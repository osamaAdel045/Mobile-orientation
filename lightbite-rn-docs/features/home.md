# Customer Home

Restaurant discovery with search, cuisine filter chips, pull-to-refresh, and infinite-scroll pagination.

**Route:** `/(customer)/home`
**Feature path:** `src/features/customer/home/`

## Data Flow

```
GET /restaurants?lat&lng&cuisine&q&sort&page
       |
home.api.ts (Zod validation)
       |
home.store.ts (Zustand: allRestaurants, query, selectedCuisine)
       |
useCustomerHome() hook
       |
CustomerHomeScreen.tsx
```

## Store Design

| Field | Type | Purpose |
|---|---|---|
| `screenState` | Discriminated union | loading, loaded(data), error(message), empty |
| `allRestaurants` | `Restaurant[]` | Raw data for client-side display |
| `query` | `string` | Full-text search input |
| `selectedCuisine` | `string \| null` | Active cuisine filter |
| `isLoadingMore` | `boolean` | Pagination in progress |
| `hasMore` | `boolean` | More pages available |

Search and cuisine filter trigger a fresh `load()` (page 1). Pagination calls `loadMore()` which appends to `allRestaurants`.

## UI Components

| Section | Implementation |
|---|---|
| Location header | Hardcoded "Dubai Marina" — dynamic in later batch |
| Search bar | `TextInput` with `onChangeText={setQuery}` |
| Cuisine chips | Horizontal `FlatList` of `TouchableOpacity` pills, active/inactive styles |
| Restaurant cards | `Card` + `Image` (or placeholder) + rating + delivery info |
| Pull-to-refresh | `RefreshControl` calling `refresh()` |
| Infinite scroll | `onEndReached` calling `loadMore()`, footer `ActivityIndicator` |
| Loading state | 3 `Skeleton` cards mimicking restaurant card layout |
| Error state | `ErrorDisplay` with retry button |
| Empty state | `EmptyState` using `t('common.noResults')` |

## Zod Schema

Fields marked optional match real API behavior:

```typescript
export const restaurantSchema = z.object({
  uuid: z.string(),
  name: z.string(),
  logo_url: z.string().nullable(),
  cuisine_types: z.array(z.string()),
  rating: z.number().optional(),
  review_count: z.number().optional(),
  delivery_time_min: z.number(),
  delivery_fee: z.string(),
  distance_km: z.number(),
  is_open: z.boolean(),
  is_accepting_orders: z.boolean().optional(),
});
```

## Next Steps

- [Restaurant Detail](./restaurant) — tapping a card navigates here
- [Architecture](../technical/architecture) — feature-first folder structure
- [State Management](../technical/state-management) — Zustand + ScreenState pattern
