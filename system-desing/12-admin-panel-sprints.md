# 12 — Admin Panel Sprints: LightBite

**Date:** 2026-07-27
**Status:** In Progress
**Depends on:** Phase 1 Backend Core (complete)

---

## Context

The admin panel was originally scheduled for Phase 7 (week 28+), but the backend is already built and verification workflows (restaurant/driver approval) are needed immediately. This document defines the sprints to bring the admin panel from its current state (5-page verify-only Vue SPA) to a complete platform control center.

**Current state:** Admin can only approve/reject restaurants and drivers, resolve disputes (without processing refunds), and change theme colors. Everything else in the 20-table database is invisible and untouchable.

**Target state:** Admin has full visibility and control over every entity in the system: users, orders, payments, restaurants, drivers, disputes, ratings, audit logs, carts, and platform configuration.

---

## Sprint 0: Document Handling & Bug Fixes (Current — 1-2 days)

**Goal:** Make verification document review functional. Fix critical backend bugs that break the system cycle.

### 0.1 Document Handling ✅ DONE

| Task | Status |
|---|---|
| Add `license_path`, `vehicle_registration_path`, `insurance_path` columns to users table | ✅ Migration created & run |
| Update User model `$fillable` with new document fields | ✅ Done |
| Update `AdminController::pendingRestaurants()` to return `trade_license_url`, `food_safety_cert_url`, `logo_url` | ✅ Done |
| Update `AdminController::pendingDrivers()` to return `license_url`, `vehicle_registration_url`, `insurance_url`, `photo_url` | ✅ Done |
| Update `RestaurantVerification.vue` to show document links, owner email, description | ✅ Done |
| Update `DriverVerification.vue` to show document links, photo, applied date | ✅ Done |

### 0.2 Critical Bug Fixes

| # | Bug | Fix |
|---|---|---|
| 0.2.1 | `OrderService::modify()` — empty `foreach` loop for adding items silently fails | Implement the addItems loop: create new OrderItems, recalculate subtotal, log modification |
| 0.2.2 | Driver earnings conflict — `DriverService` hardcodes 14 AED, `OrderService` calculates 8 + 2/km, both called on same delivery | Remove hardcoded value from DriverService. Use `OrderService::calculateDriverEarnings()` only |
| 0.2.3 | No auto-expire for pending orders — `OrderService::expire()` exists but nothing calls it | Create `app/Console/Commands/ExpirePendingOrders.php` scheduled every 60 seconds. Add to `Console/Kernel.php` |
| 0.2.4 | Dispute "refund" doesn't process payment — `resolveDispute('refund')` sets status but never calls Stripe | Call `PaymentService::refund()` when admin resolves dispute with refund |
| 0.2.5 | `picked_up` status is invisible — transitions to `delivering` in same HTTP request | Separate the transitions: `confirmPickup` sets picked_up only. Add new endpoint `startDelivery` for picked_up → delivering |
| 0.2.6 | Dashboard duplicate Active Orders metric | Remove the second (gray) Active Orders entry from `Dashboard.vue` |
| 0.2.7 | Notifications are stubs — `NotificationService` only logs, never calls FCM/APNs | Implement HTTP calls to FCM and APNs in `sendPush()` and `sendSilent()` |

---

## Sprint 1: Complete Admin Dashboard (3-4 days)

**Goal:** Replace the simple metric-card dashboard with a real operations dashboard featuring charts, auto-refresh, and drill-down.

### 1.1 Live Dashboard with Charts

| # | Feature |
|---|---|
| 1.1.1 | Add auto-refresh via polling (every 30 seconds) OR WebSocket subscription to dashboard channel |
| 1.1.2 | Revenue chart — line chart showing revenue over last 7 days (grouped by day) |
| 1.1.3 | Order volume chart — bar chart showing orders per day over last 7 days |
| 1.1.4 | Order status breakdown — pie/donut chart showing active orders by status |
| 1.1.5 | Top restaurants widget — top 5 by order volume this week |
| 1.1.6 | Recent activity feed — last 20 events (new registrations, orders, disputes, status changes) |

### 1.2 Drill-Down from Metrics

| # | Feature |
|---|---|
| 1.2.1 | Click "Active Orders" → navigates to Orders page filtered to active statuses |
| 1.2.2 | Click "Pending Restaurants" → navigates to Restaurant Verifications |
| 1.2.3 | Click "Pending Drivers" → navigates to Driver Verifications |
| 1.2.4 | Click "Open Disputes" → navigates to Disputes page |
| 1.2.5 | Click "Online Drivers" → navigates to Driver list filtered to online |
| 1.2.6 | Click "Stuck Orders" row → opens order detail modal |

### 1.3 New Backend Endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | `/admin/dashboard/revenue-chart` | Revenue data for last 7/30 days |
| GET | `/admin/dashboard/order-volume` | Order counts per day |
| GET | `/admin/dashboard/top-restaurants` | Top restaurants by volume |
| GET | `/admin/dashboard/recent-activity` | Combined event feed |

---

## Sprint 2: User Management (3-4 days)

**Goal:** Admin can list, search, filter, view, suspend, and ban all users (customers, restaurants, drivers).

### 2.1 User List & Search

| # | Feature |
|---|---|
| 2.1.1 | User list page with table: name, email, role badge, status badge, phone, created date |
| 2.1.2 | Role filter tabs: All / Customers / Restaurants / Drivers |
| 2.1.3 | Status filter: All / Pending / Verified / Active / Suspended / Deactivated |
| 2.1.4 | Search by name, email, or phone |
| 2.1.5 | Pagination (20 per page) |
| 2.1.6 | Click user → user detail page |

### 2.2 User Detail & Actions

| # | Feature |
|---|---|
| 2.2.1 | User detail page: full profile, status, documents (if driver), restaurant link (if restaurant owner) |
| 2.2.2 | Customer detail: addresses, order history, dispute history, total spent |
| 2.2.3 | Driver detail: documents, delivery history, earnings summary, rating, online status |
| 2.2.4 | Restaurant owner detail: restaurant name, status, order volume, rating |
| 2.2.5 | Suspend user action — sets status to Suspended, requires reason, logged to audit trail |
| 2.2.6 | Unsuspend/Reactivate action |
| 2.2.7 | Ban (deactivate) action — permanent, requires confirmation |
| 2.2.8 | All status changes logged to `audit_logs` |

### 2.3 Backend Endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | `/admin/users` | List users (paginated, filterable) |
| GET | `/admin/users/{uuid}` | User detail with role-specific data |
| POST | `/admin/users/{uuid}/suspend` | Suspend user |
| POST | `/admin/users/{uuid}/unsuspend` | Reactivate user |
| POST | `/admin/users/{uuid}/deactivate` | Permanently deactivate user |

---

## Sprint 3: Order Management (3-4 days)

**Goal:** Admin can view all orders, inspect details, cancel, force-transition, and process refunds.

### 3.1 Order List

| # | Feature |
|---|---|
| 3.1.1 | Order list with table: order number, customer, restaurant, driver, status badge, total, date |
| 3.1.2 | Status filter: All active / Pending / Confirmed / Preparing / Ready / Delivering / Delivered / Cancelled / Disputed |
| 3.1.3 | Search by order number or customer name |
| 3.1.4 | Date range filter |
| 3.1.5 | Sort by date, total, status |

### 3.2 Order Detail & Actions

| # | Feature |
|---|---|
| 3.2.1 | Order detail page: items, prices, customer/driver/restaurant info, payment status |
| 3.2.2 | Full status timeline (from `order_status_log`) visualized as steps |
| 3.2.3 | Payment detail: pre-auth/capture/refund status, amounts, Stripe ID |
| 3.2.4 | Force-cancel order action (with reason) |
| 3.2.5 | Force-refund action (full or partial amount with reason) |
| 3.2.6 | Reassign driver action (select from available nearby drivers) |
| 3.2.7 | Add internal note to order (visible only to admin) |

### 3.3 Backend Endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | `/admin/orders` | List all orders (paginated, filterable) |
| GET | `/admin/orders/{uuid}` | Order detail with full timeline |
| POST | `/admin/orders/{uuid}/cancel` | Force-cancel with reason |
| POST | `/admin/orders/{uuid}/refund` | Force-refund with amount + reason |
| POST | `/admin/orders/{uuid}/reassign` | Reassign driver |
| POST | `/admin/orders/{uuid}/note` | Add internal note |

---

## Sprint 4: Restaurant Management (2-3 days)

**Goal:** Admin can view all restaurants (not just pending), view details, edit, suspend, and override commission rates.

### 4.1 Restaurant List & Management

| # | Feature |
|---|---|
| 4.1.1 | Restaurant list: name, owner, cuisine, status badge, rating, active orders count |
| 4.1.2 | Status filter: Active / Pending / Rejected / Suspended / Closed |
| 4.1.3 | Search by name, cuisine, or owner name |
| 4.1.4 | Click → restaurant admin detail page |

### 4.2 Restaurant Detail & Actions

| # | Feature |
|---|---|
| 4.2.1 | Full profile: name, description, logo, cover, cuisine, address, phone, hours |
| 4.2.2 | Menu preview (read-only view of categories and items) |
| 4.2.3 | Order history and revenue stats for this restaurant |
| 4.2.4 | Rating and review list for this restaurant |
| 4.2.5 | Suspend/Unsuspend restaurant |
| 4.2.6 | Override commission rate per restaurant |
| 4.2.7 | Force-open/force-close (toggle accepting orders) |
| 4.2.8 | All changes logged to audit trail |

### 4.3 Backend Endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | `/admin/restaurants` | List all restaurants (filterable) |
| GET | `/admin/restaurants/{uuid}` | Restaurant detail with stats |
| PATCH | `/admin/restaurants/{uuid}` | Update restaurant (fields, status, commission) |
| POST | `/admin/restaurants/{uuid}/suspend` | Suspend restaurant |
| POST | `/admin/restaurants/{uuid}/unsuspend` | Reactivate restaurant |

---

## Sprint 5: Driver Management (2-3 days)

**Goal:** Admin can view all drivers, inspect profiles, view locations on map, and manage status.

### 5.1 Driver List

| # | Feature |
|---|---|
| 5.1.1 | Driver list: name, email, phone, status badge, online status, deliveries today |
| 5.1.2 | Status filter: All / Online / Offline / On Delivery / Pending / Suspended |
| 5.1.3 | Search by name, email, phone |

### 5.2 Driver Detail & Actions

| # | Feature |
|---|---|
| 5.2.1 | Full profile with documents (license, registration, insurance) |
| 5.2.2 | Live location on map (if online — WebSocket or last known position) |
| 5.2.3 | Delivery history with earnings per trip |
| 5.2.4 | Earnings summary (today, this week, this month) |
| 5.2.5 | Rating from customers |
| 5.2.6 | Dispute history linked to this driver |
| 5.2.7 | Suspend/Unsuspend driver |
| 5.2.8 | Deactivate driver (permanent) |

### 5.3 Backend Endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | `/admin/drivers` | List all drivers (filterable) |
| GET | `/admin/drivers/{uuid}` | Driver detail with stats, documents, earnings |
| GET | `/admin/drivers/{uuid}/location` | Current location (or last known) |
| POST | `/admin/drivers/{uuid}/suspend` | Suspend driver |
| POST | `/admin/drivers/{uuid}/unsuspend` | Reactivate driver |

---

## Sprint 6: Dispute Center (2 days)

**Goal:** Complete dispute resolution with evidence viewing, GPS trail, order timeline, and actual refund processing.

### 6.1 Enhanced Dispute View

| # | Feature |
|---|---|
| 6.1.1 | Full dispute detail with customer info, order detail, reason, description |
| 6.1.2 | Photo evidence viewer (customer uploads) |
| 6.1.3 | GPS breadcrumb trail visualization on map |
| 6.1.4 | Full order status timeline |
| 6.1.5 | Driver info (name, rating, delivery history) |
| 6.1.6 | Restaurant info if relevant |

### 6.2 Resolution Actions

| # | Feature |
|---|---|
| 6.2.1 | Full refund — processes Stripe refund + sets dispute status |
| 6.2.2 | Partial credit — specify AED amount, processes partial refund |
| 6.2.3 | Deny dispute — requires resolution note |
| 6.2.4 | Resolution note required for all actions |
| 6.2.5 | Auto-resolution flags visible (GPS mismatch, repeated disputes) |
| 6.2.6 | Resolved disputes history with filter |

### 6.3 Backend Endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | `/admin/disputes` (enhanced) | Add pagination, resolved filter, search |
| GET | `/admin/disputes/{uuid}` | Full dispute detail with all evidence |
| POST | `/admin/disputes/{uuid}/resolve` (enhanced) | Support partial amounts, process Stripe refund |

---

## Sprint 7: Platform Configuration (2 days)

**Goal:** Admin can configure platform parameters without touching code.

### 7.1 Settings Page

| # | Feature |
|---|---|
| 7.1.1 | Commission rate (%) — default for all restaurants |
| 7.1.2 | Delivery fee: base fee (AED), per km rate (AED/km), included km |
| 7.1.3 | Driver pay: base pay (AED), per km rate (AED/km) |
| 7.1.4 | Tax rate (%) |
| 7.1.5 | Minimum order amount (AED) |
| 7.1.6 | Delivery radius (km) |
| 7.1.7 | Driver timeout (seconds before auto-decline) |
| 7.1.8 | Order expiry (minutes before pending order auto-expires) |
| 7.1.9 | All changes logged to audit trail with old/new values |
| 7.1.10 | Settings stored in `app_configs` table |

### 7.2 Backend Endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | `/admin/settings` | Get all platform settings |
| PUT | `/admin/settings` | Update platform settings |

---

## Sprint 8: Audit & Compliance (2 days)

**Goal:** Admin can view the full audit trail and system logs.

### 8.1 Audit Log Viewer

| # | Feature |
|---|---|
| 8.1.1 | Audit log table: timestamp, admin name, action, resource type, resource ID, old values, new values, IP |
| 8.1.2 | Filter by action type (user.suspended, restaurant.rejected, settings.updated, etc.) |
| 8.1.3 | Filter by admin user |
| 8.1.4 | Filter by date range |
| 8.1.5 | Click resource link → navigate to that entity |
| 8.1.6 | Read-only (no delete or modify audit logs) |

### 8.2 Review Moderation

| # | Feature |
|---|---|
| 8.2.1 | List all ratings/reviews with filter: All / Reported / Recent |
| 8.2.2 | View review detail with customer, order, restaurant context |
| 8.2.3 | Remove inappropriate review (soft-hide, not delete) |
| 8.2.4 | Dismiss report (mark as reviewed, keep visible) |

### 8.3 Backend Endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | `/admin/audit-logs` | List audit logs (filterable, paginated) |
| GET | `/admin/ratings` | List all ratings (filterable) |
| GET | `/admin/ratings/{id}` | Rating detail |
| POST | `/admin/ratings/{id}/hide` | Hide inappropriate review |
| POST | `/admin/ratings/{id}/unhide` | Restore review |

---

## Sprint 9: Customer Management (1-2 days)

**Goal:** Admin can view customers, their order history, addresses, and dispute patterns.

### 9.1 Customer List & Detail

| # | Feature |
|---|---|
| 9.1.1 | Customer list (part of User Management from Sprint 2 — or separate tab) |
| 9.1.2 | Customer detail: profile, saved addresses, order count, total spent |
| 9.1.3 | Order history with status and totals |
| 9.1.4 | Dispute history and dispute rate |
| 9.1.5 | Flag for abuse review (sets internal flag, doesn't auto-suspend) |

---

## Sprint 10: Cart & Platform Monitoring (1-2 days)

**Goal:** Admin can monitor active carts and system health.

### 10.1 Cart Monitoring

| # | Feature |
|---|---|
| 10.1.1 | Active carts list: customer, restaurant, items count, created time |
| 10.1.2 | Abandoned carts (expired or idle > 12 hours) |
| 10.1.3 | Cart value distribution stats |

### 10.2 System Health

| # | Feature |
|---|---|
| 10.2.1 | Service health status: Database, Redis, Queue, WebSocket |
| 10.2.2 | Queue size and failed jobs count |
| 10.2.3 | Push notification stats: tokens registered, recent sends, failures |
| 10.2.4 | API request volume (last hour, last 24h) |

### 10.3 Backend Endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | `/admin/carts/active` | Active cart list |
| GET | `/admin/carts/abandoned` | Abandoned cart list |
| GET | `/admin/system/health` | System health status |
| GET | `/admin/system/stats` | Platform statistics |

---

## Sprint 11: Analytics (2-3 days)

**Goal:** Business analytics dashboard for revenue, growth, and operational metrics.

### 11.1 Analytics Dashboard

| # | Feature |
|---|---|
| 11.1.1 | Revenue over time (daily, weekly, monthly) — line chart |
| 11.1.2 | Revenue by restaurant — bar chart |
| 11.1.3 | Order volume over time — bar chart |
| 11.1.4 | Average order value trend |
| 11.1.5 | Customer acquisition: new registrations per day/week |
| 11.1.6 | Driver utilization: deliveries per driver per day |
| 11.1.7 | Cancellation rate: % of orders cancelled |
| 11.1.8 | Dispute rate: % of orders disputed |
| 11.1.9 | Average delivery time trend |
| 11.1.10 | Export data as CSV |

---

## Sprint 12: Security & Hardening (2 days)

**Goal:** Secure the admin panel with MFA, IP restrictions, and granular permissions.

### 12.1 Multi-Factor Authentication

| # | Feature |
|---|---|
| 12.1.1 | TOTP-based MFA setup for admin accounts (QR code + authenticator app) |
| 12.1.2 | MFA required on login |
| 12.1.3 | Recovery codes generation |

### 12.2 Granular Admin Permissions

| # | Feature |
|---|---|
| 12.2.1 | Admin roles: Super Admin, Operations, Support, Read-Only |
| 12.2.2 | Permission matrix: verify_users, manage_users, manage_orders, manage_payments, configure_platform, view_audit, moderate_content, manage_themes |
| 12.2.3 | Middleware-based permission enforcement |
| 12.2.4 | Admin user CRUD for Super Admin (create/edit/disable admin accounts) |

### 12.3 IP Restriction

| # | Feature |
|---|---|
| 12.3.1 | Configurable IP whitelist for admin access |
| 12.3.2 | Allowed IP ranges stored in app_configs |

---

## Summary Timeline

```
Sprint 0:  Documents + Bug Fixes      █  1-2 days (CURRENT)
Sprint 1:  Complete Dashboard          ██  3-4 days
Sprint 2:  User Management             ██  3-4 days
Sprint 3:  Order Management            ██  3-4 days
Sprint 4:  Restaurant Management       █  2-3 days
Sprint 5:  Driver Management           █  2-3 days
Sprint 6:  Dispute Center              █  2 days
Sprint 7:  Platform Configuration      █  2 days
Sprint 8:  Audit & Compliance          █  2 days
Sprint 9:  Customer Management         █  1-2 days
Sprint 10: Cart & Platform Monitoring  █  1-2 days
Sprint 11: Analytics                   █  2-3 days
Sprint 12: Security & Hardening        █  2 days
                                       ──────────
Total:                                 ~26-35 days
```

---

## Technology Decision: Laravel Filament

After Sprint 1 (Complete Dashboard), we should evaluate migrating the admin Vue SPA to **Laravel Filament**. Reasons:

| Factor | Current Vue SPA | Laravel Filament |
|---|---|---|
| New CRUD page | ~150-200 lines (controller + route + Vue component + store) | ~30-50 lines (PHP Resource class) |
| Tables with search/filter/paginate | Manual implementation each time | Built-in, zero code |
| Forms with validation | Manual Vue form + backend validation | Built-in form builder |
| File uploads | Manual | Built-in (with preview) |
| Charts | Need Chart.js integration | Built-in widgets |
| Export to CSV/Excel | Need library integration | Built-in |
| Multi-admin roles | Need custom implementation | Spatie Permissions integration |
| Dark mode, RTL, responsive | Manual CSS | Built-in |

**Recommendation:** Complete Sprints 0-2 on the existing Vue SPA to stabilize the core. Evaluate Filament migration at the start of Sprint 3. If the migration saves more time than it costs, proceed with Filament for Sprints 3-12.
