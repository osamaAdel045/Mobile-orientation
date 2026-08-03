# 06 — Non-Functional Requirements: LightBite

**Date:** 2026-07-26
**Status:** Draft

---

## 1. Performance

| ID | Requirement | Target | Measurement |
|---|---|---|---|
| NFR-P01 | API response time (p95) | < 200ms | Laravel Telescope |
| NFR-P02 | API response time (p99) | < 500ms | Laravel Telescope |
| NFR-P03 | WebSocket event latency | < 500ms publish-to-client | Custom timing headers |
| NFR-P04 | Database query time | < 50ms per query | Query logging |
| NFR-P05 | Image loading | Thumbnail < 1s, full < 3s | CDN + lazy loading |
| NFR-P06 | App cold start | < 2 seconds | Flutter DevTools |
| NFR-P07 | App UI frame rate | 60fps, no scroll jank | Flutter DevTools |
| NFR-P08 | App size | < 50MB (Flutter), < 30MB (native) | Build analysis |
| NFR-P09 | Load test — Phase 1 | 100 concurrent users, 50 active orders, 20 WebSocket connections, p95 < 200ms | k6 / Artillery |
| NFR-P10 | Load test — Phase 2 | 1,000 concurrent users, 500 active orders, 200 WebSocket connections | k6 / Artillery |
| NFR-P11 | Load test — Phase 3 | 10,000 concurrent users, 5,000 active orders, 2,000 WebSocket connections | Distributed k6 |

---

## 2. Availability & Reliability

| ID | Requirement | Target | Strategy |
|---|---|---|---|
| NFR-A01 | API uptime | 99.9% | Health check + auto-restart |
| NFR-A02 | Database availability | 99.95% | Regular backups, replication (prod) |
| NFR-A03 | Graceful degradation | WebSocket down → polling fallback | Client-side fallback |
| NFR-A04 | Data durability | Zero order loss | Queue-backed writes, tx logging |
| NFR-A05 | Backups | Daily, retained 30 days | Scheduler + mysqldump |

---

## 3. Security

| ID | Requirement | Description |
|---|---|---|
| NFR-S01 | HTTPS only | TLS 1.3 for all API and WebSocket connections |
| NFR-S02 | Password hashing | bcrypt, cost factor ≥ 12 |
| NFR-S03 | JWT security | Access token 15 min expiry, refresh token rotation, blacklist on logout |
| NFR-S04 | Input validation | All inputs validated/sanitized. SQLi prevented via Eloquent ORM. XSS via output encoding. |
| NFR-S05 | Rate limiting | General API: 120 req/min per authenticated user. Auth endpoints: 5 req/min per IP. Location updates: 30 req/min. WebSocket auth: 10 connections/min per user. Rate limit headers in all responses: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`. |
| NFR-S06 | CORS | Whitelist specific origins. No wildcard. |
| NFR-S07 | File uploads | MIME validation, malware scan, max size enforcement |
| NFR-S08 | Sensitive data | PII encrypted at rest. Passwords never logged. Cards never stored. |
| NFR-S09 | Security headers | CSP, X-Frame-Options, X-Content-Type-Options, HSTS |
| NFR-S10 | Dependency scanning | Composer/npm audit. Dependabot alerts. |

---

## 4. Scalability

| ID | Requirement | Strategy |
|---|---|---|
| NFR-SC01 | Stateless API | No server-side sessions. JWT auth. Horizontal scaling ready. |
| NFR-SC02 | Async processing | Notifications, images, email via Laravel queues (Redis). |
| NFR-SC03 | Query optimization | Indexes on all FK and search fields. N+1 detection. |
| NFR-SC04 | Caching | Redis: restaurant menus (5 min TTL), geocoding (30 days), distance matrix (1 hour) |
| NFR-SC05 | WebSocket scaling | Laravel Reverb + Redis pub/sub for multi-instance |

---

## 5. Maintainability

| ID | Requirement | Description |
|---|---|---|
| NFR-M01 | Code style | PSR-12 (PHP). snake_case DB, camelCase JS/TS, snake_case Dart. |
| NFR-M02 | API versioning | URL-prefix: `/api/v1/`. Breaking changes = new version. |
| NFR-M03 | Structured logging | JSON format. Every log: trace_id, user_id, action, context. |
| NFR-M04 | Error format | `{"error": {"code": "ORDER_NOT_FOUND", "message": "..."}}` |
| NFR-M05 | API docs | OpenAPI 3.0 (Swagger). Auto-generated from annotations. |
| NFR-M06 | Migrations | All schema changes via Laravel migrations. No manual prod changes. |

---

## 6. Observability

| ID | Requirement | Implementation |
|---|---|---|
| NFR-O01 | Health check | `GET /api/v1/health` → DB, queue, cache, WebSocket status |
| NFR-O02 | Request logging | Method, path, status, duration, user_id per request |
| NFR-O03 | Error tracking | 5xx errors with stack traces. Slack/email alerts in prod. |
| NFR-O04 | Monitoring | Laravel Telescope (dev). Sentry/DataDog candidate (prod). |
| NFR-O05 | Audit trail | User CRUD, role changes, order status, payment events |

---

## 7. Mobile-Specific

| ID | Requirement | Target |
|---|---|---|
| NFR-MB01 | Offline resilience | Cached data: restaurant list (stale if > 1 hour), menus (stale if > 30 min), past orders and user profile (always available). Staleness indicator: banner "Showing cached data from [time] ago." Connectivity indicator: persistent banner when offline. Queued actions (order placement, rating submission) replayed on reconnect in FIFO order. Conflict resolution: last-write-wins with server timestamp. |
| NFR-MB02 | Battery | Background location max 1/min. Batch network requests. |
| NFR-MB03 | Permissions | Request at point of need with explanation. Not all at launch. |
| NFR-MB04 | Deep linking | Universal Links (iOS) + App Links (Android). Notification → screen. |
| NFR-MB05 | Crash reporting | Crashlytics or Sentry on all mobile clients |
| NFR-MB06 | Network resilience | 30s timeout. 3 retries with backoff. Offline queue (SQLite). |

---

## 8. Accessibility

| ID | Requirement | Description |
|---|---|---|
| NFR-A11Y01 | Web dashboard | WCAG 2.1 AA |
| NFR-A11Y02 | Mobile | Sufficient contrast, scalable text, screen reader labels |
| NFR-A11Y03 | Color independence | Status not by color alone (icons + text) |

---

## 9. Data Retention & Privacy

| ID | Requirement | Description |
|---|---|---|
| NFR-DP01 | User data export | JSON export on request |
| NFR-DP02 | Account deletion | Soft-delete with 30-day recovery window. After 30 days: PII (name, email, phone, photo) hard-deleted. Order and payment records anonymized (linked to anonymous UUID) and retained for 7 years per UAE tax law. Anonymized records are non-identifiable and excluded from data export/deletion requests. |
| NFR-DP03 | Location data | Not retained beyond active delivery. No history stored. |
| NFR-DP04 | Payment data | Stripe handles PCI. Cards never touch our servers. |
| NFR-DP05 | Log retention | Requests: 90 days. Audit: 1 year. Errors: 1 year. |

---

## 10. Platform Support

| ID | Requirement | Target |
|---|---|---|
| NFR-B01 | Dashboard | Latest 2 Chrome, Firefox, Safari, Edge |
| NFR-B02 | Customer App | iOS 15+, Android 8+ (API 26+) |
| NFR-B03 | Driver App | Android 8+ (API 26+), iOS 15+ |
| NFR-B04 | Screen sizes | Phone 320-428px. Dashboard 768px+ (tablet) and 1024px+ (desktop) |

---

## 11. Disaster Recovery

| ID | Requirement | Target |
|---|---|---|
| NFR-DR01 | Recovery Time Objective (RTO) | < 4 hours for critical services (API, database, WebSocket) |
| NFR-DR02 | Recovery Point Objective (RPO) | < 1 hour maximum data loss |
| NFR-DR03 | Backup frequency | Daily full backup + continuous WAL (Write-Ahead Log) archiving for point-in-time recovery |
| NFR-DR04 | Backup retention | Daily backups retained 30 days. Monthly backups retained 1 year. |
| NFR-DR05 | Geo-redundancy | Backups stored in a separate geographic region from the primary database |
| NFR-DR06 | Restore testing | Full restore drill executed every 3 months. Results documented. |
| NFR-DR07 | Failover strategy | Phase 1: manual failover with documented runbook. Phase 3: automated multi-AZ failover. |

---

## 12. Compliance

| ID | Regulation | Applicability | Requirement |
|---|---|---|---|
| NFR-C01 | UAE PDPL (Personal Data Protection Law) | All user PII | Data minimization, consent for processing, right to access and deletion. Privacy policy published. |
| NFR-C02 | PCI-DSS | Payment card data | SAQ-A compliance via Stripe Elements. Cards never touch LightBite servers. Annual self-assessment. |
| NFR-C03 | GDPR | EU customers (future, Phase 3+) | Data export on request, right to erasure, Data Processing Agreement (DPA). Architecture designed for compliance readiness. |
| NFR-C04 | UAE Tax Law | Financial records | Order and payment records retained for 7 years. Anonymized after account deletion. |
| NFR-C05 | Cookie Consent | Web dashboard | Consent banner for non-essential cookies (analytics). Essential cookies (auth session) exempt. |

---

## 13. Service Level Agreements (SLA)

| Severity | Definition | Response Time | Resolution Time | Coverage |
|---|---|---|---|---|
| **Sev 1 — Critical** | Platform completely unavailable OR order processing stopped for all users | 15 minutes | 2 hours | 24/7 |
| **Sev 2 — Major** | Core feature unavailable (payments failing, tracking down, push notifications not delivered) | 30 minutes | 8 hours | 24/7 |
| **Sev 3 — Minor** | Non-critical feature degraded (search slow, image upload failing, dashboard reporting delayed) | 4 business hours | 48 hours | Business hours (9am-6pm GST, Sun-Thu) |
| **Sev 4 — Cosmetic** | UI glitch, typo, color inconsistency, non-functional issue | 24 business hours | Next release | Business hours |

**Planned maintenance:** Maximum 2 hours per month. Announced 48 hours in advance. Excluded from uptime calculation.

---

## Next Document

[07 — Product Roadmap](07-product-roadmap.md)