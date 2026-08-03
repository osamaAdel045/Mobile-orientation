<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\CartItem;
use App\Models\MenuItem;
use App\Services\CartService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class CartController extends Controller
{
    public function __construct(private CartService $cartService) {}

    public function show(Request $request): JsonResponse
    {
        $cart = $this->cartService->getOrCreateCart($request->user());

        if (! $cart->items()->exists()) {
            return response()->json(['data' => null]);
        }

        $subtotal = $cart->items->sum(fn ($i) => $i->unit_price_fils * $i->quantity);

        return response()->json([
            'data' => [
                'uuid' => $cart->uuid,
                'restaurant' => $cart->restaurant_id ? [
                    'uuid' => $cart->restaurant->uuid,
                    'name' => $cart->restaurant->name,
                ] : null,
                'items' => $cart->items->map(fn ($i) => [
                    'id' => $i->id,
                    'menu_item' => [
                        'uuid' => $i->menuItem->uuid,
                        'name' => $i->menuItem->name,
                    ],
                    'quantity' => $i->quantity,
                    'unit_price' => number_format($i->unit_price_fils / 100, 2),
                    'subtotal' => number_format(($i->unit_price_fils * $i->quantity) / 100, 2),
                    'special_instructions' => $i->special_instructions,
                ]),
                'subtotal' => number_format($subtotal / 100, 2),
                'expires_at' => $cart->expires_at->toISOString(),
            ],
            'meta' => ['trace_id' => $request->header('X-Trace-Id', '')],
        ]);
    }

    public function addItem(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'menu_item_uuid' => ['required', 'string', 'exists:menu_items,uuid'],
            'quantity' => ['nullable', 'integer', 'min:1', 'max:50'],
            'special_instructions' => ['nullable', 'string', 'max:200'],
            'clear_cart' => ['nullable', 'boolean'],
        ]);

        $menuItem = MenuItem::where('uuid', $validated['menu_item_uuid'])->firstOrFail();

        try {
            $cart = $this->cartService->addItem(
                $request->user(),
                $menuItem,
                $validated['quantity'] ?? 1,
                $validated['special_instructions'] ?? null,
            );

            return response()->json(['data' => $cart], Response::HTTP_CREATED);
        } catch (\RuntimeException $e) {
            // Cross-restaurant conflict
            if ($e->getCode() === 409) {
                return response()->json([
                    'error' => ['code' => 'DIFFERENT_RESTAURANT', 'message' => $e->getMessage()],
                    'meta' => ['trace_id' => $request->header('X-Trace-Id', '')],
                ], Response::HTTP_CONFLICT);
            }

            return response()->json([
                'error' => ['code' => 'ITEM_UNAVAILABLE', 'message' => $e->getMessage()],
                'meta' => ['trace_id' => $request->header('X-Trace-Id', '')],
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }
    }

    public function updateItem(Request $request, CartItem $item): JsonResponse
    {
        $validated = $request->validate([
            'quantity' => ['required', 'integer', 'min:0', 'max:50'],
        ]);

        $cart = $this->cartService->updateQuantity($item, $validated['quantity']);

        return response()->json(['data' => $cart]);
    }

    public function removeItem(CartItem $item): JsonResponse
    {
        $cart = $this->cartService->removeItem($item);

        return response()->json(['data' => $cart]);
    }

    public function clear(Request $request): JsonResponse
    {
        $cart = $this->cartService->clearCart($request->user());

        return response()->json(['data' => null]);
    }

    public function validate(Request $request): JsonResponse
    {
        $result = $this->cartService->validate($request->user());

        return response()->json(['data' => $result]);
    }
}
