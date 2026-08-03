# 00 — Documentation Review & Gap Analysis: LightBite

**Date:** 2026-07-26
**Reviewer:** Principal Software Architect / System Analyst
**Documents Reviewed:** 01-vision.md through 07-product-roadmap.md

---

## Executive Summary

The LightBite documentation set is a **solid foundation** with several critical gaps that must be resolved before engineering can begin. The strongest documents are **05-functional-requirements.md** (detailed state machine, validation rules, error cases) and **06-non-functional-requirements.md** (comprehensive NFR coverage). The weakest are **03-personas.md** (missing actors, no quantitative backing) and **04-user-stories.md** (missing entire epics for reviews, admin, disputes).

**Critical blocker:** The system index (`system index.md`) references NestJS as the backend framework, while 02-PRD specifies Laravel (PHP). This contradiction must be resolved immediately.

**Aggregate Scores:**

| Document | Completeness | Product Design | Engineering Quality | Scalability | Security | Clarity | Maintainability |
|---|---|---|---|---|---|---|---|
| 01-vision | 6 | 8 | 5 | 4 | 3 | 8 | 7 |
| 02-prd | 6 | 7 | 6 | 5 | 5 | 7 | 7 |
| 03-personas | 5 | 7 | 4 | 3 | 3 | 8 | 6 |
| 04-user-stories | 5 | 6 | 5 | 3 | 3 | 7 | 7 |
| 05-functional-requirements | 7 | 7 | 8 | 6 | 6 | 8 | 7 |
| 06-non-functional-requirements | 7 | 7 | 7 | 7 | 7 | 8 | 8 |
| 07-product-roadmap | 6 | 7 | 5 | 4 | 3 | 8 | 6 |

**Overall Readiness:** 62% — Documents are a strong draft. Not yet implementation-ready.

---

---

# DOCUMENT 1: 01-vision.md

## Overall Score

| Dimension | Score | Notes |
|---|---|---|
| Completeness | 6 | Missing business model, competitive analysis, admin persona, technical constraints |
| Product Design | 8 | Strong problem statements, clear solution, solid principles |
| Engineering Quality | 5 | Principles exist but no architectural decisions documented |
| Scalability | 4 | No mention of expected scale, multi-region, or growth targets |
| Security | 3 | Only implicit in "production-grade" principle |
| Clarity | 8 | Well-written, concise, easy to understand |
| Maintainability | 7 | Simple structure, easy to update |

## Findings

### Critical

**C01-VIS-001: Backend Framework Contradiction**
The vision document does not specify a backend framework, but the system index (`system index.md`) recommends NestJS while 02-PRD specifies Laravel (PHP). This is a blocking contradiction.
- **Fix:** Resolve the framework decision in this document. The vision should anchor the technology choice.

**C01-VIS-002: Missing Business Model**
No mention of how LightBite generates revenue. Without a business model, the commission/payment split logic in FRs has no foundation.
- **Fix:** Add section on business model (commission %, delivery fees, driver pay model).

**C01-VIS-003: Missing Admin Persona**
Three personas are defined (Customer, Restaurant, Driver). The admin/operations persona is entirely absent, yet 02-PRD lists "Admin Panel" as a component and 07-roadmap includes admin features.
- **Fix:** Add admin persona or explicitly declare it out of scope with a target phase.

### High

**H01-VIS-001: "Real-time" Undefined**
"Real-time by default" is a product principle but "real-time" is never defined with a latency target. The NFRs define WebSocket latency < 500ms — reference that.
- **Fix:** Define real-time as: "Status changes propagate to all subscribed clients within 500ms of the server receiving the event."

**H01-VIS-002: Success Metrics Are Aspirational, Not Measurable**
"Average order-to-delivery time < 45 minutes" — how is this measured? From order placement or restaurant confirmation? What is the measurement window?
- **Fix:** Define each metric with: measurement start event, measurement end event, measurement window.

**H01-VIS-003: "Offline-resilient" Principle Undefined**
No definition of what offline resilience means. Queue and sync? Read-only cache? Conflict resolution?
- **Fix:** Define offline resilience tiers.

**H01-VIS-004: Missing Competitive Analysis**
"Incumbent platforms taking 15-30% commission" is mentioned but no competitors are named, no differentiation table exists.
- **Fix:** Add competitive landscape section.

### Medium

**M01-VIS-001: "Framework-agnostic" Contradiction**
The principle says "framework-agnostic" but the PRD commits to specific frameworks (Laravel, Flutter first). Clarify that the API contract is framework-agnostic, but implementations use specific frameworks.
- **Fix:** Rephrase to "API-contract-driven — Every frontend consumes the same OpenAPI-defined contracts, regardless of its implementation framework."

**M01-VIS-002: Out of Scope Items Lack Detail**
"AI-powered recommendations" is listed as Phase 2 — but no definition of what this means. Same for "loyalty/rewards."
- **Fix:** Add one-sentence scope boundary for each deferred item.

**M01-VIS-003: Target Audience Lacks Market Sizing**
Three personas described but no indication of market size, target geography, or growth expectations.
- **Fix:** Add target market section.

### Low

**L01-VIS-001: "Multi-language support" Listed as Phase 2**
But the product name "LightBite" is English. Arabic/RTL support for Dubai market should be a Phase 1 consideration given the personas are Dubai-based.
- **Fix:** Add note that the UI architecture should support RTL/i18n even if translations are deferred.

**L01-VIS-002: Typo in "Product Name" Tagline**
"Fast food, light experience" — should this be "Fast food, light experience" or "Fresh food, light experience"?

## Improved Version — Sections Requiring Rewrite

### Section to Add: Business Model

```markdown
## Business Model

LightBite operates as a commission-based marketplace:

| Revenue Source | Model | Phase 1 Value |
|---|---|---|
| Restaurant Commission | X% per completed order (configurable per restaurant) | 12% (below market average of 15-30%) |
| Customer Delivery Fee | Fixed + distance-based component | AED 5 base + AED 1.5/km beyond 3km |
| Driver Payout | Base + distance + time component | AED 8 base + AED 2/km + AED 0.30/min waiting |

**Phase 1:** Commission and delivery fees are hardcoded system parameters (configurable via admin).
**Phase 2+:** Dynamic pricing based on demand, distance, and restaurant tier.
**Driver settlement:** Weekly payout calculation. Restaurant settlement: Bi-weekly, minus commission.
```

### Section to Add: Competitive Landscape

```markdown
## Competitive Landscape

| Competitor | Strength | Weakness | LightBite Differentiator |
|---|---|---|---|
| Talabat | Market leader, brand recognition | 20-30% commission, no direct customer relationship for restaurants | Lower commission, restaurant brand ownership |
| Deliveroo | Strong rider network | Limited to premium segments | Broader restaurant inclusion |
| Zomato | Discovery + reviews | Delivery not core competency in all markets | Integrated three-sided experience |
| Noon Food | E-commerce synergy | New entrant, limited coverage | Full-stack transparency, real-time tracking |
```

### Section to Add: Target Scale

```markdown
## Target Scale

| Phase | Users | Restaurants | Drivers | Daily Orders | Geography |
|---|---|---|---|---|---|
| Phase 1 (MVP) | 1,000 | 20 | 30 | 50 | Dubai Marina + Jumeirah |
| Phase 2 (Growth) | 10,000 | 100 | 150 | 500 | Dubai metro |
| Phase 3 (Scale) | 100,000 | 500 | 1,000 | 5,000 | UAE |
| Phase 4 (Regional) | 500,000+ | 2,000+ | 5,000+ | 25,000+ | GCC |
```

### Section to Rewrite: Success Metrics

```markdown
## Success Metrics

| Metric | Measurement Definition | Target | Timeframe |
|---|---|---|---|
| Order-to-delivery time | Time from `order.confirmed` event to `order.delivered` event, p50 | < 35 min | Within 3 months |
| Order-to-delivery time (p95) | Same measurement, p95 | < 55 min | Within 3 months |
| Restaurant onboarding time | Time from registration submit to first published menu item | < 1 hour | Self-serve |
| Driver job acceptance rate | (Accepted jobs / Offered jobs) × 100, rolling 7-day window | > 85% | Ongoing |
| Order accuracy rate | (Orders without customer complaint / Total orders) × 100 | > 98% | Ongoing |
| Customer repeat order rate | Customers with ≥2 orders in 30 days / Total active customers | > 40% | Within 3 months |
| Platform API uptime | (Total minutes - Downtime minutes) / Total minutes × 100 | 99.9% | Ongoing |
| Restaurant rejection rate | (Rejected orders / Total orders) × 100 | < 5% | Ongoing |
```

---

# DOCUMENT 2: 02-prd.md

## Overall Score

| Dimension | Score | Notes |
|---|---|---|
| Completeness | 6 | Missing commission model, delivery fee, admin features, rating system |
| Product Design | 7 | Good feature breakdown, clear user journeys |
| Engineering Quality | 6 | Missing API resource model, no data relationships defined |
| Scalability | 5 | Queue-backed async mentioned but no detail on architecture |
| Security | 5 | Mentioned but not detailed (delegated to NFRs) |
| Clarity | 7 | Well-organized, feature tables are clear |
| Maintainability | 7 | Feature IDs enable traceability |

## Findings

### Critical

**C02-PRD-001: Laravel vs NestJS Contradiction**
2.1 specifies "Backend API: Laravel (PHP)" but the system index recommends NestJS. This single contradiction blocks all backend work.
- **Fix:** Resolve at the vision level. If Laravel, justify. If NestJS, update this document.

**C02-PRD-002: No Commission/Fee Model**
The PRD lists payments (P1-P5) but never defines the business rules: what percentage does the platform take? How are drivers paid? How are delivery fees calculated?
- **Fix:** Add section 3.10 "Platform Economics" defining commission rate, delivery fee structure, driver pay formula.

**C02-PRD-003: Rating/Review System Missing**
Section 2.1 says customers "Rate and review completed orders" but section 3 has NO features for ratings/reviews. User stories also lack this.
- **Fix:** Add section 3.10 for Rating & Review features.

### High

**H02-PRD-001: User Journey Missing Failure Paths**
All three user journeys show happy paths only. No journey shows: restaurant rejects order, driver can't find address, payment fails, order arrives late/wrong.
- **Fix:** Add failure path journeys for each role.

**H02-PRD-002: "What Success Looks Like" Is Not Testable**
"Functional and tested" is ambiguous. Define specific test criteria.
- **Fix:** "All 45 user stories pass acceptance tests. API endpoints have ≥90% test coverage. End-to-end order flow completes without errors in 10 consecutive test runs."

**H02-PRD-003: Multiple Platforms in Phase 1 Contradicts Roadmap**
Component table lists Flutter as Phase 1 for Customer App, but roadmap shows Phase 1 is backend only. Flutter is Phase 2.
- **Fix:** Synchronize platform phase assignments with roadmap.

### Medium

**M02-PRD-001: Admin Panel Listed But Not Defined**
Admin Panel appears in component table but zero features, personas, or stories reference it.
- **Fix:** Either define admin features or explicitly mark as "Phase 4+ — Out of scope for Phase 1."

**M02-PRD-002: NFR Summary Is Too Compressed**
The NFR summary table in section 4 is a 4-row distillation of what becomes a full document. At minimum, cross-reference the full NFR document.
- **Fix:** Add: "See [06 — Non-Functional Requirements](06-non-functional-requirements.md) for detailed NFRs."

**M02-PRD-003: Missing Feature Dependencies**
No indication that Payments (section 3.4) depends on Orders (3.3) which depends on Cart (3.3) which depends on Menu (3.2).
- **Fix:** Add dependency matrix or note in each section.

**M02-PRD-004: R7 Duplicate Feature**
"Menu item customization notes" (R7, P1) and "Add special instructions per item" (C4, P1) describe the same capability.
- **Fix:** Consolidate into one feature definition.

### Low

**L02-PRD-001: "Vue or React SPA" Unresolved**
Dashboard framework is stated as "Vue or React SPA." This ambiguity defers a decision that affects the roadmap sprint planning.
- **Fix:** Make a decision or add decision criteria + deadline.

**L02-PRD-002: Push Notification P1 vs Story P0 Mismatch**
"N4: Driver arriving notification" is P1 but all push notification user stories in 04-user-stories are P0.
- **Fix:** Normalize priority between documents.

---

## Improved Version — Sections Requiring Rewrite

### Section to Add: 3.10 Rating & Reviews

```markdown
### 3.10 Rating & Reviews

| ID | Feature | Priority |
|---|---|---|
| RV1 | Customer rates order (1-5 stars) after delivery | P1 — Should Have |
| RV2 | Customer writes text review for order | P1 — Should Have |
| RV3 | Restaurant average rating displayed on discovery cards | P1 — Should Have |
| RV4 | Restaurant owner views all ratings and reviews | P1 — Should Have |
| RV5 | Restaurant owner reports inappropriate review | P2 — Phase 2 |
| RV6 | Driver rating after delivery completion | P2 — Phase 2 |
```

### Section to Add: 3.11 Platform Economics

```markdown
### 3.11 Platform Economics

| ID | Feature | Priority |
|---|---|---|
| EC1 | Platform commission applied per order (configurable %) | P0 — Must Have |
| EC2 | Delivery fee calculation (base + distance component) | P0 — Must Have |
| EC3 | Order total = subtotal + delivery fee + tax | P0 — Must Have |
| EC4 | Driver earnings per job (base + distance + time) | P1 — Should Have |
| EC5 | Restaurant settlement reporting | P2 — Phase 2 |
| EC6 | Driver payout tracking and history | P2 — Phase 2 |
| EC7 | Promo codes / discount system | P3 — Phase 3 |
```

### Section to Rewrite: Component Table

```markdown
| Component | Audience | Platform(s) | Phase |
|---|---|---|---|
| Customer App | End customers ordering food | Flutter (Phase 2), React Native (Phase 4), Android Native + iOS Native (Phase 5), Ionic (Phase 6) | Phase 2 |
| Restaurant Dashboard | Restaurant owners managing orders and menus | Web (Vue SPA) | Phase 3 |
| Driver App | Delivery drivers accepting and fulfilling jobs | Flutter (Phase 2), React Native (Phase 4), Android Native + iOS Native (Phase 5) | Phase 2 |
| Backend API | Shared backend for all clients | Laravel (PHP) | Phase 1 |
| Admin Panel | Platform administrators | Web (Vue SPA) | Phase 7 |
```

---

# DOCUMENT 3: 03-personas.md

## Overall Score

| Dimension | Score | Notes |
|---|---|---|
| Completeness | 5 | Missing admin, support, and edge-case personas; no quantitative data |
| Product Design | 7 | Good narratives, scenarios bring personas to life |
| Engineering Quality | 4 | No technical constraints mapped to personas (device, connectivity, accessibility) |
| Scalability | 3 | No indication of persona population sizes |
| Security | 3 | No security requirements per persona |
| Clarity | 8 | Well-formatted, easy to scan |
| Maintainability | 6 | Simple structure, but will need updates as product grows |

## Findings

### Critical

**C03-PER-001: Missing Admin/Operations Persona**
The platform will have administrators managing restaurants, drivers, disputes, and platform configuration. No persona exists for this role.
- **Fix:** Add P4: Admin persona.

**C03-PER-002: Missing Support/Customer Service Persona**
With three user types transacting, disputes will occur. Who handles them? What tools do they need?
- **Fix:** Add P5: Support Agent persona or explicitly scope support to Phase 3+.

### High

**H03-PER-001: Persona Demographics Not Linked to Market**
Ahmed runs a "Lebanese restaurant" in Jumeirah, Sarah is in "Dubai Marina," Khalid is in "Al Nahda" — but no market data supports these being representative.
- **Fix:** Add note: "These personas are based on typical food delivery users in Dubai. Quantitative validation through user research is planned for Phase 0."

**H03-PER-002: Accessibility Needs Not Addressed**
None of the personas have accessibility requirements (visual, motor, cognitive). A real product must consider these.
- **Fix:** Add an accessibility note to each persona or an anti-persona who cannot use the app without accessibility features.

**H03-PER-003: Khalid's "Zone Preference" Not in Features**
Khalid's goal: "Choose delivery zones near his home or university." This is NOT reflected in any FR or user story.
- **Fix:** Either add zone preference as a feature or remove from persona.

**H03-PER-004: No "Anti-Persona" or Negative Personas**
No definition of who the product is NOT for — important for scope control.
- **Fix:** Add anti-personas (e.g., "Someone who wants to pay cash on delivery" — explicitly out of scope Phase 1).

### Medium

**M03-PER-001: Connectivity Assumptions Contradictory**
Summary matrix says Sarah is "Always online (5G/WiFi)" but Khalid has "Mobile data, sometimes patchy." Yet no offline features are prioritized for the driver app.
- **Fix:** Add explicit offline requirements for the driver persona.

**M03-PER-002: "Not Very Technical" Ahmed Needs Quantification**
"Not very technical but his son helps him" is vague. What can Ahmed do independently? What requires assistance?
- **Fix:** Define technical boundaries: "Ahmed can: tap buttons, read notifications, fill simple forms. Ahmed cannot: configure settings, troubleshoot connectivity, read dense tables."

**M03-PER-003: Persona Summary Matrix Missing Security/Privacy Columns**
The summary matrix covers goals, platform, tech comfort, session length, connectivity — but NOT privacy concerns or security requirements per persona.
- **Fix:** Add rows for "Privacy concern" and "Security requirement."

### Low

**L03-PER-001: Sarah's iPad Mentioned But Never Addressed**
"iPad at home" — does the app support tablets? This creates a design implication never explored.
- **Fix:** Add note: "Phase 1 is phone-optimized. Tablet support for Customer App is Phase 3."

**L03-PER-002: Khalid's "Battery Life" Concern Not Actionable**
"Battery life matters" — this is a valid concern but no specific target is set for battery consumption.
- **Fix:** Cross-reference NFR-MB02 battery target.

---

## Missing Content — Production-Ready

### P4: Layla — The Platform Administrator

```markdown
### P4: Layla — The Platform Administrator

| Attribute | Detail |
|---|---|
| **Age** | 34 |
| **Occupation** | Operations Manager at LightBite |
| **Location** | Dubai Internet City |
| **Tech Comfort** | High — experienced with admin tools |
| **Device** | MacBook Pro, iPhone |

**Bio:** Layla manages the day-to-day operations of the LightBite platform. She onboards new restaurants, verifies driver documents, handles escalated disputes, and monitors platform health. She needs a dashboard that gives her a bird's-eye view of: active orders, driver availability, restaurant performance, and revenue.

**Goals:**
- Review and approve/reject restaurant and driver registrations
- Monitor platform metrics (orders, revenue, incidents) in real time
- Handle escalated customer complaints and refund requests
- Suspend or ban problematic users (customers, restaurants, drivers)
- Configure platform parameters (commission rates, delivery zones, surge pricing)

**Frustrations:**
- Not being able to see the full lifecycle of a disputed order
- Having to run SQL queries to get basic operational metrics
- No audit trail when someone changes a platform configuration

**Scenario:**
> Layla receives an alert that a customer has disputed an order — the food never arrived but the driver marked it delivered. She opens the order timeline, sees the GPS breadcrumb trail, driver chat log, and customer message history. She issues a full refund and adds a note to the driver's file. The entire resolution takes under 3 minutes.
```

### P5: Fatima — The Customer Support Agent (Phase 3+)

```markdown
### P5: Fatima — The Customer Support Agent

| Attribute | Detail |
|---|---|
| **Age** | 24 |
| **Occupation** | Customer Support Agent |
| **Location** | Remote |
| **Tech Comfort** | Medium |
| **Device** | Windows laptop |

**Bio:** Fatima handles 40-60 support tickets per shift across chat, phone, and email. She needs quick access to order details, customer history, and resolution tools. Most issues are: missing items, late deliveries, refund requests, and app problems.

**Goals:**
- Look up any order by ID, customer name, or phone number
- See full order timeline and every status transition
- Issue refunds, credits, or apologies with manager approval for amounts > AED 100
- Contact drivers and restaurants directly when orders go wrong
- Escalate complex cases to Layla

**Platform:** Web-based support dashboard. **Phase:** Target Phase 3.
```

---

# DOCUMENT 4: 04-user-stories.md

## Overall Score

| Dimension | Score | Notes |
|---|---|---|
| Completeness | 5 | Missing epics for reviews, admin, platform economics, disputes, favorites |
| Product Design | 6 | Good coverage of core flows, acceptance criteria are present but thin |
| Engineering Quality | 5 | Stories lack technical acceptance criteria (API contracts, error codes) |
| Scalability | 3 | No stories about multi-tenancy, data isolation, or platform limits |
| Security | 3 | No stories about permission enforcement, data access control |
| Clarity | 7 | Well-structured, consistent format |
| Maintainability | 7 | Good use of IDs, epic groupings |

## Findings

### Critical

**C04-UST-001: Missing Epic — Rating & Reviews**
PRD section 2.1, customer goal "Rate and review completed orders." Zero user stories exist for this.
- **Fix:** Add Epic 10: Rating & Reviews (minimum: rate order, view restaurant rating).

**C04-UST-002: Missing Epic — Platform Economics**
No stories for: delivery fee display, commission application, driver earnings calculation, receipt with fee breakdown.
- **Fix:** Add stories for economic transparency at each role level.

**C04-UST-003: Missing Admin Stories**
Persona missing → admin stories missing. No stories for: restaurant verification, driver verification, dispute resolution, platform configuration.
- **Fix:** Add admin epic with minimum viable stories for Phase 1 (verification, basic monitoring).

**C04-UST-004: Restaurant Verification Story Missing**
US-A05 says restaurant account is created "pending verification" — but NO story describes who verifies or how.
- **Fix:** Add verification story with acceptance criteria.

### High

**H04-UST-001: Acceptance Criteria Lack Error Cases**
US-O03: "Given valid card details, when I pay, then payment is processed" — what happens when the card is declined? When Stripe is down?
- **Fix:** Add error acceptance criteria to every story where a failure mode exists.

**H04-UST-002: US-T07 Driver Decline Path Incomplete**
"When I decline, the next driver is notified" — but what happens after 3 declines? What if no driver is available?
- **Fix:** Add: "Given I'm the 3rd driver to decline, when I decline, the order is system-cancelled and the customer is notified."

**H04-UST-003: US-O04 Missing Payment Failure**
"Given a successful order" — no story for an unsuccessful order. Payment can fail after Stripe processing.
- **Fix:** Add US-O05: "As a customer, I want to see a clear error message when payment fails so that I can try again or use a different card."

**H04-UST-004: No Cross-Role Story**
Every story is single-role. No story like: "As a customer, when the restaurant rejects my order, I receive a notification and refund" — this tests the integration.
- **Fix:** Add cross-role integration stories that span two or three roles.

**H04-UST-005: "Favorites" / "Reorder" Missing**
Sarah's persona explicitly states "Reorder from favorites with one tap" — no user story for saving favorites or reordering.
- **Fix:** Add favorite restaurant and reorder stories or explicitly mark as Phase 2.

### Medium

**M04-UST-001: Driver Earnings Display Missing**
Khalid's persona is obsessed with earnings clarity — but no story explicitly says "As a driver, I want to see estimated earnings before accepting a job."
- **Fix:** Add to US-T06 acceptance criteria or create dedicated earnings story.

**M04-UST-002: Restaurant Pause/Capacity Missing**
Ahmed wants to "pause orders when the kitchen is at capacity" — no story for temporarily closing or pausing.
- **Fix:** Add US-RM06: "As a restaurant owner, I want to temporarily pause incoming orders so I can catch up during rush."

**M04-UST-003: No Search-by-Menu-Item Story**
US-R02 only searches restaurants by name/cuisine. No story for "search 'shawarma' and see which restaurants have it."
- **Fix:** Add US-R05 for menu item search.

**M04-UST-004: Cart Expiry Story Missing**
FR-C01 says "Cart expires after 24 hours of inactivity" — no user story covers this behavior.
- **Fix:** Add US-C07: "As a customer, I want to be warned when my cart is about to expire so I don't lose my selections."

**M04-UST-005: Story Point Summary Shows No Estimates**
The table says "Story Points" but shows only story counts. No effort estimation.
- **Fix:** Either add story point estimates (Fibonacci) or rename column to "Story Count."

### Low

**L04-UST-001: US-A01 "Receive a Confirmation" Ambiguous**
Does this mean email confirmation? In-app confirmation? Both?
- **Fix:** "I receive a confirmation email and see the home screen."

**L04-UST-002: US-N03 "New Nearby Job" Requires Definition**
"When it's assigned to me" — but the dispatch algorithm broadcasts to a pool, not assigns.
- **Fix:** "When a nearby job is available and I'm in the driver pool."

---

## Missing Content — Production-Ready

### Epic 10: Rating & Reviews (Phase 1 Minimum)

```markdown
## Epic 10: Rating & Reviews

| ID | Story | Acceptance Criteria |
|---|---|---|
| US-RV01 | As a customer, I want to rate my completed order (1-5 stars) so that I can share my experience. | Given a delivered order, when I tap a star rating, then the rating is saved and displayed on the order detail. |
| US-RV02 | As a customer, I want to see the average rating of a restaurant so that I can decide where to order. | Given restaurant discovery, when I view a restaurant card or detail, then the average rating (1.0-5.0) and review count are displayed. |
| US-RV03 | As a restaurant owner, I want to see my ratings and reviews so that I can improve my service. | Given the dashboard, when I view ratings, then I see my average rating, review count, and recent reviews sorted by date. |
```

### Epic 11: Platform Economics (Phase 1 Minimum)

```markdown
## Epic 11: Platform Economics

| ID | Story | Acceptance Criteria |
|---|---|---|
| US-EC01 | As a customer, I want to see the delivery fee before paying so that I understand the total cost. | Given checkout, when I review the order, then the delivery fee is shown as a separate line item from the food subtotal. |
| US-EC02 | As a driver, I want to see the earnings for a job before accepting so that I can decide if it's worth my time. | Given a job notification, when it appears, then estimated earnings (AED), total distance (km), and pickup/dropoff locations are shown. |
| US-EC03 | As a restaurant owner, I want to see the platform commission deducted from my order revenue so that I understand my net earnings. | Given the earnings dashboard, when I view a completed order, then gross amount, commission %, commission amount, and net amount are shown. |
```

### Epic 12: Admin & Verification (Phase 1 Minimum)

```markdown
## Epic 12: Admin & Verification

| ID | Story | Acceptance Criteria |
|---|---|---|
| US-AD01 | As an admin, I want to review and approve/reject restaurant registrations so that only legitimate restaurants use the platform. | Given a pending restaurant registration, when I review the submitted details and documents, then I can approve (restaurant becomes active) or reject with a reason. |
| US-AD02 | As an admin, I want to review and approve/reject driver registrations so that only verified drivers deliver orders. | Given a pending driver registration, when I review license and vehicle documents, then I can approve or reject with a reason. |
| US-AD03 | As an admin, I want to view a dashboard of active orders so that I can monitor platform health. | Given the admin panel, when I view the dashboard, then I see: active order count, online driver count, active restaurant count, and any orders stuck in a status for > 10 minutes. |
```

---

# DOCUMENT 5: 05-functional-requirements.md

## Overall Score

| Dimension | Score | Notes |
|---|---|---|
| Completeness | 7 | Strong on core flows; missing reviews, admin, economics, conflict resolution |
| Product Design | 7 | Well-thought-out status machine and business rules |
| Engineering Quality | 8 | Good validation rules, error codes, state transitions |
| Scalability | 6 | Some scaling considerations (Haversine, cache strategy) but no sharding/multi-region |
| Security | 6 | Rate limiting, token rotation, GPS verification; missing RBAC details |
| Clarity | 8 | Excellent state machine diagram, clear input/output tables |
| Maintainability | 7 | Good ID system, structured format |

## Findings

### Critical

**C05-FR-001: Commission/Fee Calculation Missing**
FR-O01 defines order placement and FR-P01 defines payment flow — but neither defines how the order total is calculated. Where is: subtotal, delivery fee, tax, commission?
- **Fix:** Add FR-EC section defining all monetary calculations.

**C05-FR-002: GPS Verification Radius Hardcoded**
FR-O02: "GPS verified within 100m" — 100m is inappropriate for dense urban areas (Dubai Marina). A driver could be in the wrong building. Also, GPS accuracy on mid-range Android devices can be 10-50m. 100m tolerance could allow false confirmations.
- **Fix:** "GPS verified within 50m. If GPS accuracy is > 30m, require additional confirmation (photo or PIN)."

**C05-FR-003: No Idempotency for Order Placement**
FR-O01 has a rollback for payment pre-auth failure, but no idempotency key. A retry could create duplicate orders.
- **Fix:** Add client-generated idempotency key to order placement request. Duplicate key returns existing order.

**C05-FR-004: 2-Minute Auto-Reject Missing User Notification**
FR-O02 transitions show restaurant must act within 2 minutes — but what happens at 2:01? Auto-reject? Who is notified?
- **Fix:** "If restaurant does not act within 2 minutes, order is auto-rejected. Customer receives push notification and email. Refund is automatic."

### High

**H05-FR-001: Price Re-verification Race Condition**
FR-C02: "Prices are re-verified against current menu prices" at checkout. What happens if a price changed between add-to-cart and checkout?
- **Fix:** "If current price > cart price: notify customer of price change, allow proceed or cancel. If current price < cart price: use lower price automatically."

**H05-FR-002: No Delivery Fee Model**
The minimum order amount is AED 20, but no delivery fee structure is defined. Is delivery free above a threshold? Fixed fee? Distance-based?
- **Fix:** Define delivery fee calculation.

**H05-FR-003: Missing WebSocket Event for Driver Decline**
FR-W01 lists 9 events. Missing: `driver.declined` — the dispatch algorithm needs to know when a driver declines to try the next driver.
- **Fix:** Add `driver.declined` event: `{order_id, driver_id, reason?}`.

**H05-FR-004: FR-D01 Dispatch Algorithm Has Starvation Risk**
"Nearest driver first" — a driver in a low-density area may never get jobs. This creates a fairness issue.
- **Fix:** Add round-robin weighting: nearest driver gets priority but with a fairness factor that boosts drivers who've waited longest.

**H05-FR-005: Order Cancellation After "Preparing" Undefined**
FR-O03: "Customer cancels after restaurant confirms → Partial refund (minus preparation cost)" — but "preparation cost" is never defined. Is it a fixed %? A restaurant-set amount?
- **Fix:** "Partial refund = order total minus AED 5 preparation fee (configurable system parameter)."

**H05-FR-006: No Order Modification After Placement**
Once an order is placed, can a customer modify it (add an item, change quantity) before the restaurant accepts?
- **Fix:** Add: "Customer may modify order only when status = pending. Modification resets the 2-minute restaurant timer."

### Medium

**M05-FR-001: Cart "Different Restaurant" Warning Has No Recovery**
FR-C01: "Cannot add items from multiple restaurants (clear cart on restaurant change with confirmation)." But if a user has built a cart at Restaurant A and taps Restaurant B, do they lose the cart? Can they save it?
- **Fix:** "On restaurant change with items in cart: show dialog 'Switching restaurants will clear your current cart from [Restaurant A]. Continue?' Options: 'Clear and Switch' or 'Keep Cart.'"

**M05-FR-002: FR-M02 Haversine Is Inefficient at Scale**
"Calculate Haversine on all restaurants" — at 500+ restaurants, this is a full table scan per request.
- **Fix:** "Phase 1: Haversine with bounding box pre-filter. Phase 2+: Geospatial index (MySQL Spatial or PostGIS)."

**M05-FR-003: Delivery Address Validation Missing**
FR-U02 defines address fields but no validation of whether the address is within the service area.
- **Fix:** "Address coordinates validated against service area polygon. Addresses outside service area return error: 'This location is outside our delivery zone.'"

**M05-FR-004: FR-N01 Multi-Device Push Duplication**
"Notifications sent to all" — if a user has the app on phone and tablet, they get duplicate push notifications.
- **Fix:** "Send push to most recently active device only. If delivery is within 30s and no response, send to all devices."

**M05-FR-005: Image Upload Has No Malware Scanning in Phase 1**
FR-F01 mentions strip EXIF and resize — but NFR-S07 requires malware scan. Contradiction.
- **Fix:** Add to FR-F01: "Uploads scanned via ClamAV (or cloud equivalent) before storage."

**M05-FR-006: No Refund Timeline**
FR-O03 defines refund scenarios but never says how long a refund takes.
- **Fix:** Add: "Refunds processed within 5 business days via Stripe. In-app refund status visible within 1 hour."

### Low

**L05-FR-001: Password Validation Missing Common Restrictions**
"min 8 chars, 1 uppercase, 1 number" — industry standard now includes: no common passwords, no breached passwords (HaveIBeenPwned).
- **Fix:** Add to FR-A01: "Password checked against common password list (top 10,000). Breached password check deferred to Phase 2."

**L05-FR-002: FR-A01 Email Confirmation Not Defined**
"Email confirmation sent" — what is the expiry? What if the user doesn't confirm?
- **Fix:** "Confirmation link expires in 24 hours. Unconfirmed accounts cannot place orders. Re-send confirmation available after 60 seconds."

**L05-FR-003: FR-S01 Search "2 Characters Minimum" May Return Too Many Results**
At 500+ restaurants, 2-character search is nearly unfiltered.
- **Fix:** "Minimum 2 characters. If results > 50, prompt user to refine search."

**L05-FR-004: FR-M03 Fallback "× 1.4 Road Factor" Is Crude**
This can be wildly inaccurate in Dubai (highways vs Marina grid).
- **Fix:** "Fallback uses cached distance matrix values with same origin-destination pairs (1 hour TTL) before applying road factor."

---

## Missing Content — Production-Ready

### FR-EC: Platform Economics

```markdown
## 13. Platform Economics

### FR-EC01: Order Total Calculation

| Field | Requirement |
|---|---|
| **Formula** | `order_total = subtotal + delivery_fee + tax - discount` |
| **Subtotal** | Sum of (item_price × quantity) for all items. Verified against current menu at checkout. |
| **Delivery fee** | `base_fee + (per_km_rate × max(0, distance_km - included_km))`. Phase 1: AED 5 base, AED 1.5/km beyond 3km. |
| **Tax (VAT)** | 5% on subtotal + delivery fee (UAE VAT). Configurable rate per jurisdiction. |
| **Discount** | Promo codes (Phase 2). Not applicable in Phase 1. |

### FR-EC02: Commission Calculation

| Field | Requirement |
|---|---|
| **Formula** | `commission_amount = subtotal × commission_rate` |
| **Rate** | 12% default. Configurable per restaurant (admin override). |
| **Application** | Deducted from restaurant settlement. Not visible to customer. |
| **Restaurant net** | `restaurant_net = subtotal - commission_amount` |

### FR-EC03: Driver Earnings Calculation

| Field | Requirement |
|---|---|
| **Formula** | `driver_earnings = base_pay + (per_km_rate × total_distance_km)` |
| **Base pay** | AED 8 per job |
| **Per km rate** | AED 2/km |
| **Total distance** | Restaurant → Customer distance (driving, not straight-line) |
| **Display** | Estimated earnings shown before acceptance. Actual earnings (recalculated with actual distance) shown after delivery. |
| **Discrepancy** | If actual > estimated by > 20%, difference credited. If actual < estimated, no clawback. |
```

### FR-RV: Rating & Reviews

```markdown
## 14. Rating & Reviews

### FR-RV01: Order Rating

| Field | Requirement |
|---|---|
| **Who** | Customer only |
| **When** | After order status = delivered. Available for 7 days after delivery. |
| **Scale** | 1-5 stars (integer). 1 = terrible, 5 = excellent. |
| **Optional text** | Review text, max 500 characters. Not required to submit rating. |
| **Rules** | One rating per order. Cannot edit after 24 hours. Cannot delete (contact support). |

### FR-RV02: Restaurant Rating Calculation

| Field | Requirement |
|---|---|
| **Display** | Average of last 100 ratings, rounded to 1 decimal (e.g., 4.3) |
| **Update** | Recalculated on each new rating (async, within 60 seconds). |
| **Empty state** | "New" badge (no "0.0" display). |
```

### FR-DP: Dispute & Conflict Resolution

```markdown
## 15. Dispute Resolution

### FR-DP01: Order Dispute Flow

| Field | Requirement |
|---|---|
| **Triggers** | Customer reports: order not delivered, wrong items, missing items, food quality issue |
| **Flow** | Submit dispute → Support reviews → Refund/deny → Notify both parties |
| **Evidence** | Customer can upload photos (max 3, 5MB each). Driver GPS trail automatically attached. |
| **Timeline** | Resolution target: 2 hours for missing delivery, 24 hours for quality disputes. |
| **Appeal** | Restaurant/driver can appeal within 48 hours with counter-evidence. |

### FR-DP02: Auto-Resolution Rules

| Scenario | Resolution |
|---|---|
| Driver confirmed delivery but customer GPS shows driver never arrived within 200m | Auto-refund, flag driver account |
| Restaurant rejected 5+ orders in 24 hours | Auto-flag for admin review |
| Customer disputed 3+ orders in 7 days | Auto-flag for admin review |
```

---

# DOCUMENT 6: 06-non-functional-requirements.md

## Overall Score

| Dimension | Score | Notes |
|---|---|---|
| Completeness | 7 | Strong across most categories; missing DR, compliance, load testing targets |
| Product Design | 7 | Good structure covering all key NFR categories |
| Engineering Quality | 7 | Concrete targets with measurement methods |
| Scalability | 7 | Stateless design, queue-backed, Redis caching — good foundation |
| Security | 7 | Good coverage of TLS, hashing, rate limiting, input validation |
| Clarity | 8 | Well-organized tables with IDs |
| Maintainability | 8 | Good ID system, clear structure |

## Findings

### Critical

**C06-NFR-001: No Disaster Recovery Plan**
NFR-A04 says "Zero order loss" via queue-backed writes — but what about database corruption, data center failure, or ransomware?
- **Fix:** Add section on disaster recovery: RPO, RTO, backup strategy, restore testing.

**C06-NFR-002: No Data Residency / Compliance**
The product targets Dubai/UAE. UAE has data protection laws (PDPL). GDPR applies if any EU customers use the platform. No compliance section exists.
- **Fix:** Add compliance section mapping applicable regulations and compliance requirements.

### High

**H06-NFR-001: 99.9% Uptime Is Undefined**
"99.9%" = 8.76 hours downtime/year. But is this measured per component? End-to-end? During business hours only?
- **Fix:** "API uptime: 99.9% measured as (successful health check responses / total health checks) over a 30-day rolling window, excluding planned maintenance windows (max 2 hours/month, announced 48 hours in advance)."

**H06-NFR-002: NFR-A03 "WebSocket Down → Polling Fallback" Not Specified**
What polling interval? Does the client auto-switch back to WebSocket? Is there a user-visible indicator?
- **Fix:** Add polling specification: "Poll every 15 seconds on WebSocket disconnect. Auto-reconnect WebSocket with exponential backoff. Display 'Reconnecting...' indicator if disconnected > 15 seconds."

**H06-NFR-003: No Load Testing Targets**
Performance targets exist (200ms p95) but no concurrent user targets for load testing.
- **Fix:** "Phase 1 load test target: 100 concurrent users, 50 active orders, 20 WebSocket connections. Phase 2: 1,000 concurrent. Phase 3: 10,000 concurrent."

**H06-NFR-004: Backup Strategy Incomplete**
"Daily backups, retained 30 days" — but what about point-in-time recovery? Transaction logs?
- **Fix:** "Daily full backups + continuous WAL archiving (point-in-time recovery). Backups stored in separate geographic region. Restore tested monthly."

### Medium

**M06-NFR-001: NFR-MB01 "Cached Data Display" Undefined**
What data is cached offline? How stale can it be? Is there a staleness indicator?
- **Fix:** "Offline cache: restaurant list (stale if > 1 hour), menu items (stale if > 30 min), past orders (always available). Staleness indicator shown as banner: 'Showing cached data from 15 min ago.'"

**M06-NFR-002: NFR-DP02 Account Deletion Conflicts with Financial Records**
"Hard-delete after 30 days" — but financial records (orders, payments) must be retained for tax/audit purposes (typically 5-7 years in UAE).
- **Fix:** "Account PII hard-deleted after 30 days. Order and payment records anonymized (linked to anonymous UUID) and retained for 7 years per UAE tax law."

**M06-NFR-003: NFR-S05 Rate Limiting Too Coarse**
"API: 60 req/min per user" — a driver updating location every 10 seconds uses 6 req/min just for location. Add an order and it's trivially easy to hit 60 during active delivery.
- **Fix:** "General API: 120 req/min per authenticated user. Auth endpoints: 5 req/min per IP. Location update endpoint: 30 req/min (accounts for 10s interval + overhead). WebSocket events: not rate-limited (authenticated connection)."

**M06-NFR-004: No API Versioning Deprecation Policy**
"Breaking changes = new version" — but how long are old versions supported? How are consumers notified?
- **Fix:** "API versions supported for 6 months after successor release. Deprecation notice via response header `Sunset` and email to registered API consumers 90 days before shutdown."

### Low

**L06-NFR-001: NFR-P05 Image Loading Targets Ignore Network Conditions**
"Thumbnail < 1s" — on 3G this may be impossible. What network condition?
- **Fix:** "Thumbnail < 1s on 4G/LTE, < 3s on 3G. Full image < 3s on 4G/LTE, < 8s on 3G."

**L06-NFR-002: NFR-O04 Monitoring Tool Undecided**
"Sentry/DataDog candidate" — pick one for Phase 1.
- **Fix:** "Phase 1: Sentry for error tracking, Laravel Telescope for dev monitoring. Production APM (DataDog/NewRelic) deferred to Phase 2."

**L06-NFR-003: Missing SLA Definitions**
No Service Level Agreement defining response times for support tickets by severity.
- **Fix:** Add SLA section.

---

## Missing Content — Production-Ready

### Section to Add: 11. Disaster Recovery

```markdown
## 11. Disaster Recovery

| ID | Requirement | Target |
|---|---|---|
| NFR-DR01 | Recovery Time Objective (RTO) | < 4 hours for critical services (API, DB, WebSocket) |
| NFR-DR02 | Recovery Point Objective (RPO) | < 1 hour (max data loss) |
| NFR-DR03 | Backup frequency | Daily full + continuous WAL archiving |
| NFR-DR04 | Backup retention | 30 days rolling, monthly retained 1 year |
| NFR-DR05 | Geo-redundancy | Backups stored in separate geographic region from primary |
| NFR-DR06 | Restore testing | Full restore drill every 3 months |
| NFR-DR07 | Failover | Phase 1: manual. Phase 3: automated multi-AZ failover. |
```

### Section to Add: 12. Compliance

```markdown
## 12. Compliance

| ID | Regulation | Applicability | Requirement |
|---|---|---|---|
| NFR-C01 | UAE PDPL (Personal Data Protection Law) | All user PII | Data minimization, consent for processing, right to deletion |
| NFR-C02 | PCI-DSS | Payment card data | Cards never touch our servers. SAQ-A compliance via Stripe Elements. |
| NFR-C03 | GDPR | EU customers (future) | Data export, right to erasure, data processing agreement |
| NFR-C04 | UAE Tax Law | Financial records | Order/payment records retained 7 years |
| NFR-C05 | Cookie consent | Web dashboard | Consent banner for non-essential cookies (analytics) |
```

### Section to Add: 13. Service Level Agreements

```markdown
## 13. Service Level Agreements (SLA)

| Severity | Definition | Response Time | Resolution Time |
|---|---|---|---|
| Sev 1 — Critical | Platform completely unavailable or order processing stopped | 15 minutes | 2 hours |
| Sev 2 — Major | Core feature unavailable (e.g., payments, tracking) | 30 minutes | 8 hours |
| Sev 3 — Minor | Non-critical feature degraded | 4 business hours | 48 hours |
| Sev 4 — Cosmetic | UI glitch, typo, non-functional issue | 24 business hours | Next release |

**Hours:** Business hours (9am-6pm GST, Sun-Thu) for Sev 3-4. 24/7 for Sev 1-2.
```

### Section to Rewrite: NFR-S05 Rate Limiting

```markdown
| NFR-S05 | Rate limiting | General API: 120 req/min per authenticated user. Auth endpoints: 5 req/min per IP. Location updates: 30 req/min. WebSocket auth: 10 connections/min per user. Rate limit headers included in all responses: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`. |
```

---

# DOCUMENT 7: 07-product-roadmap.md

## Overall Score

| Dimension | Score | Notes |
|---|---|---|
| Completeness | 6 | Detailed sprint plans; missing risk register, dependencies, exit criteria |
| Product Design | 7 | Logical phasing, good milestone definitions |
| Engineering Quality | 5 | Aggressive backend timeline (4 weeks), no architecture decision points |
| Scalability | 4 | No scaling milestones or load testing phases |
| Security | 3 | Security treated as implicit; no security review gates |
| Clarity | 8 | Excellent visual timeline, clear sprint breakdowns |
| Maintainability | 6 | Will need updates as scope changes; no versioning |

## Findings

### Critical

**C07-RMP-001: Phase 1 (Backend) Timeline Is Unrealistic**
"Weeks 3-6" for the complete backend — 4 weeks for: auth, restaurants, menus, cart, orders, payments (Stripe), WebSocket, push notifications, driver assignment, geocoding, search, image upload, and all 45 user stories.
- **Fix:** Realistic estimate: 8-10 weeks for a production-grade backend with tests and documentation. Consider splitting Phase 1 into Phase 1a (Core: Auth, Restaurants, Menu, Cart, Orders) and Phase 1b (Real-time: WebSocket, Notifications, Driver Assignment, Maps).

**C07-RMP-002: No Testing Phase**
No sprint, week, or phase dedicated to testing. No mention of: unit tests, integration tests, API tests, E2E tests, load tests, security audit, UAT.
- **Fix:** Add testing as an explicit phase gate. "Phase 1 Gate: All API endpoints have integration tests. Core order flow has E2E test. Security scan passes with 0 critical/high findings."

**C07-RMP-003: No Risk Register**
No mention of risks: Stripe API changes, Google Maps pricing, WebSocket scaling issues, Flutter plugin incompatibilities, team skill gaps.
- **Fix:** Add risk register section.

### High

**H07-RMP-001: Phase 4 React Native Duplicates Without Learning**
"Week 15-18: React Native — reimplement everything." There's no sprint dedicated to extracting learnings from the Flutter implementation first.
- **Fix:** Add Phase 3.5 "Cross-Platform Retrospective" (1 week) before React Native implementation.

**H07-RMP-002: Offline Mode Deferred to Phase 7**
Offline resilience is a core product principle (Vision doc) and listed in NFR-MB01 — but implementation is pushed to "weeks 28+." This means the Flutter, React Native, Native, and Ionic implementations will be built without offline considerations, requiring rework.
- **Fix:** Move offline architecture and local storage patterns to Phase 0 or Phase 1. Implement basic offline cache in Phase 2 (Flutter) and replicate pattern forward.

**H07-RMP-003: No Phase Exit Criteria**
Each phase has a "Milestone" but no exit criteria. How do we know Phase 1 is truly done?
- **Fix:** Add Definition of Done per phase.

**H07-RMP-004: Restaurant Dashboard Too Late**
Phase 3 (weeks 13-14) is the restaurant dashboard. But during Phase 2 (weeks 7-12), restaurants need to manage menus and accept orders for the Flutter apps to be tested end-to-end.
- **Fix:** Build minimal restaurant dashboard in Phase 1 (order accept/reject + basic menu management). Full dashboard UX in Phase 3.

### Medium

**M07-RMP-001: No Architecture Decision Points**
Where are the ADRs (Architecture Decision Records) created? The roadmap mentions ADRs in Phase 6 but architectural decisions happen in Phase 0-1.
- **Fix:** Start ADRs in Phase 0. First ADRs: backend framework choice, WebSocket technology, caching strategy, API versioning.

**M07-RMP-002: No Observability/Monitoring Sprint**
Monitoring is deferred until "Sentry/DataDog candidate" in NFRs. Phase 1 backend should include basic observability from day 1.
- **Fix:** Add observability tasks to Phase 1 Sprint 1: structured logging, health check endpoint, error tracking setup.

**M07-RMP-003: CI/CD Deferred to Phase 7**
"CI/CD pipeline" listed as Phase 7 feature. This should be Phase 0.
- **Fix:** Set up CI/CD in Phase 0. Minimum: lint, test, build on every PR.

**M07-RMP-004: "Empty Projects Running" Milestone Too Vague**
Phase 0 milestone: "Empty projects running." What does "running" mean?
- **Fix:** "Laravel project: Docker Compose (PHP, MySQL, Redis) starts. Health endpoint returns 200. Flutter project: builds for iOS and Android. CI pipeline passes on PR."

### Low

**L07-RMP-001: Phase 5 Native Apps Timeline Aggressive**
6 weeks for BOTH Android (Kotlin) and iOS (Swift) native implementations. Even with a reference Flutter app to copy, rebuilding natively takes time.
- **Fix:** Extend to 10 weeks or reduce scope to essential screens only.

**L07-RMP-002: "Engineer Handbook Compilation" Has No Owner**
Phase 6 item 6.6 is important but no one is responsible.
- **Fix:** Assign ownership to each roadmap item.

**L07-RMP-003: Timeline Summary Doesn't Account for Rework**
27 weeks to Phase 6 completion assumes everything goes perfectly. Add 20-30% buffer.

---

## Missing Content — Production-Ready

### Section to Add: Risk Register

```markdown
## Risk Register

| ID | Risk | Probability | Impact | Mitigation | Owner |
|---|---|---|---|---|---|
| R1 | Backend framework decision delayed (Laravel vs NestJS) | High | Critical | Resolve in Phase 0 by [date]. Decision criteria: team expertise, ecosystem, performance, hiring. | Tech Lead |
| R2 | Stripe API not available in target market | Low | Critical | Verify Stripe availability for UAE before Phase 1. Fallback: Checkout.com or PayTabs. | Product Manager |
| R3 | Google Maps API cost exceeds budget at scale | Medium | High | Implement caching aggressively. Budget cap alerts. Fallback: Mapbox or OpenStreetMap for non-critical views. | Tech Lead |
| R4 | WebSocket scaling issues under load | Medium | High | Load test WebSocket with 500+ concurrent connections in Phase 1. Redis pub/sub from day one. | Backend Lead |
| R5 | Flutter plugin ecosystem gaps (background location, push) | Medium | Medium | Validate critical plugins in Phase 0 spike. Document workarounds. | Flutter Lead |
| R6 | Single developer bottleneck | High | High | Document everything. Design for handoff. All code reviewed. | Engineering Manager |
| R7 | Scope creep during implementation | Medium | Medium | Strict MVP definition. Feature freeze per phase. Change request process. | Product Manager |
```

### Section to Add: Phase Exit Criteria

```markdown
## Phase Exit Criteria (Definition of Done)

### Phase 0 — Foundation
- [ ] All 7 business documents approved
- [ ] System architecture document written and reviewed
- [ ] Database ERD complete with all v1 tables
- [ ] OpenAPI spec for all v1 endpoints
- [ ] Laravel project boots, health check returns 200, CI pipeline green
- [ ] Flutter project builds for iOS and Android
- [ ] Backend framework decision documented in ADR-001

### Phase 1 — Backend Core
- [ ] All 45 user stories have passing API integration tests
- [ ] Order lifecycle E2E test (place → accept → prepare → ready → assign → pickup → deliver) passes
- [ ] WebSocket events tested with 50 concurrent connections
- [ ] Stripe integration tested in test mode (pre-auth, capture, refund)
- [ ] Push notifications delivered to FCM test device
- [ ] Security scan: 0 critical, 0 high findings
- [ ] API docs (Swagger) published and accurate
- [ ] Postman collection with all endpoints + example requests
- [ ] Load test: 100 concurrent users, p95 < 200ms

### Phase 2 — Flutter Apps
- [ ] Customer can complete full order flow on iOS and Android
- [ ] Driver can complete full delivery flow on Android
- [ ] Real-time tracking works (WebSocket + Google Maps)
- [ ] Push notification + deep linking works
- [ ] App cold start < 2s on reference devices
- [ ] Offline: app displays cached data when connectivity lost, recovers gracefully
```

### Section to Rewrite: Phase 1 Timeline

```markdown
## Phase 1 — Backend Core (Weeks 3-12)

**Goal:** Laravel API fully functional. All v1 endpoints tested and documented.

### Sprint 1: Foundation + Auth (Weeks 3-4)
| # | Feature |
|---|---|
| 1.1 | Project structure, Docker, CI/CD pipeline |
| 1.2 | Database migrations + seeders |
| 1.3 | User registration (customer, restaurant, driver roles) |
| 1.4 | Login with JWT + refresh token rotation |
| 1.5 | Password reset flow |
| 1.6 | Profile CRUD + address management |
| 1.7 | Structured logging + health check + error tracking |
| 1.8 | API documentation (Swagger/OpenAPI) |

### Sprint 2: Restaurants & Menu (Weeks 5-6)
| # | Feature |
|---|---|
| 2.1 | Restaurant profile CRUD with image upload |
| 2.2 | Menu category CRUD |
| 2.3 | Menu item CRUD with image upload |
| 2.4 | Restaurant search (full-text) + nearby query (geospatial) |
| 2.5 | Business hours management |
| 2.6 | Basic restaurant dashboard (accept/reject orders, update status) |

### Sprint 3: Orders & Cart (Weeks 7-8)
| # | Feature |
|---|---|
| 3.1 | Cart API (add, update, remove, clear, cross-restaurant validation) |
| 3.2 | Order placement with idempotency, cart validation, pre-auth |
| 3.3 | Order status state machine (all transitions) |
| 3.4 | Order cancellation + refund logic |
| 3.5 | Stripe payment integration (pre-auth, capture, refund) |
| 3.6 | Receipt generation (in-app + email) |
| 3.7 | Order history + earnings views (all roles) |
| 3.8 | Platform economics (commission, delivery fee, driver pay calculation) |

### Sprint 4: Real-Time + Driver (Weeks 9-10)
| # | Feature |
|---|---|
| 4.1 | WebSocket server setup (Laravel Reverb + Redis pub/sub) |
| 4.2 | All order events (created, confirmed, status changes, driver events) |
| 4.3 | Driver assignment algorithm (nearest-first + fairness factor) |
| 4.4 | Driver location broadcasting + privacy controls |
| 4.5 | Push notification integration (FCM/APNs) |
| 4.6 | Deep linking configuration |

### Sprint 5: Quality + Hardening (Weeks 11-12)
| # | Feature |
|---|---|
| 5.1 | Integration tests for all endpoints |
| 5.2 | E2E test: full order lifecycle |
| 5.3 | WebSocket load test (100 concurrent connections) |
| 5.4 | Security scan + remediation |
| 5.5 | Performance profiling + query optimization |
| 5.6 | Postman collection + environment files |
| 5.7 | Deployment documentation |
| 5.8 | Phase 1 retrospective + ADR updates |

**Milestone:** Backend API complete. All 45 user stories supported with passing tests. Postman collection + Swagger docs accurate.
```

---

---

# CROSS-DOCUMENT ISSUES REPORT

## Issue Matrix

| # | Category | Documents Involved | Severity | Description |
|---|---|---|---|---|
| X01 | **Framework Contradiction** | system index, 02-prd | **CRITICAL** | System index recommends NestJS (TypeScript). 02-PRD specifies Laravel (PHP). These are mutually exclusive. Engineering cannot start until resolved. |
| X02 | **Missing Business Model** | 01-vision, 02-prd, 05-fr, 07-roadmap | **CRITICAL** | No document defines: commission rate, delivery fee formula, driver pay formula, tax handling. 05-FR has "minimum order AED 20" but no fee structure. |
| X03 | **Rating/Review System Gap** | 02-prd, 04-user-stories, 05-fr, 07-roadmap | **CRITICAL** | PRD (section 2.1) says customers can "Rate and review completed orders." Zero user stories exist. Zero FRs exist. Roadmap defers to Phase 7 but PRD implies Phase 1. |
| X04 | **Admin Persona & Features Missing** | 01-vision, 02-prd, 03-personas, 04-user-stories, 05-fr | **CRITICAL** | 02-PRD lists "Admin Panel" as component. Roadmap has admin in Phase 7. But no admin persona, no admin user stories, no admin FRs. Who verifies restaurants and drivers? |
| X05 | **Offline Mode Contradiction** | 01-vision, 06-nfr, 07-roadmap | **HIGH** | Vision: "Offline-resilient" is a core principle. NFR-MB01: detailed offline requirements. Roadmap: offline mode deferred to Phase 7 (week 28+). Flutter, RN, Native, Ionic all built before offline is implemented. |
| X06 | **Driver Zone Preference Dead End** | 03-personas, 02-prd, 04-user-stories, 05-fr | **HIGH** | Persona (Khalid): "Choose delivery zones near his home." Not in PRD features, user stories, or FRs. Either add or remove from persona. |
| X07 | **Favorite/Reorder Missing** | 03-personas, 04-user-stories, 05-fr | **HIGH** | Persona (Sarah): "Reorder from favorites with one tap." Zero stories or FRs for favorites/reorder. |
| X08 | **Restaurant Verification Workflow Undefined** | 02-prd, 04-user-stories, 05-fr | **HIGH** | US-A05/US-A07: accounts created "pending verification." No document describes the verification workflow. Manual? Automated? Document upload? |
| X09 | **Chat (Customer-Driver) Undefined** | 07-roadmap | **MEDIUM** | Roadmap Phase 7 includes "Chat (customer ↔ driver)" but no PRD feature, user story, or FR exists for chat. |
| X10 | **Restaurant Pause/Capacity Missing** | 03-personas, 02-prd, 04-user-stories | **MEDIUM** | Persona (Ahmed): "Pause orders when kitchen is at capacity." FR-R01 has "Closed (temporarily not accepting orders)" status but no user story for quick pause toggle. |
| X11 | **Push Notification Priority Inconsistency** | 02-prd, 04-user-stories | **LOW** | PRD: N4 "Driver arriving" is P1. User stories: all push notification stories are P0. |
| X12 | **Framework Decision for Dashboard** | 02-prd, 07-roadmap | **LOW** | PRD: "Vue or React SPA." Roadmap Phase 3: "Vue.js SPA setup (or React)." Decision not made. |
| X13 | **Social Login Phase Inconsistency** | 01-vision, 02-prd | **LOW** | Vision: social login = Phase 2. PRD A7: social login = P2 (Phase 2). Consistent, but Phase 2 in roadmap is Flutter apps, not auth features. Which Phase 2? |
| X14 | **Document Order Mismatch** | system index, actual files | **LOW** | System index recommends order: 01 Vision → 02 BRD → 03 PRD → 04 User Stories → 05 FR → 06 NFR → 07 Personas. Actual files: 01 Vision → 02 PRD → 03 Personas → 04 User Stories → 05 FR → 06 NFR → 07 Roadmap. Missing BRD. Personas position differs. |

---

## Missing Dependencies Map

```
Vision defines "Offline-resilient" ──→ NFR specifies offline behavior ──→ Roadmap defers to Phase 7
                                                          ↑
                                                      CONTRADICTION

Persona (Khalid) wants zone preference ──→ NOT in PRD ──→ NOT in User Stories ──→ NOT in FR
                              ↑
                          DEAD END

Persona (Sarah) wants favorites/reorder ──→ NOT in PRD ──→ NOT in User Stories ──→ NOT in FR
                              ↑
                          DEAD END

PRD "Rate and review" ──→ NOT in User Stories ──→ NOT in FR ──→ Roadmap Phase 7
              ↑
          DEAD END (referenced but no path to implementation)

PRD "Admin Panel" ──→ No persona ──→ No user stories ──→ No FR ──→ Roadmap Phase 7
        ↑
    DEAD END

Business Model ──→ NOT in Vision ──→ NOT in PRD ──→ NOT in FR (partial: min order only)
      ↑
  CRITICAL GAP — commission, fees, driver pay undefined
```

---

## Missing Lifecycle States

### Restaurant Lifecycle

```
Current (FR-R01): Active, Inactive, Closed

Missing states:
- PENDING_VERIFICATION — registration submitted, waiting for admin review
- VERIFIED — approved by admin, can now receive orders
- REJECTED — registration denied
- SUSPENDED — temporarily banned (fraud, complaints)
- PERMANENTLY_CLOSED — account terminated
```

### Driver Lifecycle

```
Current: Implicit (online/offline toggle)

Missing states:
- PENDING_VERIFICATION — registration submitted
- VERIFIED — approved, can go online
- REJECTED — registration denied
- ONLINE — accepting jobs
- OFFLINE — not accepting jobs
- ON_DELIVERY — actively delivering
- SUSPENDED — temporarily banned
- DEACTIVATED — account terminated
```

### Order Lifecycle (Missing Transitions)

```
Current transitions are well-defined but missing:
- pending → expired (restaurant timeout after 2 min)
- delivering → delivery_failed (customer unreachable, wrong address)
- delivered → disputed (customer reports issue)
- disputed → refunded / resolved
```

---

---

# FINAL PRIORITIZED IMPLEMENTATION CHECKLIST

## Critical (Must Fix Before Development — Phase 0)

| # | Action | Documents Affected |
|---|---|---|
| C1 | **Resolve backend framework:** Decide Laravel vs NestJS. Document decision in ADR-001. Update all references. | 01-vision, 02-prd, system index |
| C2 | **Define business model:** Commission rate, delivery fee formula, driver pay formula, VAT/tax handling. Write FR-EC section. | 02-prd, 05-fr |
| C3 | **Define restaurant/driver verification workflow:** Who verifies? What documents? How long? What are the states? | 02-prd, 04-user-stories, 05-fr |
| C4 | **Add admin persona (Layla) and minimum admin stories:** Verification, basic monitoring, platform config. | 03-personas, 04-user-stories, 05-fr |
| C5 | **Add rating & review epic + FR:** Minimum: star rating, restaurant average display. | 04-user-stories, 05-fr |
| C6 | **Add cross-role integration stories:** Happy path + failure path for full order lifecycle. | 04-user-stories |
| C7 | **Define offline strategy:** What Phase 1 implements vs Phase 7. If Phase 7, design Phase 2-6 frontends with offline architecture (local storage patterns) from day one to avoid rework. | 01-vision, 06-nfr, 07-roadmap |
| C8 | **Restructure Phase 1 timeline:** 4 weeks → 10 weeks (including testing/quality sprint). | 07-roadmap |
| C9 | **Add Phase 0 testing requirements:** CI/CD pipeline with lint + test + build. Security scan gate. | 07-roadmap, 06-nfr |
| C10 | **Add risk register** with mitigation owners. | 07-roadmap |

## Important (Should Fix Before MVP — Phase 0-1)

| # | Action | Documents Affected |
|---|---|---|
| I1 | **Add order idempotency** to FR-O01. | 05-fr |
| I2 | **Add delivery fee visibility** — customer sees fee before paying (US-EC01). | 04-user-stories |
| I3 | **Add driver earnings estimate** — driver sees earnings before accepting (US-EC02). | 04-user-stories |
| I4 | **Add restaurant pause toggle story** (US-RM06). | 04-user-stories |
| I5 | **Add menu-item search story** (US-R05). | 04-user-stories |
| I6 | **Add error acceptance criteria** to all 45 user stories. | 04-user-stories |
| I7 | **Add failure path user journeys** to PRD. | 02-prd |
| I8 | **Add disaster recovery section** to NFRs. | 06-nfr |
| I9 | **Add compliance section** (UAE PDPL, PCI-DSS, tax law) to NFRs. | 06-nfr |
| I10 | **Add phase exit criteria** (Definition of Done) for every phase. | 07-roadmap |
| I11 | **Fix GPS verification radius** from 100m to 50m with accuracy check. | 05-fr |
| I12 | **Add auto-reject behavior** for 2-minute restaurant timeout. | 05-fr |
| I13 | **Add price change handling** at checkout (race condition). | 05-fr |
| I14 | **Add order modification before restaurant acceptance.** | 05-fr |
| I15 | **Add anti-personas** to scope control. | 03-personas |
| I16 | **Resolve Vue vs React dashboard decision.** | 02-prd, 07-roadmap |
| I17 | **Build minimal restaurant dashboard in Phase 1** (accept/reject + menu CRUD) so Phase 2 Flutter apps can be tested end-to-end. | 07-roadmap |
| I18 | **Start ADRs in Phase 0**, not Phase 6. | 07-roadmap |
| I19 | **Move CI/CD to Phase 0**, not Phase 7. | 07-roadmap |
| I20 | **Add load testing targets** per phase to NFRs. | 06-nfr |

## Future Improvements (Can Wait — Phase 2+)

| # | Action | Documents Affected |
|---|---|---|
| F1 | Add customer support persona (Fatima) and support dashboard | 03-personas |
| F2 | Add chat (customer ↔ driver) epic and FRs | 04-user-stories, 05-fr |
| F3 | Add promo code / discount system | 02-prd, 05-fr |
| F4 | Add dynamic pricing (demand-based surge) | 05-fr |
| F5 | Add multi-language/RTL support design | 01-vision, 06-nfr |
| F6 | Add analytics dashboard specifications | 02-prd, 05-fr |
| F7 | Define advanced driver dispatch (ML-based ETA, batching) | 05-fr |
| F8 | Add subscription model for restaurants (premium placement) | 02-prd |
| F9 | Add loyalty/rewards program design | 02-prd |
| F10 | Cross-platform comparison benchmarks and metrics | 07-roadmap |
| F11 | Add service area polygon/polygon management (beyond radius) | 05-fr |
| F12 | Add restaurant table reservations (if business pivot) | 01-vision, 02-prd |

---

## Document Traceability Matrix

| Feature | Vision | PRD | Personas | User Stories | FR | NFR | Roadmap |
|---|---|---|---|---|---|---|---|
| Auth & Registration | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Restaurant Discovery | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Menu & Cart | ✅ | ✅ | ✅ | ✅ | ✅ | — | ✅ |
| Order Lifecycle | ✅ | ✅ | ✅ | ✅ | ✅ | — | ✅ |
| Real-Time Tracking | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Maps & Location | ✅ | ✅ | ✅ | ✅ | ✅ | — | ✅ |
| Payments (Stripe) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Push Notifications | ✅ | ✅ | ✅ | ✅ | ✅ | — | ✅ |
| Driver Assignment | ✅ | ✅ | ✅ | ✅ | ✅ | — | ✅ |
| **Rating & Reviews** | ❌ | ✅ | ❌ | ❌ | ❌ | — | P7 |
| **Platform Economics** | ❌ | ❌ | ❌ | ❌ | ❌ | — | ❌ |
| **Admin Panel** | ❌ | ✅ | ❌ | ❌ | ❌ | — | P7 |
| **Favorites/Reorder** | ❌ | ❌ | ✅ | ❌ | ❌ | — | ❌ |
| **Driver Zone Prefs** | ❌ | ❌ | ✅ | ❌ | ❌ | — | ❌ |
| **Chat** | ❌ | ❌ | ❌ | ❌ | ❌ | — | P7 |
| **Offline Mode** | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | P7 |
| **Dispute Resolution** | ❌ | ❌ | ❌ | ❌ | ❌ | — | ❌ |
| **Restaurant Verification** | ❌ | ❌ | ❌ | ✅ | ❌ | — | ❌ |
| **Multi-language** | P2 | ❌ | ❌ | ❌ | ❌ | — | P7 |

---

**Legend:** ✅ = Present | ❌ = Missing | P# = Deferred to Phase # | — = Not applicable to this document type

---

## Next Steps

1. Review this gap analysis with stakeholders
2. Resolve critical items (C1-C10) in Phase 0
3. Update affected documents
4. Re-run the traceability matrix to verify all features have full coverage
5. Begin Phase 0: Foundation (updated timeline with 10-week backend)
