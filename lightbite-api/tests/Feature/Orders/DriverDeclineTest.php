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

class DriverDeclineTest extends TestCase
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
            'name' => 'Burger',
            'price_fils' => 2000,
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
    }

    private function makeOnlineDriver(): User
    {
        $driver = User::factory()->driver()->create();
        DriverLocation::create([
            'driver_id' => $driver->id,
            'lat' => 25.08,
            'lng' => 55.14,
            'is_online' => true,
        ]);

        return $driver;
    }

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

    public function test_driver_decline_reassigns_to_next_nearest_driver(): void
    {
        $driverA = $this->makeOnlineDriver();
        $driverB = $this->makeOnlineDriver();
        $this->makeOnlineDriver();

        $this->goReady();

        $ready = $this->order->fresh();
        $this->assertSame(1, (int) $ready->dispatch_attempts);
        $this->assertContains($driverA->id, $ready->dispatched_driver_ids);

        // First driver declines — the job moves to the next nearest driver.
        $this->actingAs($driverA, 'api')
            ->postJson("/api/v1/driver/jobs/{$ready->uuid}/decline")
            ->assertStatus(200);

        $afterDecline = $this->order->fresh();
        $this->assertSame(2, (int) $afterDecline->dispatch_attempts);
        $this->assertCount(2, $afterDecline->dispatched_driver_ids);
        $this->assertContains($driverA->id, $afterDecline->dispatched_driver_ids);

        // The newly offered driver (driverB) accepts.
        $this->assertContains($driverB->id, $afterDecline->dispatched_driver_ids);
        $this->actingAs($driverB, 'api')
            ->postJson("/api/v1/driver/jobs/{$ready->uuid}/accept")
            ->assertStatus(200);

        $assigned = $this->order->fresh();
        $this->assertEquals(OrderStatus::Assigned, $assigned->status);
        $this->assertSame($driverB->id, $assigned->driver_id);
    }

    public function test_order_cancelled_when_all_drivers_decline(): void
    {
        $drivers = collect([
            $this->makeOnlineDriver(),
            $this->makeOnlineDriver(),
            $this->makeOnlineDriver(),
        ]);

        $this->goReady();

        $ready = $this->order->fresh();
        $this->assertSame(1, (int) $ready->dispatch_attempts);

        foreach ($drivers as $driver) {
            $this->actingAs($driver, 'api')
                ->postJson("/api/v1/driver/jobs/{$ready->uuid}/decline")
                ->assertStatus(200);
        }

        $cancelled = $this->order->fresh();
        $this->assertEquals(OrderStatus::Cancelled, $cancelled->status);
        $this->assertDatabaseHas('order_status_log', [
            'order_id' => $cancelled->id,
            'to_status' => 'cancelled',
            'note' => 'No driver available.',
        ]);
    }
}
