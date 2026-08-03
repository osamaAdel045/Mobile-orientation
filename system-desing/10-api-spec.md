# 10 — API Specification (OpenAPI 3.0): LightBite

**Date:** 2026-07-26
**Status:** Draft
**Version:** 1.0
**Base URL:** `/api/v1`

---

This document defines the complete REST API contract for LightBite Phase 1. The full machine-readable OpenAPI 3.0 YAML is in `specs/openapi-v1.yaml`. This document provides the human-readable reference.

---

## 1. Authentication Endpoints

### POST /auth/register

Register a new user account.

```
Request:
{
  "name": "Sarah Chen",
  "email": "sarah@example.com",
  "password": "SecureP4ss!",
  "password_confirmation": "SecureP4ss!",
  "role": "customer",
  "phone": "+971501234567"
}

Response 201:
{
  "data": {
    "user": {
      "uuid": "a1b2c3d4-...",
      "name": "Sarah Chen",
      "email": "sarah@example.com",
      "role": "customer",
      "status": "pending_verification",
      "created_at": "2026-07-26T12:00:00Z"
    },
    "access_token": "eyJ...",
    "refresh_token": "rT_abc123...",
    "expires_in": 900
  },
  "meta": { "trace_id": "trace-001" }
}

Errors:
  409: {"error": {"code": "EMAIL_TAKEN", "message": "An account with this email already exists."}}
  422: {"error": {"code": "VALIDATION_ERROR", "message": "...", "details": [{"field": "password", "message": "Password must be at least 8 characters with 1 uppercase and 1 number."}]}}
```

**Restaurant registration** adds: restaurant_name, trade_license (file upload), food_safety_cert (file upload), cuisine_types (array), address, lat, lng.

**Driver registration** adds: driver_license (file upload), vehicle_registration (file upload), insurance (file upload), vehicle_type.

### POST /auth/login

```
Request:
{
  "email": "sarah@example.com",
  "password": "SecureP4ss!"
}

Response 200:
{
  "data": {
    "user": { "uuid": "...", "name": "Sarah Chen", "email": "...", "role": "customer", "status": "verified" },
    "access_token": "eyJ...",
    "refresh_token": "rT_abc123...",
    "expires_in": 900
  }
}

Errors:
  401: {"error": {"code": "INVALID_CREDENTIALS", "message": "Incorrect email or password."}}
  403: {"error": {"code": "EMAIL_NOT_VERIFIED", "message": "Please verify your email before logging in."}}
  403: {"error": {"code": "ACCOUNT_LOCKED", "message": "Account temporarily locked. Try again in 15 minutes."}}
  403: {"error": {"code": "ACCOUNT_NOT_APPROVED", "message": "Your registration is under review."}}
```

**Rate limit:** 5 attempts per email per 15 minutes.

### POST /auth/refresh

```
Request: { "refresh_token": "rT_abc123..." }

Response 200:
{
  "data": {
    "access_token": "eyJ...",
    "refresh_token": "rT_new456...",
    "expires_in": 900
  }
}

Errors:
  401: {"error": {"code": "INVALID_REFRESH_TOKEN", "message": "Refresh token is invalid or expired."}}
  401: {"error": {"code": "TOKEN_REUSED", "message": "Session expired for security. Please log in again."}}
```

### POST /auth/logout

```
Headers: Authorization: Bearer <access_token>
Request: { "refresh_token": "rT_abc123..." }

Response 204: (no content)
```

### POST /auth/forgot-password

```
Request: { "email": "sarah@example.com" }
Response 200: { "data": { "message": "If that email exists, a reset link has been sent." } }
```

### PUT /auth/reset-password

```
Request: { "token": "reset-token-from-email", "password": "NewP4ss!", "password_confirmation": "NewP4ss!" }

Response 200: { "data": { "message": "Password has been reset. All existing sessions have been revoked." } }

Errors:
  400: {"error": {"code": "INVALID_RESET_TOKEN", "message": "Reset link is invalid or has expired."}}
```

---

## 2. User Profile Endpoints

### GET /users/me

```
Headers: Authorization: Bearer <access_token>
Response 200:
{
  "data": {
    "uuid": "a1b2c3d4-...",
    "name": "Sarah Chen",
    "email": "sarah@example.com",
    "phone": "+971501234567",
    "photo_url": "https://cdn.lightbite.com/users/a1b2/photo.webp",
    "role": "customer",
    "status": "verified",
    "created_at": "2026-07-26T12:00:00Z"
  }
}
```

### PATCH /users/me

```
Request: { "name": "Sarah C.", "phone": "+971501234568" }
Response 200: { "data": { ...updated user } }
```

### GET /users/me/addresses

Paginated list of saved addresses.

### POST /users/me/addresses

```
Request: {
  "label": "home",
  "address": "Marina Walk, Dubai Marina",
  "apartment": "Tower 5, Apt 1203",
  "lat": 25.0801,
  "lng": 55.1400,
  "is_default": true
}

Errors:
  422: {"error": {"code": "MAX_ADDRESSES", "message": "Maximum 10 saved addresses."}}
  422: {"error": {"code": "OUTSIDE_DELIVERY_ZONE", "message": "This location is outside our delivery zone."}}
```

### PUT /users/me/addresses/{id}

Update an address.

### DELETE /users/me/addresses/{id}

```
Error: 409: Cannot delete default address — set another address as default first.
```

### GET /users/me/orders

Customer order history. Paginated. Filterable: `?status=delivered&from=2026-07-01&to=2026-07-26`

---

## 3. Restaurant Discovery Endpoints

### GET /restaurants

```
Query params:
  ?lat=25.0801&lng=55.1400      (required — customer location)
  &radius=10                      (optional, default 10km)
  &cuisine=lebanese,middle_eastern (optional, multi-select)
  &q=spice                         (optional, full-text search)
  &sort=distance                   (distance | rating | delivery_time)
  &page=1&per_page=20

Response 200:
{
  "data": [
    {
      "uuid": "r1-...",
      "name": "Spice Route",
      "logo_url": "https://cdn.lightbite.com/restaurants/r1/logo.webp",
      "cuisine_types": ["lebanese", "middle_eastern"],
      "rating": 4.3,
      "review_count": 47,
      "delivery_time_min": 25,
      "delivery_fee": "AED 5.00",
      "distance_km": 1.2,
      "is_open": true,
      "is_accepting_orders": true
    }
  ],
  "links": { "next": "/api/v1/restaurants?page=2&..." },
  "meta": { "current_page": 1, "per_page": 20, "total": 87, "trace_id": "trace-001" }
}
```

### GET /restaurants/{uuid}

```
Response 200:
{
  "data": {
    "uuid": "r1-...",
    "name": "Spice Route",
    "description": "Authentic Lebanese cuisine since 2018",
    "logo_url": "...",
    "cover_url": "...",
    "cuisine_types": ["lebanese", "middle_eastern"],
    "rating": 4.3,
    "review_count": 47,
    "address": "Jumeirah Beach Road, Dubai",
    "lat": 25.2000,
    "lng": 55.2500,
    "phone": "+97141234567",
    "hours": {
      "today": [{ "open": "12:00", "close": "23:00" }],
      "is_open": true
    },
    "delivery_fee": "AED 5.00",
    "min_order": "AED 20.00",
    "estimated_delivery_min": 25,
    "menu_categories": [
      {
        "name": "Appetizers",
        "items": [
          {
            "uuid": "mi-1",
            "name": "Hummus",
            "description": "Creamy chickpea dip with olive oil",
            "price": "AED 22.00",
            "image_url": "...",
            "is_available": true
          }
        ]
      }
    ]
  }
}
```

### GET /restaurants/{uuid}/menu

Full menu without restaurant metadata. Useful for deep linking directly to menu.

---

## 4. Cart Endpoints

### GET /cart

Returns the current cart for the authenticated customer.

```
Response 200:
{
  "data": {
    "uuid": "cart-1",
    "restaurant": { "uuid": "r1-...", "name": "Spice Route" },
    "items": [
      {
        "id": 1,
        "menu_item": { "uuid": "mi-1", "name": "Hummus" },
        "quantity": 2,
        "unit_price": "AED 22.00",
        "subtotal": "AED 44.00",
        "special_instructions": null
      }
    ],
    "subtotal": "AED 58.00",
    "delivery_fee": "AED 5.00",
    "tax": "AED 3.15",
    "total": "AED 66.15",
    "expires_at": "2026-07-27T10:30:00Z"
  }
}

Response 200 (empty): { "data": null }
```

### POST /cart/items

Add an item to the cart.

```
Request: {
  "menu_item_uuid": "mi-1",
  "quantity": 2,
  "special_instructions": "Extra tahini"
}

Response 201: { "data": { ...updated cart } }

Errors:
  409: {"error": {"code": "DIFFERENT_RESTAURANT", "message": "Adding from Spice Route will clear your current cart from Beirut Bistro. Continue?"}}
  (Client sends confirmation header: X-Clear-Cart: true to proceed)
  422: {"error": {"code": "ITEM_UNAVAILABLE", "message": "Hummus is currently unavailable."}}
  422: {"error": {"code": "RESTAURANT_CLOSED", "message": "Spice Route is not accepting orders right now."}}
```

### PATCH /cart/items/{id}

Update quantity. `{ "quantity": 3 }` or `{ "quantity": 0 }` (removes item).

### DELETE /cart/items/{id}

Remove an item from the cart.

### DELETE /cart

Clear the entire cart.

### POST /cart/validate

Pre-checkout validation. Returns any issues without placing the order.

```
Response 200 (valid): { "data": { "valid": true } }

Response 200 (invalid):
{
  "data": {
    "valid": false,
    "issues": [
      { "type": "item_unavailable", "item_name": "Chicken Shawarma", "item_uuid": "mi-3" },
      { "type": "price_change", "item_name": "Hummus", "old_price": "AED 22.00", "new_price": "AED 25.00" },
      { "type": "below_minimum", "current_subtotal": "AED 15.00", "minimum": "AED 20.00", "shortfall": "AED 5.00" }
    ]
  }
}
```

---

## 5. Order Endpoints

### POST /orders

Place an order. **Required header:** `Idempotency-Key: <UUID>`

```
Request:
{
  "restaurant_uuid": "r1-...",
  "delivery_address_uuid": "addr-1",
  "customer_note": "Ring bell #1203"
}

Response 201:
{
  "data": {
    "uuid": "ord-1",
    "order_number": "LB-20260726-00001",
    "status": "pending",
    "restaurant": { "name": "Spice Route" },
    "items": [ ... ],
    "subtotal": "AED 58.00",
    "delivery_fee": "AED 5.00",
    "tax": "AED 3.15",
    "total": "AED 66.15",
    "estimated_delivery_min": 30,
    "created_at": "2026-07-26T12:05:00Z"
  }
}

Errors:
  409: {"error": {"code": "IDEMPOTENCY_CONFLICT", "message": "An order with this idempotency key already exists.", "existing_order_uuid": "ord-1"}}
  422: {"error": {"code": "CART_EMPTY", "message": "Your cart is empty."}}
  422: {"error": {"code": "CART_VALIDATION_FAILED", "message": "Some items have changed.", "issues": [...]}}
  402: {"error": {"code": "PAYMENT_FAILED", "message": "Payment was declined.", "stripe_decline_code": "insufficient_funds"}}
```

### GET /orders/{uuid}

Order detail. Response includes current status, status timeline, items, payment status, driver info (if assigned).

### GET /orders/{uuid}/tracking

Lightweight tracking endpoint. Returns status + driver location (if in delivering status).

```
Response 200:
{
  "data": {
    "uuid": "ord-1",
    "status": "delivering",
    "status_history": [ ... ],
    "driver": {
      "name": "Khalid",
      "photo_url": "...",
      "rating": 4.8,
      "lat": 25.0805,
      "lng": 55.1395,
      "bearing": 270,
      "eta_min": 3
    },
    "estimated_delivery_at": "2026-07-26T12:35:00Z"
  }
}
```

### POST /orders/{uuid}/cancel

Customer cancels. Only valid for `pending` status (before restaurant action).

### PATCH /orders/{uuid}

Modify order. Only valid for `pending` status. Resets the 2-minute restaurant timer.

```
Request: {
  "add_items": [{"menu_item_uuid": "mi-5", "quantity": 1}],
  "remove_items": [3],
  "update_quantities": [{"id": 1, "quantity": 3}]
}
```

---

## 6. Restaurant Dashboard Endpoints

### GET /restaurants/dashboard

Today's summary stats.

```
Response 200:
{
  "data": {
    "today_orders": 12,
    "today_revenue": "AED 480.00",
    "active_orders": 3,
    "pending_orders": 2,
    "avg_prep_time_min": 18,
    "is_accepting_orders": true
  }
}
```

### GET /restaurants/dashboard/orders

Order board. Filterable: `?status=pending,confirmed,preparing&page=1`.

### GET /restaurants/dashboard/orders/{uuid}

Full order detail (items, customer info, special instructions).

### POST /restaurants/dashboard/orders/{uuid}/accept

```
Request: { "estimated_prep_min": 25 }
Response 200: { "data": { "status": "confirmed" } }

Errors:
  409: {"error": {"code": "INVALID_TRANSITION", "message": "Order can only be accepted from pending status. Current status: expired."}}
```

### POST /restaurants/dashboard/orders/{uuid}/reject

```
Request: { "reason": "Kitchen at capacity — too many orders" }
Response 200: { "data": { "status": "rejected" } }
```

### PATCH /restaurants/dashboard/orders/{uuid}/status

```
Request: { "status": "ready" }
Valid transitions: confirmed → preparing, preparing → ready
```

### GET/POST /restaurants/dashboard/menu

CRUD for menu items.

### GET/POST /restaurants/dashboard/categories

CRUD for menu categories.

### GET /restaurants/dashboard/earnings

Earnings summary. Filterable by date range.

### POST /restaurants/dashboard/toggle-pause

Toggle order acceptance. `{ "is_accepting_orders": false }`

---

## 7. Driver Endpoints

### PATCH /driver/status

```
Request: { "is_online": true }
Response 200: { "data": { "is_online": true, "message": "You are now online and visible for job assignments." } }

Errors:
  403: {"error": {"code": "ACCOUNT_NOT_VERIFIED", "message": "Your account is pending verification."}}
  403: {"error": {"code": "ACCOUNT_SUSPENDED", "message": "Your account has been suspended."}}
```

### GET /driver/jobs

Available jobs (only when online). Returns a list of nearby orders ready for pickup.

### POST /driver/jobs/{order_uuid}/accept

```
Response 200: { "data": { "status": "assigned", "restaurant": {...}, "pickup_location": {...}, "dropoff_location": {...}, "estimated_earnings": "AED 18.00" } }

Errors:
  409: {"error": {"code": "JOB_ALREADY_TAKEN", "message": "This job has been assigned to another driver."}}
  409: {"error": {"code": "JOB_EXPIRED", "message": "Response time expired."}}
```

### POST /driver/jobs/{order_uuid}/decline

Decline a job. System dispatches to next driver.

### POST /driver/jobs/{order_uuid}/pickup

Confirm pickup. Requires GPS verification (within 50m).

### POST /driver/jobs/{order_uuid}/deliver

Confirm delivery. Requires GPS verification (within 50m, or PIN confirmation).

### POST /driver/jobs/{order_uuid}/cant-find

Customer unreachable. Triggers customer notification.

### POST /driver/location

```
Request: { "lat": 25.0805, "lng": 55.1395, "bearing": 270 }
Frequency: every 10 seconds while delivering. Throttled server-side to 6/min.
```

### GET /driver/earnings

```
Response 200:
{
  "data": {
    "today_earnings": "AED 72.00",
    "today_trips": 4,
    "this_week_earnings": "AED 320.00",
    "this_week_trips": 18,
    "recent_trips": [
      { "order_uuid": "...", "restaurant_name": "Spice Route", "earnings": "AED 18.00", "distance_km": 3.2, "completed_at": "..." }
    ]
  }
}
```

---

## 8. Rating & Dispute Endpoints

### POST /orders/{uuid}/rate

```
Request: { "stars": 4, "review_text": "Great food but arrived 10 min late." }

Errors:
  404: {"error": {"code": "ORDER_NOT_DELIVERED", "message": "You can only rate delivered orders."}}
  409: {"error": {"code": "ALREADY_RATED", "message": "You have already rated this order."}}
  422: {"error": {"code": "RATING_EXPIRED", "message": "Rating window has closed (7 days after delivery)."}}
```

### POST /orders/{uuid}/dispute

```
Request: {
  "reason": "not_delivered",
  "description": "The driver marked delivered but I never received the food.",
  "photos": [<multipart file uploads>, max 3]
}

Response 201: { "data": { "uuid": "disp-1", "status": "open" } }
```

---

## 9. Admin Endpoints

### GET /admin/dashboard

Platform metrics: active orders, online drivers, active restaurants, stuck orders, today's revenue.

### GET /admin/restaurants/pending

List restaurants pending verification.

### POST /admin/restaurants/{uuid}/verify

```
Request: { "action": "approve" }
or
Request: { "action": "reject", "reason": "Trade license is expired." }
```

### GET /admin/drivers/pending

### POST /admin/drivers/{uuid}/verify

### GET /admin/disputes

Filterable: `?status=open&page=1`

### POST /admin/disputes/{uuid}/resolve

```
Request: {
  "resolution": "refund",
  "note": "Driver GPS shows 3.5km from customer at delivery time. Full refund issued."
}
```

---

## 10. Search & Utility Endpoints

### GET /search

```
Query: ?q=shawarma&type=dishes
or: ?q=spice&type=restaurants

Response 200:
{
  "data": {
    "restaurants": [ ... ],
    "dishes": [
      { "menu_item_uuid": "...", "name": "Chicken Shawarma", "restaurant": {"name": "Spice Route", "uuid": "..."}, "price": "AED 28.00" }
    ]
  }
}
```

### GET /health

Public health check. No authentication required.

```
Response 200:
{
  "status": "ok",
  "timestamp": "2026-07-26T12:00:00Z",
  "services": {
    "database": "ok",
    "redis": "ok",
    "queue": "ok",
    "websocket": "ok"
  }
}
```

---

## 11. Common Headers

| Header | Direction | Purpose |
|---|---|---|
| `Authorization: Bearer <token>` | Request | JWT access token |
| `Idempotency-Key: <UUID>` | Request | Prevents duplicate order/payment creation |
| `X-Clear-Cart: true` | Request | Confirmation for cross-restaurant cart clear |
| `Accept: application/json` | Request | Required |
| `Content-Type: application/json` | Request | Required for JSON bodies |
| `X-RateLimit-Limit` | Response | Rate limit ceiling |
| `X-RateLimit-Remaining` | Response | Remaining requests in window |
| `X-RateLimit-Reset` | Response | Unix timestamp when window resets |
| `X-Trace-Id` | Response | Request trace ID for debugging |

---

## 12. Error Codes Reference

| Code | HTTP | Meaning |
|---|---|---|
| `EMAIL_TAKEN` | 409 | Email already registered |
| `INVALID_CREDENTIALS` | 401 | Wrong email or password |
| `EMAIL_NOT_VERIFIED` | 403 | Email not confirmed |
| `ACCOUNT_LOCKED` | 403 | Too many failed attempts |
| `ACCOUNT_NOT_APPROVED` | 403 | Registration still pending |
| `ACCOUNT_SUSPENDED` | 403 | Account suspended by admin |
| `INVALID_REFRESH_TOKEN` | 401 | Refresh token expired/invalid |
| `TOKEN_REUSED` | 401 | Token theft detected |
| `INVALID_RESET_TOKEN` | 400 | Reset link expired |
| `ORDER_NOT_FOUND` | 404 | Order UUID not found |
| `INVALID_TRANSITION` | 409 | Status change not allowed |
| `JOB_ALREADY_TAKEN` | 409 | Another driver got it first |
| `JOB_EXPIRED` | 409 | 30-second response window closed |
| `CART_EMPTY` | 422 | No items in cart |
| `CART_VALIDATION_FAILED` | 422 | Items changed/unavailable |
| `ITEM_UNAVAILABLE` | 422 | Menu item no longer available |
| `DIFFERENT_RESTAURANT` | 409 | Cart has items from different restaurant |
| `BELOW_MINIMUM` | 422 | Order below AED 20 minimum |
| `OUTSIDE_DELIVERY_ZONE` | 422 | Address outside service area |
| `MAX_ADDRESSES` | 422 | 10 address limit reached |
| `PAYMENT_FAILED` | 402 | Stripe declined the payment |
| `IDEMPOTENCY_CONFLICT` | 409 | Duplicate idempotency key |
| `ALREADY_RATED` | 409 | Order already has a rating |
| `RATING_EXPIRED` | 422 | Past 7-day window |
| `GPS_TOO_FAR` | 422 | Not within required radius |
| `GPS_ACCURACY_LOW` | 422 | GPS accuracy insufficient, use PIN |
| `VALIDATION_ERROR` | 422 | General validation failure |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

---

## Next Document

[11 — Project Scaffold](11-project-scaffold.md)
