# 08 — System Architecture: LightBite

**Date:** 2026-07-26
**Status:** Draft
**Version:** 1.0

---

## 1. Architecture Overview

### 1.1 High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐ │
│  │ Flutter  │  │React Native│ │  Native  │  │  Web Dashboard   │ │
│  │ Customer │  │ Customer  │  │Android/iOS│  │  (Vue SPA)       │ │
│  │   App    │  │   App     │  │   Apps   │  │                  │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────────┬─────────┘ │
│       │             │             │                  │           │
│  ┌────┴─────────────┴─────────────┴──────────────────┴─────────┐ │
│  │                    API GATEWAY LAYER                         │ │
│  │              Laravel HTTP Kernel + Middleware                │ │
│  │   Auth │ CORS │ Rate Limit │ Validation │ Logging │ Cache  │ │
│  └────────────────────────┬────────────────────────────────────┘ │
└───────────────────────────┼──────────────────────────────────────┘
                            │
┌───────────────────────────┼──────────────────────────────────────┐
│                    APPLICATION LAYER                              │
│  ┌────────────────────────┴──────────────────────────────────┐   │
│  │                    Controllers (Thin)                      │   │
│  │  AuthController  OrderController  RestaurantController ... │   │
│  └────────────────────────┬──────────────────────────────────┘   │
│                           ▼                                       │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                   Service Layer (Business Logic)            │  │
│  │  AuthService  OrderService  PaymentService  DispatchService │  │
│  │  RestaurantService  MenuService  CartService  RatingService│  │
│  │  NotificationService  GeocodingService  SearchService      │  │
│  └────────────────────────┬───────────────────────────────────┘  │
│                           ▼                                       │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                   Repository / Data Layer                   │  │
│  │  Eloquent Models + Query Scopes + Resource Transformers    │  │
│  └────────────────────────┬───────────────────────────────────┘  │
└───────────────────────────┼──────────────────────────────────────┘
                            │
┌───────────────────────────┼──────────────────────────────────────┐
│                    INFRASTRUCTURE LAYER                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐ │
│  │  MySQL   │  │  Redis   │  │  Laravel │  │  File Storage    │ │
│  │ (Primary)│  │ (Cache + │  │  Queue   │  │  (Local / S3)    │ │
│  │          │  │  Queue)  │  │ (Redis)  │  │                  │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────────┘ │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐ │
│  │  Stripe  │  │Google Maps│  │FCM/APNs │  │  Reverb (WS)    │ │
│  │ (Payments│  │ (Geo +   │  │  (Push   │  │  (WebSocket)    │ │
│  │  API)    │  │ Routes)  │  │  Notifs) │  │                  │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

### 1.2 Technology Stack

| Layer | Technology | Version | Rationale |
|---|---|---|---|
| **Language** | PHP | 8.3+ | Laravel requirement, typed properties, enums |
| **Framework** | Laravel | 11.x | Chosen per PRD. Ecosystem: queues, broadcasting, caching, notifications |
| **Database** | MySQL | 8.0+ | Full-text search, spatial indexes, window functions |
| **Cache** | Redis | 7.x | Cache (tags, TTL), queue driver, WebSocket pub/sub |
| **Queue** | Laravel Queue (Redis) | — | Async: notifications, image processing, emails |
| **WebSocket** | Laravel Reverb | 1.x | First-party Laravel WebSocket server with Redis pub/sub |
| **Payments** | Stripe | Latest API | Payment Intents, pre-auth + capture flow |
| **Maps** | Google Maps | Latest | Geocoding, Distance Matrix, Directions |
| **Push** | Firebase Cloud Messaging | — | Android push + iOS APNs via FCM |
| **Files** | Laravel Filesystem | — | Local (dev), S3-compatible (prod) |
| **Container** | Docker + Docker Compose | — | PHP, MySQL, Redis, Reverb |
| **CI** | GitHub Actions | — | Lint → Test → Build on PR |

### 1.3 Design Principles

1. **Thin Controllers, Rich Services** — Controllers handle HTTP concerns only (request parsing, response formatting). All business logic lives in dedicated service classes.
2. **Repository Pattern via Eloquent** — Use Eloquent query scopes and accessors rather than a separate repository layer. Keep complex queries in dedicated query builder classes.
3. **API Resource Transformers** — Every response goes through Laravel API Resources. No raw model serialization.
4. **Immutable Request Objects** — All service methods receive validated DTOs, not raw Request objects. Use `spatie/laravel-data` or custom DTOs.
5. **Event-Driven Side Effects** — Status changes emit events. Listeners handle: notifications, WebSocket broadcasts, audit logging, async processing.
6. **Idempotent Writes** — All state-changing endpoints accept an idempotency key. Duplicate keys return the original response.
7. **Fail Closed** — Unhandled exceptions return 500. Never leak stack traces in production. All external API calls have timeouts and retry strategies.

---

## 2. Project Structure

```
lightbite-api/
├── app/
│   ├── Console/
│   │   └── Commands/           # Artisan commands (cleanup, settlement, etc.)
│   ├── DTOs/                   # Data Transfer Objects for service inputs
│   ├── Enums/                  # PHP 8.1+ backed enums
│   │   ├── OrderStatus.php
│   │   ├── UserRole.php
│   │   ├── RestaurantStatus.php
│   │   └── DriverStatus.php
│   ├── Events/                 # Domain events
│   │   ├── OrderPlaced.php
│   │   ├── OrderStatusChanged.php
│   │   ├── DriverAssigned.php
│   │   └── ...
│   ├── Exceptions/             # Custom domain exceptions
│   │   ├── OrderException.php
│   │   ├── PaymentException.php
│   │   └── DispatchException.php
│   ├── Http/
│   │   ├── Controllers/
│   │   │   └── Api/V1/         # Versioned API controllers
│   │   ├── Middleware/          # Custom middleware
│   │   ├── Requests/            # Form request validation
│   │   └── Resources/           # API resource transformers
│   ├── Listeners/               # Event listeners
│   ├── Models/                  # Eloquent models
│   ├── Services/                # Business logic services
│   │   ├── AuthService.php
│   │   ├── OrderService.php
│   │   ├── PaymentService.php
│   │   ├── DispatchService.php
│   │   ├── RestaurantService.php
│   │   ├── MenuService.php
│   │   ├── CartService.php
│   │   ├── RatingService.php
│   │   ├── NotificationService.php
│   │   ├── GeocodingService.php
│   │   └── SearchService.php
│   └── Providers/               # Service providers
├── config/                      # Configuration files
├── database/
│   ├── migrations/
│   ├── seeders/
│   └── factories/
├── routes/
│   └── api_v1.php              # All v1 API routes
├── tests/
│   ├── Feature/                # Feature/integration tests
│   └── Unit/                   # Unit tests (services, models)
├── docker-compose.yml
├── Dockerfile
├── .github/
│   └── workflows/
│       └── ci.yml              # CI pipeline
└── composer.json
```

---

## 3. Authentication Architecture

### 3.1 Token Flow

```
Client                          Server
  │                               │
  │  POST /api/v1/auth/login      │
  │  {email, password}            │
  │──────────────────────────────>│  Validate credentials
  │                               │  Generate access_token (15 min)
  │                               │  Generate refresh_token (7 days)
  │  {access_token,               │  Store refresh_token hash in DB
  │   refresh_token,              │
  │   expires_in: 900}            │
  │<──────────────────────────────│
  │                               │
  │  GET /api/v1/orders           │
  │  Authorization: Bearer <at>   │
  │──────────────────────────────>│  Verify JWT signature + expiry
  │  {orders: [...]}              │
  │<──────────────────────────────│
  │                               │
  │  (15 min later — token expired)│
  │                               │
  │  POST /api/v1/auth/refresh    │
  │  {refresh_token}              │
  │──────────────────────────────>│  Validate refresh token
  │                               │  Rotate: invalidate old, issue new
  │  {access_token,               │
  │   refresh_token}              │
  │<──────────────────────────────│
```

### 3.2 Token Security

| Mechanism | Implementation |
|---|---|
| **Access token** | JWT signed with RS256. 15-minute expiry. Stateless (no DB lookup). |
| **Refresh token** | Opaque string, stored hashed (SHA-256) in `refresh_tokens` table. 7-day expiry. |
| **Token rotation** | Each refresh invalidates the old refresh token and issues a new pair. |
| **Reuse detection** | If a revoked refresh token is reused, revoke ALL tokens for that user (token theft detection). |
| **Logout** | Revoke the specific refresh token. Access token remains valid until expiry (15 min max). |
| **Password change** | Revoke ALL refresh tokens for the user. |
| **JWKS** | Publish public keys at `/.well-known/jwks.json` for service-to-service auth (future). |

### 3.3 Middleware Pipeline

```
Request
  │
  ├── TrustProxies           (trust load balancer headers)
  ├── HandleCors             (whitelist origins, no wildcard)
  ├── PreventRequestsDuringMaintenance
  ├── TrimStrings / ConvertEmptyStringsToNull
  ├── ThrottleRequests       (120 req/min per user, 5/min per IP for auth)
  ├── Authenticate:JWT       (validate access token)
  ├── CheckUserRole          (customer | restaurant | driver | admin)
  ├── CheckVerified          (email verified + admin verified)
  ├── LogRequest             (method, path, status, duration, user_id, trace_id)
  ▼
Controller
```

---

## 4. Database Architecture

### 4.1 Schema Design Principles

1. **UUIDs for public identifiers** — All tables use auto-increment `id` internally and a public `uuid` column for API references. Never expose internal IDs.
2. **Soft deletes** — Users and restaurants use soft deletes with 30-day recovery.
3. **Price storage in fils** — All monetary values stored as integers in the smallest currency unit (fils for AED). AED 25.00 = 2500.
4. **Optimistic locking** — `lock_version` column on order and cart tables to prevent concurrent modification conflicts.
5. **Event sourcing for orders** — Order status changes stored in an `order_status_log` table (immutable append-only log).
6. **Indexes on every FK + search column** — No unindexed foreign keys. Composite indexes on common query patterns.

### 4.2 Core Tables

| Table | Purpose | Key Columns |
|---|---|---|
| `users` | All user accounts (customer, restaurant, driver, admin) | uuid, name, email, password_hash, role (enum), email_verified_at, status |
| `refresh_tokens` | Active refresh tokens | user_id (FK), token_hash, expires_at, revoked_at |
| `user_addresses` | Customer saved addresses | user_id (FK), label, address, lat, lng, is_default |
| `restaurants` | Restaurant profiles | uuid, owner_id (FK→users), name, cuisine_types (JSON), logo, cover, lat, lng, status (enum), commission_rate |
| `restaurant_hours` | Weekly business hours | restaurant_id (FK), day_of_week, open_time, close_time (supports split hours) |
| `menu_categories` | Menu category groups | restaurant_id (FK), name, sort_order |
| `menu_items` | Individual menu items | uuid, restaurant_id (FK), category_id (FK), name, description, price_fils, image_path, is_available, prep_time_min |
| `carts` | Active customer carts | uuid, customer_id (FK→users), restaurant_id (FK), expires_at |
| `cart_items` | Items in a cart | cart_id (FK), menu_item_id (FK), quantity, unit_price_fils, special_instructions |
| `orders` | Placed orders | uuid, order_number (LB-YYYYMMDD-XXXXX), customer_id (FK), restaurant_id (FK), driver_id (FK, nullable), status (enum), subtotal_fils, delivery_fee_fils, tax_fils, total_fils, commission_fils, driver_earnings_fils, idempotency_key (unique), delivery_address_snapshot (JSON), lock_version |
| `order_items` | Items in an order (snapshot) | order_id (FK), menu_item_id (FK), name, quantity, unit_price_fils, special_instructions |
| `order_status_log` | Immutable status change history | order_id (FK), from_status, to_status, changed_by_type, changed_by_id, note, created_at |
| `payments` | Payment transaction records | uuid, order_id (FK), stripe_payment_intent_id, amount_fils, status (pre_auth/captured/refunded/voided), refund_amount_fils |
| `driver_locations` | Current driver position (ephemeral) | driver_id (FK, unique), lat, lng, bearing, updated_at |
| `ratings` | Order ratings | order_id (FK, unique), customer_id (FK), stars (1-5), review_text, created_at |
| `disputes` | Customer disputes | uuid, order_id (FK), customer_id (FK), reason, status, resolution, resolved_by, photos (JSON) |
| `push_tokens` | Device push notification tokens | user_id (FK), token, platform (ios/android), updated_at |
| `audit_logs` | Admin action audit trail | user_id (FK), action, resource_type, resource_id, old_values (JSON), new_values (JSON), ip_address |

### 4.3 Key Indexes

```sql
-- Spatial index for nearby restaurant queries
ALTER TABLE restaurants ADD SPATIAL INDEX idx_location (location_point);

-- Composite index for order listing (most common query)
CREATE INDEX idx_orders_customer_status ON orders(customer_id, status, created_at DESC);

-- Composite index for restaurant order board
CREATE INDEX idx_orders_restaurant_status ON orders(restaurant_id, status, created_at DESC);

-- Full-text index for restaurant search
ALTER TABLE restaurants ADD FULLTEXT INDEX ft_search (name, cuisine_types);
ALTER TABLE menu_items ADD FULLTEXT INDEX ft_search (name, description);

-- Driver dispatch: find online drivers near a point
CREATE INDEX idx_driver_locations_online ON driver_locations(driver_id)
    WHERE driver is online; -- partial index concept, implemented at app level
```

---

## 5. API Design

### 5.1 URL Structure

```
/api/v1/auth/register          POST
/api/v1/auth/login             POST
/api/v1/auth/refresh           POST
/api/v1/auth/logout            POST
/api/v1/auth/reset-password    POST
/api/v1/auth/reset-password    PUT     {token}

/api/v1/users/me               GET     (profile)
/api/v1/users/me               PATCH   (update profile)
/api/v1/users/me/addresses     GET/POST
/api/v1/users/me/addresses/{id} PUT/DELETE
/api/v1/users/me/orders        GET     (order history)
/api/v1/users/me/payment-methods GET/POST/DELETE

/api/v1/restaurants            GET     (list/discovery with ?lat=&lng=&cuisine=&search=)
/api/v1/restaurants/{id}       GET     (detail + menu)
/api/v1/restaurants/{id}/menu  GET     (full menu with categories)

/api/v1/restaurants/dashboard              GET     (today stats)
/api/v1/restaurants/dashboard/orders       GET     (order board)
/api/v1/restaurants/dashboard/orders/{id}  GET     (order detail)
/api/v1/restaurants/dashboard/orders/{id}/accept   POST
/api/v1/restaurants/dashboard/orders/{id}/reject   POST
/api/v1/restaurants/dashboard/orders/{id}/status   PATCH
/api/v1/restaurants/dashboard/menu         GET/POST
/api/v1/restaurants/dashboard/menu/{id}    PUT/DELETE
/api/v1/restaurants/dashboard/categories   GET/POST
/api/v1/restaurants/dashboard/earnings     GET
/api/v1/restaurants/dashboard/toggle-pause POST

/api/v1/cart                  GET/POST/PUT/DELETE  (single cart per customer)
/api/v1/cart/items            POST                  (add item)
/api/v1/cart/items/{id}       PATCH/DELETE          (update qty / remove)
/api/v1/cart/validate         POST                  (pre-checkout validation)

/api/v1/orders                POST    (place order)  Header: Idempotency-Key
/api/v1/orders/{id}           GET     (order detail)
/api/v1/orders/{id}/cancel    POST    (customer cancel)
/api/v1/orders/{id}/modify    PATCH   (modify while pending)
/api/v1/orders/{id}/tracking  GET     (tracking status + driver location)

/api/v1/driver/status         PATCH   (online/offline)
/api/v1/driver/jobs           GET     (available jobs)
/api/v1/driver/jobs/{id}/accept  POST
/api/v1/driver/jobs/{id}/decline POST
/api/v1/driver/jobs/{id}/pickup  POST  (confirm pickup)
/api/v1/driver/jobs/{id}/deliver POST  (confirm delivery)
/api/v1/driver/jobs/{id}/cant-find POST (customer unreachable)
/api/v1/driver/location       POST    (update location — every 10s while delivering)
/api/v1/driver/earnings       GET     (earnings summary + history)

/api/v1/orders/{id}/rate      POST    (rate + review)
/api/v1/orders/{id}/dispute   POST    (file dispute with photos)

/api/v1/admin/restaurants/pending     GET     (pending verifications)
/api/v1/admin/restaurants/{id}/verify POST    (approve/reject)
/api/v1/admin/drivers/pending         GET
/api/v1/admin/drivers/{id}/verify     POST
/api/v1/admin/dashboard               GET     (platform metrics)
/api/v1/admin/disputes                GET
/api/v1/admin/disputes/{id}/resolve   POST

/api/v1/search               GET     (?q=&type=restaurants|dishes)
/api/v1/health               GET     (no auth — DB, Redis, Queue, WebSocket status)
```

### 5.2 Response Envelope

All successful responses:

```json
{
  "data": { ... },
  "meta": {
    "trace_id": "abc-123"
  }
}
```

Collection responses:

```json
{
  "data": [ ... ],
  "links": {
    "first": "/api/v1/restaurants?page=1",
    "prev": null,
    "next": "/api/v1/restaurants?page=2",
    "last": "/api/v1/restaurants?page=10"
  },
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 187,
    "trace_id": "abc-123"
  }
}
```

Error responses:

```json
{
  "error": {
    "code": "ORDER_NOT_FOUND",
    "message": "Order with the given ID was not found.",
    "details": []
  },
  "meta": {
    "trace_id": "abc-123"
  }
}
```

### 5.3 Standard HTTP Status Codes

| Code | Usage |
|---|---|
| 200 | Success (GET, PATCH) |
| 201 | Created (POST) |
| 204 | No Content (DELETE) |
| 400 | Bad Request (validation error) |
| 401 | Unauthenticated (missing/invalid token) |
| 403 | Forbidden (wrong role, unverified) |
| 404 | Not Found |
| 409 | Conflict (duplicate, state transition invalid) |
| 422 | Unprocessable Entity (validation) |
| 429 | Too Many Requests (rate limit) |
| 500 | Internal Server Error |

### 5.4 Pagination, Filtering, Sorting

| Mechanism | Implementation |
|---|---|
| **Pagination** | Cursor-based for real-time feeds (orders). Page-based for lists (restaurants). |
| **Page size** | Default 20, max 100. `?per_page=50` |
| **Filtering** | Query params: `?cuisine=lebanese&status=active&rating_min=4` |
| **Sorting** | `?sort=distance` or `?sort=-created_at` (descending). Allowed sort fields per endpoint. |
| **Search** | `?q=shawarma` → full-text search across restaurants and menu items. |

---

## 6. WebSocket Architecture

### 6.1 Connection Flow

```
Client                          Reverb Server
  │                               │
  │  wss://api.lightbite.com/     │
  │  ?token=<jwt_access_token>    │
  │──────────────────────────────>│  Validate JWT
  │                               │  Authenticate user
  │  {"event":"pusher:connection_ │  Subscribe to private channels
  │   established"}               │
  │<──────────────────────────────│
  │                               │
  │  {"event":"pusher:subscribe", │
  │   "channel":"private-orders   │
  │   .<user_id>"}                │
  │──────────────────────────────>│  Authorization check
  │                               │
  │  {"event":"order.status_      │
  │   update","data":{...}}       │
  │<──────────────────────────────│  (real-time events)
```

### 6.2 Channels

| Channel | Subscribers | Events |
|---|---|---|
| `private-orders.{user_id}` | Specific user (customer/driver/restaurant) | order.created, order.confirmed, order.rejected, order.status_update, order.delivered |
| `presence-drivers.{zone}` | Online drivers in a zone | driver.joined, driver.left |
| `private-delivery.{order_id}` | Customer of a specific order | driver.location_update, driver.arriving |

### 6.3 Scaling

```
                   ┌──────────────┐
                   │  Nginx / LB  │
                   └──────┬───────┘
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
   ┌────────────┐ ┌────────────┐ ┌────────────┐
   │  Reverb 1  │ │  Reverb 2  │ │  Reverb 3  │
   └──────┬─────┘ └──────┬─────┘ └──────┬─────┘
          │               │               │
          └───────────────┼───────────────┘
                          │
                   ┌──────┴──────┐
                   │    Redis    │  (pub/sub message bus)
                   └─────────────┘
```

All Reverb instances subscribe to the same Redis channels. A message published by any instance reaches all connected clients regardless of which instance they're connected to.

---

## 7. Caching Strategy

| Data | TTL | Key Pattern | Invalidation |
|---|---|---|---|
| Restaurant detail + menu | 5 min | `restaurant:{uuid}:menu` | On menu/profile update |
| Nearby restaurants list | 2 min | `restaurants:nearby:{lat}:{lng}:{radius}` | On restaurant status change |
| Geocoding results | 30 days | `geocode:{address_hash}` | Never (immutable) |
| Distance matrix | 1 hour | `distance:{origin}:{dest}` | Never (TTL-based) |
| Restaurant rating | 5 min | `restaurant:{uuid}:rating` | On new rating |
| User session (JWT) | Stateless | N/A | N/A |
| Rate limit counters | Per-window | `ratelimit:{user_id}:{endpoint}` | Window-based expiry |

---

## 8. Queue & Async Processing

| Job | Queue | Priority | Retry |
|---|---|---|---|
| Send push notification | `notifications` | High | 3 retries, 30s backoff |
| Send email (receipt, reset) | `mail` | Medium | 3 retries, 60s backoff |
| Process image (resize, WebP) | `images` | Medium | 2 retries, 10s backoff |
| Calculate restaurant rating | `ratings` | Low | 3 retries, 30s backoff |
| Geocode address | `geocoding` | Low | 3 retries, 5s backoff |
| Weekly settlement report | `reports` | Low | 1 retry, 1h backoff |

All jobs are idempotent — running the same job twice produces the same result.

---

## 9. Security Architecture

### 9.1 Defense in Depth

| Layer | Control |
|---|---|
| **Transport** | TLS 1.3 only. HSTS header (max-age=1 year). |
| **Authentication** | JWT RS256 (15 min expiry). Refresh token rotation with reuse detection. |
| **Authorization** | Role-based (customer, restaurant, driver, admin). Restaurant scoping (owner can only access own restaurant). Driver scoping (driver can only access own jobs). |
| **Input** | All inputs validated via Laravel Form Requests. SQL injection prevented by Eloquent ORM (parameterized queries). XSS prevented by output encoding (Blade/Vue). |
| **Rate Limiting** | 120 req/min per user (general). 5 req/min per IP (auth). 30 req/min (location updates). 10 WebSocket connections/min per user. |
| **CORS** | Whitelist specific origins. No wildcard (`*`). Credentials: true only for whitelisted origins. |
| **Secrets** | All secrets in environment variables (`.env`). Never committed. Production secrets via vault or CI secrets. |
| **Headers** | CSP, X-Frame-Options: DENY, X-Content-Type-Options: nosniff, Referrer-Policy: strict-origin-when-cross-origin. |

### 9.2 Payment Security (PCI-DSS)

- Card data never touches LightBite servers — Stripe Elements / Payment Sheet on client
- Stripe returns a Payment Method ID — only this ID is sent to LightBite backend
- Backend uses Stripe SDK (server-side) to create Payment Intents using the Payment Method ID
- SAQ-A compliance level (lowest scope — only Stripe.js/ Elements on client)

---

## 10. Testing Strategy

### 10.1 Test Pyramid

```
           ┌──────┐
           │ E2E  │   ~10 tests (critical flows)
           └──────┘
        ┌────────────┐
        │ Integration │  ~100 tests (every API endpoint + auth scenarios)
        └────────────┘
     ┌───────────────────┐
     │     Unit           │  ~150 tests (services, models, DTOs, enums)
     └───────────────────┘
```

### 10.2 Test Types

| Type | Scope | Framework | Run |
|---|---|---|---|
| **Unit** | Services, models, DTOs, enums, value objects | PHPUnit | Every commit |
| **Feature** | API endpoints (auth, validation, response format) | PHPUnit + Laravel TestCase | Every PR |
| **Integration** | Multi-service flows (order lifecycle, payment flow) | PHPUnit | Every PR |
| **E2E** | Full user journeys (customer orders → restaurant accepts → driver delivers) | Laravel + scripted HTTP | Pre-merge to main |
| **Load** | 100/1000 concurrent users | k6 / Artillery | Pre-release |
| **Security** | Dependency scan (composer audit), static analysis (PHPStan) | CI pipeline | Every PR |

---

## 11. Monitoring & Observability

### 11.1 Logging

Every log entry includes:

```json
{
  "trace_id": "uuid",
  "user_id": "uuid|null",
  "role": "customer|restaurant|driver|admin|null",
  "action": "order.placed",
  "resource_type": "order",
  "resource_id": "uuid",
  "http_method": "POST",
  "http_path": "/api/v1/orders",
  "http_status": 201,
  "duration_ms": 145,
  "ip": "x.x.x.x",
  "user_agent": "..."
}
```

### 11.2 Health Check

`GET /api/v1/health` returns:

```json
{
  "status": "ok",
  "timestamp": "2026-07-26T12:00:00Z",
  "services": {
    "database": "ok",
    "redis": "ok",
    "queue": "ok",
    "websocket": "ok",
    "stripe": "ok",
    "google_maps": "ok"
  }
}
```

---

## 12. Deployment Architecture (Phase 1)

```
┌─────────────────────────────────────────┐
│              VPS / Cloud VM              │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │          Docker Compose            │  │
│  │                                    │  │
│  │  ┌──────────┐  ┌──────────────┐   │  │
│  │  │  Nginx   │  │  PHP-FPM     │   │  │
│  │  │  (80/443)│──│  (Laravel)   │   │  │
│  │  └──────────┘  └──────┬───────┘   │  │
│  │                       │           │  │
│  │  ┌──────────┐  ┌──────┴───────┐   │  │
│  │  │  MySQL   │  │    Redis     │   │  │
│  │  │  :3306   │  │   :6379      │   │  │
│  │  └──────────┘  └──────┬───────┘   │  │
│  │                       │           │  │
│  │  ┌──────────┐  ┌──────┴───────┐   │  │
│  │  │  Reverb  │  │ Queue Worker │   │  │
│  │  │  :8080   │  │              │   │  │
│  │  └──────────┘  └──────────────┘   │  │
│  │                                    │  │
│  └────────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

---

## Next Document

[09 — Database ERD + Schema](09-database-schema.md)
