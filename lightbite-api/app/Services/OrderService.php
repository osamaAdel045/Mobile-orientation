<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Events\OrderStatusChanged;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderStatusLog;
use App\Models\Payment;
use App\Models\User;
use App\Models\UserAddress;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderService
{
    public function __construct(
        private CartService $cartService,
        private PaymentService $paymentService,
    ) {}

    // ─── Placement ─────────────────────────────────────────

    public function placeOrder(User $customer, string $addressUuid, string $idempotencyKey, ?string $note = null): Order
    {
        // Idempotency check
        $existing = Order::where('idempotency_key', $idempotencyKey)->first();
        if ($existing) {
            return $existing;
        }

        // Validate cart
        $validation = $this->cartService->validate($customer);
        if (! $validation['valid']) {
            throw new \RuntimeException(json_encode($validation['issues']));
        }

        $cart = $this->cartService->getOrCreateCart($customer);
        $restaurant = $cart->restaurant;
        $address = UserAddress::where('uuid', $addressUuid)->where('user_id', $customer->id)->firstOrFail();

        // Calculate totals
        $subtotalFils = $validation['subtotal_fils'];
        $deliveryFeeFils = $this->calculateDeliveryFee($restaurant, $address);
        $taxFils = (int) round(($subtotalFils + $deliveryFeeFils) * 0.05); // 5% VAT
        $totalFils = $subtotalFils + $deliveryFeeFils + $taxFils;
        $commissionFils = (int) round($subtotalFils * $restaurant->commission_rate);

        // Pre-authorize payment
        $payment = $this->paymentService->preAuthorize($customer, $totalFils, $idempotencyKey);

        // Create order with retry on duplicate order number
        $maxRetries = 5;
        $order = null;
        for ($attempt = 0; $attempt < $maxRetries; $attempt++) {
            try {
                $order = Order::create([
                    'uuid' => (string) Str::uuid(),
                    'order_number' => $this->generateOrderNumber(),
                    'customer_id' => $customer->id,
                    'restaurant_id' => $restaurant->id,
                    'status' => OrderStatus::Pending,
                    'subtotal_fils' => $subtotalFils,
                    'delivery_fee_fils' => $deliveryFeeFils,
                    'tax_fils' => $taxFils,
                    'total_fils' => $totalFils,
                    'commission_fils' => $commissionFils,
                    'idempotency_key' => $idempotencyKey,
                    'delivery_address_snapshot' => $address->only(['label', 'address', 'apartment', 'lat', 'lng']),
            'estimated_delivery_min' => $restaurant->prep_avg_time_min + $this->estimateTransitMin($restaurant, $address),
            'customer_note' => $note,
        ]);

                // Snapshot cart items
                foreach ($cart->items as $cartItem) {
                    OrderItem::create([
                        'order_id' => $order->id,
                        'menu_item_id' => $cartItem->menu_item_id,
                        'name' => $cartItem->menuItem->name,
                        'quantity' => $cartItem->quantity,
                        'unit_price_fils' => $cartItem->unit_price_fils,
                        'special_instructions' => $cartItem->special_instructions,
                    ]);
                }

                // Link payment to order
                $payment->update(['order_id' => $order->id]);

                // Log status change
                $this->logStatus($order, null, OrderStatus::Pending, 'customer', $customer->id);

                // Clear cart
                $cart->items()->delete();
                $cart->delete();

                return $order->fresh(['items', 'restaurant', 'payment']);
            } catch (\Illuminate\Database\QueryException $e) {
                if ($attempt === $maxRetries - 1 || !str_contains($e->getMessage(), 'Duplicate entry')) {
                    throw $e;
                }
                // Retry with a new order number on duplicate key
            }
        }

        throw new \RuntimeException('Failed to generate unique order number after '.$maxRetries.' attempts.');
    }

    // ─── Status Transitions ────────────────────────────────

    public function confirm(Order $order, User $restaurantUser, int $estimatedPrepMin = 20): Order
    {
        $this->assertTransition($order, OrderStatus::Pending, OrderStatus::Confirmed);
        $this->assertRestaurantOwner($order, $restaurantUser);

        $order->update([
            'status' => OrderStatus::Confirmed,
            'estimated_delivery_min' => $estimatedPrepMin + $this->estimateTransitMinFromOrder($order),
        ]);

        // Capture payment
        $order->payment->update(['status' => PaymentStatus::Captured]);

        $this->logStatus($order, OrderStatus::Pending, OrderStatus::Confirmed, 'restaurant', $restaurantUser->id);

        return $order;
    }

    public function reject(Order $order, User $restaurantUser, string $reason): Order
    {
        $this->assertTransition($order, OrderStatus::Pending, OrderStatus::Rejected);
        $this->assertRestaurantOwner($order, $restaurantUser);

        $order->update(['status' => OrderStatus::Rejected]);

        // Void payment
        if ($order->payment) {
            $this->paymentService->void($order->payment);
        }

        $this->logStatus($order, OrderStatus::Pending, OrderStatus::Rejected, 'restaurant', $restaurantUser->id, $reason);

        return $order;
    }

    public function startPreparing(Order $order, User $restaurantUser): Order
    {
        $this->assertTransition($order, OrderStatus::Confirmed, OrderStatus::Preparing);
        $this->assertRestaurantOwner($order, $restaurantUser);

        $order->update(['status' => OrderStatus::Preparing]);
        $this->logStatus($order, OrderStatus::Confirmed, OrderStatus::Preparing, 'restaurant', $restaurantUser->id);

        return $order;
    }

    public function markReady(Order $order, User $restaurantUser): Order
    {
        $this->assertTransition($order, OrderStatus::Preparing, OrderStatus::Ready);
        $this->assertRestaurantOwner($order, $restaurantUser);

        $order->update(['status' => OrderStatus::Ready]);
        $this->logStatus($order, OrderStatus::Preparing, OrderStatus::Ready, 'restaurant', $restaurantUser->id);

        return $order;
    }

    public function assignDriver(Order $order, User $driver): Order
    {
        $this->assertTransition($order, OrderStatus::Ready, OrderStatus::Assigned);

        $order->update([
            'status' => OrderStatus::Assigned,
            'driver_id' => $driver->id,
        ]);

        $this->logStatus($order, OrderStatus::Ready, OrderStatus::Assigned, 'system');

        return $order;
    }

    public function confirmPickup(Order $order, User $driver): Order
    {
        $this->assertTransition($order, OrderStatus::Assigned, OrderStatus::PickedUp);
        $this->assertDriver($order, $driver);

        $order->update(['status' => OrderStatus::PickedUp]);
        $this->logStatus($order, OrderStatus::Assigned, OrderStatus::PickedUp, 'driver', $driver->id);

        return $order;
    }

    public function startDelivery(Order $order, User $driver): Order
    {
        $this->assertTransition($order, OrderStatus::PickedUp, OrderStatus::Delivering);
        $this->assertDriver($order, $driver);

        $order->update(['status' => OrderStatus::Delivering]);
        $this->logStatus($order, OrderStatus::PickedUp, OrderStatus::Delivering, 'system');

        return $order;
    }

    public function confirmDelivery(Order $order, User $driver): Order
    {
        $this->assertTransition($order, OrderStatus::Delivering, OrderStatus::Delivered);
        $this->assertDriver($order, $driver);

        $driverEarnings = $this->calculateDriverEarnings($order);

        $order->update([
            'status' => OrderStatus::Delivered,
            'driver_earnings_fils' => $driverEarnings,
            'actual_delivery_min' => (int) $order->created_at->diffInMinutes(now()),
        ]);

        $this->logStatus($order, OrderStatus::Delivering, OrderStatus::Delivered, 'driver', $driver->id);

        return $order;
    }

    public function cancelByCustomer(Order $order, User $customer): Order
    {
        $this->assertBelongsToCustomer($order, $customer);

        if ($order->status === OrderStatus::Pending) {
            // Full refund
            $order->update(['status' => OrderStatus::Cancelled]);
            if ($order->payment) {
                $this->paymentService->void($order->payment);
            }
        } elseif (in_array($order->status, [OrderStatus::Confirmed, OrderStatus::Preparing], true)) {
            // Partial refund — deduct preparation fee
            $order->update(['status' => OrderStatus::Cancelled]);
            $prepFee = 500; // AED 5.00
            if ($order->payment) {
                $this->paymentService->refund($order->payment, $order->total_fils - $prepFee, 'Customer cancelled after confirmation.');
            }
        } else {
            throw new \RuntimeException('Order cannot be cancelled in '.$order->status->value.' status.');
        }

        $this->logStatus($order, $order->status, OrderStatus::Cancelled, 'customer', $customer->id);

        return $order;
    }

    public function expire(Order $order): Order
    {
        $this->assertTransition($order, OrderStatus::Pending, OrderStatus::Expired);

        $order->update(['status' => OrderStatus::Expired]);

        if ($order->payment) {
            $this->paymentService->void($order->payment);
        }

        $this->logStatus($order, OrderStatus::Pending, OrderStatus::Expired, 'system', note: 'Restaurant did not respond within 2 minutes.');

        return $order;
    }

    public function modify(Order $order, User $customer, array $addItems = [], array $removeItemIds = [], array $updateQuantities = []): Order
    {
        if ($order->status !== OrderStatus::Pending) {
            throw new \RuntimeException('Order can only be modified in pending status.');
        }
        $this->assertBelongsToCustomer($order, $customer);

        foreach ($addItems as $item) {
            OrderItem::create([
                'order_id' => $order->id,
                'menu_item_id' => $item['menu_item_id'],
                'name' => $item['name'],
                'quantity' => $item['quantity'] ?? 1,
                'unit_price_fils' => $item['unit_price_fils'],
                'special_instructions' => $item['special_instructions'] ?? null,
            ]);
        }
        foreach ($removeItemIds as $id) {
            $order->items()->where('id', $id)->delete();
        }
        foreach ($updateQuantities as $update) {
            $order->items()->where('id', $update['id'])->update(['quantity' => $update['quantity']]);
        }

        // Recalculate subtotal
        $newSubtotal = $order->fresh('items')->items->sum(fn ($i) => $i->unit_price_fils * $i->quantity);
        $taxFils = (int) round(($newSubtotal + $order->delivery_fee_fils) * 0.05);
        $totalFils = $newSubtotal + $order->delivery_fee_fils + $taxFils;
        $commissionFils = (int) round($newSubtotal * $order->restaurant->commission_rate);

        $order->update([
            'subtotal_fils' => $newSubtotal,
            'tax_fils' => $taxFils,
            'total_fils' => $totalFils,
            'commission_fils' => $commissionFils,
        ]);

        $this->logStatus($order, OrderStatus::Pending, OrderStatus::Pending, 'customer', $customer->id, 'Order modified by customer.');

        return $order->fresh('items');
    }

    // ─── Calculations ──────────────────────────────────────

    private function calculateDeliveryFee($restaurant, $address): int
    {
        $baseFee = 500; // AED 5.00 in fils
        $perKmRate = 150; // AED 1.50/km in fils
        $includedKm = 3;

        $distance = $this->haversine(
            $restaurant->lat, $restaurant->lng,
            $address->lat, $address->lng
        );

        $extraKm = max(0, $distance - $includedKm);

        return $baseFee + (int) round($extraKm * $perKmRate);
    }

    /**
     * Calculate driver earnings for an order.
     * Single source of truth — DriverService delegates here.
     *
     * Formula: base_pay + (per_km_rate × distance_km)
     * Rates configurable via app_configs (driver_base_pay, driver_per_km).
     */
    public function calculateDriverEarnings(Order $order): int
    {
        $basePay = (int) (\App\Models\AppConfig::get('driver_base_pay', 800)); // AED 8.00 default
        $perKmRate = (int) (\App\Models\AppConfig::get('driver_per_km', 200)); // AED 2.00/km default

        $address = $order->delivery_address_snapshot;
        $distance = $this->haversine(
            (float) $order->restaurant->lat, (float) $order->restaurant->lng,
            (float) ($address['lat'] ?? 0), (float) ($address['lng'] ?? 0)
        );

        return $basePay + (int) round($distance * $perKmRate);
    }

    /**
     * Calculate estimated driver earnings shown before job acceptance.
     * Uses restaurant → customer delivery address distance.
     */
    public function estimateDriverEarnings(float $restaurantLat, float $restaurantLng, float $addressLat, float $addressLng): int
    {
        $basePay = (int) (\App\Models\AppConfig::get('driver_base_pay', 800));
        $perKmRate = (int) (\App\Models\AppConfig::get('driver_per_km', 200));
        $distance = $this->haversine($restaurantLat, $restaurantLng, $addressLat, $addressLng);

        return $basePay + (int) round($distance * $perKmRate);
    }

    private function estimateTransitMin($restaurant, $address): int
    {
        $distance = $this->haversine($restaurant->lat, $restaurant->lng, $address->lat, $address->lng);

        return (int) ceil($distance * 3); // ~3 min per km average
    }

    private function estimateTransitMinFromOrder(Order $order): int
    {
        $address = $order->delivery_address_snapshot;
        $distance = $this->haversine(
            $order->restaurant->lat, $order->restaurant->lng,
            $address['lat'], $address['lng']
        );

        return (int) ceil($distance * 3);
    }

    private function haversine(mixed $lat1, mixed $lng1, mixed $lat2, mixed $lng2): float
    {
        $earthRadius = 6371;
        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);
        $a = sin($dLat / 2) ** 2 + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLng / 2) ** 2;

        return $earthRadius * 2 * atan2(sqrt($a), sqrt(1 - $a));
    }

    // ─── Order Number ──────────────────────────────────────

    private function generateOrderNumber(): string
    {
        $today = now()->format('Ymd');

        // Find today's highest order number and increment
        $latest = Order::where('order_number', 'like', "LB-{$today}-%")
            ->orderBy('order_number', 'desc')
            ->lockForUpdate()
            ->value('order_number');

        if ($latest) {
            $nextCount = (int) substr($latest, -5) + 1;
        } else {
            $nextCount = 1;
        }

        return "LB-{$today}-".str_pad((string) $nextCount, 5, '0', STR_PAD_LEFT);
    }

    // ─── Assertions ─────────────────────────────────────────

    private function assertTransition(Order $order, OrderStatus $from, OrderStatus $to): void
    {
        if ($order->status !== $from) {
            throw new \RuntimeException(
                "Order must be in '{$from->value}' status to transition to '{$to->value}'. Current: '{$order->status->value}'."
            );
        }
    }

    private function assertRestaurantOwner(Order $order, User $user): void
    {
        if ($order->restaurant->owner_id !== $user->id) {
            throw new \RuntimeException('You do not own this restaurant.');
        }
    }

    private function assertDriver(Order $order, User $user): void
    {
        if ($order->driver_id !== $user->id) {
            throw new \RuntimeException('You are not assigned to this order.');
        }
    }

    private function assertBelongsToCustomer(Order $order, User $user): void
    {
        if ($order->customer_id !== $user->id) {
            throw new \RuntimeException('This order does not belong to you.');
        }
    }

    private function logStatus(Order $order, ?OrderStatus $from, OrderStatus $to, string $changedByType, ?int $changedById = null, ?string $note = null): void
    {
        OrderStatusLog::create([
            'order_id' => $order->id,
            'from_status' => $from?->value ?? '',
            'to_status' => $to->value,
            'changed_by_type' => $changedByType,
            'changed_by_id' => $changedById,
            'note' => $note,
        ]);

        // Broadcast to customer and restaurant
        if (class_exists(OrderStatusChanged::class)) {
            OrderStatusChanged::dispatch($order->fresh(['restaurant', 'driver']), $from?->value ?? '', $to->value, $note);
        }
    }
}
