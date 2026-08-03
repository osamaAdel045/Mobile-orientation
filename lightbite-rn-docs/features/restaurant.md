# Restaurant Detail

Full restaurant view with cover image, menu categories, and scrollable item list. Includes a sticky View Cart bar at the bottom.

**Route:** `/(customer)/restaurant/[uuid]`
**Feature path:** `src/features/customer/restaurant/`

## Data Flow

```
GET /restaurants/{uuid}
       |
restaurant.api.ts (no Zod validation — see concern below)
       |
restaurant.store.ts (Zustand: screenState, selectedCategoryIndex)
       |
useCustomerRestaurant(uuid) hook
       |
CustomerRestaurantScreen.tsx
```

## API Contract

### `GET /restaurants/{uuid}`

Response includes full menu nested inside `menu_categories`:

```typescript
interface RestaurantDetail {
  uuid: string;
  name: string;
  description: string;
  cover_url: string | null;
  cuisine_types: string[];
  rating?: number;
  review_count?: number;
  address: string;
  delivery_fee: string;
  estimated_delivery_min: number;
  menu_categories: MenuCategory[];
  hours: { today: { open: string; close: string }[]; is_open: boolean };
}

interface MenuCategory {
  name: string;
  items: MenuItem[];
}

interface MenuItem {
  uuid: string;
  name: string;
  description: string;
  price: string;
  image_url: string | null;
  is_available: boolean;
}
```

## Store Design

| Field | Type | Purpose |
|---|---|---|
| `screenState` | Discriminated union | loading, loaded(data), error(message) |
| `selectedCategoryIndex` | `number` | Active menu category tab |
| `load(uuid)` | Method | Fetches restaurant with menu |
| `selectCategory(index)` | Method | Switches active category tab |

## UI Layout

```
+---------------------------+
|     Cover Image (200px)   |  ← edge-to-edge (marginTop: -insets.top)
+---------------------------+
| Restaurant Info           |
| Name, description, rating |
| Cuisine tags, delivery    |
| Address, hours            |
+---------------------------+
| Category | Category | ... |  ← horizontal ScrollView tabs
+---------------------------+
| Menu Item                 |
| Menu Item                 |
| Menu Item                 |  ← FlatList with items from selected category
| ...                       |
+---------------------------+
| [3]  View Cart            |  ← sticky absolute bar, paddingBottom: insets.bottom
+---------------------------+
```

## Known Issues

- **No Zod validation** on restaurant detail responses — malformed payloads reach the store unvalidated
- **Sticky cart count** is hardcoded `0` — will be wired to cart store in Batch 3
- **View Cart button** press is a TODO placeholder
- Menu items without images show a food emoji placeholder

## Next Steps

- [Menu Item Detail](./menu-item) — tapping a menu item opens this modal
- [Home](./home) — the screen that navigates here
- [API & Networking](../technical/api-networking) — Axios interceptor chain
