<?php

declare(strict_types=1);

namespace Tests\Feature\Orders;

use App\Enums\OrderStatus;
use App\Models\MenuItem;
use App\Models\Order;
use App\Models\Restaurant;
use App\Models\User;
use App\Models\UserAddress;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class OrderExpiryTest extends TestCase
{
    use RefreshDatabase;

    private User $customer;
    private User $owner;
    private Order $order;

    protected function setUp(): void
    {
        parent::setUp();

        $this->customer = User::factory()->customer()->create();
        $this->owner = User::factory()->restaurant()->create();
        $restaurant = Restaurant::factory()->create([
            'owner_id' => $this->owner->id,
            'status' => 'active',
            'lat' => 25.08,
            'lng' => 55.14,
        ]);

        $cat = $restaurant->categories()->create(['name' => 'Mains', 'sort_order' => 1]);
        MenuItem::create([
            'uuid' => Str::uuid(),
            'restaurant_id' => $restaurant->id,
            'category_id' => $cat->id,
            'name' => 'Salad',
            'price_fils' => 2200,
        ]);
        UserAddress::create([
            'user_id' => $this->customer->id,
            'uuid' => Str::uuid(),
            'label' => 'Home',
            'address' => 'Villa 12',
            'lat' => 25.08,
            'lng' => 55.14,
        ]);

        $this->actingAs($this->customer, 'api')
            ->postJson('/api/v1/cart/items', ['menu_item_uuid' => MenuItem::first()->uuid]);
        $this->actingAs($this->customer, 'api')
            ->postJson('/api/v1/orders', [
                'delivery_address_uuid' => UserAddress::first()->uuid,
            ], ['Idempotency-Key' => Str::uuid()]);

        $this->order = Order::first();
        $this->assertNotNull($this->order->payment, 'Order should have a linked pre-authorized payment.');
    }

    public function test_pending_order_expires_when_restaurant_does_not_respond(): void
    {
        // Backdate so the order falls outside the restaurant response window.
        $this->order->created_at = now()->subMinutes(3);
        $this->order->save();

        $this->artisan('orders:expire-pending')->assertSuccessful();

        $this->assertEquals(OrderStatus::Expired, $this->order->fresh()->status);
        $this->assertDatabaseHas('payments', [
            'order_id' => $this->order->id,
            'status' => 'voided',
        ]);
    }

    public function test_pending_order_within_window_is_not_expired(): void
    {
        $this->artisan('orders:expire-pending')->assertSuccessful();

        $this->assertEquals(OrderStatus::Pending, $this->order->fresh()->status);
    }
}
