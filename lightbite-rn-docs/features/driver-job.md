# Driver Job Offer

30-second countdown accept/decline screen for incoming delivery jobs.

**Route:** `/(driver)/job-offer` (modal)
**Feature path:** `src/features/driver/job/`

## Data Flow

```
DriverHomeScreen (polling detects job)
       |
router.push({ pathname: '/(driver)/job-offer', params: { job: JSON.stringify(job) } })
       |
DriverJobScreen.tsx (reads job from params)
       |
job.store.ts → POST /driver/jobs/{uuid}/accept | decline
       |
   Accept → router.replace to pickup screen
   Decline → router.back to driver home
   Timer expires → auto-decline → router.back
```

## Store Design

| Field | Type | Purpose |
|---|---|---|
| `isAccepting` | `boolean` | Accept API in progress |
| `isDeclining` | `boolean` | Decline API in progress |
| `error` | `string \| null` | Error message |

## Timer

- 30-second countdown displayed as a badge (pill)
- Color changes from neutral to red when ≤10 seconds remaining
- Auto-declines when timer reaches 0
- Uses `setInterval` with 1-second ticks, cleared on unmount

## UI Layout

```
+---------------------------+
|  ✕   New Job Offer   30s  |
+---------------------------+
|                           |
|     Earnings              |
|     AED 15.00             |
|     Distance: 2.3 km      |
|                           |
+---------------------------+
| Restaurant                |
| Spice Route               |
| Jumeirah Beach Road       |
+---------------------------+
| Deliver To                |
| Dubai Marina              |
+---------------------------+
| [Decline]   [  Accept  ]  |
+---------------------------+
```

## Next Steps

- [Driver Home](./driver-home) — polling and job detection
- [Pickup & Delivery](./driver-delivery) — delivery flow after accepting
