# 🚀 LightBite — From Flutter Developer to Software Engineer

**A multi-platform food delivery platform. Built with AI. Designed for growth.**

---

## 🎯 The Mission

This is not just a food delivery app. **This is my transformation from a Flutter developer to a full-stack Software Engineer**, using AI as a learning accelerator — not a crutch.

| Dimension | Before | After |
|-----------|--------|-------|
| **Identity** | Flutter Developer | Software Engineer |
| **Frameworks** | Flutter only | Flutter, React Native, Laravel, Vue.js |
| **Scope** | Write widgets & screens | Design systems, architect databases, build CI/CD |
| **AI Usage** | Ask AI to write code | Partner with AI to learn, design, and build faster |
| **Mindset** | "Will this widget work?" | "How does this system scale?" |

---

## 📊 What Was Built (4 Weeks)

### Phase 0 — Foundation (Week 1-2)
> **Goal:** Design the full system before writing a single line of code.

- [x] 13 System Design Documents — vision, PRD, personas, user stories, functional & non-functional requirements, roadmap, architecture, database schema, API specification, design system, admin panel sprints
- [x] Architecture Decision Records (ADRs)
- [x] Full ERD with 24 tables
- [x] OpenAPI specification for all v1 endpoints

📄 [System Design Documents →](system-desing/)

---

### Phase 1 — Backend API (Week 1-4)
> **Goal:** Build a production-grade Laravel API that serves all clients.

| Layer | What's Built |
|-------|-------------|
| **Database** | 24 migrations, full schema with indexes |
| **Models** | 19 Eloquent models with relationships, UUIDs, soft deletes |
| **Services** | 8 service classes — Auth, Cart, Driver, Notification, Order, Payment, Restaurant, Theme |
| **API** | RESTful v1 endpoints — auth, restaurants, menu, cart, orders, driver, payments |
| **Security** | JWT with refresh token rotation, rate limiting, input validation, CSRF protection |
| **Architecture** | DTOs, Enums, Events, Listeners, Form Requests, structured JSON logging |
| **Infra** | Docker + docker-compose, SQLite (dev), MySQL (prod ready) |

📁 [lightbite-api/ →](lightbite-api/)

---

### Phase 2 — Flutter App (Original + Audit)
> **Goal:** Understand the existing Flutter codebase, identify issues, extract best practices.

| What | Details |
|------|---------|
| **Architecture** | Clean Architecture with dependency injection |
| **State** | Bloc + HydratedBloc with event-driven updates |
| **Networking** | Dio + auth/refresh interceptors + connectivity monitoring |
| **Real-time** | WebSocket client with reconnection |
| **UI** | Shared widget library (Button, Input, Card, StatusBadge, EmptyState, etc.) |
| **i18n** | English + Arabic with ARB files |
| **Quality** | Full audit report documenting issues and recommendations |

📄 [Full Audit Report →](AUDIT_REPORT.md)
📄 [Best Practices Extracted →](BEST_PRACTICES_FROM_MOBILE.md)
📁 [lightbite-app/ →](lightbite-app/)

---

### Phase 3 — React Native App (Built from Zero)
> **Goal:** Learn a completely new framework and build the same product with the same quality.

| Feature | Status |
|---------|--------|
| Expo SDK 57 + TypeScript strict | ✅ |
| ESLint + Prettier + Stylelint (350+ rules) | ✅ |
| Plop.js component generators | ✅ |
| API client with auth & refresh interceptors | ✅ |
| Theme system (light/dark tokens from design system) | ✅ |
| UI Component library (8 components, all tested) | ✅ |
| i18n (Arabic + English, matched to Flutter keys) | ✅ |
| Auth feature (Zustand + Zod + neverthrow + tests) | ✅ |
| Navigation shell with auth guards & role-based tabs | ✅ |
| CI/CD pipeline (GitHub Actions: lint, typecheck, test, build) | ✅ |

📁 [lightbite-rn/ →](lightbite-rn/)

---

### Phase 4 — Knowledge Infrastructure
> **Goal:** Document everything so others can learn from this journey.

| Project | Tech | Purpose |
|---------|------|---------|
| [lightbite-rn-docs/](lightbite-rn-docs/) | VitePress | Technical documentation for the React Native app |
| [mobile-knowledge-hub/](mobile-knowledge-hub/) | React + MDX + Zustand | Interactive knowledge hub for mobile engineering best practices |

---

## 🏗️ Architecture Overview

```
┌──────────────────────────────────────────────────────────┐
│                    LightBite Platform                      │
├──────────────────────────────────────────────────────────┤
│                                                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │ Flutter  │  │  React   │  │  Native  │  │  Ionic   │ │
│  │   App    │  │  Native  │  │  (iOS +  │  │  (Web +  │ │
│  │  (Dart)  │  │  (TS/Expo)│  │ Android) │  │ Mobile)  │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘ │
│       │             │             │             │        │
│       └─────────────┼─────────────┼─────────────┘        │
│                     │             │                       │
│              ┌──────┴─────────────┴──────┐               │
│              │    REST API + WebSocket    │               │
│              │       Laravel (PHP)        │               │
│              │    JWT Auth • Redis • SQL  │               │
│              └──────────────┬─────────────┘               │
│                             │                              │
│              ┌──────────────┼──────────────┐              │
│              │              │              │              │
│         ┌────┴────┐   ┌────┴────┐   ┌────┴────┐        │
│         │  MySQL  │   │  Redis  │   │ Stripe  │        │
│         └─────────┘   └─────────┘   └─────────┘        │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │              Supporting Infrastructure                │ │
│  │  Docker • GitHub Actions • VitePress Docs • MDX Hub  │ │
│  └──────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

---

## 🔑 Key Engineering Decisions

| Decision | Rationale |
|----------|-----------|
| **Backend-first** | API is the product. Every client consumes the same contracts. |
| **Real-time by default** | WebSocket events for every state change. No polling. |
| **Offline-resilient** | Degrade gracefully. Queued actions sync on reconnect. |
| **Framework-agnostic** | Same business logic, expressed idiomatically in each platform. |
| **AI as partner** | AI accelerates learning, reviews code, generates docs — but every line is understood and owned. |

---

## 📈 Growth Metrics (Self-Assessment)

See [system-desing/self-assessments/](system-desing/self-assessments/) for weekly self-assessments tracking progress across 5 dimensions:

1. 🧠 Learning with AI (not just using it)
2. 🔄 Stepping out of comfort zone (Flutter → everything)
3. 💪 Becoming stronger with AI (speed + quality)
4. 📱 Becoming a true Mobile Engineer (multi-framework)
5. 🎯 Becoming a full Software Engineer (system-level thinking)

---

## 🚀 Quick Start

### Backend
```bash
cd lightbite-api
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

### React Native
```bash
cd lightbite-rn
npm install
npx expo start
```

### Documentation
```bash
cd lightbite-rn-docs
npm install
npm run dev
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Laravel 11, PHP 8.3, MySQL, Redis, Laravel Reverb (WebSockets) |
| **Mobile (Original)** | Flutter 3.10+, Dart, Bloc, Dio, GoRouter |
| **Mobile (New)** | React Native 0.86, Expo SDK 57, TypeScript, Zustand, Zod, neverthrow |
| **Docs** | VitePress, MDX, React |
| **DevOps** | Docker, GitHub Actions, Pest (testing) |
| **Payments** | Stripe |
| **Maps** | Google Maps |

---

> *"I'm not here to build a food delivery app. I'm here to prove that with AI as a learning partner, a Flutter developer can become a Software Engineer in weeks — not years."*
