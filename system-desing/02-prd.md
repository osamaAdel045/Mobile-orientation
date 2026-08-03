# 02 — Product Requirements Document (PRD): LightBite

**Date:** 2026-07-26
**Status:** Draft
**Version:** 1.0

---

## 1. Product Overview

LightBite is a three-sided food delivery marketplace connecting **Customers**, **Restaurant Owners**, and **Delivery Drivers** through a shared real-time backend. The product consists of:

| Component | Audience | Platform(s) | Phase |
|---|---|---|---|---|
| Customer App | End customers ordering food | Flutter (Phase 2), React Native (Phase 4), Native Android/iOS (Phase 5), Ionic (Phase 6) | Phase 2 |
| Restaurant Dashboard | Restaurant owners managing orders and menus | Web (Vue SPA) | Phase 3 |
| Driver App | Delivery drivers accepting and fulfilling jobs | Flutter (Phase 2), React Native (Phase 4), Native Android/iOS (Phase 5) | Phase 2 |
| Backend API | Shared backend for all clients | Laravel (PHP) | Phase 1 |
| Admin Panel | Platform administrators — restaurant/driver verification, dispute resolution, platform configuration, monitoring | Web (Vue SPA) | Phase 7 — out of scope for Phase 1-3 |

---

## 2. User Roles & Responsibilities

### 2.1 Customer

- Browse restaurants by location, cuisine, or search
- View restaurant menus with images, descriptions, and prices
- Add items to cart, customize orders (notes, quantity)
- Place orders with delivery address
- Pay via card (Stripe)
- Track order status in real time (confirmed → preparing → ready → picked up → delivered)
- View order history
- Rate and review completed orders

### 2.2 Restaurant Owner

- Register and set up restaurant profile (name, logo, cuisine, location, hours)
- Manage menu (add/edit/delete items, upload images, set prices, availability)
- Receive new order notifications in real time
- Accept or reject incoming orders
- Update order preparation status
- View order history and earnings summary
- Manage business hours and holiday closures

### 2.3 Delivery Driver

- Register with vehicle and license information
- Toggle availability (online / offline)
- Receive delivery job notifications with restaurant and customer locations
- Accept or decline delivery jobs
- View pickup location on Google Maps with navigation
- Confirm pickup from restaurant
- View delivery location on Google Maps with navigation
- Confirm delivery to customer
- View earnings summary and trip history

---

## 3. Phase 1 Feature Scope

### 3.1 Authentication & User Management

| ID | Feature | Priority |
|---|---|---|
| A1 | Email/password registration | P0 — Must Have |
| A2 | Email/password login | P0 — Must Have |
| A3 | JWT-based authentication with refresh tokens | P0 — Must Have |
| A4 | Role-based registration (customer, restaurant, driver) | P0 — Must Have |
| A5 | Password reset via email | P1 — Should Have |
| A6 | Profile management (name, phone, photo) | P1 — Should Have |
| A7 | Social login (Google, Apple) | P2 — Phase 2 |

### 3.2 Restaurant Discovery & Menu

| ID | Feature | Priority |
|---|---|---|
| R1 | List restaurants near customer location | P0 — Must Have |
| R2 | Search restaurants by name or cuisine | P0 — Must Have |
| R3 | Filter by cuisine type, rating, delivery time | P1 — Should Have |
| R4 | View restaurant details (name, image, rating, hours, location) | P0 — Must Have |
| R5 | View menu with categories (appetizers, mains, desserts, drinks) | P0 — Must Have |
| R6 | Menu items with image, name, description, price | P0 — Must Have |

### 3.3 Cart & Ordering

| ID | Feature | Priority |
|---|---|---|
| C1 | Add items to cart | P0 — Must Have |
| C2 | Update item quantities in cart | P0 — Must Have |
| C3 | Remove items from cart | P0 — Must Have |
| C4 | Add special instructions per item | P1 — Should Have |
| C5 | Select delivery address (saved or new) | P0 — Must Have |
| C6 | View order summary before confirming | P0 — Must Have |
| C7 | Place order | P0 — Must Have |

### 3.4 Payments

| ID | Feature | Priority |
|---|---|---|
| P1 | Card payment via Stripe | P0 — Must Have |
| P2 | Save payment method for future | P1 — Should Have |
| P3 | Order payment receipt | P1 — Should Have |
| P4 | Driver earnings payout tracking | P2 — Phase 2 |
| P5 | Restaurant commission settlement | P2 — Phase 2 |

### 3.5 Real-time Order Tracking

| ID | Feature | Priority |
|---|---|---|
| T1 | Customer: live order status (confirmed → preparing → ready → picked up → delivering → delivered) | P0 — Must Have |
| T2 | Restaurant: new order notification with accept/reject | P0 — Must Have |
| T3 | Driver: new delivery job notification with accept/decline | P0 — Must Have |
| T4 | Customer: see driver location on map during delivery | P0 — Must Have |
| T5 | All parties: order status updates via WebSocket | P0 — Must Have |

### 3.6 Maps & Location

| ID | Feature | Priority |
|---|---|---|
| M1 | Customer: select delivery address on map | P0 — Must Have |
| M2 | Customer: view nearby restaurants on map | P1 — Should Have |
| M3 | Driver: navigate to restaurant (pickup) | P0 — Must Have |
| M4 | Driver: navigate to customer (delivery) | P0 — Must Have |
| M5 | Customer: track driver location in real time | P0 — Must Have |
| M6 | Distance matrix for delivery time estimation | P1 — Should Have |

### 3.7 Push Notifications

| ID | Feature | Priority |
|---|---|---|
| N1 | Customer: order status change notifications | P0 — Must Have |
| N2 | Restaurant: new order notification | P0 — Must Have |
| N3 | Driver: new delivery job notification | P0 — Must Have |
| N4 | Customer: driver arriving notification | P1 — Should Have |
| N5 | Deep link from notification to relevant screen | P1 — Should Have |

### 3.8 Restaurant Management

| ID | Feature | Priority |
|---|---|---|
| RM1 | Restaurant profile CRUD | P0 — Must Have |
| RM2 | Menu item CRUD with image upload | P0 — Must Have |
| RM3 | Menu categories management | P0 — Must Have |
| RM4 | Toggle item availability | P1 — Should Have |
| RM5 | Business hours configuration | P0 — Must Have |
| RM6 | Order history and earnings dashboard | P1 — Should Have |

### 3.9 Driver Features

| ID | Feature | Priority |
|---|---|---|
| D1 | Toggle online/offline availability | P0 — Must Have |
| D2 | Accept/decline delivery jobs | P0 — Must Have |
| D3 | View pickup and delivery locations on map | P0 — Must Have |
| D4 | Confirm pickup from restaurant | P0 — Must Have |
| D5 | Confirm delivery to customer | P0 — Must Have |
| D6 | Trip history and earnings | P1 — Should Have |
| D7 | Background location sharing while online | P2 — Phase 2 |

### 3.10 Rating & Reviews

| ID | Feature | Priority |
|---|---|---|
| RV1 | Customer rates completed order (1-5 stars) | P1 — Should Have |
| RV2 | Customer writes optional text review for order | P1 — Should Have |
| RV3 | Restaurant average rating displayed on discovery cards and detail page | P1 — Should Have |
| RV4 | Restaurant owner views all ratings and reviews in dashboard | P1 — Should Have |
| RV5 | Restaurant owner reports inappropriate review for admin review | P2 — Phase 2 |
| RV6 | Driver rating after delivery completion | P2 — Phase 2 |

### 3.11 Platform Economics

| ID | Feature | Priority |
|---|---|---|
| EC1 | Platform commission applied per order (configurable %, default 12%) | P0 — Must Have |
| EC2 | Delivery fee calculation: base fee (AED 5) + distance component (AED 1.5/km beyond 3km) | P0 — Must Have |
| EC3 | Order total displayed as: subtotal + delivery fee + VAT (5%) | P0 — Must Have |
| EC4 | Receipt shows fee breakdown (subtotal, delivery fee, tax, total) | P0 — Must Have |
| EC5 | Driver sees estimated earnings before accepting job (base + distance) | P1 — Should Have |
| EC6 | Restaurant sees gross revenue, commission deducted, and net earnings per order | P1 — Should Have |
| EC7 | Driver earnings payout tracking and history | P2 — Phase 2 |
| EC8 | Restaurant commission settlement reporting (bi-weekly) | P2 — Phase 2 |
| EC9 | Promo codes and discount system | P2 — Phase 2 |

---

## 4. Non-Functional Requirements Summary

| Category | Requirement |
|---|---|
| **Performance** | API response < 200ms p95, WebSocket event delivery < 500ms |
| **Availability** | 99.9% uptime target |
| **Security** | JWT auth, HTTPS only, input validation, rate limiting, SQL injection prevention |
| **Scalability** | Stateless API design, queue-backed async processing for notifications |
| **Observability** | Structured logging, health check endpoint, error tracking |
| **Mobile** | App size < 50MB, cold start < 2s, smooth 60fps scrolling |

---

## 5. User Journeys (High-Level)

### 5.1 Customer Places an Order

```
Open app → Browse restaurants → Select restaurant → View menu →
Add items to cart → Go to cart → Add delivery address → Pay →
Order confirmed → Watch live status → Driver picks up → Track on map →
Driver delivers → Confirm receipt → Rate order
```

### 5.2 Restaurant Processes an Order

```
Receive notification → Open dashboard → View incoming order →
Accept order → Start preparing → Mark as ready →
Driver arrives → Hand over food
```

### 5.3 Driver Completes a Delivery

```
Go online → Receive job notification → Accept job →
Navigate to restaurant → Arrive at restaurant → Confirm pickup →
Navigate to customer → Arrive at customer → Confirm delivery →
Available for next job
```

### 5.4 Customer Payment Fails

```
Open app → Browse restaurants → Add items to cart → Go to checkout →
Enter card details → Pay → Payment declined →
See clear error with reason → Try different card → Payment succeeds →
Order confirmed
```

### 5.5 Restaurant Rejects Order

```
Receive notification → Open dashboard → View incoming order →
Kitchen is overwhelmed → Tap "Reject" → Select reason: "Kitchen at capacity" →
Customer receives push: "Order declined — Spice Route cannot fulfill" →
Customer payment pre-auth voided → Customer sees "Find another restaurant"
```

### 5.6 Driver Cannot Find Customer

```
Accept job → Navigate to restaurant → Pick up food →
Navigate to customer → Arrive at pin location → Customer not visible →
Tap "Call Customer" → No answer → Tap "Can't Find Customer" →
System notifies customer: "Driver is at your location" → Customer comes out →
Confirm delivery
```

---

## 6. What Success Looks Like (Phase 1)

1. A customer can register, browse restaurants, place an order, pay, and track it in real time
2. A restaurant can register, set up a menu, receive orders, and update their status
3. A driver can register, go online, accept jobs, navigate, and complete deliveries
4. The entire system runs on a single Laravel backend consumed by all clients
5. The Flutter Customer App and Flutter Driver App are functional and tested
6. The Restaurant Web Dashboard is functional and tested
7. All features are documented with API specs

---

## Next Document

[03 — Personas](03-personas.md)
