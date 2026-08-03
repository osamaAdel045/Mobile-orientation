<?php

declare(strict_types=1);

namespace Tests\Feature\Orders;

use App\Models\MenuItem;
use App\Models\Order;
use App\Models\Restaurant;
use App\Models\User;
use App\Models\UserAddress;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class OrderPlacementTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_can_place_order(): void
    {
        $customer = User::factory()->customer()->create();
        $owner = User::factory()->restaurant()->create();
        $restaurant = Restaurant::factory()->create(['owner_id' => $owner->id, 'status' => 'active', 'lat' => 25.0801, 'lng' => 55.1400]);
        $cat = $restaurant->categories()->create(['name' => 'Mains', 'sort_order' => 1]);
        $item = MenuItem::create([
            'uuid' => Str::uuid(), 'restaurant_id' => $restaurant->id,
            'category_id' => $cat->id, 'name' => 'Shawarma', 'price_fils' => 2500,
        ]);
        $address = UserAddress::create([
            'user_id' => $customer->id, 'uuid' => Str::uuid(),
            'label' => 'home', 'address' => 'Test', 'lat' => 25.0805, 'lng' => 55.1410,
        ]);

        // Add to cart
        $this->actingAs($customer, 'api')
            ->postJson('/api/v1/cart/items', ['menu_item_uuid' => $item->uuid]);

        // Place order
        $response = $this->actingAs($customer, 'api')
            ->postJson('/api/v1/orders', [
                'delivery_address_uuid' => $address->uuid,
            ], ['Idempotency-Key' => Str::uuid()]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => ['uuid', 'order_number', 'status', 'subtotal', 'delivery_fee', 'tax', 'total', 'estimated_delivery_min'],
            ])
            ->assertJsonPath('data.status', 'pending');

        $this->assertDatabaseHas('orders', ['customer_id' => $customer->id, 'status' => 'pending']);
    }

    public function test_order_requires_idempotency_key(): void
    {
        $customer = User::factory()->customer()->create();
        $address = UserAddress::create([
            'user_id' => $customer->id,
            'uuid' => Str::uuid(),
            'label' => 'home',
            'address' => 'Test',
            'lat' => 25.0805,
            'lng' => 55.1410,
        ]);

        $response = $this->actingAs($customer, 'api')
            ->postJson('/api/v1/orders', ['delivery_address_uuid' => $address->uuid]);

        // Missing Idempotency-Key header
        $response->assertStatus(400);
    }

    public function test_duplicate_idempotency_key_returns_existing_order(): void
    {
        $customer = User::factory()->customer()->create();
        $owner = User::factory()->restaurant()->create();
        $restaurant = Restaurant::factory()->create(['owner_id' => $owner->id, 'status' => 'active', 'lat' => 25.0801, 'lng' => 55.1400]);
        $cat = $restaurant->categories()->create(['name' => 'Food', 'sort_order' => 1]);
        $item = MenuItem::create([
            'uuid' => Str::uuid(), 'restaurant_id' => $restaurant->id,
            'category_id' => $cat->id, 'name' => 'Item', 'price_fils' => 2000,
        ]);
        UserAddress::create([
            'user_id' => $customer->id, 'uuid' => Str::uuid(),
            'label' => 'home', 'address' => 'Test', 'lat' => 25.0805, 'lng' => 55.1410,
        ]);

        $this->actingAs($customer, 'api')->postJson('/api/v1/cart/items', ['menu_item_uuid' => $item->uuid]);

        $key = Str::uuid();

        // First order
        $r1 = $this->actingAs($customer, 'api')
            ->postJson('/api/v1/orders', ['delivery_address_uuid' => UserAddress::first()->uuid], ['Idempotency-Key' => $key]);

        // Re-add to cart and try same key
        $this->actingAs($customer, 'api')->postJson('/api/v1/cart/items', ['menu_item_uuid' => $item->uuid]);
        $r2 = $this->actingAs($customer, 'api')
            ->postJson('/api/v1/orders', ['delivery_address_uuid' => UserAddress::first()->uuid], ['Idempotency-Key' => $key]);

        $this->assertEquals($r1->json('data.uuid'), $r2->json('data.uuid'));
        $this->assertEquals(1, Order::count());
    }
}
