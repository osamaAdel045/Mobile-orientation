<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\RestaurantResource;
use App\Models\Restaurant;
use App\Services\RestaurantService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RestaurantController extends Controller
{
    public function __construct(private RestaurantService $restaurantService) {}

    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'lat' => ['required', 'numeric', 'between:-90,90'],
            'lng' => ['required', 'numeric', 'between:-180,180'],
            'radius' => ['nullable', 'integer', 'min:1', 'max:50'],
            'cuisine' => ['nullable', 'string'],
            'q' => ['nullable', 'string', 'min:2'],
            'sort' => ['nullable', 'string', 'in:distance,rating,delivery_time'],
            'per_page' => ['nullable', 'integer', 'min:10', 'max:100'],
        ]);

        $restaurants = $this->restaurantService->nearby(
            lat: (float) $request->input('lat'),
            lng: (float) $request->input('lng'),
            radius: (int) $request->input('radius', 10),
            cuisine: $request->input('cuisine'),
            search: $request->input('q'),
            sort: $request->input('sort', 'distance'),
            perPage: (int) $request->input('per_page', 20),
        );

        return response()->json([
            'data' => RestaurantResource::collection($restaurants),
            'links' => [
                'first' => $restaurants->url(1),
                'prev' => $restaurants->previousPageUrl(),
                'next' => $restaurants->nextPageUrl(),
                'last' => $restaurants->url($restaurants->lastPage()),
            ],
            'meta' => [
                'current_page' => $restaurants->currentPage(),
                'per_page' => $restaurants->perPage(),
                'total' => $restaurants->total(),
                'trace_id' => $request->header('X-Trace-Id', ''),
            ],
        ]);
    }

    public function show(string $uuid): JsonResponse
    {
        $restaurant = Restaurant::where('uuid', $uuid)->with(['categories.items', 'hours'])->firstOrFail();

        return response()->json([
            'data' => new RestaurantResource($restaurant),
            'meta' => ['trace_id' => request()->header('X-Trace-Id', '')],
        ]);
    }

    public function menu(string $uuid): JsonResponse
    {
        $restaurant = Restaurant::where('uuid', $uuid)->firstOrFail();

        return response()->json([
            'data' => [
                'restaurant_uuid' => $restaurant->uuid,
                'restaurant_name' => $restaurant->name,
                'categories' => $restaurant->categories()
                    ->with(['items' => fn ($q) => $q->where('is_available', true)->orderBy('sort_order')])
                    ->orderBy('sort_order')
                    ->get()
                    ->map(fn ($cat) => [
                        'name' => $cat->name,
                        'items' => $cat->items->map(fn ($item) => [
                            'uuid' => $item->uuid,
                            'name' => $item->name,
                            'description' => $item->description,
                            'price' => number_format($item->price_fils / 100, 2),
                            'image_url' => $item->image_path ? url($item->image_path) : null,
                            'is_available' => $item->is_available,
                        ]),
                    ]),
            ],
            'meta' => ['trace_id' => request()->header('X-Trace-Id', '')],
        ]);
    }
}
