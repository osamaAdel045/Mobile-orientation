# Order History & Tracking

Order history list with status badges, pagination, and real-time order tracking with driver location and status timeline.

**Routes:** Tab: Orders, `/(customer)/order-tracking`
**Feature path:** `src/features/customer/order/`

## Data Flow

```
Order List:                    Order Tracking:
GET /users/me/orders?page=1    GET /orders/{uuid}/tracking
       |                              |
order.api.ts                     order.api.ts
       |                              |
useCustomerOrderStore            useOrderTrackingStore
  (ScreenState + pagination)       (load + 15s polling + cleanup)
       |                              |
CustomerOrderScreen              CustomerOrderTrackingScreen
```

## API Contract

### `GET /users/me/orders` — Order History

Paginated, filterable by status. Returns `{ data: Order[], meta: { current_page, total } }`.

### `GET /orders/{uuid}/tracking` — Real-Time Tracking

Returns status, status history timeline, driver info (only during delivering/picked_up), and ETA.

```typescript
interface OrderTracking {
  uuid: string;
  status: OrderStatus;
  status_history: StatusHistoryEntry[];
  driver: DriverInfo | null;
  estimated_delivery_at: string | null;
}

interface DriverInfo {
  name: string;
  photo_url: string;
  rating: number;
  lat: number;
  lng: number;
  bearing: number;
  eta_min: number;
}
```

## Store Design

### Order List Store

Standard ScreenState with pagination: `load(page)` → `loadMore()` pattern, exactly like the home screen's restaurant listing.

### Tracking Store

| Field | Type | Purpose |
|---|---|---|
| `trackingState` | ScreenState | loading, loaded(OrderTracking), error |
| `load(uuid)` | Method | Initial fetch |
| `startPolling(uuid)` | Method | 15s interval auto-refresh |
| `stopPolling()` | Method | Cleanup (called on unmount) |
| `reset()` | Method | Clear state |

**Polling behavior:** Starts on mount, auto-stops when status is `delivered`/`rejected`/`cancelled`. Keeps last-good data on transient poll errors — no flickering.

## UI Layout

### Order History

```
+---------------------------+
| LB-20260726-00001  [Pending]|
| Spice Route               |
| Jul 26, 2026              |
| 2x Hummus, 1x Shawarma    |
| Total: AED 66.15          |
| [Track Order] [Order Again]|
+---------------------------+
| LB-20260725-00005 [Delivered]|
| Beirut Bistro             |
| Jul 25, 2026              |
| 1x Falafel Wrap           |
| Total: AED 28.00          |
| [Reorder]                  |
+---------------------------+
```

### Order Tracking

```
+---------------------------+
|                           |
|       🚗 (large icon)     |
|       Delivering          |
|                           |
| Estimated: 12:35 PM       |
| ETA: 3 min                |
+---------------------------+
| Driver: Khalid            |
| Rating: ★ 4.8             |
|                           |
+---------------------------+
| ● Confirmed   12:05 PM    |
| ● Preparing   12:10 PM    |
| ● Ready       12:20 PM    |
| ● Picked Up   12:28 PM    |
| ○ Delivering  12:32 PM    |  ← current
| ○ Delivered  --:--        |
+---------------------------+
```

## Status Timeline

The tracking screen renders a vertical stepper showing all status transitions. Completed steps show a filled dot, the current step is highlighted, and future steps are dimmed. The stepper is built from `status_history` array — not a hardcoded list.

## Next Steps

- [Checkout](./checkout) — creates orders, navigates to confirmation
- [Cart](./cart) — feeds into checkout
