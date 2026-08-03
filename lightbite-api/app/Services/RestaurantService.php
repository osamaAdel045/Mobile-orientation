<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\RestaurantStatus;
use App\Models\MenuCategory;
use App\Models\MenuItem;
use App\Models\Restaurant;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Str;

class RestaurantService
{
    // ─── Discovery ──────────────────────────────────────────

    public function nearby(float $lat, float $lng, int $radius = 10, ?string $cuisine = null, ?string $search = null, string $sort = 'distance', int $perPage = 20): LengthAwarePaginator
    {
        // Bounding box pre-filter (approx 1° lat ≈ 111 km)
        $latDelta = $radius / 111.0;
        $lngDelta = $radius / (111.0 * cos(deg2rad($lat)));

        $query = Restaurant::query()
            ->active()
            ->acceptingOrders()
            ->whereBetween('lat', [$lat - $latDelta, $lat + $latDelta])
            ->whereBetween('lng', [$lng - $lngDelta, $lng + $lngDelta]);

        // Apply Haversine for precise distance calculation
        $haversine = '(6371 * acos(cos(radians(?)) * cos(radians(lat)) * cos(radians(lng) - radians(?)) + sin(radians(?)) * sin(radians(lat))))';
        $query->selectRaw("*, {$haversine} AS distance", [$lat, $lng, $lat])
            ->whereRaw("{$haversine} <= ?", [$lat, $lng, $lat, $radius]);

        if ($cuisine) {
            $cuisines = explode(',', $cuisine);
            $query->where(function ($q) use ($cuisines) {
                foreach ($cuisines as $c) {
                    $q->orWhereJsonContains('cuisine_types', trim($c));
                }
            });
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhereJsonContains('cuisine_types', $search);
            });
        }

        $sortDir = $sort === 'rating' ? 'desc' : 'asc';
        $sortCol = match ($sort) {
            'rating' => 'rating',
            'delivery_time' => 'prep_avg_time_min',
            default => 'distance',
        };

        return $query->orderBy($sortCol, $sortDir)->paginate($perPage);
    }

    // ─── Restaurant Profile ────────────────────────────────

    public function createProfile(int $ownerId, array $data): Restaurant
    {
        return Restaurant::create([
            'uuid' => (string) Str::uuid(),
            'owner_id' => $ownerId,
            'name' => $data['restaurant_name'],
            'cuisine_types' => $data['cuisine_types'],
            'phone' => $data['phone'] ?? '',
            'address' => $data['address'] ?? '',
            'lat' => $data['lat'] ?? 0,
            'lng' => $data['lng'] ?? 0,
            'status' => RestaurantStatus::PendingVerification,
            'trade_license_path' => $data['trade_license_path'] ?? null,
            'food_safety_cert_path' => $data['food_safety_cert_path'] ?? null,
        ]);
    }

    public function updateProfile(Restaurant $restaurant, array $data): Restaurant
    {
        $restaurant->update($data);

        return $restaurant->fresh();
    }

    // ─── Business Hours ─────────────────────────────────────

    public function setHours(Restaurant $restaurant, array $hours): void
    {
        $restaurant->hours()->delete();

        foreach ($hours as $hour) {
            $restaurant->hours()->create([
                'day_of_week' => $hour['day_of_week'],
                'open_time' => $hour['open_time'],
                'close_time' => $hour['close_time'],
                'is_closed' => $hour['is_closed'] ?? false,
            ]);
        }
    }

    // ─── Menu Categories ────────────────────────────────────

    public function createCategory(Restaurant $restaurant, array $data): MenuCategory
    {
        return $restaurant->categories()->create($data);
    }

    public function updateCategory(MenuCategory $category, array $data): MenuCategory
    {
        $category->update($data);

        return $category;
    }

    public function deleteCategory(MenuCategory $category): void
    {
        // Check for items before deleting
        if ($category->items()->exists()) {
            throw new \RuntimeException('Move or delete items before removing this category.');
        }
        $category->delete();
    }

    // ─── Menu Items ─────────────────────────────────────────

    public function createMenuItem(Restaurant $restaurant, int $categoryId, array $data): MenuItem
    {
        return $restaurant->menuItems()->create([
            'uuid' => (string) Str::uuid(),
            'category_id' => $categoryId,
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'price_fils' => $this->toFils($data['price']),
            'image_path' => $data['image_path'] ?? null,
            'is_available' => $data['is_available'] ?? true,
            'prep_time_minutes' => $data['prep_time_minutes'] ?? 15,
            'sort_order' => $data['sort_order'] ?? 0,
        ]);
    }

    public function updateMenuItem(MenuItem $item, array $data): MenuItem
    {
        if (isset($data['price'])) {
            $data['price_fils'] = $this->toFils($data['price']);
            unset($data['price']);
        }

        $item->update($data);

        return $item;
    }

    public function deleteMenuItem(MenuItem $item): void
    {
        $item->delete(); // Soft delete — historical orders retain snapshot
    }

    public function toggleItemAvailability(MenuItem $item): MenuItem
    {
        $item->update(['is_available' => ! $item->is_available]);

        return $item;
    }

    public function toggleAcceptingOrders(Restaurant $restaurant): Restaurant
    {
        $restaurant->update(['is_accepting_orders' => ! $restaurant->is_accepting_orders]);

        return $restaurant;
    }

    private function toFils(float $aed): int
    {
        return (int) round($aed * 100);
    }
}
