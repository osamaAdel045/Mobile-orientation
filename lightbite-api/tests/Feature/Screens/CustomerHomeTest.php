<?php

declare(strict_types=1);

namespace Tests\Feature\Screens;

use App\Models\MenuItem;
use App\Models\Restaurant;
use App\Models\User;
use App\Models\UserAddress;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class CustomerHomeTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_home_returns_theme_and_restaurants(): void
    {
        $customer = User::factory()->customer()->create();
        $owner = User::factory()->restaurant()->create();
        Restaurant::factory()->create([
            'owner_id' => $owner->id,
            'status' => 'active',
            'lat' => 25.0801,
            'lng' => 55.1400,
        ]);

        $response = $this->actingAs($customer, 'api')
            ->getJson('/api/v1/home?lat=25.0801&lng=55.1400');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => ['theme', 'user', 'active_order', 'nearby_restaurants', 'saved_addresses'],
            ])
            ->assertJsonPath('data.theme.colors.primary.500', '#F97316')
            ->assertJsonPath('data.user.name', $customer->name)
            ->assertJsonPath('data.active_order', null);
    }

    public function test_customer_home_shows_active_order(): void
    {
        $customer = User::factory()->customer()->create();
        $owner = User::factory()->restaurant()->create();
        $restaurant = Restaurant::factory()->create(['owner_id' => $owner->id, 'status' => 'active']);
        $cat = $restaurant->categories()->create(['name' => 'Food', 'sort_order' => 1]);
        $item = MenuItem::create([
            'uuid' => Str::uuid(), 'restaurant_id' => $restaurant->id,
            'category_id' => $cat->id, 'name' => 'Burger', 'price_fils' => 2000,
        ]);
        UserAddress::create(['user_id' => $customer->id, 'uuid' => Str::uuid(), 'label' => 'home', 'address' => 'Test', 'lat' => 25.08, 'lng' => 55.14]);

        // Place order via cart
        $this->actingAs($customer, 'api')->postJson('/api/v1/cart/items', ['menu_item_uuid' => $item->uuid]);
        $this->actingAs($customer, 'api')->postJson('/api/v1/orders', [
            'delivery_address_uuid' => UserAddress::first()->uuid,
        ], ['Idempotency-Key' => Str::uuid()]);

        $response = $this->actingAs($customer, 'api')->getJson('/api/v1/home?lat=25.0801&lng=55.1400');

        $response->assertJsonPath('data.active_order.status', 'pending')
            ->assertJsonStructure(['data' => ['active_order' => ['progress']]]);
    }

    public function test_guest_cannot_access_home(): void
    {
        $response = $this->getJson('/api/v1/home?lat=25.0801&lng=55.1400');

        $response->assertStatus(401);
    }
}
