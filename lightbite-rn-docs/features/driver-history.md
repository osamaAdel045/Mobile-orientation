# Driver Order History

Completed delivery history with order details, earnings per trip, and pagination.

**Route:** `/(driver)/(tabs)/history`
**Feature path:** `src/features/driver/history/`

## Data Flow

```
GET /driver/orders
       |
history.api.ts
       |
useDriverHistoryStore (ScreenState + pagination)
       |
DriverHistoryScreen
```

## API Contract

### `GET /driver/orders`

Returns paginated list of completed/cancelled/rejected orders with restaurant name, earnings per order, distance, and completion date.

Response validated with Zod schema — `distance_km` must be `number`, not `null`.

```typescript
interface DriverOrder {
  uuid: string;
  order_number: string;
  restaurant: { name: string };
  earnings: string | null;
  distance_km: number;
  status: string;
  completed_at: string;
}
```

## Store Design

| Field | Type | Purpose |
|---|---|---|
| `screenState` | Discriminated union | loading, loaded(DriverOrder[]), error, empty |
| `hasMore` / `isLoadingMore` | Boolean | Pagination state |
| `load()` | Method | Initial fetch (page 1) |
| `loadMore()` | Method | Append next page |
| `refresh()` | Method | Reload from page 1 |

Standard paginated list pattern — identical to customer order history.

## UI Layout

```
+---------------------------+
| Spice Route               |
| AED 18.16 — 3.2 km        |
| Delivered · Jul 28        |
+---------------------------+
| Pasta Paradise            |
| AED 15.50 — 2.1 km        |
| Cancelled · Jul 27        |
+---------------------------+
| Sushi Zen                 |
| AED 22.00 — 5.0 km        |
| Delivered · Jul 26        |
+---------------------------+
       (load more...)
```

## Next Steps

- [Earnings](./driver-earnings) — daily/weekly revenue breakdown
- [Profile](./driver-profile) — driver info and stats
