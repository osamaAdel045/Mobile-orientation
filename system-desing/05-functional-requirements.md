# 05 — Functional Requirements: LightBite

**Date:** 2026-07-26
**Status:** Draft

---

## 1. Authentication System

### FR-A01: Registration

| Field | Requirement |
|---|---|
| **Input** | Full name, email, password, role (customer / restaurant / driver), phone number |
| **Validation** | Email: valid format, unique. Password: min 8 chars, 1 uppercase, 1 number. Phone: valid format. |
| **Output** | User created with hashed password (bcrypt). JWT access token + refresh token returned. Email confirmation sent. |
| **Error cases** | Duplicate email → 409. Weak password → 422 with validation message. Missing fields → 422. |

### FR-A02: Login

| Field | Requirement |
|---|---|
| **Input** | Email, password |
| **Output** | JWT access token (15 min expiry) + refresh token (7 day expiry). User profile with role. |
| **Error cases** | Invalid credentials → 401. Unverified email → 403. Account disabled → 403. |
| **Rate limit** | 5 attempts per email per 15 minutes |

### FR-A03: Token Refresh

| Field | Requirement |
|---|---|
| **Input** | Refresh token |
| **Output** | New access token + new refresh token. Old refresh token invalidated (token rotation). |
| **Error cases** | Expired/revoked refresh token → 401. Reused refresh token → 401 + revoke all user tokens (security). |

### FR-A04: Password Reset

| Field | Requirement |
|---|---|
| **Flow** | User requests reset → Email sent with signed link (1 hour expiry) → User sets new password → All existing tokens revoked |
| **Security** | Reset tokens are single-use, stored hashed, expire in 1 hour |

---

## 2. User Profiles

### FR-U01: Profile CRUD

| Field | Requirement |
|---|---|
| **Editable fields** | Full name, phone number, profile photo, email |
| **Photo upload** | Max 5MB, formats: JPG/PNG/WebP, auto-resize to 300x300 |
| **Email change** | Requires password confirmation |

### FR-U02: Address Management (Customer)

| Field | Requirement |
|---|---|
| **Fields** | Label (home/work/other), full address, apartment/floor, coordinates (lat/lng), is_default flag |
| **Rules** | Max 10 saved addresses. One default address required. Deletion allowed only if not default (set another default first). Address coordinates validated against delivery service area. Addresses outside service area return error: "This location is outside our delivery zone." Service area defined as: 10km radius from any active restaurant, configurable per city. |

---

## 3. Restaurant & Menu Management

### FR-R01: Restaurant Profile

| Field | Requirement |
|---|---|
| **Fields** | Name (required, unique), description, logo image, cover image, cuisine type (multi-select from predefined list), phone, address with coordinates, business hours |
| **Business hours** | Per day: open time, close time. Supports split hours (e.g., 12:00-15:00, 18:00-23:00). Supports "closed" days. |
| **Status** | Pending Verification → Verified → Active, Inactive, Closed, Suspended, Permanently Closed. **Pending Verification:** registration submitted, awaiting admin review. **Verified:** admin approved, can transition to Active. **Rejected:** registration denied (admin provides reason). **Suspended:** temporarily banned (fraud, complaints, policy violation). **Permanently Closed:** account terminated. |

### FR-R02: Menu Categories

| Field | Requirement |
|---|---|
| **Fields** | Name, display order (sort index), optional description |
| **Rules** | Min 1 category. Categories without items are hidden from customers. Max 20 categories. |

### FR-R03: Menu Items

| Field | Requirement |
|---|---|
| **Fields** | Name (required), description, price (required, > 0), image, category (required), is_available (default true), preparation_time_minutes |
| **Image** | Max 3MB, JPG/PNG/WebP, auto-resize to 800x600 |
| **Price** | Stored in base currency (AED), integer representing fils (e.g., AED 25.00 = 2500) |
| **Rules** | Deleting an item with active orders is allowed (historical orders retain the snapshot). Max 200 items per restaurant. |

---

## 4. Cart System

### FR-C01: Cart Operations

| Field | Requirement |
|---|---|
| **Storage** | Backend-managed cart (persisted in database), linked to customer ID |
| **Constraints** | 1 cart per customer. Max 50 items per cart. Cannot add items from multiple restaurants (clear cart on restaurant change with confirmation). |
| **Expiry** | Cart expires after 24 hours of inactivity |

### FR-C02: Cart Validation at Checkout

| Field | Requirement |
|---|---|
| **Validations** | Restaurant must be active and accepting orders. All items must be available. Prices are re-verified against current menu prices. If current price > cart price: notify customer ("Price updated: [item] is now AED X.XX, was AED Y.YY"), allow proceed or remove. If current price < cart price: use lower price automatically. Minimum order amount (AED 20) enforced. |
| **Error handling** | If validation fails, show specific message (e.g., "Chicken Shawarma is no longer available", "Minimum order is AED 20. Add AED X.XX more.") |

---

## 5. Order Lifecycle

### FR-O01: Order Placement

| Field | Requirement |
|---|---|
| **Input** | Restaurant ID, items (item_id, quantity, unit price, special instructions), delivery address ID, payment method ID, notes, idempotency_key (client-generated UUID) |
| **Validation** | Cart validation (FR-C02) runs. Payment pre-authorization succeeds. Duplicate idempotency_key returns existing order (prevents double-charge on retry). |
| **Output** | Order created with status "pending". Order number generated (format: LB-YYYYMMDD-XXXXX). Payment captured (not charged — captured on restaurant acceptance). |
| **Rollback** | If payment pre-auth fails, order not created. If order creation fails, payment pre-auth voided. |

### FR-O02: Order Status Machine

```
                    ┌──────────┐
                    │ pending  │  (order placed, waiting for restaurant)
                    └────┬─────┘
                         │
              ┌──────────┼──────────┬──────────┐
              ▼          │          ▼          ▼
        ┌──────────┐    │    ┌──────────┐  ┌──────────┐
        │confirmed │    │    │ rejected │  │ expired  │  (restaurant didn't respond in 2 min)
        └────┬─────┘    │    └──────────┘  └──────────┘
             │          │
             ▼          │
        ┌──────────┐    │
        │preparing │    │
        └────┬─────┘    │
             │          │
             ▼          │
        ┌──────────┐    │
        │  ready   │    │
        └────┬─────┘    │
             │          │
             ▼          │
        ┌──────────┐    │
        │ assigned │    │  (driver accepted the job)
        └────┬─────┘    │
             │          │
             ▼          │
        ┌──────────┐    │
        │ picked_up│    │  (driver has the food)
        └────┬─────┘    │
             │          │
             ▼          │
        ┌──────────┐    │
        │delivering│    │  (driver en route to customer)
        └────┬─────┘    │
             │          │
             ▼          │
        ┌──────────┐    │
        │delivered │    │  (driver handed over food)
        └────┬─────┘    │
             │          │
             ▼          │
        ┌──────────┐    │
        │ disputed │    │  (customer reported issue)
        └────┬─────┘    │
             │          │
        ┌────┴────┐     │
        ▼         ▼     │
   ┌────────┐ ┌────────┐│
   │resolved│ │refunded││
   └────────┘ └────────┘│
                        │
        ┌──────────┐    │
        │cancelled │◄───┘  (customer cancelled before confirmation)
        └──────────┘
```

| Transition | Who | When allowed |
|---|---|---|
| pending → confirmed | Restaurant | Within 2 minutes of order |
| pending → rejected | Restaurant | Within 2 minutes of order |
| pending → cancelled | Customer | Before restaurant action |
| pending → pending (modify) | Customer | Before restaurant action. Customer may add/remove items or change quantities. Modification resets the 2-minute restaurant response timer. |
| confirmed → preparing | Restaurant | Anytime |
| preparing → ready | Restaurant | Anytime |
| ready → assigned | System | When driver accepts job |
| assigned → picked_up | Driver | At restaurant location (GPS verified within 50m). If GPS accuracy > 30m, require 4-digit PIN shown on restaurant dashboard for manual confirmation. |
| picked_up → delivering | System | Automatic after pickup |
| delivering → delivered | Driver | At customer location (GPS verified within 50m) |
| pending → expired | System | Restaurant does not respond within 2 minutes. Auto-reject, auto-refund, notify customer. |
| delivered → disputed | Customer | Within 7 days of delivery. Customer reports: not delivered, wrong items, missing items, quality issue. |
| disputed → resolved | Admin | After review. No refund or partial credit at admin discretion. |
| disputed → refunded | Admin/System | Auto-refund if driver GPS never within 200m of customer. Admin refund for other valid cases. |

### FR-O03: Order Cancellation Rules

| Scenario | Refund | Condition |
|---|---|---|
| Customer cancels before restaurant action | Full refund | Status = pending |
| Customer cancels after restaurant confirms | Partial refund (minus preparation cost) | Status ≤ preparing |
| Restaurant rejects | Full refund | Automatic |
| System cancels (no driver found, 15 min) | Full refund + notification | Status = ready, no driver assigned |
| Driver cancels after acceptance | Reassign to next driver | 3 reassign attempts before system cancels |

---

## 6. Payment Processing

### FR-P01: Payment Flow

| Field | Requirement |
|---|---|
| **Provider** | Stripe (Phase 1) |
| **Method** | Card payment with Stripe Elements / Payment Intents |
| **Flow** | Pre-authorize at order placement → Capture on restaurant acceptance → Release on rejection |
| **Refunds** | Full or partial via Stripe API. Refund reasons logged. |
| **PCI** | Card data never touches backend. Stripe tokenization only. |

### FR-P02: Receipts

| Field | Requirement |
|---|---|
| **Content** | Order number, date, items with prices, delivery fee, total, restaurant name |
| **Format** | Viewable in-app + email |
| **Generation** | Automatic on delivery confirmation |

---

## 7. Real-Time Communication

### FR-W01: WebSocket Events

| Event | Publisher | Subscribers | Payload |
|---|---|---|---|
| `order.created` | Backend | Restaurant | order_id, items, customer_name, total |
| `order.confirmed` | Restaurant | Customer | order_id, estimated_time |
| `order.rejected` | Restaurant | Customer | order_id, reason |
| `order.status_update` | Restaurant/Driver | Customer, other party | order_id, new_status |
| `order.ready_for_pickup` | Restaurant | Driver pool | order_id, restaurant_name, restaurant_location, earnings |
| `driver.assigned` | Backend | Customer, Restaurant | order_id, driver_name, driver_location |
| `driver.declined` | Driver | Backend (dispatch) | order_id, driver_id, reason? |
| `driver.location_update` | Driver | Customer | order_id, lat, lng, bearing |
| `driver.arriving` | Driver | Customer | order_id, eta_minutes |
| `order.delivered` | Driver | Customer, Restaurant | order_id |

### FR-W02: WebSocket Connection

| Field | Requirement |
|---|---|
| **Auth** | Connection authenticated via JWT in query param on handshake |
| **Channels** | User-specific private channel. Role-specific presence channels. |
| **Reconnection** | Exponential backoff: 1s, 2s, 4s, 8s, max 30s |
| **Heartbeat** | Ping/pong every 30 seconds. Disconnect after 60s no response. |

---

## 8. Maps & Location

### FR-M01: Geocoding

| Field | Requirement |
|---|---|
| **Forward geocode** | Address text → lat/lng (Google Maps Geocoding API) |
| **Reverse geocode** | lat/lng → Address text (for map pin drop) |
| **Cache** | Geocoding results cached for 30 days |

### FR-M02: Nearby Restaurants

| Field | Requirement |
|---|---|
| **Algorithm** | Haversine formula on restaurant coordinates, filtered by customer lat/lng |
| **Default radius** | 10 km from customer |
| **Sort** | By distance ascending or by rating descending (user toggle) |

### FR-M03: Distance Matrix

| Field | Requirement |
|---|---|
| **Usage** | Estimate delivery time: restaurant → customer distance |
| **Provider** | Google Maps Distance Matrix API |
| **Fallback** | Straight-line distance × 1.4 (road factor) if API unavailable |

### FR-M04: Driver Location Sharing

| Field | Requirement |
|---|---|
| **When** | Only when driver is online AND has an active delivery |
| **Frequency** | Every 10 seconds while in "delivering" status |
| **Privacy** | Location sharing stops immediately when delivery is confirmed or driver goes offline |
| **Storage** | Location history not retained beyond active delivery (privacy) |

---

## 9. Push Notifications

### FR-N01: Device Registration

| Field | Requirement |
|---|---|
| **Flow** | Client registers with FCM/APNs → Sends device token to backend → Backend stores token with user ID |
| **Token refresh** | Client sends new token on app start if changed |
| **Multi-device** | One user can have multiple device tokens. Notifications sent to all. |

### FR-N02: Notification Triggers

| Trigger | Recipient | Title | Body |
|---|---|---|---|
| Order placed | Restaurant | "New Order #12345" | "2x Chicken Shawarma, 1x Hummus — AED 45.00" |
| Order confirmed | Customer | "Order Confirmed!" | "Spice Route is preparing your order. ETA: 25-30 min" |
| Order rejected | Customer | "Order Declined" | "Spice Route cannot fulfill your order. Refund issued." |
| Order ready | Driver pool | "New Delivery Job" | "AED 18.00 — Spice Route → Dubai Marina. 3.2 km" |
| Driver assigned | Customer | "Driver Assigned!" | "Khalid is heading to the restaurant. Track live." |
| Driver arriving | Customer | "Driver Almost Here!" | "Khalid is 2 minutes away. Meet at the door." |
| Order delivered | Customer | "Order Delivered!" | "Enjoy your meal! How was Spice Route?" |

### FR-N03: Deep Linking

| Notification | Deep Link |
|---|---|
| Order status change | `/order/{order_id}/tracking` |
| New order (restaurant) | `/dashboard/orders/{order_id}` |
| New job (driver) | `/driver/jobs/{order_id}` |

---

## 10. Image & File Management

### FR-F01: Image Upload

| Field | Requirement |
|---|---|
| **Types** | Profile photos (restaurants, users), menu item photos |
| **Storage** | Laravel local filesystem (local/dev), S3-compatible (production) |
| **Processing** | Auto-resize to predefined dimensions. Strip EXIF data. Convert to WebP. |
| **Access** | Public URLs for menu/restaurant images. Authenticated URLs for user uploads. |
| **Limits** | Restaurant: max 50 images. Menu item: 1 image per item. |

---

## 11. Search

### FR-S01: Restaurant Search

| Field | Requirement |
|---|---|
| **Indexed fields** | Name, cuisine type, description, menu item names |
| **Algorithm** | Full-text search (MySQL FULLTEXT or Laravel Scout with Meilisearch in production) |
| **Results** | Ranked by relevance. Fallback to LIKE-based search if full-text unavailable. |
| **Minimum query** | 2 characters |

---

## 12. Driver Management

### FR-D00: Driver Lifecycle

| Status | Description |
|---|---|
| Pending Verification | Registration submitted with license, vehicle, and insurance documents. Awaiting admin review. |
| Verified | Admin approved. Driver can toggle online/offline. |
| Rejected | Registration denied. Admin provides reason via email. Driver may re-apply with corrected documents. |
| Online | Actively accepting delivery jobs. Location sharing active. |
| Offline | Not accepting jobs. Location sharing stopped. |
| On Delivery | Actively delivering an order. Cannot receive new job offers until current delivery completes. |
| Suspended | Temporarily banned (complaints, failed GPS verification, policy violation). Admin action with reason. |
| Deactivated | Account permanently terminated. |

### FR-D01: Job Dispatch Algorithm

| Field | Requirement |
|---|---|
| **Trigger** | Order status changes to "ready" |
| **Pool** | Online drivers within 5 km of restaurant |
| **Dispatch** | Nearest driver first with fairness weighting: drivers waiting > 15 minutes since last job get boosted priority (distance reduced by 30% for ranking). If declined, next nearest. Max 3 attempts. |
| **Timeout** | 30 seconds per driver to accept/decline. Auto-decline on timeout. |
| **Fallback** | If no driver accepts within 3 attempts or 15 minutes since order ready, order is system-cancelled with full refund and customer notification. |

---

## 13. Platform Economics

### FR-EC01: Order Total Calculation

| Field | Requirement |
|---|---|
| **Formula** | `order_total = subtotal + delivery_fee + tax − discount` |
| **Subtotal** | Sum of (item_price × quantity) for all items. Verified against current menu prices at checkout. |
| **Delivery fee** | `base_fee + (per_km_rate × max(0, driving_distance_km − included_km))`. Phase 1 values: base_fee = AED 5.00, per_km_rate = AED 1.50/km, included_km = 3km. Minimum delivery fee = AED 5.00. |
| **Tax (VAT)** | 5% on (subtotal + delivery fee). Configured per jurisdiction. Rounded to nearest fils. |
| **Discount** | Promo codes (Phase 2). Not applicable in Phase 1. Value = AED 0.00. |
| **Minimum order** | Subtotal must be ≥ AED 20.00. Error: "Minimum order is AED 20.00. Add AED X.XX more." |

### FR-EC02: Commission Calculation

| Field | Requirement |
|---|---|
| **Formula** | `commission_amount = subtotal × commission_rate` |
| **Default rate** | 12% (0.12). Configurable per restaurant via admin override. |
| **Application** | Deducted from restaurant settlement. Not visible to customer. |
| **Restaurant net** | `restaurant_net = subtotal − commission_amount`. Displayed in restaurant earnings dashboard. |
| **Settlement** | Restaurant settlement calculated bi-weekly. Report available in dashboard. Payout via bank transfer (Phase 2). |

### FR-EC03: Driver Earnings Calculation

| Field | Requirement |
|---|---|
| **Formula** | `driver_earnings = base_pay + (per_km_rate × actual_distance_km)` |
| **Base pay** | AED 8.00 per completed job |
| **Per km rate** | AED 2.00/km |
| **Actual distance** | Driving distance from restaurant to customer (Google Maps Distance Matrix). Recalculated after delivery. |
| **Estimated earnings** | Shown before acceptance using straight-line × 1.4 estimate. Label: "Estimated earnings." |
| **Discrepancy** | If actual > estimated by more than 20%, difference credited to driver automatically. If actual < estimated, no clawback — driver keeps estimated amount. |
| **Display** | AED, rounded to 2 decimal places. |

---

## 14. Rating & Reviews

### FR-RV01: Order Rating

| Field | Requirement |
|---|---|
| **Who** | Customer only. Must be the customer who placed the order. |
| **When** | After order status = delivered. Available for 7 days after delivery. Prompt shown on next app open. |
| **Scale** | 1-5 stars (integer). 1 = Poor, 5 = Excellent. |
| **Optional text** | Review text, max 500 characters, UTF-8. Profanity filter (Phase 2). Not required to submit star rating. |
| **Rules** | One rating per order. Cannot edit after 24 hours of submission. Cannot delete (contact support for removal). Rating optional — not required to reorder. |

### FR-RV02: Restaurant Rating Calculation

| Field | Requirement |
|---|---|
| **Display** | Average of last 100 ratings, rounded to 1 decimal place (e.g., 4.3). |
| **Update** | Recalculated asynchronously on each new rating. Visible within 60 seconds. |
| **Empty state** | Restaurants with < 5 ratings display "New" badge instead of numerical rating. Never display "0.0" or "No ratings." |
| **Review count** | Total number of text reviews displayed next to rating (e.g., "4.3 (47 reviews)"). |

### FR-RV03: Restaurant Review Management

| Field | Requirement |
|---|---|
| **View** | Restaurant owner can view all ratings and reviews in dashboard, sorted by date (most recent first). |
| **Report** | Restaurant owner can report inappropriate reviews for admin review. Review stays visible pending admin decision. |
| **Response** | Restaurant owner can add a public response to any review (Phase 2). |

---

## 15. Dispute Resolution

### FR-DP01: Order Dispute Flow

| Field | Requirement |
|---|---|
| **Triggers** | Customer reports: order not delivered, wrong items received, missing items, food quality issue, driver behavior issue. |
| **Evidence** | Customer can upload up to 3 photos (max 5MB each, JPG/PNG). Driver GPS trail and order timeline automatically attached. |
| **Flow** | Customer submits dispute → System creates dispute ticket → Admin reviews with full context (GPS trail, timeline, photos, chat) → Admin resolves (refund/deny/credit) → Both parties notified. |
| **Timeline** | Resolution target: 2 hours for "not delivered" disputes. 24 hours for quality disputes. |
| **Appeal** | Restaurant or driver can appeal admin decision within 48 hours. Appeal requires counter-evidence. |

### FR-DP02: Auto-Resolution Rules

| Scenario | Resolution |
|---|---|
| Driver confirmed delivery but GPS trail shows driver never arrived within 200m of customer | Auto-refund customer, flag driver account for review |
| Restaurant rejected 5 or more orders within 24 hours | Auto-flag restaurant for admin review (possible capacity issue or policy violation) |
| Customer filed 3 or more disputes within 7 days | Auto-flag customer account for admin review (possible abuse) |
| Order stuck in "ready" status > 15 minutes with no driver assigned | Auto-cancel, full refund, notify customer: "No driver available." |

---

## Next Document

[06 — Non-Functional Requirements](06-non-functional-requirements.md)
