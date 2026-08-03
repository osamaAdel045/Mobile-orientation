<?php

declare(strict_types=1);

namespace Tests\Feature\EdgeCases;

use App\Enums\OrderStatus;
use App\Models\MenuItem;
use App\Models\Order;
use App\Models\Restaurant;
use App\Models\User;
use App\Models\UserAddress;
use App\Services\OrderService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class OrderStateMachineTest extends TestCase
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
        $this->restaurant = Restaurant::factory()->create(['owner_id' => $this->owner->id, 'status' => 'active', 'lat' => 25.08, 'lng' => 55.14]);
        $cat = $this->restaurant->categories()->create(['name' => 'Food', 'sort_order' => 1]);
        $item = MenuItem::create(['uuid' => Str::uuid(), 'restaurant_id' => $this->restaurant->id, 'category_id' => $cat->id, 'name' => 'Test Item', 'price_fils' => 3000]);
        UserAddress::create(['user_id' => $this->customer->id, 'uuid' => Str::uuid(), 'label' => 'home', 'address' => 'Test', 'lat' => 25.08, 'lng' => 55.14]);

        // Place order
        $this->actingAs($this->customer, 'api')->postJson('/api/v1/cart/items', ['menu_item_uuid' => $item->uuid]);
        $this->actingAs($this->customer, 'api')->postJson('/api/v1/orders', [
            'delivery_address_uuid' => UserAddress::first()->uuid,
        ], ['Idempotency-Key' => Str::uuid()]);

        $this->order = Order::first();
    }

    public function test_cannot_skip_status(): void
    {
        // Try to go directly from pending to ready (skip confirmed, preparing)
        $response = $this->actingAs($this->owner, 'api')
            ->patchJson("/api/v1/restaurants/dashboard/orders/{$this->order->uuid}/status", ['status' => 'ready']);

        $response->assertStatus(409);
    }

    public function test_cannot_accept_already_confirmed_order(): void
    {
        $this->actingAs($this->owner, 'api')
            ->postJson("/api/v1/restaurants/dashboard/orders/{$this->order->uuid}/accept");

        // Try to accept again
        $response = $this->actingAs($this->owner, 'api')
            ->postJson("/api/v1/restaurants/dashboard/orders/{$this->order->uuid}/accept");

        $response->assertStatus(409);
    }

    public function test_cannot_cancel_after_confirmed(): void
    {
        // Confirm first
        $this->actingAs($this->owner, 'api')
            ->postJson("/api/v1/restaurants/dashboard/orders/{$this->order->uuid}/accept");

        // Customer tries to cancel
        $response = $this->actingAs($this->customer, 'api')
            ->postJson("/api/v1/orders/{$this->order->uuid}/cancel");

        $response->assertStatus(409)
            ->assertJsonPath('error.code', 'CANCEL_FAILED');
    }

    public function test_wrong_restaurant_cannot_accept_order(): void
    {
        $otherOwner = User::factory()->restaurant()->create();
        Restaurant::factory()->create(['owner_id' => $otherOwner->id, 'status' => 'active']);

        $response = $this->actingAs($otherOwner, 'api')
            ->postJson("/api/v1/restaurants/dashboard/orders/{$this->order->uuid}/accept");

        $response->assertStatus(404);
    }

    public function test_full_happy_path(): void
    {
        // Accept
        $this->actingAs($this->owner, 'api')
            ->postJson("/api/v1/restaurants/dashboard/orders/{$this->order->uuid}/accept")
            ->assertStatus(200);

        $this->assertEquals(OrderStatus::Confirmed, $this->order->fresh()->status);

        // Start preparing
        $this->actingAs($this->owner, 'api')
            ->patchJson("/api/v1/restaurants/dashboard/orders/{$this->order->uuid}/status", ['status' => 'preparing'])
            ->assertStatus(200);

        $this->assertEquals(OrderStatus::Preparing, $this->order->fresh()->status);

        // Mark ready
        $this->actingAs($this->owner, 'api')
            ->patchJson("/api/v1/restaurants/dashboard/orders/{$this->order->uuid}/status", ['status' => 'ready'])
            ->assertStatus(200);

        $this->assertEquals(OrderStatus::Ready, $this->order->fresh()->status);
    }
}
