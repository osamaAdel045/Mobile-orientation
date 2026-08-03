<?php

declare(strict_types=1);

namespace Tests\Feature\Restaurants;

use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class MenuManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_restaurant_can_create_category(): void
    {
        $user = $this->createRestaurantUser();

        $response = $this->actingAs($user, 'api')
            ->postJson('/api/v1/restaurants/dashboard/categories', [
                'name' => 'Appetizers',
                'sort_order' => 1,
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.name', 'Appetizers');

        $this->assertDatabaseHas('menu_categories', ['name' => 'Appetizers']);
    }

    public function test_restaurant_can_add_menu_item(): void
    {
        $user = $this->createRestaurantUser();
        $restaurant = $user->restaurant;
        $cat = $restaurant->categories()->create(['name' => 'Mains', 'sort_order' => 1]);

        $response = $this->actingAs($user, 'api')
            ->postJson('/api/v1/restaurants/dashboard/menu-items', [
                'category_id' => $cat->id,
                'name' => 'Chicken Shawarma',
                'description' => 'Marinated chicken with garlic sauce',
                'price' => 28.00,
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.name', 'Chicken Shawarma');

        $this->assertDatabaseHas('menu_items', ['name' => 'Chicken Shawarma', 'price_fils' => 2800]);
    }

    public function test_restaurant_can_toggle_item_availability(): void
    {
        $user = $this->createRestaurantUser();
        $restaurant = $user->restaurant;
        $cat = $restaurant->categories()->create(['name' => 'Mains', 'sort_order' => 1]);
        $item = $restaurant->menuItems()->create([
            'uuid' => Str::uuid(),
            'category_id' => $cat->id,
            'name' => 'Falafel',
            'price_fils' => 1200,
        ]);

        $response = $this->actingAs($user, 'api')
            ->patchJson("/api/v1/restaurants/dashboard/menu-items/{$item->id}/toggle");

        $response->assertStatus(200);
        $this->assertDatabaseHas('menu_items', ['id' => $item->id, 'is_available' => false]);
    }

    private function createRestaurantUser(): User
    {
        $user = User::factory()->restaurant()->create();
        Restaurant::factory()->create([
            'owner_id' => $user->id,
            'status' => 'active',
        ]);

        return $user;
    }
}
