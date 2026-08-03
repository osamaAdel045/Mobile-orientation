<?php

declare(strict_types=1);

namespace Tests\Feature\Driver;

use App\Models\DriverLocation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DriverFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_driver_can_toggle_online(): void
    {
        $driver = User::factory()->driver()->create();

        $response = $this->actingAs($driver, 'api')
            ->patchJson('/api/v1/driver/status', ['is_online' => true]);

        $response->assertStatus(200)
            ->assertJsonPath('data.is_online', true);

        $this->assertDatabaseHas('driver_locations', ['driver_id' => $driver->id, 'is_online' => true]);
    }

    public function test_driver_can_update_location(): void
    {
        $driver = User::factory()->driver()->create();
        DriverLocation::create(['driver_id' => $driver->id, 'lat' => 0, 'lng' => 0, 'is_online' => true]);

        $response = $this->actingAs($driver, 'api')
            ->postJson('/api/v1/driver/location', [
                'lat' => 25.0801,
                'lng' => 55.1400,
                'bearing' => 90,
            ]);

        $response->assertStatus(200);
        $this->assertEqualsWithDelta(25.0801, (float) $response->json('data.lat'), 0.0001);
    }

    public function test_driver_can_go_offline(): void
    {
        $driver = User::factory()->driver()->create();

        $this->actingAs($driver, 'api')
            ->patchJson('/api/v1/driver/status', ['is_online' => false]);

        $this->assertDatabaseHas('driver_locations', ['driver_id' => $driver->id, 'is_online' => false]);
    }
}
