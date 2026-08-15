# Checkout & Order Confirmation

Order placement with idempotency protection, address selection, payment method selection, and confirmation screen.

**Routes:** `/(customer)/checkout`, `/(customer)/order-confirmation`
**Feature path:** `src/features/customer/checkout/`

## Data Flow

```
CartStore (screenState → Cart)     AddressStore (addresses, selectedUuid)
            \                              /
             CheckoutScreen (reads both stores + paymentMethod)
                    |
           Place Order button
                    |
          checkout.store.ts → placeOrder()
                    |
          checkout.api.ts → POST /orders  { delivery_address_uuid, payment_method, customer_note }
                    |
          Idempotency-Key header (random UUID)
                    |
      ┌── 201: OrderResult → navigate to order-confirmation
      └── Error: display error, stay on checkout
```

## Payment Method Selection

The checkout screen lets the customer choose how to pay before placing the order. Payment is a first-class field on the store and the API request.

| Method | Store value | Behavior |
|---|---|---|
| Cash on Delivery | `cash_on_delivery` | Default. Order is placed immediately; payment happens on delivery. |
| Card Payment | `card` | **Simulated for the demo** — no real gateway. The store waits ~900ms to feel realistic, then places the order as usual. |

```typescript
// src/features/customer/checkout/types.ts
export type PaymentMethod = 'cash_on_delivery' | 'card';

export interface PlaceOrderRequest {
  restaurant_uuid: string;
  delivery_address_uuid: string;
  payment_method: PaymentMethod;   // NEW — sent to the backend
  customer_note?: string;
}
```

## API Contract

### `POST /orders`

```typescript
Request: {
  delivery_address_uuid: string;   // restaurant_uuid is resolved server-side from the cart
  payment_method: "cash_on_delivery" | "card";
  customer_note?: string;
}
Headers: { 'Idempotency-Key': '<random-uuid>' }
Response 201: {
  uuid, order_number, status: "pending",
  restaurant: { name }, subtotal, delivery_fee,
  tax, total, estimated_delivery_min, created_at
}
```

## Store Design

| Field | Type | Purpose |
|---|---|---|
| `isPlacingOrder` | `boolean` | Loading state for button |
| `orderError` | `string \| null` | Error message display |
| `orderResult` | `OrderResult \| null` | Set on success, triggers navigation |
| `customerNote` | `string` | Optional note text |
| `paymentMethod` | `PaymentMethod` | `'cash_on_delivery'` (default) or `'card'` |
| `placeOrder()` | Method | Returns `boolean` — reads cart + address stores via `getState()` |
| `setPaymentMethod(method)` | Method | Update the selected payment method |
| `reset()` | Method | Clear all state |

**Key design choices:**
- `placeOrder()` reads from `useCartStore.getState()` and `useCustomerAddressStore.getState()` synchronously — no prop drilling needed. The checkout store is the orchestrator, not the data holder.
- Card payment is simulated in the store: before the API call, `placeOrder()` waits ~900ms when `paymentMethod === 'card'` so the demo feels realistic. No card details are ever collected.

## UI Layout

### Checkout Screen

```
+---------------------------+
| Order Summary             |
| Restaurant: Spice Route   |
| 2x Hummus     AED 44.00   |
| 1x Shawarma   AED 18.00   |
+---------------------------+
| Subtotal:  AED 62.00      |
| Delivery:    AED 5.00     |
| Tax:         AED 3.10     |
| Total:      AED 70.10     |
+---------------------------+
| Delivery Address          |
| 🏠 Home  Marina Walk...   |
| [Change]                  |  ← pushes to address picker
+---------------------------+
| Payment Method            |
| (•) Cash on Delivery      |
| ( ) Card Payment          |  ← "simulated for demo"
|                           |
+---------------------------+
| Customer Note             |
| [____________________]    |
+---------------------------+
| [    Place Order    ]     |  ← primary, full-width, loading state
+---------------------------+
```

### Order Confirmation

```
+---------------------------+
|        ✓ (large icon)     |
|                           |
| Order Confirmed!          |
| LB-20260726-00001         |
|                           |
| Restaurant: Spice Route   |
| Estimated: 25-30 min      |
+---------------------------+
| [  Track Order  ]         |  ← navigates to tracking
| [ Back to Home  ]         |  ← secondary, ghost variant
+---------------------------+
```

## Idempotency

Every order placement generates a unique idempotency key. If the network fails after the server processes the order but before the client receives the response, retrying with the same key returns the existing order instead of creating a duplicate.

## Known Gaps

- Cart is not cleared after successful order placement
- Track Order goes to orders tab, not directly to tracking route (has `orderResult.uuid` available)
- Card payments are simulated — real Stripe (or another gateway) integration is future work

## Next Steps

- [Cart](./cart) — data source for checkout
- [Address](./address) — address selection flow
- [Order History](./order) — tracking flow after confirmation
