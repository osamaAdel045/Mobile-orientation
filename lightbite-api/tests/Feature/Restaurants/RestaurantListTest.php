<?php

declare(strict_types=1);

namespace Tests\Feature\Restaurants;

use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RestaurantListTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_list_nearby_restaurants(): void
    {
        $owner = User::factory()->restaurant()->create();
        Restaurant::factory()->create([
            'owner_id' => $owner->id,
            'name' => 'Spice Route',
            'lat' => 25.0801,
            'lng' => 55.1400,
            'cuisine_types' => ['lebanese'],
            'status' => 'active',
        ]);

        $response = $this->getJson('/api/v1/restaurants?lat=25.0801&lng=55.1400');

        $response->assertStatus(200)
            ->assertJsonPath('data.0.name', 'Spice Route');
    }

    public function test_lat_lng_required(): void
    {
        $response = $this->getJson('/api/v1/restaurants');

        $response->assertStatus(422);
    }

    public function test_inactive_restaurants_not_listed(): void
    {
        $owner = User::factory()->restaurant()->create();
        Restaurant::factory()->create([
            'owner_id' => $owner->id,
            'lat' => 25.0801,
            'lng' => 55.1400,
            'status' => 'pending_verification',
        ]);

        $response = $this->getJson('/api/v1/restaurants?lat=25.0801&lng=55.1400');

        $this->assertCount(0, $response->json('data'));
    }
}
