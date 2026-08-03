# Driver Pickup & Delivery

Two-phase delivery flow: pickup from restaurant, then delivery to customer.

**Routes:** `/(driver)/pickup`, `/(driver)/delivery`
**Feature path:** `src/features/driver/delivery/`

## Flow

```
Job Offer (Accept)
       |
Pickup Screen → POST /driver/jobs/{uuid}/pickup
       |
       → router.replace to Delivery Screen
       |
Delivery Screen → POST /driver/jobs/{uuid}/deliver
       |
       → Show earnings summary → Back to Home
```

## API Contract

| Endpoint | Purpose |
|---|---|
| `POST /driver/jobs/{uuid}/pickup` | Confirm pickup at restaurant |
| `POST /driver/jobs/{uuid}/start-delivery` | Transition from pickup to delivering |
| `POST /driver/jobs/{uuid}/deliver` | Confirm delivery to customer |

## UI Layout

### Pickup Screen
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
| [ Navigate ]              |  ← Opens Google Maps
| [ Confirm Pickup ]        |  ← Green primary button
+---------------------------+
```

### Delivery Screen
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
- [Earnings](./driver-earnings) — post-delivery earnings
