# Search

Restaurant and dish search with debounced input, recent searches, and cuisine filtering.

**Route:** `/(customer)/(tabs)/home` (search bar at top)
**Feature path:** `src/features/customer/search/`

## Data Flow

```
User types → 300ms debounce → search store → home feature's fetchRestaurants(?q=term)
       |
search.store.ts (Zustand: query, recentSearches)
       |
CustomerSearchScreen
```

The search feature does NOT have its own API endpoint. It delegates to the home feature's `fetchRestaurants()` call, passing `q` as a query parameter. Results are displayed using the same restaurant card component as the home screen.

## Store Design

| Field | Type | Purpose |
|---|---|---|
| `query` | `string` | Current search input |
| `recentSearches` | `string[]` | Last 10 searches (in-memory, cleared on app restart) |
| `setQuery(q)` | Method | Update input with 300ms debounce |
| `addRecentSearch(term)` | Method | Prepend term, deduplicate, cap at 10 |

## API Contract

Search uses the existing restaurant listing endpoint with a query parameter:

```
GET /restaurants?q=shawarma&lat=25.08&lng=55.14
```

Returns restaurants whose name, cuisine, or menu items match the query. Ranking is by relevance (full-text search).

## UI Layout

```
+---------------------------+
|  🔍 [shawarma        ✕]  |
+---------------------------+
| Recent Searches:          |
| · pizza · biryani · sushi|
+---------------------------+
| Results (restaurant cards)|
| ┌───────────────────────┐ |
| │ 🍽️ Spice Route       │ |
| │ Lebanese · ★ 4.3      │ |
| │ Shawarma Plate AED 30 │ |
| └───────────────────────┘ |
| ┌───────────────────────┐ |
| │ 🍽️ Beirut Bistro     │ |
| │ Lebanese · ★ 4.1      │ |
| │ Chicken Shawarma AED 25│ |
| └───────────────────────┘ |
+---------------------------+
```

## Next Steps

- [Home](./home) — restaurant listing, the primary consumer of search
- [Restaurant](./restaurant) — detail view after selecting a search result
