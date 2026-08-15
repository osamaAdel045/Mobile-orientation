<?php

declare(strict_types=1);

namespace Tests\Feature\Orders;

use App\Enums\OrderStatus;
use App\Models\DriverLocation;
use App\Models\MenuItem;
use App\Models\Order;
use App\Models\Restaurant;
use App\Models\User;
use App\Models\UserAddress;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class OrderLifecycleTest extends TestCase
{
    use RefreshDatabase;

    private User $customer;
    private User $owner;
    private Restaurant $restaurant;
    private Order $order;

    protected function setUp(): void
    {
        parent::setUp();

        $this->customer = User::factory()->customer()->create();
        $this->owner = User::factory()->restaurant()->create();
        $this->restaurant = Restaurant::factory()->create([
            'owner_id' => $this->owner->id,
            'status' => 'active',
            'lat' => 25.08,
            'lng' => 55.14,
        ]);

        $cat = $this->restaurant->categories()->create(['name' => 'Mains', 'sort_order' => 1]);
        MenuItem::create([
            'uuid' => Str::uuid(),
            'restaurant_id' => $this->restaurant->id,
            'category_id' => $cat->id,
            'name' => 'Shawarma Plate',
            'price_fils' => 2500,
        ]);
        UserAddress::create([
            'user_id' => $this->customer->id,
            'uuid' => Str::uuid(),
            'label' => 'Home',
            'address' => 'Villa 12',
            'lat' => 25.08,
            'lng' => 55.14,
        ]);

        // Place the order through the public API.
        $this->actingAs($this->customer, 'api')
            ->postJson('/api/v1/cart/items', ['menu_item_uuid' => MenuItem::first()->uuid]);
        $this->actingAs($this->customer, 'api')
            ->postJson('/api/v1/orders', [
                'delivery_address_uuid' => UserAddress::first()->uuid,
            ], ['Idempotency-Key' => Str::uuid()]);

        $this->order = Order::first();
    }

    /** Create a driver that is online near the restaurant. */
    private function makeOnlineDriver(float $lat, float $lng): User
    {
        $driver = User::factory()->driver()->create();
        DriverLocation::create([
            'driver_id' => $driver->id,
            'lat' => $lat,
            'lng' => $lng,
            'is_online' => true,
        ]);

        return $driver;
    }

    /** Run the restaurant through accept → preparing → ready. */
    private function goReady(): void
    {
        $this->actingAs($this->owner, 'api')
            ->postJson("/api/v1/restaurants/dashboard/orders/{$this->order->uuid}/accept")
            ->assertStatus(200);
        $this->actingAs($this->owner, 'api')
            ->patchJson("/api/v1/restaurants/dashboard/orders/{$this->order->uuid}/status", ['status' => 'preparing'])
            ->assertStatus(200);
        $this->actingAs($this->owner, 'api')
            ->patchJson("/api/v1/restaurants/dashboard/orders/{$this->order->uuid}/status", ['status' => 'ready'])
            ->assertStatus(200);
    }

    public function test_full_order_lifecycle_with_driver_assignment(): void
    {
        $driver = $this->makeOnlineDriver(25.08, 55.14);
        $this->makeOnlineDriver(25.08, 55.14);

        $this->goReady();

        // Order is ready and the nearest driver has been offered the job.
        $ready = $this->order->fresh();
        $this->assertEquals(OrderStatus::Ready, $ready->status);
        $this->assertSame(1, (int) $ready->dispatch_attempts);
        $this->assertContains($driver->id, $ready->dispatched_driver_ids);

        // Driver accepts the job.
        $this->actingAs($driver, 'api')
            ->postJson("/api/v1/driver/jobs/{$ready->uuid}/accept")
            ->assertStatus(200);

        $assigned = $ready->fresh();
        $this->assertEquals(OrderStatus::Assigned, $assigned->status);
        $this->assertSame($driver->id, $assigned->driver_id);
        $this->assertNull($assigned->dispatch_expires_at);

        // Pickup → delivering → delivered.
        $this->actingAs($driver, 'api')
            ->postJson("/api/v1/driver/jobs/{$ready->uuid}/pickup")
            ->assertStatus(200);
        $this->assertEquals(OrderStatus::PickedUp, $ready->fresh()->status);

        $this->actingAs($driver, 'api')
            ->postJson("/api/v1/driver/jobs/{$ready->uuid}/start-delivery")
            ->assertStatus(200);
        $this->assertEquals(OrderStatus::Delivering, $ready->fresh()->status);

        $this->actingAs($driver, 'api')
            ->postJson("/api/v1/driver/jobs/{$ready->uuid}/deliver")
            ->assertStatus(200);

        $delivered = $ready->fresh();
        $this->assertEquals(OrderStatus::Delivered, $delivered->status);
        $this->assertNotNull($delivered->driver_earnings_fils);
        $this->assertDatabaseHas('order_status_log', [
            'order_id' => $delivered->id,
            'to_status' => 'delivered',
        ]);
    }
}
