# 01 — Vision Document: LightBite

**Date:** 2026-07-26
**Status:** Draft
**Author:** Mobile Engineering Reference System

---

## Product Name

**LightBite** — Fast food, light experience.

---

## Elevator Pitch

A real-time food delivery platform connecting hungry customers with local restaurants through a network of independent drivers. Built as a cross-platform engineering reference system demonstrating backend architecture, real-time communication, maps integration, payment processing, and multi-platform mobile development.

---

## Problem Statement

| Actor | Problem |
|---|---|
| **Customers** | Slow, cluttered food ordering experiences. High delivery fees from incumbent platforms. Limited visibility into order status. |
| **Restaurant Owners** | Dependent on expensive third-party platforms taking 15-30% commission. No direct relationship with their customers. Limited control over their brand presentation. |
| **Delivery Drivers** | Opaque earning calculations. Inefficient routing. No flexibility in choosing delivery zones. |

---

## Competitive Landscape

| Competitor | Strength | Weakness | LightBite Differentiator |
|---|---|---|---|
| **Talabat** | Market leader, brand recognition, wide coverage | 20-30% commission, restaurants lose customer relationship | Lower commission (12%), restaurant brand ownership |
| **Deliveroo** | Strong rider network, premium positioning | Limited to premium restaurant segments | Broader restaurant inclusion, lower fees |
| **Zomato** | Discovery + reviews ecosystem | Delivery not core competency in all markets | Integrated three-sided real-time experience |
| **Noon Food** | E-commerce synergy, rapid growth | New entrant, limited coverage, basic tracking | Full-stack transparency, real-time driver tracking |
| **Careem Food** | Super-app integration, UAE presence | High commissions, limited restaurant tools | Self-serve restaurant dashboard, lower fees |

---

## Solution

LightBite provides a three-sided marketplace:

1. **Customer App** — Browse restaurants, search menus, place orders, real-time tracking, pay seamlessly
2. **Restaurant Dashboard** — Manage menu, accept/reject orders, update preparation status, view earnings
3. **Driver App** — Accept delivery jobs, real-time navigation, earnings tracking, availability toggle

All connected through a shared backend API with real-time WebSocket communication.

---

## Business Model

LightBite operates as a commission-based three-sided marketplace:

| Revenue/Payment | Model | Phase 1 Value |
|---|---|---|
| **Restaurant Commission** | Percentage of food subtotal per completed order (configurable per restaurant) | 12% (below market average of 15-30%) |
| **Customer Delivery Fee** | Fixed base + distance-based variable component | AED 5 base + AED 1.5/km beyond 3km |
| **Driver Payout** | Base pay + distance component per completed job | AED 8 base + AED 2/km |
| **Tax (VAT)** | Applied per UAE tax law | 5% on subtotal + delivery fee |

**Phase 1:** Commission and delivery fees are system-wide parameters (configurable via admin).
**Phase 2+:** Dynamic pricing based on demand, distance, and restaurant tier.
**Driver settlement:** Weekly payout calculation. **Restaurant settlement:** Bi-weekly, minus commission.
**Payment flow:** Pre-authorize at order placement → Capture on restaurant acceptance → Release on rejection.

---

## Target Audience

| Persona | Description | Primary Platform |
|---|---|---|
| **Sarah (Customer)** | Busy professional, 25-40, orders food 2-3x/week | iOS / Android |
| **Ahmed (Restaurant Owner)** | Small restaurant owner, 30-55, wants more orders without high commissions | Web Dashboard / Tablet |
| **Khalid (Driver)** | Part-time delivery driver, 22-35, wants flexible hours and clear earnings | Android (primary) |

---

## Core Differentiator

**Full-stack transparency.** Customers see every step from kitchen prep to doorstep delivery in real time — not just "your order is on the way."

**Built as a reference architecture.** Every component (backend, Flutter, React Native, Android Native, iOS Native, Ionic) follows the same design patterns, consumes the same API, and demonstrates production-grade engineering practices.

---

## Target Scale

| Phase | Users | Restaurants | Drivers | Daily Orders | Geography |
|---|---|---|---|---|---|
| **Phase 1 (MVP)** | 1,000 | 20 | 30 | 50 | Dubai Marina + Jumeirah |
| **Phase 2 (Growth)** | 10,000 | 100 | 150 | 500 | Dubai metro area |
| **Phase 3 (Scale)** | 100,000 | 500 | 1,000 | 5,000 | UAE nationwide |
| **Phase 4 (Regional)** | 500,000+ | 2,000+ | 5,000+ | 25,000+ | GCC |

---

## Success Metrics

| Metric | Measurement Definition | Target | Timeframe |
|---|---|---|---|
| Order-to-delivery time (p50) | Time from `order.confirmed` event to `order.delivered` event, median | < 35 min | Within 3 months |
| Order-to-delivery time (p95) | Same measurement, 95th percentile | < 55 min | Within 3 months |
| Restaurant onboarding time | Time from registration submission to first published menu item | < 1 hour | Self-serve |
| Driver job acceptance rate | (Accepted jobs / Offered jobs) × 100, rolling 7-day window | > 85% | Ongoing |
| Order accuracy rate | (Orders without customer complaint / Total orders) × 100 | > 98% | Ongoing |
| Customer repeat order rate | Customers with ≥ 2 orders in 30 days / Total active customers | > 40% | Within 3 months |
| Platform API uptime | (Total minutes − Downtime minutes) / Total minutes × 100, 30-day rolling window | 99.9% | Ongoing |
| Restaurant rejection rate | (Rejected orders / Total orders) × 100 | < 5% | Ongoing |

---

## Out of Scope (Phase 1)

| Feature | Reason | Target Phase |
|---|---|---|
| Grocery / alcohol / pharmacy delivery | Different logistics model | Phase 3+ |
| Subscription meal plans | Different product entirely | Phase 3+ |
| Table reservations / dine-in | Diverges from core delivery focus | Phase 3+ |
| Multi-language support | Engineering complexity, not product value | Phase 2 |
| Crypto payments | Niche adoption | Phase 3+ |
| AI-powered recommendations | Nice-to-have, not MVP | Phase 2 |
| Loyalty / rewards program | Requires order volume to be meaningful | Phase 2 |

---

## Product Principles

1. **Backend-first** — The API is the product. Every frontend consumes the same contracts.
2. **Real-time by default** — If something changes, the user sees it without refresh.
3. **Offline-resilient** — Degrade gracefully. Queued actions sync when connectivity returns.
4. **Framework-agnostic** — The same business logic, expressed idiomatically in each platform.
5. **Production-grade** — Not a demo. Authentication, error handling, rate limiting, logging from day one.

---

## Next Document

[02 — Product Requirements Document (PRD)](02-prd.md)
