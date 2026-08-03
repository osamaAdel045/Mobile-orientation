# Driver Home

Online/offline toggle, adaptive job polling, and active delivery management.

**Route:** `/(driver)/(tabs)/home`
**Feature path:** `src/features/driver/home/`

## Data Flow

```
GET /driver/home (ScreenController)
       |
driverHome bundles: driver info, active_delivery, pending_jobs, earnings
       |
home.store.ts (Zustand: isOnline, activeDelivery, jobOffer)
       |
useDriverHome() hook
       |
DriverHomeScreen.tsx
```

## Store Design

| Field | Type | Purpose |
|---|---|---|
| `isOnline` | `boolean` | Online status |
| `isTogglingOnline` | `boolean` | API call in progress |
| `activeDelivery` | `Delivery \| null` | Current delivery with job data |
| `jobOffer` | `DriverJob \| null` | New job that arrived via polling |
| `pollingError` | `string \| null` | Polling error message |

**Polling behavior:** Starts when online and no active delivery. Uses `useFocusEffect` to auto-start/stop when the screen gains/loses focus. No fixed interval — the store polls `GET /driver/home` every 5 seconds with exponential backoff (5s → 30s max).

## API Contract

### `PATCH /driver/status`
Toggle online/offline. Body: `{ "is_online": true|false }`

### `GET /driver/home`
Returns bundled driver data: theme, driver info, `active_delivery`, `pending_jobs` array, earnings summary.

## UI Layout

```
+---------------------------+
| 👤 Driver Name      🟢 Online |
+---------------------------+
|                           |
|    🚚 (large emoji)      |
|    Waiting for jobs...    |
|                           |
|  [   Go Online   ]        |  ← large CTA button
|                           |
+---------------------------+
```

When a delivery is active:
```
+---------------------------+
| Active Delivery     [Picked Up] |
| Spice Route               |
| Deliver to: Dubai Marina  |
| Earnings: AED 15.00       |
| [Resume]                  |
+---------------------------+
```

## Next Steps

- [Job Offer](./driver-job) — 30s countdown accept/decline
- [Earnings](./driver-earnings) — today/week summary
