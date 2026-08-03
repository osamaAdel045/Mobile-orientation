# 09 — Database Schema: LightBite

**Date:** 2026-07-26
**Status:** Draft
**Version:** 1.0

---

## 1. Entity-Relationship Diagram

```
┌──────────┐       ┌─────────────────┐       ┌──────────┐
│  users   │       │ refresh_tokens  │       │ push_    │
│──────────│       │─────────────────│       │ tokens   │
│ id (PK)  │──┐    │ id (PK)         │       │──────────│
│ uuid     │  │    │ user_id (FK)────│───────│ id (PK)  │
│ name     │  │    │ token_hash      │       │ user_id──│──┐
│ email    │  ├───▶│ expires_at      │       │ token    │  │
│ password │  │    │ revoked_at      │       │ platform │  │
│ role ────│──┤    └─────────────────┘       └──────────┘  │
│ phone    │  │                                             │
│ photo    │  │    ┌─────────────────┐                     │
│ status   │  │    │ user_addresses  │                     │
│ email_v..│  │    │─────────────────│                     │
└──────────┘  │    │ id (PK)         │                     │
              │    │ user_id (FK)────│─────────────────────┘
              │    │ label           │
              │    │ address         │
              │    │ lat, lng        │
              │    │ is_default      │
              │    └─────────────────┘
              │
              │    ┌──────────────────────────────────────────────┐
              │    │                restaurants                   │
              │    │──────────────────────────────────────────────│
              │    │ id (PK)                                      │
              ├───▶│ owner_id (FK→users)                          │
              │    │ uuid, name, description, logo, cover         │
              │    │ cuisine_types (JSON), phone                  │
              │    │ lat, lng, address                            │
              │    │ status (enum)                                │
              │    │ commission_rate (decimal, default 0.12)      │
              │    │ is_accepting_orders (bool)                   │
              │    │ prep_avg_time_min                            │
              │    │ deleted_at (soft delete)                     │
              │    └──────┬───────────────────────────────────────┘
              │           │
              │           ├──▶ restaurant_hours (day_of_week, open, close)
              │           │
              │           ├──▶ menu_categories (name, sort_order)
              │           │         │
              │           │         └──▶ menu_items (name, desc, price_fils, image, is_available)
              │           │
              │           └──▶ orders ──────────────────────────────┐
              │                                                     │
              │    ┌──────────┐                                     │
              │    │  carts   │                                     │
              │    │──────────│                                     │
              └───▶│customer──│────┐                                │
                   │restaurant│    │                                │
                   │expires_at│    │                                │
                   └──────────┘    │                                │
                        │          │                                │
                   ┌────┴─────┐    │                                │
                   │cart_items│    │                                │
                   │──────────│    │                                │
                   │cart_id───│────┘                                │
                   │menu_item │                                      │
                   │quantity  │                                      │
                   │unit_price│                                      │
                   │notes     │                                      │
                   └──────────┘                                      │
                                                                     │
┌──────────────────────────────────────────────────────────────────┐ │
│                          orders                                   │ │
│──────────────────────────────────────────────────────────────────│ │
│ id (PK), uuid, order_number (unique)                             │ │
│ customer_id (FK→users) ──────────────────────────────────────────┘ │
│ restaurant_id (FK→restaurants) ───────────────────────────────────┘ │
│ driver_id (FK→users, nullable)                                     │
│ status (enum)                                                       │
│ subtotal_fils (int), delivery_fee_fils (int)                       │
│ tax_fils (int), total_fils (int)                                   │
│ commission_fils (int), driver_earnings_fils (int)                 │
│ idempotency_key (unique), delivery_address_snapshot (JSON)        │
│ estimated_delivery_min, actual_delivery_min                       │
│ lock_version (int, optimistic locking)                            │
│ created_at, updated_at                                            │
└────────────┬─────────────────────────────────────────────────────┘
             │
             ├──▶ order_items (menu_item_id, name, qty, unit_price_fils, special_instructions)
             │
             ├──▶ order_status_log (from_status, to_status, changed_by_type, changed_by_id, note)
             │
             ├──▶ payments (stripe_payment_intent_id, amount_fils, status, refund_amount_fils)
             │
             ├──▶ ratings (customer_id, stars, review_text)  [unique: one per order]
             │
             └──▶ disputes (customer_id, reason, status, resolution, photos (JSON), resolved_by)


┌─────────────────┐     ┌──────────────────┐     ┌─────────────────────┐
│ driver_locations│     │   audit_logs     │     │  failed_jobs / jobs  │
│─────────────────│     │──────────────────│     │─────────────────────│
│ driver_id (FK)──│─────│ user_id (FK)     │     │ queue, payload,      │
│ lat, lng        │     │ action           │     │ attempts, reserved_at│
│ bearing         │     │ resource_type    │     └─────────────────────┘
│ is_online (bool)│     │ resource_id      │
│ updated_at      │     │ old_values (JSON)│
└─────────────────┘     │ new_values (JSON)│
                        │ ip_address       │
                        └──────────────────┘
```

---

## 2. Migration Specifications

### 2.1 users

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT | Internal ID |
| uuid | CHAR(36) | UNIQUE, NOT NULL | Public identifier |
| name | VARCHAR(255) | NOT NULL | |
| email | VARCHAR(255) | UNIQUE, NOT NULL | |
| email_verified_at | TIMESTAMP | NULLABLE | |
| password | VARCHAR(255) | NOT NULL | bcrypt hash |
| role | ENUM('customer','restaurant','driver','admin') | NOT NULL | |
| phone | VARCHAR(20) | NULLABLE | E.164 format |
| photo_path | VARCHAR(500) | NULLABLE | Storage path |
| status | ENUM('pending_verification','verified','active','rejected','suspended','deactivated') | NOT NULL, DEFAULT 'pending_verification' | |
| locale | VARCHAR(5) | DEFAULT 'en' | i18n prep |
| created_at | TIMESTAMP | NOT NULL | |
| updated_at | TIMESTAMP | NOT NULL | |
| deleted_at | TIMESTAMP | NULLABLE | Soft delete |

**Indexes:** `UNIQUE(email)`, `UNIQUE(uuid)`, `INDEX(role, status)`

### 2.2 refresh_tokens

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT | |
| user_id | BIGINT UNSIGNED | FK→users(id), NOT NULL | CASCADE on delete |
| token_hash | VARCHAR(64) | UNIQUE, NOT NULL | SHA-256 of token |
| expires_at | TIMESTAMP | NOT NULL | |
| revoked_at | TIMESTAMP | NULLABLE | Set on logout/rotation |
| created_at | TIMESTAMP | NOT NULL | |

**Indexes:** `UNIQUE(token_hash)`, `INDEX(user_id, revoked_at)`

### 2.3 user_addresses

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT | |
| user_id | BIGINT UNSIGNED | FK→users(id), NOT NULL | CASCADE on delete |
| label | VARCHAR(50) | NOT NULL | home, work, other |
| address | VARCHAR(500) | NOT NULL | Full address text |
| apartment | VARCHAR(100) | NULLABLE | |
| lat | DECIMAL(10,7) | NOT NULL | |
| lng | DECIMAL(10,7) | NOT NULL | |
| is_default | BOOLEAN | NOT NULL, DEFAULT FALSE | |

**Indexes:** `INDEX(user_id)`, `UNIQUE(user_id, label)`

### 2.4 restaurants

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT | |
| uuid | CHAR(36) | UNIQUE, NOT NULL | |
| owner_id | BIGINT UNSIGNED | FK→users(id), NOT NULL | |
| name | VARCHAR(255) | NOT NULL | |
| description | TEXT | NULLABLE | |
| logo_path | VARCHAR(500) | NULLABLE | |
| cover_path | VARCHAR(500) | NULLABLE | |
| cuisine_types | JSON | NOT NULL | e.g., ["lebanese","middle_eastern"] |
| phone | VARCHAR(20) | NOT NULL | |
| address | VARCHAR(500) | NOT NULL | |
| lat | DECIMAL(10,7) | NOT NULL | |
| lng | DECIMAL(10,7) | NOT NULL | |
| location_point | POINT | NULLABLE | Spatial column for proximity queries |
| status | ENUM('pending_verification','verified','active','inactive','closed','suspended','permanently_closed') | NOT NULL, DEFAULT 'pending_verification' | |
| commission_rate | DECIMAL(4,3) | NOT NULL, DEFAULT 0.120 | e.g., 0.120 = 12% |
| is_accepting_orders | BOOLEAN | NOT NULL, DEFAULT TRUE | Quick pause toggle |
| prep_avg_time_min | INT | DEFAULT 20 | |
| trade_license_path | VARCHAR(500) | NULLABLE | Verification doc |
| food_safety_cert_path | VARCHAR(500) | NULLABLE | Verification doc |
| created_at | TIMESTAMP | NOT NULL | |
| updated_at | TIMESTAMP | NOT NULL | |
| deleted_at | TIMESTAMP | NULLABLE | Soft delete |

**Indexes:** `UNIQUE(uuid)`, `SPATIAL(location_point)`, `FULLTEXT(name, cuisine_types)`, `INDEX(status, lat, lng)`, `INDEX(owner_id)`

### 2.5 restaurant_hours

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT | |
| restaurant_id | BIGINT UNSIGNED | FK→restaurants(id), NOT NULL | CASCADE |
| day_of_week | TINYINT | NOT NULL | 0=Sun, 6=Sat |
| open_time | TIME | NOT NULL | |
| close_time | TIME | NOT NULL | |
| is_closed | BOOLEAN | NOT NULL, DEFAULT FALSE | Override for holidays |

**Indexes:** `UNIQUE(restaurant_id, day_of_week, open_time)` (supports split hours)

### 2.6 menu_categories

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT | |
| restaurant_id | BIGINT UNSIGNED | FK→restaurants(id), NOT NULL | CASCADE |
| name | VARCHAR(100) | NOT NULL | |
| description | VARCHAR(255) | NULLABLE | |
| sort_order | INT | NOT NULL, DEFAULT 0 | |

**Indexes:** `INDEX(restaurant_id, sort_order)`

### 2.7 menu_items

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT | |
| uuid | CHAR(36) | UNIQUE, NOT NULL | |
| restaurant_id | BIGINT UNSIGNED | FK→restaurants(id), NOT NULL | CASCADE |
| category_id | BIGINT UNSIGNED | FK→menu_categories(id), NOT NULL | |
| name | VARCHAR(255) | NOT NULL | |
| description | TEXT | NULLABLE | |
| price_fils | INT | NOT NULL | AED 25.00 = 2500 |
| image_path | VARCHAR(500) | NULLABLE | |
| is_available | BOOLEAN | NOT NULL, DEFAULT TRUE | |
| prep_time_minutes | INT | DEFAULT 15 | |
| sort_order | INT | DEFAULT 0 | |
| created_at | TIMESTAMP | NOT NULL | |
| updated_at | TIMESTAMP | NOT NULL | |
| deleted_at | TIMESTAMP | NULLABLE | |

**Indexes:** `UNIQUE(uuid)`, `INDEX(restaurant_id, category_id)`, `FULLTEXT(name, description)`, `INDEX(restaurant_id, is_available)`

### 2.8 carts

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT | |
| uuid | CHAR(36) | UNIQUE, NOT NULL | |
| customer_id | BIGINT UNSIGNED | FK→users(id), UNIQUE, NOT NULL | 1 cart per customer |
| restaurant_id | BIGINT UNSIGNED | FK→restaurants(id), NOT NULL | |
| expires_at | TIMESTAMP | NOT NULL | 24h from last activity |
| created_at | TIMESTAMP | NOT NULL | |
| updated_at | TIMESTAMP | NOT NULL | |

**Indexes:** `UNIQUE(customer_id)`, `UNIQUE(uuid)`

### 2.9 cart_items

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT | |
| cart_id | BIGINT UNSIGNED | FK→carts(id), NOT NULL | CASCADE |
| menu_item_id | BIGINT UNSIGNED | FK→menu_items(id), NOT NULL | |
| quantity | INT | NOT NULL, DEFAULT 1, MIN 1, MAX 50 | |
| unit_price_fils | INT | NOT NULL | Snapshot at add time |
| special_instructions | VARCHAR(200) | NULLABLE | |

**Indexes:** `UNIQUE(cart_id, menu_item_id)`

### 2.10 orders

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT | |
| uuid | CHAR(36) | UNIQUE, NOT NULL | |
| order_number | VARCHAR(22) | UNIQUE, NOT NULL | LB-YYYYMMDD-XXXXX |
| customer_id | BIGINT UNSIGNED | FK→users(id), NOT NULL | |
| restaurant_id | BIGINT UNSIGNED | FK→restaurants(id), NOT NULL | |
| driver_id | BIGINT UNSIGNED | FK→users(id), NULLABLE | |
| status | ENUM('pending','confirmed','preparing','ready','assigned','picked_up','delivering','delivered','rejected','expired','cancelled','disputed','resolved','refunded') | NOT NULL, DEFAULT 'pending' | |
| subtotal_fils | INT | NOT NULL | |
| delivery_fee_fils | INT | NOT NULL | |
| tax_fils | INT | NOT NULL | |
| total_fils | INT | NOT NULL | |
| commission_fils | INT | DEFAULT 0 | |
| driver_earnings_fils | INT | NULLABLE | |
| idempotency_key | CHAR(36) | UNIQUE, NOT NULL | Client-generated UUID |
| delivery_address_snapshot | JSON | NOT NULL | Full address at order time |
| estimated_delivery_min | INT | NULLABLE | |
| actual_delivery_min | INT | NULLABLE | |
| customer_note | VARCHAR(500) | NULLABLE | |
| lock_version | INT | NOT NULL, DEFAULT 1 | Optimistic locking |
| created_at | TIMESTAMP | NOT NULL | |
| updated_at | TIMESTAMP | NOT NULL | |

**Indexes:** `UNIQUE(uuid)`, `UNIQUE(order_number)`, `UNIQUE(idempotency_key)`, `INDEX(customer_id, status, created_at DESC)`, `INDEX(restaurant_id, status, created_at DESC)`, `INDEX(driver_id, status)`, `INDEX(status, created_at)`

### 2.11 order_items

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT | |
| order_id | BIGINT UNSIGNED | FK→orders(id), NOT NULL | CASCADE |
| menu_item_id | BIGINT UNSIGNED | FK→menu_items(id), NOT NULL | NOT cascade — keep snapshot |
| name | VARCHAR(255) | NOT NULL | Snapshot |
| quantity | INT | NOT NULL | |
| unit_price_fils | INT | NOT NULL | Snapshot at order time |
| special_instructions | VARCHAR(200) | NULLABLE | |

**Indexes:** `INDEX(order_id)`

### 2.12 order_status_log

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT | |
| order_id | BIGINT UNSIGNED | FK→orders(id), NOT NULL | CASCADE |
| from_status | VARCHAR(20) | NOT NULL | |
| to_status | VARCHAR(20) | NOT NULL | |
| changed_by_type | VARCHAR(20) | NOT NULL | 'customer','restaurant','driver','system','admin' |
| changed_by_id | BIGINT UNSIGNED | NULLABLE | |
| note | VARCHAR(500) | NULLABLE | e.g., rejection reason |
| created_at | TIMESTAMP | NOT NULL | |

**Indexes:** `INDEX(order_id, created_at)`

### 2.13 payments

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT | |
| uuid | CHAR(36) | UNIQUE, NOT NULL | |
| order_id | BIGINT UNSIGNED | FK→orders(id), NOT NULL | |
| stripe_payment_intent_id | VARCHAR(100) | UNIQUE, NULLABLE | |
| amount_fils | INT | NOT NULL | |
| status | ENUM('pre_authorized','captured','voided','refunded','partially_refunded','failed') | NOT NULL | |
| refund_amount_fils | INT | DEFAULT 0 | |
| refund_reason | VARCHAR(500) | NULLABLE | |
| created_at | TIMESTAMP | NOT NULL | |
| updated_at | TIMESTAMP | NOT NULL | |

**Indexes:** `UNIQUE(uuid)`, `INDEX(order_id)`, `INDEX(stripe_payment_intent_id)`

### 2.14 driver_locations

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT | |
| driver_id | BIGINT UNSIGNED | FK→users(id), UNIQUE, NOT NULL | |
| lat | DECIMAL(10,7) | NOT NULL | |
| lng | DECIMAL(10,7) | NOT NULL | |
| bearing | DECIMAL(5,1) | NULLABLE | Heading in degrees |
| is_online | BOOLEAN | NOT NULL, DEFAULT FALSE | |
| updated_at | TIMESTAMP | NOT NULL | |

**Indexes:** `UNIQUE(driver_id)`, `INDEX(is_online, updated_at)`

### 2.15 ratings (moved from 2.15 → consistent)

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT | |
| order_id | BIGINT UNSIGNED | FK→orders(id), UNIQUE, NOT NULL | One rating per order |
| customer_id | BIGINT UNSIGNED | FK→users(id), NOT NULL | |
| restaurant_id | BIGINT UNSIGNED | FK→restaurants(id), NOT NULL | Denormalized for fast queries |
| stars | TINYINT | NOT NULL, MIN 1, MAX 5 | |
| review_text | VARCHAR(500) | NULLABLE | |
| created_at | TIMESTAMP | NOT NULL | |
| updated_at | TIMESTAMP | NOT NULL | |

**Indexes:** `UNIQUE(order_id)`, `INDEX(restaurant_id, created_at DESC)`

### 2.16 disputes

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT | |
| uuid | CHAR(36) | UNIQUE, NOT NULL | |
| order_id | BIGINT UNSIGNED | FK→orders(id), NOT NULL | |
| customer_id | BIGINT UNSIGNED | FK→users(id), NOT NULL | |
| reason | ENUM('not_delivered','wrong_items','missing_items','quality','driver_behavior','other') | NOT NULL | |
| description | VARCHAR(1000) | NOT NULL | |
| photos | JSON | NULLABLE | Array of storage paths (max 3) |
| status | ENUM('open','under_review','resolved_refunded','resolved_no_refund','denied') | NOT NULL, DEFAULT 'open' | |
| resolution_note | VARCHAR(500) | NULLABLE | |
| resolved_by | BIGINT UNSIGNED | FK→users(id), NULLABLE | Admin who resolved |
| created_at | TIMESTAMP | NOT NULL | |
| updated_at | TIMESTAMP | NOT NULL | |

**Indexes:** `UNIQUE(uuid)`, `INDEX(order_id)`, `INDEX(status, created_at)`

### 2.17 push_tokens

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT | |
| user_id | BIGINT UNSIGNED | FK→users(id), NOT NULL | CASCADE |
| token | VARCHAR(500) | NOT NULL | FCM/APNs token |
| platform | ENUM('ios','android') | NOT NULL | |
| created_at | TIMESTAMP | NOT NULL | |
| updated_at | TIMESTAMP | NOT NULL | |

**Indexes:** `INDEX(user_id)`, `UNIQUE(token)`

### 2.18 audit_logs

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT | |
| user_id | BIGINT UNSIGNED | FK→users(id), NULLABLE | NULL for system actions |
| action | VARCHAR(100) | NOT NULL | e.g., 'restaurant.verified', 'order.refunded' |
| resource_type | VARCHAR(50) | NOT NULL | |
| resource_id | BIGINT UNSIGNED | NULLABLE | |
| old_values | JSON | NULLABLE | |
| new_values | JSON | NULLABLE | |
| ip_address | VARCHAR(45) | NOT NULL | |
| created_at | TIMESTAMP | NOT NULL | |

**Indexes:** `INDEX(user_id, created_at)`, `INDEX(resource_type, resource_id)`, `INDEX(action, created_at)`

---

## 3. Price Storage Convention

All monetary values are stored as **integers in fils** (1/1000 of AED, though practically 1/100).

| Display Value | Stored Value | Column Suffix |
|---|---|---|
| AED 25.00 | 2500 | `_fils` |
| AED 0.50 | 50 | `_fils` |
| AED 100.00 | 10000 | `_fils` |

**Why:** Avoids floating-point rounding errors. Integer math is exact. Conversion happens at the API boundary via Laravel accessors/mutators.

```php
// Model mutator
public function getPriceAttribute(int $value): float
{
    return $value / 100;
}

// Model accessor
public function setPriceAttribute(float $value): void
{
    $this->attributes['price_fils'] = (int) round($value * 100);
}
```

---

## 4. Database Migration Order

```
1.  users
2.  refresh_tokens
3.  user_addresses
4.  push_tokens
5.  restaurants
6.  restaurant_hours
7.  menu_categories
8.  menu_items
9.  carts
10. cart_items
11. orders
12. order_items
13. order_status_log
14. payments
15. driver_locations
16. ratings
17. disputes
18. audit_logs
```

---

## Next Document

[10 — API Specification (OpenAPI)](10-api-spec.md)
