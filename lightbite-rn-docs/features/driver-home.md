# Driver Home

Online/offline toggle, live job discovery via WebSocket, and active delivery recovery after restart.

**Route:** `/(driver)/(tabs)/home`
**Feature path:** `src/features/driver/home/`

## Data Flow

```
GET /driver/home (ScreenController)
       |
driverHome bundles: driver info, active_delivery, pending_jobs, earnings
       |
home.store.ts (Zustand: isOnline, isLive, activeDelivery, jobOffer)
       |
useDriverHome() hook
       |
DriverHomeScreen.tsx
```

Job offers do **not** come from polling by default. The driver subscribes to a private Reverb channel and receives `driver.new_job` events instantly:

```
WebSocket (private-driver.{driverId}) ── driver.new_job ──► jobOffer ──► navigate to job offer
```

## Active Delivery Recovery

On mount, `DriverHomeScreen` calls `recoverActiveDelivery()` once. This hits `GET /driver/active-delivery` and restores any in-progress delivery after an app restart or a cold start mid-job.

```typescript
// src/features/driver/home/store/home.store.ts
recoverActiveDelivery: async () => {
  const result = await fetchActiveDelivery();
  result.match(
    (delivery) => {
      if (delivery) set({ activeDelivery: delivery, isOnline: true });
    },
    () => {
      // Silently ignore — the driver may just not have an active delivery.
    },
  );
},
```

The recovered `ActiveDelivery` carries both the job data and the current phase:

```typescript
export type DeliveryPhase = 'pickup' | 'picked_up' | 'delivering';

export interface ActiveDelivery {
  job: DriverJob;
  phase: DeliveryPhase;
}
```

The "Active Delivery" card navigates to the correct phase screen — the `pickup` phase goes to the pickup route, everything else goes to the delivery route (which renders the picked-up or delivering phase):

```typescript
const pathname = delivery.phase === 'pickup' ? '/(driver)/pickup' : '/(driver)/delivery';
```

## WebSocket Live Updates

When the driver goes online and has no active delivery, `startPolling()` is invoked. Under the hood it subscribes to the driver's private Reverb channel and listens for the `driver.new_job` event — this is the **primary** job signal. Polling is only a fallback that runs while the WebSocket is not connected.

```
startPolling()
   ├── subscribe(private-driver.{userId})
   ├── on('driver.new_job') → set jobOffer, stop polling
   ├── onStatusChange → set isLive (status === 'connected')
   └── fallback poll: GET /driver/home every 5s (5s → 30s backoff)
                  only when webSocketClient.isConnected() === false
```

- **`isLive`** — true when the WebSocket is connected, surfaced as "Waiting for jobs…" (live) vs the polling fallback copy.
- The job offer screen is entered from store state (`jobOffer`) — no manual navigation on the event itself.
- Polling uses exponential backoff (5s → 30s max) and only fires while the WebSocket is down.

## Store Design

| Field | Type | Purpose |
|---|---|---|
| `isOnline` | `boolean` | Online status |
| `isTogglingOnline` | `boolean` | API call in progress |
| `isLive` | `boolean` | WebSocket connected (live job updates active) |
| `activeDelivery` | `ActiveDelivery \| null` | Current delivery with job + phase |
| `jobOffer` | `DriverJob \| null` | New job that arrived via WebSocket (or fallback polling) |
| `pollingError` | `string \| null` | Polling error message |
| `unsubscribeWebSocket` | `() => void \| null` | Cleanup for channel + event listeners |

| Method | Purpose |
|---|---|
| `goOnline()` / `goOffline()` | Toggle online status, start/stop job discovery |
| `setActiveDelivery(delivery)` | Sync current delivery + phase (called by delivery store) |
| `recoverActiveDelivery()` | Fetch in-progress delivery after restart |
| `startPolling()` / `stopPolling()` | Subscribe to WebSocket + fallback poll / tear down |

**Lifecycle:** `useFocusEffect` starts job discovery only when online, focused, and no active delivery. When a `driver.new_job` event (or fallback poll) produces a job, discovery stops and the screen navigates to the job offer.

## API Contract

### `PATCH /driver/status`
Toggle online/offline. Body: `{ "is_online": true|false }`

### `GET /driver/home`
Returns bundled driver data: theme, driver info, `active_delivery`, `pending_jobs` array, earnings summary. Used only by the fallback poll for job discovery.

### `GET /driver/active-delivery`
Returns the driver's current in-progress delivery, or empty. The status maps back to a phase:

| Backend status | Phase |
|---|---|
| `assigned` | `pickup` |
| `picked_up` | `picked_up` |
| `delivering` | `delivering` |

## UI Layout

```
+---------------------------+
| 👤 Driver Name      🟢 Online |
+---------------------------+
|                           |
|    🚚 (large emoji)      |
|    Waiting for jobs...    |
|    (live) or (polling)    |
|                           |
|  [   Go Online   ]        |  ← large CTA button
|                           |
+---------------------------+
```

When a delivery is active (recovered or set by the delivery screen):

```
+---------------------------+
| Active Delivery    [Picked Up] |
| Spice Route               |
| Deliver to: Dubai Marina  |
| Earnings: AED 15.00       |
| [Resume]                  |  ← → /pickup if phase is pickup, else /delivery
+---------------------------+
```

## Next Steps

- [Driver Delivery](./driver-delivery) — 3-phase pickup / start-delivery / deliver flow
- [Job Offer](./driver-job) — 30s countdown accept/decline
- [Earnings](./driver-earnings) — today/week summary
