<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\RestaurantStatus;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class RestaurantFactory extends Factory
{
    public function definition(): array
    {
        $cuisines = ['lebanese', 'indian', 'italian', 'chinese', 'japanese', 'american', 'mexican', 'thai', 'middle_eastern', 'turkish'];

        return [
            'uuid' => (string) Str::uuid(),
            'owner_id' => User::factory()->restaurant(),
            'name' => fake()->company().' '.fake()->randomElement(['Kitchen', 'Bistro', 'Restaurant', 'Cafe']),
            'description' => fake()->sentence(),
            'cuisine_types' => fake()->randomElements($cuisines, rand(1, 3)),
            'phone' => '+9714'.fake()->numerify('#######'),
            'address' => fake()->address(),
            'lat' => 25.0000 + (fake()->randomFloat(7, 0, 20) / 100),
            'lng' => 55.0000 + (fake()->randomFloat(7, 0, 30) / 100),
            'status' => RestaurantStatus::Active,
            'commission_rate' => 0.120,
            'is_accepting_orders' => true,
        ];
    }

    public function pendingVerification(): static
    {
        return $this->state(fn () => ['status' => RestaurantStatus::PendingVerification]);
    }

    public function inactive(): static
    {
        return $this->state(fn () => ['status' => RestaurantStatus::Inactive, 'is_accepting_orders' => false]);
    }

    public function paused(): static
    {
        return $this->state(fn () => ['is_accepting_orders' => false]);
    }
}
