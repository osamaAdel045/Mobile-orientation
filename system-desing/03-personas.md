# 03 — Personas: LightBite

**Date:** 2026-07-26
**Status:** Draft

---

## Primary Personas

---

### P1: Sarah — The Customer

| Attribute | Detail |
|---|---|
| **Age** | 29 |
| **Occupation** | Marketing Manager |
| **Location** | Dubai Marina |
| **Tech Comfort** | High — uses apps for everything |
| **Device** | iPhone 15, iPad at home |
| **Accessibility** | No specific needs. Uses default text size. Prefers dark mode in evening. |

**Bio:** Sarah works long hours and orders food delivery 2-3 times per week. She values speed and reliability. She's frustrated when she can't see where her order is. She usually orders from the same 3-4 restaurants but occasionally tries new places when she's bored with her rotation. She's willing to pay a premium for fast delivery.

**Goals:**
- Find food quickly when hungry
- Know exactly when her food will arrive
- Reorder from favorites with one tap
- See real-time driver location so she can meet them at the door

**Frustrations:**
- "Your order is on the way" with no map or ETA
- Restaurants that show items as available but reject orders
- Having to re-enter her address every time
- No photo of the food — she eats with her eyes first

**Scenario — Sarah's Friday Night:**
> Sarah finishes work late. She opens LightBite, sees her favorite Thai place is open. The menu has photos and clear prices. She adds Pad Thai and spring rolls to her cart, selects her saved home address, and pays with her saved card. Within seconds, she sees "Restaurant confirmed." Two minutes later: "Preparing." When the driver picks up, she sees a map with the driver's car moving toward her. She meets the driver at the door exactly when the ETA said she would.

---

### P2: Ahmed — The Restaurant Owner

| Attribute | Detail |
|---|---|
| **Age** | 42 |
| **Occupation** | Owner of "Spice Route" (Lebanese restaurant, 15 tables) |
| **Location** | Jumeirah |
| **Tech Comfort** | Medium — uses WhatsApp, Instagram, basic POS system |
| **Device** | Samsung Galaxy tablet + Windows laptop |
| **Accessibility** | Needs large touch targets (fat-finger friendly). High-contrast UI. Simple, non-technical language. Arabic-language UI preferred when available. Avoids small text and dense data tables. |

**Bio:** Ahmed has run his restaurant for 8 years. He currently uses a major delivery platform but resents the 25% commission. He wants to offer delivery directly to his loyal customers. He's not very technical but his son helps him with the tablet. He needs something simple — accept order, cook, mark ready. Nothing complicated.

**Goals:**
- Receive orders clearly with item details and special instructions
- Accept or reject orders quickly when the kitchen is overwhelmed
- Manage his menu himself (add daily specials, mark items as sold out)
- Track how much he's earning from delivery orders
- Keep his restaurant's brand identity (logo, photos, description)

**Frustrations:**
- Delivery platforms that hide customer information from him
- Complicated dashboards with too many features he doesn't need
- Not being able to pause orders when the kitchen is at capacity
- Customers complaining about wrong items because the platform menu was outdated

**Scenario — Ahmed's Busy Lunch Rush:**
> Ahmed's tablet chimes with a new order notification. He sees the order details — 2 chicken shawarma, 1 hummus, 1 tabbouleh. He taps "Accept." The tablet shows "Preparing." When the food is packed, he taps "Ready for Pickup." A driver arrives 4 minutes later, shows the order number on their phone, and takes the food. Ahmed didn't need to call anyone or write anything down. The order appears in his daily summary with the revenue amount.

---

### P3: Khalid — The Driver

| Attribute | Detail |
|---|---|
| **Age** | 26 |
| **Occupation** | Part-time delivery driver (also studying computer science) |
| **Location** | Al Nahda |
| **Tech Comfort** | High — always on his phone |
| **Device** | Android (Xiaomi mid-range) |
| **Accessibility** | Needs glanceable UI (large status indicators) usable while driving with minimal taps. Voice prompts for navigation and job alerts. High-visibility mode for bright sunlight. One-thumb operation for accept/decline actions. |

**Bio:** Khalid delivers food 4 evenings a week to supplement his income while studying. He drives his own car. He currently juggles multiple delivery apps to maximize earnings. He wants clear earnings per trip, efficient routes, and the ability to choose which areas he works in. Battery life matters — his phone needs to last a full shift.

**Goals:**
- See earnings per trip clearly before accepting
- Get efficient navigation that avoids traffic
- Choose delivery zones near his home or university
- Track his daily/weekly earnings
- Quick accept/decline that he can use while driving

**Frustrations:**
- Apps that drain his battery with constant GPS
- Vague delivery locations ("near the mosque" with no pin)
- Long waits at restaurants that aren't ready
- No indication of how much he'll earn before accepting a job
- Apps that send him 15km away for a small order

**Scenario — Khalid's Evening Shift:**
> Khalid opens LightBite and taps "Go Online." Within minutes, he gets a notification: new delivery job, AED 18 earnings, 3.2 km total. He can see the restaurant and customer pins on a mini-map. He taps "Accept." The app launches navigation to Spice Route. He arrives, confirms pickup, and the app switches to customer navigation. He delivers to Sarah, confirms, and sees AED 18 added to his earnings. He's immediately available for the next job.

---

### P4: Layla — The Platform Administrator

| Attribute | Detail |
|---|---|
| **Age** | 34 |
| **Occupation** | Operations Manager at LightBite |
| **Location** | Dubai Internet City |
| **Tech Comfort** | High — experienced with admin tools, dashboards, and SQL |
| **Device** | MacBook Pro, iPhone 15 |

**Bio:** Layla manages the day-to-day operations of the LightBite platform. She onboards new restaurants, verifies driver documents, handles escalated disputes, monitors platform health, and configures platform parameters. She previously worked in operations at a logistics company. She needs real-time visibility and quick resolution tools — when something goes wrong, she's the person everyone calls.

**Goals:**
- Review and approve/reject restaurant and driver registrations quickly
- Monitor platform metrics (active orders, driver availability, restaurant performance, revenue) in a single dashboard
- Handle escalated customer complaints and process refunds with full order context
- Suspend or ban users who violate platform policies
- Configure platform parameters (commission rates, delivery fees, delivery zones)
- See audit trails for all admin actions

**Frustrations:**
- Not being able to see the full lifecycle of a disputed order (GPS trail, status timeline, chat, payment)
- Having to run database queries to get basic operational metrics
- No audit trail when platform configuration is changed
- Slow verification workflows that delay restaurant/driver onboarding

**Scenario — Layla Resolves a Dispute:**
> A customer disputes an order claiming the food never arrived, but the driver marked it delivered. Layla opens the admin panel, pulls up the order timeline. She sees: the driver's GPS breadcrumb trail (arrived within 30m of customer), the driver confirmation timestamp, and the customer's message history. She can see this is likely a customer misunderstanding — the driver went to the wrong building entrance. She issues a AED 15 credit as goodwill, adds a note to the order, and closes the dispute. The entire resolution takes under 3 minutes.

---

## Persona Summary Matrix

| | Sarah (Customer) | Ahmed (Restaurant) | Khalid (Driver) | Layla (Admin) |
|---|---|---|---|---|---|
| **Primary goal** | Fast, reliable food delivery | Simple order management | Maximize earnings per hour | Platform health + quick resolution |
| **Platform** | iOS (Flutter app) | Web Dashboard (tablet) | Android (Flutter app) | Web Dashboard (laptop) |
| **Tech comfort** | High | Medium | High | High |
| **Key feature** | Real-time driver tracking | One-tap accept/reject | Clear earnings + navigation | Order inspection + audit trail |
| **Session length** | 3-5 minutes (ordering), passive (tracking) | All day with bursts | 4-5 hour shifts | Full workday with bursts |
| **Connectivity** | Always online (5G/WiFi) | Always online (WiFi) | Mobile data, sometimes patchy | Always online (WiFi) |
| **Notification sensitivity** | Wants push for status changes | Must not miss new orders | Must not miss job offers | Alerts for stuck orders + disputes |
| **Privacy concern** | Location while tracking, payment data | Revenue data, customer order history | Real-time location while online | Access to all user data — must be audited |
| **Security requirement** | JWT + secure payment (Stripe) | Role-based access to own restaurant only | Location sharing only when on delivery | MFA required, all actions logged, IP-restricted |

---

## Anti-Personas — Who LightBite Is NOT For

Explicitly defining who we do NOT serve prevents scope creep and focuses engineering effort.

| Anti-Persona | Why Excluded | When Revisit |
|---|---|---|
| **Cash-on-delivery customers** | Payment must be pre-authorized for the order flow to work (pre-auth → capture on acceptance → release on rejection). Cash breaks this model. | Phase 3+ if market demands |
| **Customers outside delivery zones** | Delivery is limited to a defined service area (10km radius from active restaurants). Expanding requires driver density and logistics scaling. | Phase 2 (zone expansion) |
| **Dine-in / table reservation users** | LightBite is a delivery platform. Dine-in is a fundamentally different product with different workflows (table management, POS integration, wait staff). | Not planned — different product |
| **Restaurants without food safety permits** | All restaurants must pass admin verification including valid trade license and food safety documentation. | Never — compliance requirement |
| **Drivers without valid license + insurance** | All drivers must submit valid driver's license, vehicle registration, and insurance. No exceptions. | Never — legal requirement |
| **Enterprise restaurant chains requiring ERP integration** | Large chains (20+ locations) often require custom integrations (SAP, Oracle MICROS). Phase 1 targets independent and small-chain restaurants. | Phase 3+ with dedicated integrations team |

---

## Next Document

[04 — User Stories](04-user-stories.md)
