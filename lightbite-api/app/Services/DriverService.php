<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\OrderStatus;
use App\Events\NewDriverJob;
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

        $order->update([
            'status' => OrderStatus::Assigned,
            'driver_id' => $driver->id,
        ]);

        return $order;
    }

    public function declineJob(Order $order, User $driver): void
    {
        // Driver declined — dispatch system handles retry
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

        return [
            'today_earnings' => number_format($todayOrders->sum('driver_earnings_fils') / 100, 2),
            'today_trips' => $todayOrders->count(),
            'this_week_earnings' => number_format($weekOrders->sum('driver_earnings_fils') / 100, 2),
            'this_week_trips' => $weekOrders->count(),
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

    private function haversine(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $r = 6371;
        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);
        $a = sin($dLat / 2) ** 2 + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLng / 2) ** 2;

        return $r * 2 * atan2(sqrt($a), sqrt(1 - $a));
    }
}
