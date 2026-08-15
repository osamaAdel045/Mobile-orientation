<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\MenuCategory;
use App\Models\MenuItem;
use App\Models\Order;
use App\Services\OrderService;
use App\Services\RestaurantService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class RestaurantDashboardController extends Controller
{
    public function __construct(
        private RestaurantService $restaurantService,
        private OrderService $orderService,
    ) {}

    // ─── Dashboard ─────────────────────────────────────────

    public function dashboard(Request $request): JsonResponse
    {
        $restaurant = $request->user()->restaurant;

        $todayOrders = $restaurant->orders()->whereDate('created_at', today())->count();
        $todayRevenue = $restaurant->orders()->whereDate('created_at', today())
            ->whereIn('status', ['delivered', 'resolved', 'refunded'])
            ->sum('subtotal_fils');

        return response()->json([
            'data' => [
                'today_orders' => $todayOrders,
                'today_revenue' => number_format($todayRevenue / 100, 2),
                'active_orders' => $restaurant->orders()->whereIn('status', ['confirmed', 'preparing', 'ready'])->count(),
                'pending_orders' => $restaurant->orders()->where('status', 'pending')->count(),
                'is_accepting_orders' => $restaurant->is_accepting_orders,
            ],
            'meta' => ['trace_id' => $request->header('X-Trace-Id', '')],
        ]);
    }

    // ─── Profile ───────────────────────────────────────────

    public function profile(Request $request): JsonResponse
    {
        return response()->json([
            'data' => $request->user()->restaurant->load('hours'),
            'meta' => ['trace_id' => $request->header('X-Trace-Id', '')],
        ]);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'cuisine_types' => ['sometimes', 'array', 'min:1'],
            'phone' => ['sometimes', 'string', 'max:20'],
            'address' => ['sometimes', 'string', 'max:500'],
            'lat' => ['sometimes', 'numeric'],
            'lng' => ['sometimes', 'numeric'],
        ]);

        $restaurant = $this->restaurantService->updateProfile($request->user()->restaurant, $validated);

        return response()->json([
            'data' => $restaurant,
            'meta' => ['trace_id' => $request->header('X-Trace-Id', '')],
        ]);
    }

    // ─── Business Hours ─────────────────────────────────────

    public function updateHours(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'hours' => ['required', 'array'],
            'hours.*.day_of_week' => ['required', 'integer', 'between:0,6'],
            'hours.*.open_time' => ['required', 'date_format:H:i'],
            'hours.*.close_time' => ['required', 'date_format:H:i', 'after:hours.*.open_time'],
            'hours.*.is_closed' => ['boolean'],
        ]);

        $this->restaurantService->setHours($request->user()->restaurant, $validated['hours']);

        return response()->json([
            'data' => ['message' => 'Hours updated.'],
            'meta' => ['trace_id' => $request->header('X-Trace-Id', '')],
        ]);
    }

    // ─── Categories ─────────────────────────────────────────

    public function categories(Request $request): JsonResponse
    {
        return response()->json([
            'data' => $request->user()->restaurant->categories()->orderBy('sort_order')->get(),
            'meta' => ['trace_id' => $request->header('X-Trace-Id', '')],
        ]);
    }

    public function createCategory(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:255'],
            'sort_order' => ['nullable', 'integer'],
        ]);

        $category = $this->restaurantService->createCategory($request->user()->restaurant, $validated);

        return response()->json([
            'data' => $category,
            'meta' => ['trace_id' => $request->header('X-Trace-Id', '')],
        ], Response::HTTP_CREATED);
    }

    public function updateCategory(Request $request, MenuCategory $category): JsonResponse
    {
        $this->authorizeRestaurant($request, $category->restaurant_id);

        $category = $this->restaurantService->updateCategory($category, $request->validate([
            'name' => ['sometimes', 'string', 'max:100'],
            'description' => ['nullable', 'string'],
            'sort_order' => ['nullable', 'integer'],
        ]));

        return response()->json([
            'data' => $category,
            'meta' => ['trace_id' => $request->header('X-Trace-Id', '')],
        ]);
    }

    public function deleteCategory(Request $request, MenuCategory $category): JsonResponse
    {
        $this->authorizeRestaurant($request, $category->restaurant_id);

        try {
            $this->restaurantService->deleteCategory($category);
        } catch (\RuntimeException $e) {
            return response()->json([
                'error' => ['code' => 'CATEGORY_HAS_ITEMS', 'message' => $e->getMessage()],
                'meta' => ['trace_id' => $request->header('X-Trace-Id', '')],
            ], Response::HTTP_CONFLICT);
        }

        return response()->noContent();
    }

    // ─── Menu Items ─────────────────────────────────────────

    public function createMenuItem(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'category_id' => ['required', 'integer', 'exists:menu_categories,id'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'price' => ['required', 'numeric', 'min:0.01'],
            'image_path' => ['nullable', 'string'],
            'prep_time_minutes' => ['nullable', 'integer', 'min:5'],
            'sort_order' => ['nullable', 'integer'],
        ]);

        $item = $this->restaurantService->createMenuItem(
            $request->user()->restaurant,
            $validated['category_id'],
            $validated,
        );

        return response()->json([
            'data' => $item,
            'meta' => ['trace_id' => $request->header('X-Trace-Id', '')],
        ], Response::HTTP_CREATED);
    }

    public function updateMenuItem(Request $request, MenuItem $item): JsonResponse
    {
        $this->authorizeRestaurant($request, $item->restaurant_id);

        $item = $this->restaurantService->updateMenuItem($item, $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'price' => ['sometimes', 'numeric', 'min:0.01'],
            'category_id' => ['sometimes', 'integer', 'exists:menu_categories,id'],
            'prep_time_minutes' => ['nullable', 'integer'],
            'sort_order' => ['nullable', 'integer'],
        ]));

        return response()->json([
            'data' => $item,
            'meta' => ['trace_id' => $request->header('X-Trace-Id', '')],
        ]);
    }

    public function deleteMenuItem(Request $request, MenuItem $item): JsonResponse
    {
        $this->authorizeRestaurant($request, $item->restaurant_id);
        $this->restaurantService->deleteMenuItem($item);

        return response()->noContent();
    }

    public function toggleItem(MenuItem $item): JsonResponse
    {
        $item = $this->restaurantService->toggleItemAvailability($item);

        return response()->json([
            'data' => $item,
            'meta' => ['trace_id' => request()->header('X-Trace-Id', '')],
        ]);
    }

    public function togglePause(Request $request): JsonResponse
    {
        $restaurant = $this->restaurantService->toggleAcceptingOrders($request->user()->restaurant);

        return response()->json([
            'data' => [
                'is_accepting_orders' => $restaurant->is_accepting_orders,
                'message' => $restaurant->is_accepting_orders ? 'Orders resumed.' : 'Orders paused.',
            ],
            'meta' => ['trace_id' => $request->header('X-Trace-Id', '')],
        ]);
    }

    // ─── Helpers ────────────────────────────────────────────

    // ─── Order Management ─────────────────────────────────

    public function orders(Request $request): JsonResponse
    {
        $paginator = $request->user()->restaurant->orders()
            ->with(['items', 'customer:id,uuid,name'])
            ->when($request->status, fn ($q) => $q->whereIn('status', explode(',', $request->status)))
            ->latest()
            ->paginate(20);

        return response()->json([
            'data' => collect($paginator->items())->map(fn ($o) => [
                'uuid' => $o->uuid,
                'order_number' => $o->order_number,
                'status' => $o->status->value,
                'customer_name' => $o->customer->name,
                'items_summary' => $o->items->pluck('name')->join(', '),
                'total' => number_format($o->total_fils / 100, 2),
                'created_at' => $o->created_at->toISOString(),
            ])->values(),
            'meta' => ['current_page' => $paginator->currentPage(), 'total' => $paginator->total()],
        ]);
    }

    public function orderDetail(Request $request, string $uuid): JsonResponse
    {
        $order = $request->user()->restaurant->orders()
            ->where('uuid', $uuid)
            ->with(['items', 'customer', 'driver', 'statusLog'])
            ->firstOrFail();

        return response()->json(['data' => $order->load('items')]);
    }

    public function acceptOrder(Request $request, string $uuid): JsonResponse
    {
        $order = $request->user()->restaurant->orders()->where('uuid', $uuid)->firstOrFail();

        try {
            $this->orderService->confirm($order, $request->user(), (int) $request->input('estimated_prep_min', 20));

            return response()->json(['data' => ['status' => 'confirmed']]);
        } catch (\RuntimeException $e) {
            return response()->json(['error' => ['code' => 'INVALID_TRANSITION', 'message' => $e->getMessage()]], Response::HTTP_CONFLICT);
        }
    }

    public function rejectOrder(Request $request, string $uuid): JsonResponse
    {
        $order = $request->user()->restaurant->orders()->where('uuid', $uuid)->firstOrFail();
        $reason = $request->input('reason', 'Restaurant cannot fulfill this order.');

        try {
            $this->orderService->reject($order, $request->user(), $reason);

            return response()->json(['data' => ['status' => 'rejected']]);
        } catch (\RuntimeException $e) {
            return response()->json(['error' => ['code' => 'INVALID_TRANSITION', 'message' => $e->getMessage()]], Response::HTTP_CONFLICT);
        }
    }

    public function updateOrderStatus(Request $request, string $uuid): JsonResponse
    {
        $order = $request->user()->restaurant->orders()->where('uuid', $uuid)->firstOrFail();
        $status = $request->input('status');

        try {
            $result = match ($status) {
                'preparing' => $this->orderService->startPreparing($order, $request->user()),
                'ready' => $this->orderService->markReady($order, $request->user()),
                default => throw new \RuntimeException("Invalid status: {$status}"),
            };

            return response()->json(['data' => ['status' => $result->status->value]]);
        } catch (\RuntimeException $e) {
            return response()->json(['error' => ['code' => 'INVALID_TRANSITION', 'message' => $e->getMessage()]], Response::HTTP_CONFLICT);
        }
    }

    public function earnings(Request $request): JsonResponse
    {
        $restaurant = $request->user()->restaurant;
        $completedOrders = $restaurant->orders()
            ->whereIn('status', ['delivered', 'resolved', 'refunded'])
            ->whereBetween('created_at', [
                $request->input('from', now()->subDays(30)->toDateString()),
                $request->input('to', now()->toDateString()),
            ])
            ->get();

        $grossRevenue = $completedOrders->sum('subtotal_fils');
        $totalCommission = $completedOrders->sum('commission_fils');
        $netRevenue = $grossRevenue - $totalCommission;

        return response()->json([
            'data' => [
                'total_orders' => $completedOrders->count(),
                'gross_revenue' => number_format($grossRevenue / 100, 2),
                'total_commission' => number_format($totalCommission / 100, 2),
                'net_revenue' => number_format($netRevenue / 100, 2),
                'orders' => $completedOrders->take(50)->map(fn ($o) => [
                    'uuid' => $o->uuid,
                    'order_number' => $o->order_number,
                    'subtotal' => number_format($o->subtotal_fils / 100, 2),
                    'commission' => number_format($o->commission_fils / 100, 2),
                    'net' => number_format(($o->subtotal_fils - $o->commission_fils) / 100, 2),
                    'delivered_at' => $o->updated_at->toISOString(),
                ]),
            ],
        ]);
    }

    private function authorizeRestaurant(Request $request, int $restaurantId): void
    {
        abort_if($request->user()->restaurant->id !== $restaurantId, 403);
    }
}
