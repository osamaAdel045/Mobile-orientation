<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\OrderStatus;
use App\Events\NewDriverJob;
use App\Models\AppConfig;
use App\Models\DriverLocation;
use App\Models\Order;
use App\Models\User;

class DriverService
{
    public function __construct(
        private OrderService $orderService,
    ) {}

    public function toggleOnline(User $driver, bool $online): DriverLocation
    {
        $loc = DriverLocation::updateOrCreate(
            ['driver_id' => $driver->id],
            [
                'lat' => 0, 'lng' => 0,
                'is_online' => $online,
                'updated_at' => now(),
            ]
        );

        if (! $online) {
            // Clear location when going offline
            $loc->update(['lat' => 0, 'lng' => 0]);
        }

        return $loc;
    }

    public function updateLocation(User $driver, float $lat, float $lng, ?float $bearing = null): DriverLocation
    {
        return DriverLocation::updateOrCreate(
            ['driver_id' => $driver->id],
            [
                'lat' => $lat, 'lng' => $lng,
                'bearing' => $bearing,
                'is_online' => true,
                'updated_at' => now(),
            ]
        );
    }

    public function acceptJob(Order $order, User $driver): Order
    {
        if ($order->status !== OrderStatus::Ready) {
            throw new \RuntimeException('Order is no longer available.');
        }

        if ($order->driver_id) {
            throw new \RuntimeException('Job already taken.');
        }

        // Delegate to OrderService so the status log and the
        // OrderStatusChanged / DriverAssigned events fire like every
        // other driver assignment.
        return $this->orderService->assignDriver($order, $driver);
    }

    public function declineJob(Order $order, User $driver): void
    {
        if ($order->status !== OrderStatus::Ready) {
            throw new \RuntimeException('Order is no longer available.');
        }

        // The declining driver is already in dispatched_driver_ids, so the next
        // call to dispatchOrder() skips them and offers the job to the next
        // nearest driver. Once every candidate has been offered, cancel.
        if ((int) $order->dispatch_attempts >= $this->maxDispatchAttempts()) {
            $this->orderService->cancelNoDriver($order);

            return;
        }

        $this->dispatchOrder($order);
    }

    public function confirmPickup(Order $order, User $driver): Order
    {
        if ($order->driver_id !== $driver->id) {
            throw new \RuntimeException('You are not assigned to this order.');
        }

        // Only transition to picked_up — the driver must call startDelivery separately
        return $this->orderService->confirmPickup($order, $driver);
    }

    public function startDelivery(Order $order, User $driver): Order
    {
        if ($order->driver_id !== $driver->id) {
            throw new \RuntimeException('You are not assigned to this order.');
        }

        if ($order->status !== OrderStatus::PickedUp) {
            throw new \RuntimeException('Order must be picked_up before starting delivery. Current: '.$order->status->value);
        }

        return $this->orderService->startDelivery($order, $driver);
    }

    public function confirmDelivery(Order $order, User $driver): Order
    {
        if ($order->driver_id !== $driver->id) {
            throw new \RuntimeException('You are not assigned to this order.');
        }

        // Delegate to OrderService for correct distance-based earnings calculation
        $order = $this->orderService->confirmDelivery($order, $driver);

        // Update driver location tracking
        DriverLocation::where('driver_id', $driver->id)->update(['is_online' => true, 'updated_at' => now()]);

        return $order;
    }

    public function getEarnings(User $driver): array
    {
        $todayOrders = $driver->driverOrders()
            ->whereDate('created_at', today())
            ->whereNotNull('driver_earnings_fils')
            ->get();

        $weekOrders = $driver->driverOrders()
            ->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])
            ->whereNotNull('driver_earnings_fils')
            ->get();

        $weekTotal = $weekOrders->sum('driver_earnings_fils');
        $weekCount = $weekOrders->count();

        return [
            'today_earnings' => number_format($todayOrders->sum('driver_earnings_fils') / 100, 2),
            'today_trips' => $todayOrders->count(),
            'this_week_earnings' => number_format($weekTotal / 100, 2),
            'this_week_trips' => $weekCount,
            'avg_per_trip' => $weekCount > 0 ? number_format($weekTotal / $weekCount / 100, 2) : '0.00',
            'recent_trips' => $weekOrders->take(20)->map(fn ($o) => [
                'order_uuid' => $o->uuid,
                'restaurant_name' => $o->restaurant->name,
                'earnings' => number_format($o->driver_earnings_fils / 100, 2),
                'completed_at' => $o->updated_at->toISOString(),
            ]),
        ];
    }

    /** Find nearest online drivers within radius */
    public function findNearbyDrivers(float $lat, float $lng, int $radiusKm = 5, int $limit = 3): array
    {
        $drivers = DriverLocation::where('is_online', true)
            ->where('updated_at', '>', now()->subMinutes(5))
            ->get();

        $nearby = [];
        foreach ($drivers as $d) {
            $dist = $this->haversine($lat, $lng, (float) $d->lat, (float) $d->lng);
            if ($dist <= $radiusKm) {
                $nearby[] = ['driver' => $d, 'distance' => $dist];
            }
        }

        usort($nearby, fn ($a, $b) => $a['distance'] <=> $b['distance']);

        return array_slice(array_column($nearby, 'driver'), 0, $limit);
    }

    public function dispatchToDriver(Order $order, User $driver): void
    {
        $earnings = $this->orderService->calculateDriverEarnings($order);

        $order->update(['driver_earnings_fils' => $earnings]);

        NewDriverJob::dispatch($order, $driver->id);
    }

    /**
     * Offer a ready order to the nearest driver that has not already been offered it.
     *
     * Called when an order becomes ready (via the BroadcastDriverJob listener), when a
     * driver declines, and when a previous offer times out. Advances the dispatch state
     * stored on the order (attempts / dispatched drivers / expiry).
     */
    public function dispatchOrder(Order $order): void
    {
        $order->load('restaurant');

        if ($order->status !== OrderStatus::Ready) {
            return;
        }

        // First offer — start the 15-minute "no driver" window.
        if (! $order->dispatch_started_at) {
            $order->update(['dispatch_started_at' => now()]);
            $order->refresh();
        }

        $alreadyDispatched = $order->dispatched_driver_ids ?? [];

        $nearby = $this->findNearbyDrivers(
            (float) $order->restaurant->lat,
            (float) $order->restaurant->lng,
        );

        // Next candidate = nearest driver not yet offered this job.
        $candidate = collect($nearby)
            ->first(fn (DriverLocation $loc) => ! in_array($loc->driver_id, $alreadyDispatched, true));

        if (! $candidate) {
            // No driver available right now — re-check shortly without burning an attempt.
            $order->update(['dispatch_expires_at' => now()->addSeconds(60)]);

            return;
        }

        $driver = $candidate->driver;

        $this->dispatchToDriver($order, $driver);

        $order->update([
            'dispatch_attempts' => (int) $order->dispatch_attempts + 1,
            'dispatched_driver_ids' => array_values(array_unique([...$alreadyDispatched, $driver->id])),
            'dispatch_expires_at' => now()->addSeconds($this->driverTimeoutSeconds()),
        ]);
    }

    /**
     * Advance a stale dispatch (called by the scheduler when dispatch_expires_at passes).
     *
     *  - No driver accepted within 15 minutes          -> cancel the order.
     *  - Every candidate driver has declined           -> cancel the order.
     *  - Current offer simply timed out                -> offer to the next driver.
     */
    public function processStaleDispatch(Order $order): void
    {
        if ($order->status !== OrderStatus::Ready) {
            return;
        }

        if ($order->dispatch_started_at && $order->dispatch_started_at->lte(now()->subMinutes(15))) {
            $this->orderService->cancelNoDriver($order);

            return;
        }

        if ((int) $order->dispatch_attempts >= $this->maxDispatchAttempts()) {
            $this->orderService->cancelNoDriver($order);

            return;
        }

        $this->dispatchOrder($order);
    }

    /** Seconds a driver has to accept a job before it moves to the next driver. */
    private function driverTimeoutSeconds(): int
    {
        return max(5, (int) AppConfig::get('driver_timeout', 30));
    }

    /** How many distinct drivers are offered a job before the order is cancelled. */
    private function maxDispatchAttempts(): int
    {
        return 3;
    }

    private function haversine(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $r = 6371;
        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);
        $a = sin($dLat / 2) ** 2 + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLng / 2) ** 2;

        return $r * 2 * atan2(sqrt($a), sqrt(1 - $a));
    }
}
