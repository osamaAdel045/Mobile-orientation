<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Events\DriverLocationUpdated;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\DriverService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class DriverController extends Controller
{
    public function __construct(private DriverService $driverService) {}

    // ─── Status ────────────────────────────────────────────

    public function toggleStatus(Request $request): JsonResponse
    {
        $online = $request->boolean('is_online');
        $loc = $this->driverService->toggleOnline($request->user(), $online);

        return response()->json([
            'data' => ['is_online' => $loc->is_online, 'message' => $online ? 'You are now online.' : 'You are now offline.'],
            'meta' => ['trace_id' => $request->header('X-Trace-Id', '')],
        ]);
    }

    // ─── Location ──────────────────────────────────────────

    public function updateLocation(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'lat' => ['required', 'numeric', 'between:-90,90'],
            'lng' => ['required', 'numeric', 'between:-180,180'],
            'bearing' => ['nullable', 'numeric', 'between:0,360'],
        ]);

        $loc = $this->driverService->updateLocation(
            $request->user(),
            (float) $validated['lat'],
            (float) $validated['lng'],
            $validated['bearing'] ?? null,
        );

        // Broadcast to customer if in active delivery
        $activeOrder = $request->user()->driverOrders()->where('status', 'delivering')->first();
        if ($activeOrder) {
            DriverLocationUpdated::dispatch($loc, $activeOrder->uuid);
        }

        return response()->json([
            'data' => ['lat' => $loc->lat, 'lng' => $loc->lng, 'updated_at' => $loc->updated_at->toISOString()],
            'meta' => ['trace_id' => $request->header('X-Trace-Id', '')],
        ]);
    }

    // ─── Jobs ──────────────────────────────────────────────

    public function acceptJob(Request $request, string $orderUuid): JsonResponse
    {
        $order = Order::where('uuid', $orderUuid)->firstOrFail();

        try {
            $order = $this->driverService->acceptJob($order, $request->user());

            return response()->json([
                'data' => [
                    'status' => $order->status->value,
                    'restaurant_name' => $order->restaurant->name,
                    'restaurant_lat' => $order->restaurant->lat,
                    'restaurant_lng' => $order->restaurant->lng,
                    'estimated_earnings' => number_format(($order->driver_earnings_fils ?? 0) / 100, 2),
                ],
            ]);
        } catch (\RuntimeException $e) {
            return response()->json([
                'error' => ['code' => 'JOB_UNAVAILABLE', 'message' => $e->getMessage()],
            ], Response::HTTP_CONFLICT);
        }
    }

    public function declineJob(Request $request, string $orderUuid): JsonResponse
    {
        $order = Order::where('uuid', $orderUuid)->firstOrFail();
        $this->driverService->declineJob($order, $request->user());

        return response()->json(['data' => ['message' => 'Job declined.']]);
    }

    // ─── Delivery Actions ──────────────────────────────────

    public function confirmPickup(Request $request, string $orderUuid): JsonResponse
    {
        $order = Order::where('uuid', $orderUuid)->firstOrFail();

        try {
            $order = $this->driverService->confirmPickup($order, $request->user());

            return response()->json(['data' => ['status' => $order->status->value]]);
        } catch (\RuntimeException $e) {
            return response()->json([
                'error' => ['code' => 'ACTION_FAILED', 'message' => $e->getMessage()],
            ], Response::HTTP_CONFLICT);
        }
    }

    public function startDelivery(Request $request, string $orderUuid): JsonResponse
    {
        $order = Order::where('uuid', $orderUuid)->firstOrFail();

        try {
            $order = $this->driverService->startDelivery($order, $request->user());

            return response()->json(['data' => ['status' => $order->status->value]]);
        } catch (\RuntimeException $e) {
            return response()->json([
                'error' => ['code' => 'ACTION_FAILED', 'message' => $e->getMessage()],
            ], Response::HTTP_CONFLICT);
        }
    }

    public function confirmDelivery(Request $request, string $orderUuid): JsonResponse
    {
        $order = Order::where('uuid', $orderUuid)->firstOrFail();

        try {
            $order = $this->driverService->confirmDelivery($order, $request->user());

            return response()->json([
                'data' => [
                    'status' => $order->status->value,
                    'earnings' => number_format($order->driver_earnings_fils / 100, 2),
                ],
            ]);
        } catch (\RuntimeException $e) {
            return response()->json([
                'error' => ['code' => 'ACTION_FAILED', 'message' => $e->getMessage()],
            ], Response::HTTP_CONFLICT);
        }
    }

    // ─── Earnings ──────────────────────────────────────────

    public function earnings(Request $request): JsonResponse
    {
        return response()->json(['data' => $this->driverService->getEarnings($request->user())]);
    }

    // ─── Order History ─────────────────────────────────────

    public function orderHistory(Request $request): JsonResponse
    {
        $orders = $request->user()->driverOrders()
            ->with('restaurant')
            ->whereIn('status', ['delivered', 'cancelled', 'rejected'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        $data = $orders->map(fn (Order $order) => [
            'uuid'          => $order->uuid,
            'order_number'  => $order->order_number,
            'restaurant'    => ['name' => $order->restaurant->name],
            'earnings'      => $order->driver_earnings_fils !== null
                ? 'AED ' . number_format($order->driver_earnings_fils / 100, 2)
                : null,
            'distance_km'   => null,
            'status'        => $order->status->value,
            'completed_at'  => $order->updated_at?->toISOString(),
        ]);

        return response()->json([
            'data' => $data,
            'meta' => [
                'current_page' => $orders->currentPage(),
                'total'        => $orders->total(),
            ],
        ]);
    }
}
