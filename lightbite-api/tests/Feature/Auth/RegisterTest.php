<?php

declare(strict_types=1);

namespace Tests\Feature\Auth;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegisterTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_can_register(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Sarah Chen',
            'email' => 'sarah@example.com',
            'password' => 'SecureP4ss!',
            'password_confirmation' => 'SecureP4ss!',
            'role' => 'customer',
            'phone' => '+971501234567',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => [
                    'user' => ['uuid', 'name', 'email', 'role', 'status', 'created_at'],
                    'access_token',
                    'refresh_token',
                    'expires_in',
                ],
                'meta' => ['trace_id'],
            ]);

        $this->assertDatabaseHas('users', ['email' => 'sarah@example.com', 'role' => 'customer']);
    }

    public function test_register_validates_password_strength(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Test',
            'email' => 'test@example.com',
            'password' => 'weak',
            'password_confirmation' => 'weak',
            'role' => 'customer',
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('error.code', 'VALIDATION_ERROR');
    }

    public function test_register_rejects_duplicate_email(): void
    {
        $this->postJson('/api/v1/auth/register', [
            'name' => 'First',
            'email' => 'dupe@example.com',
            'password' => 'SecureP4ss!',
            'password_confirmation' => 'SecureP4ss!',
            'role' => 'customer',
        ]);

        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Second',
            'email' => 'dupe@example.com',
            'password' => 'SecureP4ss!',
            'password_confirmation' => 'SecureP4ss!',
            'role' => 'customer',
        ]);

        $response->assertStatus(409)
            ->assertJsonPath('error.code', 'EMAIL_TAKEN');
    }

    public function test_register_requires_valid_role(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Test',
            'email' => 'test@example.com',
            'password' => 'SecureP4ss!',
            'password_confirmation' => 'SecureP4ss!',
            'role' => 'invalid_role',
        ]);

        $response->assertStatus(422);
    }
}
