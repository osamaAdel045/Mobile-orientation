<?php

declare(strict_types=1);

namespace Tests\Feature\EdgeCases;

use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class ValidationEdgeCasesTest extends TestCase
{
    use RefreshDatabase;

    public function test_register_rejects_invalid_email(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Test',
            'email' => 'not-an-email',
            'password' => 'SecureP4ss!',
            'password_confirmation' => 'SecureP4ss!',
            'role' => 'customer',
        ]);

        $response->assertStatus(422);
    }

    public function test_login_locked_after_rate_limit(): void
    {
        $user = User::factory()->customer()->create();

        // Hit rate limit (5 attempts per 15 min)
        for ($i = 0; $i < 6; $i++) {
            $this->postJson('/api/v1/auth/login', [
                'email' => $user->email,
                'password' => 'wrong',
            ]);
        }

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => 'wrong',
        ]);

        $response->assertStatus(429);
    }

    public function test_restaurant_discovery_validates_coordinates(): void
    {
        $response = $this->getJson('/api/v1/restaurants?lat=999&lng=999');

        $response->assertStatus(422);
    }

    public function test_menu_item_price_must_be_positive(): void
    {
        $owner = User::factory()->restaurant()->create();
        Restaurant::factory()->create(['owner_id' => $owner->id, 'status' => 'active']);
        $cat = $owner->restaurant->categories()->create(['name' => 'Food', 'sort_order' => 1]);

        $response = $this->actingAs($owner, 'api')
            ->postJson('/api/v1/restaurants/dashboard/menu-items', [
                'category_id' => $cat->id,
                'name' => 'Free Item',
                'price' => 0,
            ]);

        $response->assertStatus(422);
    }

    public function test_driver_location_validation(): void
    {
        $driver = User::factory()->driver()->create();

        $response = $this->actingAs($driver, 'api')
            ->postJson('/api/v1/driver/location', [
                'lat' => 200,  // invalid
                'lng' => 55.14,
            ]);

        $response->assertStatus(422);
    }
}
