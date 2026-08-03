<?php

declare(strict_types=1);

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RefreshTest extends TestCase
{
    use RefreshDatabase;

    public function test_token_can_be_refreshed(): void
    {
        $user = User::factory()->customer()->create();

        // Login to get tokens
        $login = $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => 'SecureP4ss!',
        ]);

        $refreshToken = $login->json('data.refresh_token');

        // Refresh
        $response = $this->postJson('/api/v1/auth/refresh', [
            'refresh_token' => $refreshToken,
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => ['access_token', 'refresh_token', 'expires_in'],
            ]);

        // Old refresh token should be revoked
        $reuse = $this->postJson('/api/v1/auth/refresh', [
            'refresh_token' => $refreshToken,
        ]);

        $reuse->assertStatus(401);
    }

    public function test_invalid_refresh_token_is_rejected(): void
    {
        $response = $this->postJson('/api/v1/auth/refresh', [
            'refresh_token' => 'invalid-token',
        ]);

        $response->assertStatus(401);
    }
}
