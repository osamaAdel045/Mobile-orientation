<?php

declare(strict_types=1);

namespace Tests\Feature\Orders;

use App\Models\MenuItem;
use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class CartTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_can_add_item_to_cart(): void
    {
        $customer = User::factory()->customer()->create();
        $owner = User::factory()->restaurant()->create();
        $restaurant = Restaurant::factory()->create(['owner_id' => $owner->id, 'status' => 'active']);
        $cat = $restaurant->categories()->create(['name' => 'Mains', 'sort_order' => 1]);
        $item = MenuItem::create([
            'uuid' => Str::uuid(),
            'restaurant_id' => $restaurant->id,
            'category_id' => $cat->id,
            'name' => 'Falafel Wrap',
            'price_fils' => 1500,
        ]);

        $response = $this->actingAs($customer, 'api')
            ->postJson('/api/v1/cart/items', [
                'menu_item_uuid' => $item->uuid,
                'quantity' => 2,
            ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('cart_items', ['menu_item_id' => $item->id, 'quantity' => 2]);
    }

    public function test_cannot_add_from_different_restaurant(): void
    {
        $customer = User::factory()->customer()->create();

        $owner1 = User::factory()->restaurant()->create();
        $r1 = Restaurant::factory()->create(['owner_id' => $owner1->id, 'status' => 'active']);
        $cat1 = $r1->categories()->create(['name' => 'Food', 'sort_order' => 1]);
        $item1 = MenuItem::create(['uuid' => Str::uuid(), 'restaurant_id' => $r1->id, 'category_id' => $cat1->id, 'name' => 'Item 1', 'price_fils' => 1000]);

        $owner2 = User::factory()->restaurant()->create();
        $r2 = Restaurant::factory()->create(['owner_id' => $owner2->id, 'status' => 'active']);
        $cat2 = $r2->categories()->create(['name' => 'Food', 'sort_order' => 1]);
        $item2 = MenuItem::create(['uuid' => Str::uuid(), 'restaurant_id' => $r2->id, 'category_id' => $cat2->id, 'name' => 'Item 2', 'price_fils' => 2000]);

        // Add from restaurant 1
        $this->actingAs($customer, 'api')->postJson('/api/v1/cart/items', ['menu_item_uuid' => $item1->uuid]);

        // Try to add from restaurant 2
        $response = $this->actingAs($customer, 'api')
            ->postJson('/api/v1/cart/items', ['menu_item_uuid' => $item2->uuid]);

        $response->assertStatus(409)
            ->assertJsonPath('error.code', 'DIFFERENT_RESTAURANT');
    }

    public function test_cart_validation_detects_unavailable_items(): void
    {
        $customer = User::factory()->customer()->create();
        $owner = User::factory()->restaurant()->create();
        $restaurant = Restaurant::factory()->create(['owner_id' => $owner->id, 'status' => 'active']);
        $cat = $restaurant->categories()->create(['name' => 'Food', 'sort_order' => 1]);
        $item = MenuItem::create([
            'uuid' => Str::uuid(), 'restaurant_id' => $restaurant->id,
            'category_id' => $cat->id, 'name' => 'Item', 'price_fils' => 5000,
        ]);

        $this->actingAs($customer, 'api')->postJson('/api/v1/cart/items', ['menu_item_uuid' => $item->uuid]);

        // Make item unavailable
        $item->update(['is_available' => false]);

        $response = $this->actingAs($customer, 'api')->postJson('/api/v1/cart/validate');

        $response->assertStatus(200)
            ->assertJsonPath('data.valid', false);
    }
}
