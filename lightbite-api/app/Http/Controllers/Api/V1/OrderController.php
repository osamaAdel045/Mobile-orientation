<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class OrderController extends Controller
{
    public function __construct(private OrderService $orderService) {}

    public function place(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'delivery_address_uuid' => ['required', 'string', 'exists:user_addresses,uuid'],
            'customer_note' => ['nullable', 'string', 'max:500'],
        ]);

        $idempotencyKey = $request->header('Idempotency-Key');
        if (! $idempotencyKey) {
            return response()->json([
                'error' => ['code' => 'MISSING_IDEMPOTENCY_KEY', 'message' => 'Idempotency-Key header is required.'],
            ], Response::HTTP_BAD_REQUEST);
        }

        try {
            $order = $this->orderService->placeOrder(
                $request->user(),
                $validated['delivery_address_uuid'],
                $idempotencyKey,
                $validated['customer_note'] ?? null,
            );

            return response()->json([
                'data' => [
                    'uuid' => $order->uuid,
                    'order_number' => $order->order_number,
                    'status' => $order->status->value,
                    'restaurant' => ['name' => $order->restaurant->name],
                    'items' => $order->items->map(fn ($i) => [
                        'name' => $i->name,
                        'quantity' => $i->quantity,
                        'unit_price' => number_format($i->unit_price_fils / 100, 2),
                    ]),
                    'subtotal' => number_format($order->subtotal_fils / 100, 2),
                    'delivery_fee' => number_format($order->delivery_fee_fils / 100, 2),
                    'tax' => number_format($order->tax_fils / 100, 2),
                    'total' => number_format($order->total_fils / 100, 2),
                    'estimated_delivery_min' => $order->estimated_delivery_min,
                    'created_at' => $order->created_at->toISOString(),
                ],
                'meta' => ['trace_id' => $request->header('X-Trace-Id', '')],
            ], Response::HTTP_CREATED);
        } catch (\RuntimeException $e) {
            return response()->json([
                'error' => ['code' => 'ORDER_FAILED', 'message' => $e->getMessage()],
                'meta' => ['trace_id' => $request->header('X-Trace-Id', '')],
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }
    }

    public function show(string $uuid): JsonResponse
    {
        $order = Order::where('uuid', $uuid)
            ->with(['items', 'restaurant', 'statusLog', 'payment', 'rating'])
            ->firstOrFail();

        return response()->json([
            'data' => $this->formatOrder($order),
            'meta' => ['trace_id' => request()->header('X-Trace-Id', '')],
        ]);
    }

    public function tracking(string $uuid): JsonResponse
    {
        $order = Order::where('uuid', $uuid)
            ->with(['driver', 'statusLog'])
            ->firstOrFail();

        $data = [
            'uuid' => $order->uuid,
            'status' => $order->status->value,
            'status_history' => $order->statusLog->map(fn ($log) => [
                'from' => $log->from_status,
                'to' => $log->to_status,
                'at' => $log->created_at->toISOString(),
            ]),
            'estimated_delivery_at' => $order->created_at->addMinutes($order->estimated_delivery_min)->toISOString(),
        ];

        if ($order->driver_id && $order->status === OrderStatus::Delivering) {
            $loc = $order->driver->driverLocation;
            $data['driver'] = [
                'name' => $order->driver->name,
                'lat' => $loc?->lat,
                'lng' => $loc?->lng,
                'eta_min' => max(1, $order->estimated_delivery_min - (int) $order->created_at->diffInMinutes(now())),
            ];
        }

        return response()->json([
            'data' => $data,
            'meta' => ['trace_id' => request()->header('X-Trace-Id', '')],
        ]);
    }

    public function history(Request $request): JsonResponse
    {
        $paginator = $request->user()->customerOrders()
            ->with(['restaurant', 'items'])
            ->latest()
            ->paginate(20);

        return response()->json([
            'data' => collect($paginator->items())->map(fn ($o) => $this->formatOrder($o))->values(),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'total' => $paginator->total(),
                'trace_id' => $request->header('X-Trace-Id', ''),
            ],
        ]);
    }

    public function cancel(Request $request, Order $order): JsonResponse
    {
        try {
            $this->orderService->cancelByCustomer($order, $request->user());

            return response()->json([
                'data' => ['status' => 'cancelled', 'message' => 'Order cancelled. Refund will be processed.'],
            ]);
        } catch (\RuntimeException $e) {
            return response()->json([
                'error' => ['code' => 'CANCEL_FAILED', 'message' => $e->getMessage()],
            ], Response::HTTP_CONFLICT);
        }
    }

    public function modify(Request $request, Order $order): JsonResponse
    {
        try {
            $order = $this->orderService->modify(
                $order, $request->user(),
                $request->input('add_items', []),
                $request->input('remove_items', []),
                $request->input('update_quantities', []),
            );

            return response()->json(['data' => $this->formatOrder($order)]);
        } catch (\RuntimeException $e) {
            return response()->json([
                'error' => ['code' => 'MODIFY_FAILED', 'message' => $e->getMessage()],
            ], Response::HTTP_CONFLICT);
        }
    }

    public function rate(Request $request, Order $order): JsonResponse
    {
        $user = $request->user();

        if ($order->customer_id !== $user->id) {
            return response()->json([
                'error' => ['code' => 'FORBIDDEN', 'message' => 'You can only rate your own orders.'],
            ], Response::HTTP_FORBIDDEN);
        }

        if ($order->status->value !== 'delivered') {
            return response()->json([
                'error' => ['code' => 'INVALID_STATUS', 'message' => 'You can only rate delivered orders.'],
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $validated = $request->validate([
            'rating' => ['required', 'integer', 'between:1,5'],
            'review' => ['nullable', 'string', 'max:500'],
        ]);

        $order->rating()->updateOrCreate(
            ['order_id' => $order->id],
            [
                'customer_id'    => $user->id,
                'restaurant_id'  => $order->restaurant_id,
                'stars'          => $validated['rating'],
                'review_text'    => $validated['review'] ?? null,
            ]
        );

        return response()->json([
            'data' => ['message' => 'Thank you for your rating!'],
        ], Response::HTTP_CREATED);
    }

    private function formatOrder(Order $order): array
    {
        return [
            'uuid' => $order->uuid,
            'order_number' => $order->order_number,
            'status' => $order->status->value,
            'restaurant' => $order->restaurant ? ['uuid' => $order->restaurant->uuid, 'name' => $order->restaurant->name] : null,
            'driver' => $order->driver_id ? ['name' => $order->driver->name] : null,
            'items' => $order->items->map(fn ($i) => [
                'name' => $i->name,
                'quantity' => $i->quantity,
                'unit_price' => number_format($i->unit_price_fils / 100, 2),
            ]),
            'subtotal' => number_format($order->subtotal_fils / 100, 2),
            'delivery_fee' => number_format($order->delivery_fee_fils / 100, 2),
            'tax' => number_format($order->tax_fils / 100, 2),
            'total' => number_format($order->total_fils / 100, 2),
            'estimated_delivery_min' => $order->estimated_delivery_min,
            'delivery_address' => $order->delivery_address_snapshot,
            'created_at' => $order->created_at->toISOString(),
        ];
    }
}
