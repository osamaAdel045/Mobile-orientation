<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RestaurantResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'uuid' => $this->uuid,
            'name' => $this->name,
            'logo_url' => $this->logo_path ? url($this->logo_path) : null,
            'cover_url' => $this->cover_path ? url($this->cover_path) : null,
            'cuisine_types' => $this->cuisine_types,
            'rating' => $this->whenLoaded('ratings', fn () => $this->ratings->avg('stars') ? round($this->ratings->avg('stars'), 1) : null),
            'review_count' => $this->whenCounted('ratings'),
            'delivery_time_min' => $this->prep_avg_time_min + 10, // prep + transit estimate
            'delivery_fee' => 'AED 5.00', // TODO: calculate from distance
            'distance_km' => $this->whenHas('distance', fn () => round((float) $this->distance, 1)),
            'is_open' => $this->is_accepting_orders,
            'address' => $this->address,
            'phone' => $this->phone,
            'hours' => $this->whenLoaded('hours'),
            'categories' => $this->whenLoaded('categories', fn () => $this->categories->map(fn ($cat) => [
                'name' => $cat->name,
                'items' => $cat->items->map(fn ($item) => [
                    'uuid' => $item->uuid,
                    'name' => $item->name,
                    'description' => $item->description,
                    'price' => number_format($item->price_fils / 100, 2),
                    'image_url' => $item->image_path ? url($item->image_path) : null,
                    'is_available' => $item->is_available,
                ]),
            ])),
        ];
    }
}
