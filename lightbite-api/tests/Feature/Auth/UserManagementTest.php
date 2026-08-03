<?php

declare(strict_types=1);

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserManagementTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $customer;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->admin()->create();
        $this->customer = User::factory()->customer()->create();
    }

    // ─── List & Filter ────────────────────────────────────

    public function test_admin_can_list_users(): void
    {
        $response = $this->actingAs($this->admin, 'api')
            ->getJson('/api/v1/admin/users');

        $response->assertStatus(200)
            ->assertJsonStructure(['data', 'current_page', 'total', 'last_page']);
    }

    public function test_admin_can_filter_users_by_role(): void
    {
        User::factory()->customer()->create();
        User::factory()->driver()->create();

        $response = $this->actingAs($this->admin, 'api')
            ->getJson('/api/v1/admin/users?role=customer');

        $response->assertStatus(200);
        $users = $response->json('data');
        $this->assertNotEmpty($users);
        // Data is an array keyed by index — each element is an array
        $firstUser = array_values($users)[0];
        $this->assertEquals('customer', $firstUser['role']);
    }

    public function test_admin_can_search_users(): void
    {
        $response = $this->actingAs($this->admin, 'api')
            ->getJson('/api/v1/admin/users?search='.$this->customer->name);

        $response->assertStatus(200);
        $this->assertNotEmpty($response->json('data'));
    }

    public function test_non_admin_cannot_list_users(): void
    {
        $response = $this->actingAs($this->customer, 'api')
            ->getJson('/api/v1/admin/users');

        $response->assertStatus(403);
    }

    // ─── User Detail ──────────────────────────────────────

    public function test_admin_can_view_user_detail(): void
    {
        $response = $this->actingAs($this->admin, 'api')
            ->getJson("/api/v1/admin/users/{$this->customer->uuid}");

        $response->assertStatus(200)
            ->assertJsonPath('data.name', $this->customer->name)
            ->assertJsonPath('data.role', 'customer');
    }

    public function test_user_detail_includes_role_specific_data(): void
    {
        $response = $this->actingAs($this->admin, 'api')
            ->getJson("/api/v1/admin/users/{$this->customer->uuid}");

        $response->assertJsonStructure([
            'data' => ['uuid', 'name', 'email', 'role', 'status', 'addresses', 'stats', 'recent_orders'],
        ]);
    }

    // ─── Suspend / Unsuspend ─────────────────────────────

    public function test_admin_can_suspend_user(): void
    {
        $response = $this->actingAs($this->admin, 'api')
            ->postJson("/api/v1/admin/users/{$this->customer->uuid}/suspend", [
                'reason' => 'Violation of terms.',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'suspended');

        $this->assertEquals('suspended', $this->customer->fresh()->status->value);
    }

    public function test_admin_can_unsuspend_user(): void
    {
        $this->customer->update(['status' => \App\Enums\UserStatus::Suspended]);

        $response = $this->actingAs($this->admin, 'api')
            ->postJson("/api/v1/admin/users/{$this->customer->uuid}/unsuspend");

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'verified');

        $this->assertEquals('verified', $this->customer->fresh()->status->value);
    }

    // ─── Deactivate ──────────────────────────────────────

    public function test_admin_can_deactivate_user(): void
    {
        $response = $this->actingAs($this->admin, 'api')
            ->postJson("/api/v1/admin/users/{$this->customer->uuid}/deactivate", [
                'reason' => 'Account terminated.',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'deactivated');

        $this->assertEquals('deactivated', $this->customer->fresh()->status->value);
    }

    public function test_suspend_logs_audit_trail(): void
    {
        $response = $this->actingAs($this->admin, 'api')
            ->postJson("/api/v1/admin/users/{$this->customer->uuid}/suspend", [
                'reason' => 'Test suspension.',
            ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'user.suspended',
            'resource_type' => 'user',
            'resource_id' => $this->customer->id,
        ]);
    }

    public function test_deactivate_also_closes_restaurant(): void
    {
        // Create a restaurant owner
        $owner = User::factory()->restaurant()->create(['status' => \App\Enums\UserStatus::Verified]);
        // Create the restaurant linked to this owner
        $restaurant = \App\Models\Restaurant::factory()->create([
            'owner_id' => $owner->id,
            'status' => \App\Enums\RestaurantStatus::Active,
        ]);

        $response = $this->actingAs($this->admin, 'api')
            ->postJson("/api/v1/admin/users/{$owner->uuid}/deactivate", [
                'reason' => 'Terminating restaurant owner.',
            ]);

        $response->assertStatus(200);

        $this->assertEquals('deactivated', $owner->fresh()->status->value);
        $this->assertEquals('permanently_closed', $restaurant->fresh()->status->value);
    }
}
