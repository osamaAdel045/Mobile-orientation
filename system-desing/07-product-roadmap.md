# 07 — Product Roadmap: LightBite

**Date:** 2026-07-26
**Status:** Draft

---

## Phase 0 — Foundation (Weeks 1-2)

**Goal:** Business documents complete. Development environment ready.

| # | Task | Output |
|---|---|---|
| 0.1 | Complete all business documents | 01-07 documents finalized |
| 0.2 | System Architecture Document | Backend + client architecture design |
| 0.3 | Database schema design (ERD) | Full ER diagram + migration plan |
| 0.4 | API specification (OpenAPI) | All v1 endpoints documented |
| 0.5 | Set up Laravel project | Fresh Laravel install + Docker + CI |
| 0.6 | Set up Flutter project | Fresh Flutter project, folder structure, linting |
| 0.7 | Set up CI/CD pipeline | GitHub Actions: lint → test → build on every PR. Docker Compose for local dev. |
| 0.8 | Start Architecture Decision Records (ADRs) | ADR-001: Backend framework decision. ADR-002: WebSocket technology (Laravel Reverb). ADR-003: Caching strategy (Redis). ADR-004: API versioning strategy. |
| 0.9 | Traceability verification | Every PRD feature → persona need → user story → FR → roadmap phase. Close all gaps. |

**Milestone:** Documents approved. Empty projects running with CI/CD green. First 4 ADRs written.

**Phase 0 Exit Criteria (DoD):**
- [ ] All 7 business documents approved with traceability verified
- [ ] System architecture document written and reviewed
- [ ] Database ERD complete with all v1 tables and relationships
- [ ] OpenAPI spec for all v1 endpoints (at least endpoint paths + request/response schemas)
- [ ] Laravel project: `docker compose up` → health check returns 200, CI pipeline green on PR
- [ ] Flutter project: builds for iOS and Android without errors
- [ ] ADR-001 through ADR-004 written and approved

---

## Phase 1 — Backend Core (Weeks 3-12)

**Goal:** Laravel API fully functional. All v1 endpoints tested, documented, and load-tested.

### Sprint 1: Foundation & Auth (Weeks 3-4)

| # | Feature |
|---|---|
| 1.1 | Project structure, Docker Compose (PHP, MySQL, Redis) |
| 1.2 | Database migrations, seeders, factories |
| 1.3 | User registration (customer, restaurant, driver roles) with email verification |
| 1.4 | Login with JWT + refresh token rotation |
| 1.5 | Password reset flow (email link, 1-hour expiry) |
| 1.6 | Profile CRUD + address management (customer) |
| 1.7 | Structured logging (JSON, trace_id per request), health check endpoint (DB, queue, cache, WS) |
| 1.8 | Sentry error tracking integration |
| 1.9 | API documentation (Swagger/OpenAPI, auto-generated from annotations) |

### Sprint 2: Restaurants & Menu (Weeks 5-6)

| # | Feature |
|---|---|
| 2.1 | Restaurant profile CRUD with image upload, verification status workflow |
| 2.2 | Menu category CRUD |
| 2.3 | Menu item CRUD with image upload (resize, strip EXIF, WebP conversion) |
| 2.4 | Restaurant search (full-text) + nearby query (Haversine with bounding box) |
| 2.5 | Business hours management with split hours support |
| 2.6 | Basic restaurant dashboard API (accept/reject orders, update order status, view today's orders) |

### Sprint 3: Orders, Cart & Payments (Weeks 7-8)

| # | Feature |
|---|---|
| 3.1 | Cart API (add, update, remove, clear, cross-restaurant validation, 24h expiry) |
| 3.2 | Order placement with idempotency key, cart validation, price re-verification |
| 3.3 | Order status state machine (all transitions including expired, disputed) |
| 3.4 | Order cancellation + refund logic (full, partial, auto) |
| 3.5 | Stripe payment integration (pre-auth, capture, refund, idempotency) |
| 3.6 | Receipt generation (in-app + email with fee breakdown) |
| 3.7 | Order history + earnings views (all roles) |
| 3.8 | Platform economics: commission calculation, delivery fee, driver pay, VAT |

### Sprint 4: Real-Time, Driver & Notifications (Weeks 9-10)

| # | Feature |
|---|---|
| 4.1 | WebSocket server setup (Laravel Reverb + Redis pub/sub for multi-instance) |
| 4.2 | All order events: created, confirmed, rejected, status_update, ready_for_pickup, driver.assigned, driver.declined, driver.location_update, driver.arriving, delivered |
| 4.3 | Driver assignment algorithm (nearest-first + fairness weighting, 30s timeout, 3 attempts) |
| 4.4 | Driver location broadcasting with privacy controls (only during active delivery) |
| 4.5 | Push notification integration (FCM for Android, APNs for iOS) |
| 4.6 | Notification templates for all triggers + deep linking |
| 4.7 | Driver lifecycle management (online/offline/on_delivery toggle) |

### Sprint 5: Quality & Hardening (Weeks 11-12)

| # | Feature |
|---|---|
| 5.1 | Integration tests for all API endpoints (target > 90% coverage) |
| 5.2 | E2E test: full order lifecycle (place → accept → prepare → ready → assign → pickup → deliver) |
| 5.3 | E2E test: failure paths (reject, timeout, decline × 3, cancel, dispute) |
| 5.4 | WebSocket load test: 100 concurrent connections |
| 5.5 | API load test: 100 concurrent users, p95 < 200ms |
| 5.6 | Security scan + remediation (0 critical, 0 high before gate passes) |
| 5.7 | Performance profiling + N+1 query detection + index optimization |
| 5.8 | Postman collection with all v1 endpoints + environment variables |
| 5.9 | Define offline architecture pattern: local storage strategy, staleness rules, sync queue design |
| 5.10 | API versioning finalized (URL-prefix `/api/v1/`, deprecation policy) |

**Milestone:** Backend API complete. All 64 user stories supported with passing tests. Postman collection + Swagger docs accurate. Load test passed.

**Phase 1 Exit Criteria (DoD):**
- [ ] All 64 user stories have passing API integration tests (target > 90% coverage)
- [ ] Full order lifecycle E2E test passes (happy path + 5 failure paths)
- [ ] WebSocket event delivery tested with 100 concurrent connections
- [ ] Stripe integration tested in test mode: pre-auth, capture, refund, decline, idempotency
- [ ] Push notifications delivered to FCM test device for all trigger types
- [ ] Security scan: 0 critical, 0 high findings
- [ ] API load test: 100 concurrent users, p95 < 200ms, 0 errors
- [ ] Postman collection published with all endpoints + example requests/responses
- [ ] Swagger docs accurate and accessible at `/api/v1/docs`
- [ ] Offline architecture pattern documented for mobile teams

---

## Phase 2 — Flutter Apps (Weeks 7-12)

**Goal:** Flutter Customer App + Flutter Driver App fully functional.

### Sprint 5: Flutter Foundation (Week 7)

| # | Feature |
|---|---|
| 5.1 | Project setup with Clean Architecture |
| 5.2 | Dependency injection (get_it / injectable) |
| 5.3 | Routing (GoRouter) |
| 5.4 | API client with Dio + interceptors |
| 5.5 | Token management + auto-refresh |
| 5.6 | WebSocket client |
| 5.7 | Theme + design system |

### Sprint 6: Auth & Onboarding (Week 8)

| # | Feature |
|---|---|
| 6.1 | Login / Register screens |
| 6.2 | Role-based registration flow |
| 6.3 | Password reset flow |
| 6.4 | Profile screen + edit |
| 6.5 | Address management with map picker |
| 6.6 | Onboarding screens |

### Sprint 7: Restaurant Discovery (Week 9)

| # | Feature |
|---|---|
| 7.1 | Home screen with nearby restaurants |
| 7.2 | Search with debounce |
| 7.3 | Cuisine filter chips |
| 7.4 | Restaurant detail screen |
| 7.5 | Menu view with categories |
| 7.6 | Image caching + shimmer loading |

### Sprint 8: Cart & Checkout (Week 10)

| # | Feature |
|---|---|
| 8.1 | Cart screen with quantity controls |
| 8.2 | Cross-restaurant cart warning |
| 8.3 | Checkout screen |
| 8.4 | Address selection + add new |
| 8.5 | Stripe payment sheet |
| 8.6 | Order confirmation screen |

### Sprint 9: Order Tracking & Maps (Week 11)

| # | Feature |
|---|---|
| 9.1 | Active order tracking screen |
| 9.2 | Real-time status updates via WebSocket |
| 9.3 | Google Maps integration |
| 9.4 | Driver location tracking on map |
| 9.5 | Order history list + detail |
| 9.6 | Push notification handling + deep links |

### Sprint 10: Driver App (Week 12)

| # | Feature |
|---|---|
| 10.1 | Driver home screen (online/offline toggle) |
| 10.2 | Job notification + accept/decline |
| 10.3 | Pickup navigation via Google Maps |
| 10.4 | Confirm pickup |
| 10.5 | Delivery navigation |
| 10.6 | Confirm delivery |
| 10.7 | Earnings summary screen |

**Milestone:** Both Flutter apps functional end-to-end. Order flow works: Customer orders → Restaurant accepts → Driver delivers.

**Phase 2 Exit Criteria (DoD):**
- [ ] Customer app: full order flow completes on iOS 15+ and Android 8+ (API 26+)
- [ ] Driver app: full delivery flow completes on Android 8+
- [ ] Real-time tracking works end-to-end (WebSocket events → UI update < 500ms)
- [ ] Google Maps integration: restaurant discovery, address picker, driver navigation, live tracking
- [ ] Push notification received + deep link navigates to correct screen
- [ ] App cold start < 2s on iPhone 12 and Samsung Galaxy A52 (reference devices)
- [ ] App displays cached data when offline, recovers when connectivity returns
- [ ] Stripe payment sheet works on both platforms
- [ ] 0 crash reports from manual E2E test runs

---

## Phase 3 — Restaurant Dashboard (Weeks 13-14)

**Goal:** Web dashboard for restaurant owners.

| # | Feature |
|---|---|
| 3.1 | Vue.js SPA setup (or React) |
| 3.2 | Login / Register for restaurants |
| 3.3 | Dashboard home with today's stats |
| 3.4 | Live order board with accept/reject |
| 3.5 | Order status management |
| 3.6 | Menu editor (items + categories + images) |
| 3.7 | Restaurant profile editor |
| 3.8 | Order history + earnings view |

**Milestone:** Restaurant can manage their entire operation from the dashboard.

---

## Phase 4 — React Native App (Weeks 15-18)

**Goal:** Same LightBite product, rebuilt in React Native.

| # | Feature |
|---|---|
| 4.1 | RN project setup, navigation, state management |
| 4.2 | Auth flow (matching Flutter implementation) |
| 4.3 | Restaurant discovery + search |
| 4.4 | Cart + checkout + payment |
| 4.5 | Order tracking with WebSocket |
| 4.6 | Google Maps via react-native-maps |
| 4.7 | Push notifications via React Native Firebase |
| 4.8 | Driver app in React Native |

**Milestone:** React Native version reaches feature parity with Flutter version.

---

## Phase 5 — Native Apps (Weeks 19-24)

**Goal:** Same product, native Android (Kotlin) and native iOS (Swift).

| Week | Platform | Focus |
|---|---|---|
| 19-21 | Android (Kotlin) | Jetpack Compose, Retrofit, Room, FCM, Google Maps SDK, WorkManager |
| 22-24 | iOS (Swift) | SwiftUI, URLSession, Core Data, APNs, MapKit, BGTaskScheduler |

**Milestone:** Four implementations of the same product, all consuming the same backend.

---

## Phase 6 — Ionic + Polish (Weeks 25-27)

**Goal:** Ionic/Capacitor implementation. Cross-platform comparison matrix.

| # | Feature |
|---|---|
| 6.1 | Ionic Angular project setup |
| 6.2 | Capacitor plugins for maps, notifications, camera |
| 6.3 | Feature parity with other platforms |
| 6.4 | Cross-platform comparison document |
| 6.5 | Maintain and update ADRs (ongoing from Phase 0) |
| 6.6 | Engineering handbook compilation |

---

## Phase 7 — Advanced Features (Weeks 28+)

**Goal:** Features that were deferred from Phase 1.

| # | Feature | Platforms |
|---|---|---|
| 7.1 | Offline mode + sync engine | All mobile |
| 7.2 | Background location (driver) | All mobile |
| 7.3 | Chat (customer ↔ driver) | All mobile |
| 7.4 | Reviews & ratings | All mobile |
| 7.5 | Admin panel | Web |
| 7.6 | Analytics dashboard | Web |
| 7.7 | Advanced CI/CD (automated E2E, multi-platform build matrix, Fastlane deployment) | DevOps |
| 7.8 | Multi-language support | All |
| 7.9 | Social login (Google, Apple) | All mobile |

---

## Phase 8 — Continuous Evolution

**Goal:** Living reference system. Keep all implementations in sync.

| Activity | Cadence |
|---|---|
| Add new features across all platforms | Monthly |
| Update dependencies + fix vulnerabilities | Weekly |
| Write ADRs for key decisions | Per decision |
| Update documentation | Per change |
| Cross-platform comparison benchmarks | Quarterly |

---

## Timeline Summary

```
Phase 0: Foundation        ██  Weeks 1-2
Phase 1: Backend Core      ████  Weeks 3-6
Phase 2: Flutter Apps      ██████  Weeks 7-12
Phase 3: Dashboard         ██  Weeks 13-14
Phase 4: React Native      ████  Weeks 15-18
Phase 5: Native Apps       ██████  Weeks 19-24
Phase 6: Ionic + Polish    ███  Weeks 25-27
Phase 7: Advanced Features ████  Weeks 28+
Phase 8: Evolution         ░░░░  Ongoing
```

**Total to Phase 6 completion:** ~35 weeks (includes 30% buffer for unknowns, rework, and learning).

---

## Risk Register

| ID | Risk | Probability | Impact | Mitigation | Owner |
|---|---|---|---|---|---|
| R1 | Backend framework skill gap (Laravel) | Medium | High | Allocate learning time in Phase 0. Set up pairing/review with experienced Laravel dev if available. | Tech Lead |
| R2 | Stripe API not available or restricted in UAE market | Low | Critical | Verify Stripe UAE availability in Phase 0. Fallback: Checkout.com or PayTabs integration. | Product Manager |
| R3 | Google Maps API cost exceeds budget at scale | Medium | Medium | Aggressive caching (geocoding: 30 days, distance matrix: 1 hour). Budget cap alerts. Fallback: Mapbox for non-critical views. | Tech Lead |
| R4 | WebSocket scaling issues under concurrent load | Medium | High | Use Redis pub/sub from day one (not single-instance). Load test with 500 connections in Phase 1. | Backend Lead |
| R5 | Flutter plugin gaps (background location, push notifications) | Medium | Medium | Validate all critical plugins in Phase 0 spike. Document known limitations and workarounds. | Flutter Lead |
| R6 | Single developer bottleneck (all platforms) | High | High | Document all decisions and patterns. Design for handoff. All code reviewed (self-review checklist if solo). Prioritize backend + one client if time-constrained. | Engineering Manager |
| R7 | Scope creep during implementation | Medium | Medium | Strict MVP definition per phase. Feature freeze at sprint start. Change request process for anything new. | Product Manager |
| R8 | Restaurant/driver verification bottleneck (manual review) | Medium | Medium | Design verification workflow to be < 5 min per review. Clear document requirements upfront. Automation candidates identified for Phase 2. | Admin/Ops |

---

## Next Steps

1. Review all 7 business documents
2. Write System Architecture Document
3. Design database schema (ERD)
4. Write API specification (OpenAPI)
5. Begin Phase 1: Backend Core
