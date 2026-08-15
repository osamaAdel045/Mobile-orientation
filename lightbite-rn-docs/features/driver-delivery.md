# Driver Delivery

Three-phase delivery flow: pick up from the restaurant, drive to the customer, then hand over the food.

**Routes:** `/(driver)/pickup`, `/(driver)/delivery`
**Feature path:** `src/features/driver/delivery/`

## Phases

The delivery lifecycle is split into three phases, each driven by one store action and one API call:

| Phase | Starting status | Action | Endpoint | New status |
|---|---|---|---|---|
| **pickup** | `assigned` | Confirm Pickup | `POST /driver/jobs/{uuid}/pickup` | `picked_up` |
| **picked_up** | `picked_up` | Start Delivery | `POST /driver/jobs/{uuid}/start-delivery` | `delivering` |
| **delivering** | `delivering` | Confirm Delivery | `POST /driver/jobs/{uuid}/deliver` | `delivered` |

- **Phase 1 — pickup:** The driver is at the restaurant. After confirming they picked up the food, the order moves from `assigned` → `picked_up`.
- **Phase 2 — picked_up:** NEW. The driver has the food in hand and presses "Start Delivery" to begin driving to the customer. This is what moves the order from `picked_up` → `delivering`.
- **Phase 3 — delivering:** The driver is en route. On arrival they confirm the food was delivered, completing the job with status `delivered` and showing the earnings summary.

## Flow

```
Job Offer (Accept)
       |
Pickup Screen → confirmPickup() → POST /driver/jobs/{uuid}/pickup
       |         (assigned → picked_up)
       ↓
Picked-Up Screen → startDelivery() → POST /driver/jobs/{uuid}/start-delivery
       |            (picked_up → delivering)
       ↓
Delivery Screen → confirmDelivery() → POST /driver/jobs/{uuid}/deliver
       |            (delivering → delivered)
       ↓
Earnings summary → Back to Home
```

## API Contract

| Endpoint | Purpose |
|---|---|
| `POST /driver/jobs/{uuid}/pickup` | Confirm pickup at restaurant (`assigned` → `picked_up`) |
| `POST /driver/jobs/{uuid}/start-delivery` | Start driving to customer (`picked_up` → `delivering`) |
| `POST /driver/jobs/{uuid}/deliver` | Confirm delivery to customer (`delivering` → `delivered`) |

## Component Structure

One screen renders all three phases. `DriverDeliveryScreen` receives a `job` plus a `phase` prop (`pickup | picked_up | delivering`) and re-renders the header, destination card, and confirm button based on the current phase:

```
DriverDeliveryScreen({ job, phase })
   ├── setJob(job, phase)              ← hydrate the store on mount
   ├── phase = 'pickup'     → header "Pickup from Restaurant", destination = restaurant, button "Confirm Pickup"
   ├── phase = 'picked_up'  → header "Start Delivery",        destination = customer,   button "Start Delivery"
   ├── phase = 'delivering' → header "Deliver to Customer",   destination = customer,   button "Confirm Delivery"
   └── completedEarnings != null → earnings summary screen
```

Each successful confirm does `router.replace` back into the same delivery route with the next phase, so the screen is never torn down mid-delivery. The two route entries (`/pickup` and `/delivery`) are both backed by this screen — the phase decides what it renders.

## Store Design

The Zustand store tracks the current phase and exposes one action per transition:

| Field | Type | Purpose |
|---|---|---|
| `job` | `DriverDeliveryJob \| null` | The job being delivered |
| `phase` | `pickup \| picked_up \| delivering` | Current delivery phase |
| `isConfirming` | `boolean` | API call in progress |
| `completedEarnings` | `string \| null` | Set on delivery success, triggers earnings summary |
| `error` | `string \| null` | Error message display |

| Action | API call | Resulting phase | Syncs home store |
|---|---|---|---|
| `confirmPickup()` | `POST .../pickup` | `picked_up` | `setActiveDelivery({ job, phase: 'picked_up' })` |
| `startDelivery()` | `POST .../start-delivery` | `delivering` | `setActiveDelivery({ job, phase: 'delivering' })` |
| `confirmDelivery()` | `POST .../deliver` | `completedEarnings` set | `setActiveDelivery(null)` |

Every action is guarded by `job != null`, sets `isConfirming` while the request is in flight, and surfaces failures through the `error` field. The `setActiveDelivery(...)` calls keep the driver home store in sync so the "Active Delivery" card reflects the current phase.

## UI Layout

### Pickup Screen (phase `pickup`)

```
+---------------------------+
| ←  Pickup from Restaurant |
+---------------------------+
|                           |
| Pickup from:              |
| Spice Route               |
| Jumeirah Beach Road       |
+---------------------------+
| Job Earnings: AED 15.00   |
| Distance: 2.3 km          |
+---------------------------+
| [ Navigate ]              |  ← Opens Google Maps (restaurant)
| [ Confirm Pickup ]        |  ← Green primary button
+---------------------------+
```

### Picked-Up Screen (phase `picked_up`)

```
+---------------------------+
| ←  Start Delivery         |
+---------------------------+
|                           |
| Deliver to:               |
| Dubai Marina              |
+---------------------------+
| Job Earnings: AED 15.00   |
| Distance: 2.3 km          |
+---------------------------+
| [ Navigate ]              |  ← Opens Google Maps (customer)
| [ Start Delivery ]        |  ← new second-phase button
+---------------------------+
```

### Delivery Screen (phase `delivering`)

```
+---------------------------+
| ←  Deliver to Customer    |
+---------------------------+
|                           |
| Deliver to:               |
| Dubai Marina              |
+---------------------------+
| Job Earnings: AED 15.00   |
| Distance: 2.3 km          |
+---------------------------+
| [ Navigate ]              |
| [ Confirm Delivery ]      |
+---------------------------+
```

### Completion Screen

```
+---------------------------+
|         🎉                |
|    Delivery Complete!     |
|                           |
|    AED 15.00              |
|                           |
| [ Back to Home ]          |
+---------------------------+
```

## Next Steps

- [Job Offer](./driver-job) — accepting a job
- [Driver Home](./driver-home) — active delivery recovery and phase-based resume
- [Earnings](./driver-earnings) — post-delivery earnings
