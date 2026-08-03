<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\MenuItem;
use App\Models\User;
use Illuminate\Support\Str;

class CartService
{
    public function getOrCreateCart(User $customer): Cart
    {
        $cart = Cart::where('customer_id', $customer->id)
            ->where('expires_at', '>', now())
            ->first();

        if (! $cart) {
            $cart = Cart::create([
                'uuid' => (string) Str::uuid(),
                'customer_id' => $customer->id,
                'restaurant_id' => null,
                'expires_at' => now()->addHours(24),
            ]);
        }

        return $cart->load(['items.menuItem', 'restaurant']);
    }

    public function addItem(User $customer, MenuItem $menuItem, int $quantity = 1, ?string $instructions = null): Cart
    {
        if (! $menuItem->is_available) {
            throw new \RuntimeException("{$menuItem->name} is currently unavailable.");
        }

        $restaurant = $menuItem->restaurant;

        if (! $restaurant->canAcceptOrders()) {
            throw new \RuntimeException("{$restaurant->name} is not accepting orders right now.");
        }

        $cart = $this->getOrCreateCart($customer);

        // Cross-restaurant check
        if ($cart->restaurant_id && $cart->restaurant_id !== $restaurant->id && $cart->items()->exists()) {
            throw new \RuntimeException("Adding from {$restaurant->name} will clear your current cart from {$cart->restaurant->name}.", 409);
        }

        // First item sets the restaurant
        if (! $cart->restaurant_id) {
            $cart->update(['restaurant_id' => $restaurant->id]);
        }

        // Check existing item
        $existing = $cart->items()->where('menu_item_id', $menuItem->id)->first();

        if ($existing) {
            $existing->update([
                'quantity' => $existing->quantity + $quantity,
                'unit_price_fils' => $menuItem->price_fils,
            ]);
        } else {
            $cart->items()->create([
                'menu_item_id' => $menuItem->id,
                'quantity' => $quantity,
                'unit_price_fils' => $menuItem->price_fils,
                'special_instructions' => $instructions,
            ]);
        }

        // Extend expiry
        $cart->update(['expires_at' => now()->addHours(24)]);

        return $this->getOrCreateCart($customer);
    }

    public function updateQuantity(CartItem $item, int $quantity): Cart
    {
        if ($quantity <= 0) {
            $item->delete();
        } else {
            $item->update(['quantity' => $quantity]);
        }

        return $this->getOrCreateCart($item->cart->customer);
    }

    public function removeItem(CartItem $item): Cart
    {
        $cart = $item->cart;
        $item->delete();

        // If cart is now empty, keep restaurant reference but items are cleared
        return $this->getOrCreateCart($cart->customer);
    }

    public function clearCart(User $customer): Cart
    {
        $cart = $this->getOrCreateCart($customer);
        $cart->items()->delete();
        $cart->update([
            'restaurant_id' => null,
            'expires_at' => now()->addHours(24),
        ]);

        return $cart;
    }

    public function validate(User $customer): array
    {
        $cart = $this->getOrCreateCart($customer);
        $issues = [];

        if (! $cart->items()->exists()) {
            $issues[] = ['type' => 'cart_empty', 'message' => 'Your cart is empty.'];

            return ['valid' => false, 'issues' => $issues];
        }

        $restaurant = $cart->restaurant;

        if (! $restaurant || ! $restaurant->canAcceptOrders()) {
            $issues[] = ['type' => 'restaurant_closed', 'message' => 'This restaurant is not accepting orders.'];
        }

        $subtotal = 0;

        foreach ($cart->items as $item) {
            $menuItem = $item->menuItem;

            if (! $menuItem || ! $menuItem->is_available) {
                $issues[] = [
                    'type' => 'item_unavailable',
                    'item_name' => $item->menuItem?->name ?? 'Unknown item',
                    'item_uuid' => $item->menuItem?->uuid,
                ];

                continue;
            }

            if ($menuItem->price_fils !== $item->unit_price_fils) {
                $issues[] = [
                    'type' => 'price_change',
                    'item_name' => $menuItem->name,
                    'old_price' => number_format($item->unit_price_fils / 100, 2),
                    'new_price' => number_format($menuItem->price_fils / 100, 2),
                ];
            }

            $subtotal += $menuItem->price_fils * $item->quantity;
        }

        $minOrderFils = 2000; // AED 20.00
        if ($subtotal < $minOrderFils) {
            $issues[] = [
                'type' => 'below_minimum',
                'current_subtotal' => number_format($subtotal / 100, 2),
                'minimum' => '20.00',
                'shortfall' => number_format(($minOrderFils - $subtotal) / 100, 2),
            ];
        }

        return [
            'valid' => empty($issues),
            'issues' => $issues,
            'subtotal_fils' => $subtotal,
        ];
    }
}
