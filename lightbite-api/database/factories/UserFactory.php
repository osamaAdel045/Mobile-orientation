<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\UserRole;
use App\Enums\UserStatus;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class UserFactory extends Factory
{
    protected static ?string $password;

    public function definition(): array
    {
        return [
            'uuid' => (string) Str::uuid(),
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= bcrypt('SecureP4ss!'),
            'role' => UserRole::Customer,
            'status' => UserStatus::Verified,
            'phone' => '+97150'.fake()->numerify('#######'),
            'locale' => 'en',
        ];
    }

    public function customer(): static
    {
        return $this->state(fn () => ['role' => UserRole::Customer, 'status' => UserStatus::Verified]);
    }

    public function restaurant(): static
    {
        return $this->state(fn () => ['role' => UserRole::Restaurant, 'status' => UserStatus::Verified]);
    }

    public function driver(): static
    {
        return $this->state(fn () => ['role' => UserRole::Driver, 'status' => UserStatus::Verified]);
    }

    public function admin(): static
    {
        return $this->state(fn () => ['role' => UserRole::Admin, 'status' => UserStatus::Verified]);
    }

    public function unverified(): static
    {
        return $this->state(fn () => [
            'email_verified_at' => null,
            'status' => UserStatus::PendingVerification,
        ]);
    }

    public function pendingVerification(): static
    {
        return $this->state(fn () => ['status' => UserStatus::PendingVerification]);
    }
}
