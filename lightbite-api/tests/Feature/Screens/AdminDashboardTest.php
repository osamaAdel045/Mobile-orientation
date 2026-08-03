<?php

declare(strict_types=1);

namespace Tests\Feature\Screens;

use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminDashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_view_dashboard(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin, 'api')
            ->getJson('/api/v1/admin/dashboard');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => ['theme', 'metrics', 'stuck_orders'],
            ])
            ->assertJsonPath('data.metrics.active_orders', 0)
            ->assertJsonPath('data.metrics.online_drivers', 0)
            ->assertJsonPath('data.metrics.active_restaurants', 0);
    }

    public function test_non_admin_cannot_view_admin_dashboard(): void
    {
        $customer = User::factory()->customer()->create();

        $response = $this->actingAs($customer, 'api')
            ->getJson('/api/v1/admin/dashboard');

        $response->assertStatus(403);
    }

    public function test_admin_sees_pending_verifications(): void
    {
        $admin = User::factory()->admin()->create();
        $owner = User::factory()->restaurant()->create();
        Restaurant::factory()->create(['owner_id' => $owner->id, 'status' => 'pending_verification']);

        $response = $this->actingAs($admin, 'api')
            ->getJson('/api/v1/admin/dashboard');

        $response->assertJsonPath('data.metrics.pending_restaurant_verifications', 1);
    }

    public function test_revenue_chart_endpoint(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin, 'api')
            ->getJson('/api/v1/admin/dashboard/revenue-chart?days=7');

        $response->assertStatus(200)
            ->assertJsonStructure(['data' => [['date', 'revenue']]]);
    }

    public function test_revenue_chart_defaults_to_7_days(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin, 'api')
            ->getJson('/api/v1/admin/dashboard/revenue-chart');

        $response->assertStatus(200);
        $this->assertCount(7, $response->json('data'));
    }

    public function test_order_volume_endpoint(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin, 'api')
            ->getJson('/api/v1/admin/dashboard/order-volume?days=7');

        $response->assertStatus(200)
            ->assertJsonStructure(['data' => [['date', 'total', 'delivered', 'cancelled']]]);
    }

    public function test_top_restaurants_endpoint(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin, 'api')
            ->getJson('/api/v1/admin/dashboard/top-restaurants?days=7');

        $response->assertStatus(200)
            ->assertJsonStructure(['data']);
    }

    public function test_recent_activity_endpoint(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin, 'api')
            ->getJson('/api/v1/admin/dashboard/recent-activity?limit=10');

        $response->assertStatus(200)
            ->assertJsonStructure(['data']);
    }

    public function test_dashboard_sub_endpoints_require_admin(): void
    {
        $customer = User::factory()->customer()->create();

        $endpoints = [
            '/api/v1/admin/dashboard/revenue-chart',
            '/api/v1/admin/dashboard/order-volume',
            '/api/v1/admin/dashboard/top-restaurants',
            '/api/v1/admin/dashboard/recent-activity',
        ];

        foreach ($endpoints as $endpoint) {
            $response = $this->actingAs($customer, 'api')->getJson($endpoint);
            $response->assertStatus(403);
        }
    }
}
