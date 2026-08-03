# Driver Earnings & History

Earnings dashboard with today/week summaries and completed trip history.

**Routes:** `/(driver)/(tabs)/earnings`, `/(driver)/(tabs)/history`
**Feature paths:** `src/features/driver/earnings/`, `src/features/driver/history/`

## API Contract

### `GET /driver/earnings`
```
Response: { "data": { "today_earnings": "AED 120.00", "today_trips": 4,
  "this_week_earnings": "AED 480.00", "this_week_trips": 16, "avg_per_trip": "AED 30.00" } }
```

### `GET /driver/orders`
Driver's completed/cancelled/rejected orders. Paginated 20 per page. Returns: order number, restaurant name, earnings, status, completed_at.

## UI — Earnings

```
+---------------------------+
| Today                     |
| AED 120.00                |
| 4 trips                   |
+---------------------------+
| This Week                 |
| AED 480.00                |
| 16 trips                  |
+---------------------------+
| Average per Trip          |
| AED 30.00                 |
+---------------------------+
```

Cards use theme colors — today in primary tint, week in neutral, avg in success tint. Pull-to-refresh to reload.

## UI — History

Each card shows:
```
+---------------------------+
| LB-20260802-00001  [Delivered] |
| Spice Route               |
| AED 15.00  •  2.3 km      |
| Aug 2, 2026               |
+---------------------------+
```

Status badge uses the shared `StatusBadge` component. Pull-to-refresh. Empty state when no trips.

## Next Steps

- [Driver Home](./driver-home) — online/offline toggle
- [Profile](./driver-profile) — driver info and logout
