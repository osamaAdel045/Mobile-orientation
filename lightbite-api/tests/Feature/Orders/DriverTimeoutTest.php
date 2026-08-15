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

class DriverTimeoutTest extends TestCase
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
            'name' => 'Pizza',
            'price_fils' => 2600,
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

    public function test_unanswered_offer_moves_to_next_driver_after_timeout(): void
    {
        $driverA = $this->makeOnlineDriver();
        $driverB = $this->makeOnlineDriver();

        $this->goReady();

        $ready = $this->order->fresh();
        $this->assertSame(1, (int) $ready->dispatch_attempts);
        $this->assertContains($driverA->id, $ready->dispatched_driver_ids);

        // The first driver never answers — expire their offer.
        $ready->dispatch_expires_at = now()->subSecond();
        $ready->save();

        $this->artisan('orders:process-dispatch')->assertSuccessful();

        $afterTimeout = $this->order->fresh();
        $this->assertSame(2, (int) $afterTimeout->dispatch_attempts);
        $this->assertContains($driverB->id, $afterTimeout->dispatched_driver_ids);
        $this->assertEquals(OrderStatus::Ready, $afterTimeout->status);
    }

    public function test_order_cancelled_when_no_driver_found_within_15_minutes(): void
    {
        // No drivers are online — dispatch just arms the re-check window.
        $this->goReady();

        $ready = $this->order->fresh();
        $this->assertSame(0, (int) $ready->dispatch_attempts);
        $this->assertNotNull($ready->dispatch_started_at);

        // Simulate the 15-minute window elapsing with no taker.
        $ready->dispatch_started_at = now()->subMinutes(16);
        $ready->dispatch_expires_at = now()->subSecond();
        $ready->save();

        $this->artisan('orders:process-dispatch')->assertSuccessful();

        $cancelled = $this->order->fresh();
        $this->assertEquals(OrderStatus::Cancelled, $cancelled->status);
        $this->assertDatabaseHas('order_status_log', [
            'order_id' => $cancelled->id,
            'to_status' => 'cancelled',
            'note' => 'No driver available.',
        ]);
    }
}
