# Cart

Full shopping cart with CRUD operations, cross-restaurant conflict resolution, and checkout flow.

**Route:** `/(customer)/cart`
**Feature path:** `src/features/customer/cart/`

## Data Flow

```
MenuItemScreen (Add to Cart)
       |
cart.store.ts → addItem(input)
       |
cart.api.ts → POST /cart/items
       |
   ┌── 201: Cart updated → screenState: loaded
   └── 409: DIFFERENT_RESTAURANT → conflictRestaurant state → Alert dialog
              └── User confirms → X-Clear-Cart: true → retry
```

## API Contract

| Endpoint | Method | Purpose |
|---|---|---|
| `/cart` | GET | Fetch current cart (null if empty) |
| `/cart/items` | POST | Add item (quantity, special_instructions) |
| `/cart/items/{id}` | PATCH | Update quantity (0 = remove) |
| `/cart/items/{id}` | DELETE | Remove single item |
| `/cart` | DELETE | Clear entire cart |

## Cross-Restaurant Conflict

When adding an item from a different restaurant than the current cart:

1. Server returns `409 DIFFERENT_RESTAURANT`
2. Store sets `conflictRestaurant` state
3. `useCartConflictDialog` hook shows native Alert
4. User chooses "Clear & Add" or "Cancel"
5. If confirmed: retry with `X-Clear-Cart: true` header

This hook is mounted in BOTH CartScreen and MenuItemScreen — because adds originate from the menu item screen, the conflict dialog must be available wherever an add can happen.

## Store Design

| Field | Type | Purpose |
|---|---|---|
| `screenState` | Discriminated union | loading, loaded(Cart), error, empty |
| `isLoading` | `boolean` | Mutation in progress |
| `conflictRestaurant` | `{ name, pendingInput } \| null` | Unresolved conflict |
| `addItem(input)` | Method | Returns `boolean` (success) |
| `resolveConflict(clear)` | Method | Retry with/without clearing |
| `updateQuantity(id, qty)` | Method | Quantity change |
| `removeItem(id)` | Method | Remove item |
| `getItemCount()` | Method | Total item count for badges |

## UI Layout

```
+---------------------------+
| Restaurant: Spice Route   |
+---------------------------+
| [-]  2  [+]  Hummus       |
|     AED 22.00  = 44.00    |
| Extra tahini              |  ← special instructions
+---------------------------+
| [-]  1  [+]  Shawarma     |
|     AED 18.00             |
+---------------------------+
| Subtotal:  AED 62.00      |
| Delivery:    AED 5.00     |
| Tax:         AED 3.10     |
| Total:      AED 70.10     |
+---------------------------+
| [      Checkout      ]    |  ← sticky bottom
+---------------------------+
```

## Wiring

| Source | Action |
|---|---|
| MenuItemScreen | Add to Cart button → `cartStore.addItem()` |
| RestaurantScreen | View Cart bar → `router.push('/(customer)/cart')` |
| CartScreen | Checkout button → `router.push('/(customer)/checkout')` |

## Next Steps

- [Checkout](./checkout) — place order from cart
- [Menu Item](./menu-item) — where adds originate
- [API & Networking](../technical/api-networking) — Axios interceptor chain
