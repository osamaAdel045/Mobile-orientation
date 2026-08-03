<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\RestaurantResource;
use App\Models\AuditLog;
use App\Models\Dispute;
use App\Models\DriverLocation;
use App\Models\Order;
use App\Models\OrderStatusLog;
use App\Models\Restaurant;
use App\Models\User;
use App\Services\DriverService;
use App\Services\ThemeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ScreenController extends Controller
{
    public function __construct(
        private ThemeService $themeService,
        private DriverService $driverService,
    ) {}

    // ─── Customer Home Screen ──────────────────────────────

    /**
     * Single endpoint that bundles everything the customer home screen needs:
     * theme, nearby restaurants, active order, user profile, saved addresses.
     */
    public function customerHome(Request $request): JsonResponse
    {
        $user = $request->user();
        $lat = (float) $request->input('lat', $user->addresses()->where('is_default', true)->value('lat') ?? 25.0801);
        $lng = (float) $request->input('lng', $user->addresses()->where('is_default', true)->value('lng') ?? 55.1400);

        // Active order
        $activeOrder = $user->customerOrders()
            ->whereIn('status', ['pending', 'confirmed', 'preparing', 'ready', 'assigned', 'picked_up', 'delivering'])
            ->with(['restaurant', 'driver', 'items', 'statusLog'])
            ->latest()
            ->first();

        // Nearby restaurants
        $restaurants = Restaurant::active()->acceptingOrders()
            ->selectRaw('*, (6371 * acos(cos(radians(?)) * cos(radians(lat)) * cos(radians(lng) - radians(?)) + sin(radians(?)) * sin(radians(lat)))) AS distance', [$lat, $lng, $lat])
            ->whereRaw('(6371 * acos(cos(radians(?)) * cos(radians(lat)) * cos(radians(lng) - radians(?)) + sin(radians(?)) * sin(radians(lat)))) <= 10', [$lat, $lng, $lat])
            ->orderBy('distance')
            ->limit(10)
            ->get();

        return response()->json([
            'data' => [
                'theme' => $this->themeService->getTheme(),
                'user' => [
                    'uuid' => $user->uuid,
                    'name' => $user->name,
                    'email' => $user->email,
                    'photo_url' => $user->photo_path ? url($user->photo_path) : null,
                ],
                'active_order' => $activeOrder ? $this->formatActiveOrder($activeOrder) : null,
                'nearby_restaurants' => RestaurantResource::collection($restaurants),
                'saved_addresses' => $user->addresses->map(fn ($a) => [
                    'uuid' => $a->uuid,
                    'label' => $a->label,
                    'address' => $a->address,
                    'is_default' => $a->is_default,
                ]),
            ],
            'meta' => ['trace_id' => $request->header('X-Trace-Id', '')],
        ]);
    }

    // ─── Driver Home Screen ────────────────────────────────

    /**
     * Bundles everything the driver home screen needs:
     * online status, active delivery, recent earnings, theme.
     */
    public function driverHome(Request $request): JsonResponse
    {
        $driver = $request->user();
        $location = $driver->driverLocation;

        // Active delivery
        $activeDelivery = $driver->driverOrders()
            ->whereIn('status', ['assigned', 'picked_up', 'delivering'])
            ->with(['restaurant', 'customer', 'items'])
            ->latest()
            ->first();

        // Pending job offers (ready orders near driver)
        $pendingJobs = [];
        if ($location?->is_online && ! $activeDelivery) {
            $orderService = app(\App\Services\OrderService::class);
            $driverLat = (float) ($location->lat ?: 0);
            $driverLng = (float) ($location->lng ?: 0);

            $pendingJobs = Order::where('status', 'ready')
                ->whereNull('driver_id')
                ->with('restaurant')
                ->latest()
                ->take(5)
                ->get()
                ->map(fn ($o) => [
                    'uuid' => $o->uuid,
                    'order_number' => $o->order_number,
                    'restaurant_name' => $o->restaurant->name,
                    'restaurant_lat' => $o->restaurant->lat,
                    'restaurant_lng' => $o->restaurant->lng,
                    'estimated_earnings' => number_format(
                        $orderService->estimateDriverEarnings(
                            (float) $o->restaurant->lat, (float) $o->restaurant->lng,
                            $driverLat, $driverLng
                        ) / 100, 2
                    ),
                    'created_at' => $o->created_at->diffForHumans(),
                ]);
        }

        $earnings = $this->driverService->getEarnings($driver);

        return response()->json([
            'data' => [
                'theme' => $this->themeService->getTheme(),
                'driver' => [
                    'uuid' => $driver->uuid,
                    'name' => $driver->name,
                    'is_online' => $location?->is_online ?? false,
                ],
                'active_delivery' => $activeDelivery ? [
                    'order_uuid' => $activeDelivery->uuid,
                    'order_number' => $activeDelivery->order_number,
                    'status' => $activeDelivery->status->value,
                    'restaurant' => ['name' => $activeDelivery->restaurant->name, 'address' => $activeDelivery->restaurant->address],
                    'customer' => ['name' => $activeDelivery->customer->name],
                    'delivery_address' => $activeDelivery->delivery_address_snapshot,
                    'items_count' => $activeDelivery->items->count(),
                ] : null,
                'pending_jobs' => $pendingJobs,
                'earnings' => $earnings,
            ],
            'meta' => ['trace_id' => $request->header('X-Trace-Id', '')],
        ]);
    }

    // ─── Restaurant Dashboard Home ─────────────────────────

    /**
     * Bundles everything the restaurant dashboard home needs:
     * today's stats, pending orders, active orders, theme.
     */
    public function restaurantDashboardHome(Request $request): JsonResponse
    {
        if (! $request->user()->restaurant) {
            abort(403, 'Restaurant account required.');
        }
        $restaurant = $request->user()->restaurant;

        $todayOrders = $restaurant->orders()->whereDate('created_at', today());
        $todayDelivered = (clone $todayOrders)->whereIn('status', ['delivered', 'resolved', 'refunded']);
        $activeOrders = $restaurant->orders()->whereIn('status', ['confirmed', 'preparing', 'ready', 'assigned', 'picked_up', 'delivering'])
            ->with(['items', 'driver:id,uuid,name'])
            ->latest()
            ->get();

        $pendingCount = $restaurant->orders()->where('status', 'pending')->count();

        // Revenue stats
        $todayRevenue = $todayDelivered->sum('subtotal_fils');
        $todayCommission = $todayDelivered->sum('commission_fils');

        return response()->json([
            'data' => [
                'theme' => $this->themeService->getTheme(),
                'restaurant' => [
                    'uuid' => $restaurant->uuid,
                    'name' => $restaurant->name,
                    'is_accepting_orders' => $restaurant->is_accepting_orders,
                    'status' => $restaurant->status->value,
                    'rating' => $restaurant->ratings()->avg('stars') ? round((float) $restaurant->ratings()->avg('stars'), 1) : null,
                ],
                'stats' => [
                    'today_orders' => $todayOrders->count(),
                    'today_revenue' => number_format($todayRevenue / 100, 2),
                    'today_commission' => number_format($todayCommission / 100, 2),
                    'today_net' => number_format(($todayRevenue - $todayCommission) / 100, 2),
                    'pending_count' => $pendingCount,
                    'active_count' => $activeOrders->count(),
                ],
                'pending_orders' => $restaurant->orders()->where('status', 'pending')
                    ->with('items')
                    ->latest()
                    ->limit(10)
                    ->get()
                    ->map(fn ($o) => [
                        'uuid' => $o->uuid,
                        'order_number' => $o->order_number,
                        'items_summary' => $o->items->pluck('name')->join(', '),
                        'total' => number_format($o->total_fils / 100, 2),
                        'created_at' => $o->created_at->diffForHumans(),
                    ]),
                'active_orders' => $activeOrders->map(fn ($o) => [
                    'uuid' => $o->uuid,
                    'order_number' => $o->order_number,
                    'status' => $o->status->value,
                    'items_summary' => $o->items->pluck('name')->join(', '),
                    'driver_name' => $o->driver?->name,
                    'created_at' => $o->created_at->diffForHumans(),
                ]),
            ],
            'meta' => ['trace_id' => $request->header('X-Trace-Id', '')],
        ]);
    }

    // ─── Admin Dashboard Home ──────────────────────────────

    /**
     * Admin dashboard: platform metrics, pending verifications, disputes.
     */
    public function adminDashboard(Request $request): JsonResponse
    {
        abort_if(! $request->user()?->isAdmin(), 403);

        $activeOrders = Order::whereIn('status', ['pending', 'confirmed', 'preparing', 'ready', 'assigned', 'picked_up', 'delivering'])->count();
        $onlineDrivers = DriverLocation::where('is_online', true)->count();
        $activeRestaurants = Restaurant::active()->count();
        $pendingRestaurantVerifications = Restaurant::where('status', 'pending_verification')->count();
        $pendingDriverVerifications = User::where('role', 'driver')->where('status', 'pending_verification')->count();
        $openDisputes = Dispute::where('status', 'open')->count();
        $todayRevenue = Order::whereDate('created_at', today())->whereIn('status', ['delivered', 'resolved', 'refunded'])->sum('total_fils');
        $completedToday = Order::whereDate('created_at', today())->where('status', 'delivered')->count();

        // Status breakdown for pie/donut chart
        $orderStatusBreakdown = [
            'pending'       => Order::where('status', 'pending')->count(),
            'confirmed'     => Order::where('status', 'confirmed')->count(),
            'preparing'     => Order::where('status', 'preparing')->count(),
            'ready'         => Order::where('status', 'ready')->count(),
            'assigned'      => Order::where('status', 'assigned')->count(),
            'picked_up'     => Order::where('status', 'picked_up')->count(),
            'delivering'    => Order::where('status', 'delivering')->count(),
            'delivered'     => Order::whereDate('created_at', today())->where('status', 'delivered')->count(),
            'cancelled'     => Order::whereDate('created_at', today())->where('status', 'cancelled')->count(),
            'disputed'      => Order::where('status', 'disputed')->count(),
        ];

        // Revenue chart — last 7 days
        $revenueChart = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i);
            $rev = Order::whereDate('created_at', $date)
                ->whereIn('status', ['delivered', 'resolved', 'refunded'])
                ->sum('total_fils');
            $revenueChart[] = [
                'date' => $date->format('M d'),
                'revenue' => (int) round($rev / 100),
            ];
        }

        // Order volume — last 7 days
        $volumeChart = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i);
            $volumeChart[] = [
                'date' => $date->format('M d'),
                'total' => Order::whereDate('created_at', $date)->count(),
                'delivered' => Order::whereDate('created_at', $date)->where('status', 'delivered')->count(),
                'cancelled' => Order::whereDate('created_at', $date)->where('status', 'cancelled')->count(),
            ];
        }

        // Top restaurants this week (by order volume)
        $topRestaurants = Restaurant::withCount(['orders' => function ($q) {
            $q->whereBetween('created_at', [now()->subDays(7)->startOfDay(), now()->endOfDay()]);
        }])->orderByDesc('orders_count')->limit(5)->get()->map(fn ($r) => [
            'name' => $r->name,
            'order_count' => $r->orders_count,
            'cuisine' => $r->cuisine_types[0] ?? '',
        ]);

        // Recent activity feed — last 20 events
        $recentActivity = AuditLog::with('user')
            ->latest()
            ->limit(10)
            ->get()
            ->map(fn ($log) => [
                'action' => $log->action,
                'user' => $log->user?->name ?? 'System',
                'resource_type' => $log->resource_type,
                'timestamp' => $log->created_at->diffForHumans(),
            ])->toArray();

        // Also include recent order events
        $recentOrders = OrderStatusLog::with('order')
            ->latest()
            ->limit(10)
            ->get()
            ->map(fn ($log) => [
                'action' => 'order.'.$log->to_status,
                'user' => ucfirst($log->changed_by_type),
                'resource_type' => 'order',
                'detail' => $log->order?->order_number ?? '',
                'timestamp' => $log->created_at->diffForHumans(),
            ])->toArray();

        $activityFeed = collect([...$recentActivity, ...$recentOrders])
            ->sortByDesc('timestamp')
            ->take(20)
            ->values()
            ->toArray();

        // Stuck orders
        $stuckOrders = Order::whereIn('status', ['pending', 'ready'])
            ->where('created_at', '<', now()->subMinutes(15))
            ->with('restaurant')
            ->limit(10)
            ->get()
            ->map(fn ($o) => [
                'uuid' => $o->uuid,
                'order_number' => $o->order_number,
                'status' => $o->status->value,
                'restaurant_name' => $o->restaurant->name,
                'stuck_since' => $o->created_at->diffForHumans(),
            ]);

        return response()->json([
            'data' => [
                'theme' => $this->themeService->getTheme(),
                'metrics' => [
                    'active_orders' => $activeOrders,
                    'online_drivers' => $onlineDrivers,
                    'active_restaurants' => $activeRestaurants,
                    'today_revenue' => number_format($todayRevenue / 100, 2),
                    'completed_today' => $completedToday,
                    'pending_restaurant_verifications' => $pendingRestaurantVerifications,
                    'pending_driver_verifications' => $pendingDriverVerifications,
                    'open_disputes' => $openDisputes,
                ],
                'charts' => [
                    'revenue' => $revenueChart,
                    'volume' => $volumeChart,
                    'status_breakdown' => $orderStatusBreakdown,
                    'top_restaurants' => $topRestaurants,
                ],
                'recent_activity' => $activityFeed,
                'stuck_orders' => $stuckOrders,
            ],
            'meta' => ['trace_id' => $request->header('X-Trace-Id', '')],
        ]);
    }

    private function formatActiveOrder(Order $order): array
    {
        $statuses = ['pending', 'confirmed', 'preparing', 'ready', 'assigned', 'picked_up', 'delivering', 'delivered'];
        $currentIndex = array_search($order->status->value, $statuses);

        return [
            'uuid' => $order->uuid,
            'order_number' => $order->order_number,
            'status' => $order->status->value,
            'restaurant' => ['name' => $order->restaurant->name],
            'items' => $order->items->map(fn ($i) => ['name' => $i->name, 'quantity' => $i->quantity]),
            'total' => number_format($order->total_fils / 100, 2),
            'estimated_delivery_min' => $order->estimated_delivery_min,
            'estimated_delivery_at' => $order->created_at->addMinutes($order->estimated_delivery_min)->toISOString(),
            'progress' => [
                'current_step' => $currentIndex,
                'total_steps' => count($statuses),
                'steps' => array_map(fn ($i, $s) => [
                    'label' => $s,
                    'completed' => $i <= $currentIndex,
                    'active' => $i === $currentIndex,
                ], array_keys($statuses), $statuses),
            ],
            'driver' => $order->driver ? [
                'name' => $order->driver->name,
                'lat' => $order->driver->driverLocation?->lat,
                'lng' => $order->driver->driverLocation?->lng,
            ] : null,
        ];
    }
}
