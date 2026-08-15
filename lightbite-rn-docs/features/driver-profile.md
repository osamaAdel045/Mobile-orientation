# Driver Profile

Driver profile screen showing personal info, vehicle details, total trips, rating, and theme toggle.

**Route:** `/(driver)/(tabs)/profile`
**Feature path:** `src/features/driver/profile/`

## Data Flow

```
GET /driver/orders (meta.total → trips count)
       |
profile.api.ts
       |
profile.store.ts (Zustand: profileScreenState, summary)
       |
useDriverProfile() hook
       |
DriverProfileScreen
```

Driver name and email come from the auth store. Trip count, earnings, and rating are fetched from the profile API. Vehicle info is displayed if available from registration data.

## API Contract

| Endpoint | Method | Purpose |
|---|---|---|
| `/driver/orders` | GET | Order history — `meta.total` used for trip count |

The profile does not have its own dedicated endpoint. Trip count is derived from the order history pagination metadata, rating from the auth store user object, and earnings from the earnings API.

## Store Design

| Field | Type | Purpose |
|---|---|---|
| `profileScreenState` | Discriminated union | loading, loaded, error |
| `profileSummary` | `ProfileSummary \| null` | Total trips, rating, vehicle info |
| `load()` | Method | Fetch profile data |
| `clear()` | Method | Reset state |

All states (loading, loaded, error) are handled with Skeleton, data display, and ErrorDisplay components respectively.

## UI Layout

```
+---------------------------+
|       👤 (avatar)         |
|    Khalid Mohammed        |
|  khalid.mohammed@driver.. |
|                           |
|  ┌─────────────────────┐ |
|  │ 📊 42 Total Trips   │ |
|  │ ⭐ 4.7 Rating       │ |
|  │ 🚗 Toyota Camry     │ |
|  │ 📋 DXB-12345        │ |
|  └─────────────────────┘ |
|                           |
|  🌙 Dark Mode  [Toggle]  |
|  🌐 English →             |
|  🚪 Logout                |
+---------------------------+
```

## Next Steps

- [Home](./driver-home) — online/offline toggle, job discovery
- [Earnings](./driver-earnings) — daily/weekly earnings summary
