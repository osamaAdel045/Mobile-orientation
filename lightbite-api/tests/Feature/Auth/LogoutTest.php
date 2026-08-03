<?php

declare(strict_types=1);

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LogoutTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_logout(): void
    {
        $user = User::factory()->customer()->create();

        $login = $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => 'SecureP4ss!',
        ]);

        $accessToken = $login->json('data.access_token');
        $refreshToken = $login->json('data.refresh_token');

        $response = $this->withHeader('Authorization', "Bearer {$accessToken}")
            ->postJson('/api/v1/auth/logout', [
                'refresh_token' => $refreshToken,
            ]);

        $response->assertStatus(204);

        // Refresh token should no longer work
        $reuse = $this->postJson('/api/v1/auth/refresh', [
            'refresh_token' => $refreshToken,
        ]);

        $reuse->assertStatus(401);
    }
}
