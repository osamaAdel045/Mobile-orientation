# Menu Item Detail

Full-screen modal showing item details with quantity selector, special instructions, and add-to-cart button.

**Route:** `/(customer)/menu-item`
**Feature path:** `src/features/customer/menu-item/`

## Data Flow

Menu item data is passed via **route params** (serialized JSON) — no API call needed because the full menu is already loaded from the restaurant detail response.

```
RestaurantScreen (handleItemPress)
       |
router.push({ pathname: '/(customer)/menu-item', params: { item: JSON.stringify(menuItem), ... } })
       |
MenuItemRoute (parses params)
       |
MenuItemScreen.tsx
       |
useMenuItem() hook → menu-item.store.ts (Zustand: quantity, specialInstructions)
```

## Store Design

| Field | Type | Purpose |
|---|---|---|
| `quantity` | `number` (1-99) | Selected quantity |
| `specialInstructions` | `string` | Free-text notes |
| `increment()` | Method | +1, max 99 |
| `decrement()` | Method | -1, min 1 |
| `setSpecialInstructions(text)` | Method | Update notes |
| `reset()` | Method | Reset to defaults (1, empty) |

## UI Layout

```
+---------------------------+
|                     [✕]   |  ← close button, top: insets.top
|                           |
|   Item Image (280px)      |
|                           |
+---------------------------+
| Restaurant Name           |
| Item Name                 |
| Description               |
| Price                     |
+---------------------------+
| Quantity:  [-]  2  [+]    |  ← minus/plus buttons
+---------------------------+
| Special Instructions      |
| [textarea................]|
+---------------------------+
| [  Add to Cart (2)  ]     |  ← disabled if !is_available
+---------------------------+     paddingBottom: insets.bottom
```

## Route Params

The route receives these params from the restaurant screen:

```typescript
interface MenuItemParams {
  item: string;           // JSON.stringify(MenuItem)
  restaurantName: string;
  restaurantUuid: string; // Carried for cart API in Batch 3
}
```

**Why route params instead of API call:** The menu item data is already available in the restaurant detail response. Passing it via params avoids a redundant network request.

## Known Issues

- **Add to Cart button** calls `router.back()` but doesn't actually add to cart (Batch 3)
- **restaurantUuid** is passed through but not yet consumed
- No image caching — images reload on every open
- `increment`/`decrement` functions are not pure — they reference `Math.min`/`Math.max` inside the store setter

## Next Steps

- [Restaurant Detail](./restaurant) — the screen that navigates here
- [State Management](../technical/state-management) — Zustand patterns
