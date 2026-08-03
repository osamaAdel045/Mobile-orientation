<?php

declare(strict_types=1);

namespace Tests\Feature\Theme;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ThemeManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_theme_endpoint_returns_default_theme(): void
    {
        $response = $this->getJson('/api/v1/theme');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => ['version', 'colors', 'typography', 'spacing', 'border_radius', 'shadows'],
            ])
            ->assertJsonPath('data.colors.primary.500', '#F97316');
    }

    public function test_admin_can_update_theme(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin, 'api')
            ->putJson('/api/v1/admin/theme', [
                'colors' => [
                    'primary' => ['500' => '#FF0000'],
                ],
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.theme.colors.primary.500', '#FF0000')
            ->assertJsonPath('data.message', 'Theme updated. Silent push notification queued to all devices.');
    }

    public function test_public_theme_reflects_admin_changes(): void
    {
        $admin = User::factory()->admin()->create();

        // Admin updates theme
        $this->actingAs($admin, 'api')
            ->putJson('/api/v1/admin/theme', [
                'colors' => ['primary' => ['500' => '#00FF00']],
            ]);

        // Public endpoint returns updated theme
        $response = $this->getJson('/api/v1/theme');

        $response->assertJsonPath('data.colors.primary.500', '#00FF00');
    }

    public function test_admin_can_reset_theme(): void
    {
        $admin = User::factory()->admin()->create();

        // Change theme
        $this->actingAs($admin, 'api')
            ->putJson('/api/v1/admin/theme', [
                'colors' => ['primary' => ['500' => '#FF0000']],
            ]);

        // Reset
        $response = $this->actingAs($admin, 'api')
            ->postJson('/api/v1/admin/theme/reset');

        $response->assertStatus(200);

        // Verify reset
        $theme = $this->getJson('/api/v1/theme');
        $theme->assertJsonPath('data.colors.primary.500', '#F97316');
    }

    public function test_invalid_color_is_rejected(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin, 'api')
            ->putJson('/api/v1/admin/theme', [
                'colors' => ['primary' => ['500' => 'not-a-color']],
            ]);

        $response->assertStatus(422)
            ->assertJsonPath('error.code', 'INVALID_THEME');
    }

    public function test_non_admin_cannot_update_theme(): void
    {
        $customer = User::factory()->customer()->create();

        $response = $this->actingAs($customer, 'api')
            ->putJson('/api/v1/admin/theme', [
                'colors' => ['primary' => ['500' => '#FF0000']],
            ]);

        $response->assertStatus(403);
    }
}
