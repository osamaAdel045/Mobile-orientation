# Rate Order

Star rating and optional text review for completed orders.

**Route:** `/(customer)/rate-order`
**Feature path:** `src/features/customer/rate-order/`

## Data Flow

```
POST /orders/{uuid}/rate
       |
rate-order.api.ts
       |
useRateOrderStore
       |
RateOrderScreen
```

## API Contract

### `POST /orders/{uuid}/rate`

Submits a 1-5 star rating with an optional text review.

```typescript
interface RateRequest {
  rating: number;   // 1-5
  review?: string;  // max 500 chars, optional
}
```

**Rules:**
- Only the customer who placed the order can rate it
- Order must be `delivered`
- One rating per order (updateOrCreate — subsequent calls update)
- Cannot edit after 24 hours of submission

## Store Design

| Field | Type | Purpose |
|---|---|---|
| `screenState` | Discriminated union | idle, submitting, success, error |
| `submit(rating, review?)` | Method | POST rating, returns success/error |

The store uses `idle` as initial state (not `loading`) — the screen renders immediately. Transitions to `submitting` during API call, then `success` (show confirmation + navigate back) or `error` (show retry).

## UI Layout

```
+---------------------------+
|      Rate Your Order      |
|      Spice Route          |
|                           |
|      ⭐ ⭐ ⭐ ⭐ ⭐        |
|      (tap to select)      |
|                           |
|  ┌─────────────────────┐  |
|  │ Tell us more...      │  |
|  │ (optional review)    │  |
|  └─────────────────────┘  |
|                           |
|      [ Submit Rating ]    |
+---------------------------+
```

## Next Steps

- [Order Tracking](./order) — where the rate action originates
- [Checkout](./checkout) — places orders that can later be rated
