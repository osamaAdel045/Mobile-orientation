# Address Management

Saved delivery addresses with CRUD, default badge, and checkout selection support.

**Routes:** `/(customer)/address`, `/(customer)/address-form`, `/(customer)/address-picker`
**Feature path:** `src/features/customer/address/`

## Data Flow

```
GET /users/me/addresses
       |
address.api.ts
       |
address.store.ts (Zustand: addresses[], selectedUuid)
       |
useCustomerAddress() hook
       |
AddressScreen / AddressForm / AddressPicker
```

## API Contract

| Endpoint | Method | Purpose |
|---|---|---|
| `/users/me/addresses` | GET | List paginated addresses |
| `/users/me/addresses` | POST | Create address |
| `/users/me/addresses/{id}` | PUT | Update address |
| `/users/me/addresses/{id}` | DELETE | Delete (409 if default) |

## Store Design

| Field | Type | Purpose |
|---|---|---|
| `screenState` | Discriminated union | loading, loaded(Address[]), error, empty |
| `selectedUuid` | `string \| null` | Selected address for checkout flow |
| `load()` | Method | Fetch addresses |
| `add(input)` | Method | Create → returns `AppError \| null` |
| `update(uuid, input)` | Method | Edit → returns `AppError \| null` |
| `remove(uuid)` | Method | Delete — surfaces 409 for default address |
| `select(uuid)` | Method | Set selectedUuid for checkout |

**Key decision:** Mutations return `AppError | null` instead of `boolean` — lets the UI display the specific 409 "cannot delete default" message from the server.

## Three Screen Modes

| Screen | Purpose | Key Behavior |
|---|---|---|
| `AddressScreen` | List all addresses | Default badge, edit/delete actions, Add New button |
| `AddressFormScreen` | Add/Edit form | Populated from route params for edit mode, blank for add |
| `AddressPicker` | Checkout selection | Tap to select → `setSelectedUuid` → `router.back()` |

## Known Gaps

- Lat/lng are plain text inputs — no map picker integration yet
- Address picker uses `router.back()` after selection; checkout `placeOrder()` reads `selectedUuid` synchronously
- No geocoding or address autocomplete

## Next Steps

- [Checkout](./checkout) — consumes selected address
- [Cart](./cart) — flows into checkout
