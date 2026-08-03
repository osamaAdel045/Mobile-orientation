# Checkout & Order Confirmation

Order placement with idempotency protection, address selection, and confirmation screen.

**Routes:** `/(customer)/checkout`, `/(customer)/order-confirmation`
**Feature path:** `src/features/customer/checkout/`

## Data Flow

```
CartStore (screenState → Cart)     AddressStore (addresses, selectedUuid)
            \                              /
             CheckoutScreen (reads both stores)
                    |
           Place Order button
                    |
          checkout.store.ts → placeOrder()
                    |
          checkout.api.ts → POST /orders
                    |
          Idempotency-Key header (Date.now()-random)
                    |
      ┌── 201: OrderResult → navigate to order-confirmation
      └── Error: display error, stay on checkout
```

## API Contract

### `POST /orders`

```typescript
Request: {
  restaurant_uuid: string;
  delivery_address_uuid: string;
  customer_note?: string;
}
Headers: { 'Idempotency-Key': '<unique-key>' }
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
| `placeOrder()` | Method | Returns `boolean` — reads cart + address stores via `getState()` |
| `reset()` | Method | Clear all state |

**Key design choice:** `placeOrder()` reads from `useCartStore.getState()` and `useCustomerAddressStore.getState()` synchronously — no prop drilling needed. The checkout store is the orchestrator, not the data holder.

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
- No payment method selection (Stripe integration is future work)

## Next Steps

- [Cart](./cart) — data source for checkout
- [Address](./address) — address selection flow
- [Order History](./order) — tracking flow after confirmation
