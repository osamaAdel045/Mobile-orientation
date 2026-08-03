# 🚀 Mobile Orientation — From Flutter Developer to Software Engineer

**A multi-platform food delivery platform. Built with AI. Designed for growth.**

> 🔗 **Repo:** [osamaAdel045/Mobile-orientation](https://github.com/osamaAdel045/Mobile-orientation) — `main`

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

## 📂 Repo Structure

```
Mobile-orientation/
├── README.md                        ← You are here
├── .gitignore
├── system-desing/                   ← 13 design documents (~400 pages)
│   ├── 01-vision.md                 ← Product vision & market analysis
│   ├── 02-prd.md                    ← Product requirements
│   ├── 03-personas.md              ← User personas
│   ├── 04-user-stories.md          ← 64 user stories
│   ├── 05-functional-requirements.md
│   ├── 06-non-functional-requirements.md
│   ├── 07-product-roadmap.md       ← 8 phases
│   ├── 08-architecture.md          ← System architecture
│   ├── 09-database-schema.md       ← ERD + 24 tables
│   ├── 10-api-spec.md              ← OpenAPI specification
│   ├── 11-design-system.md         ← Design tokens & components
│   ├── 12-admin-panel-sprints.md   ← Admin dashboard planning
│   └── system index.md
├── mobile-knowledge-hub/            ← Engineering Knowledge Base
│   └── src/content/       (8 frameworks × 24 topics — 192 articles)
│       ├── flutter/       (24 deep-dive articles)
│       ├── react-native/  (24 deep-dive articles)
│       ├── android/       (24 deep-dive articles)
│       ├── ios/           (24 deep-dive articles)
│       ├── ionic/         (24 deep-dive articles)
│       ├── kmm/           (24 deep-dive articles)
│       └── maui/          (24 deep-dive articles)
├── lightbite-api/                   ← Laravel Backend (PHP)
│   ├── app/Models/        (19 models)
│   ├── app/Services/      (8 services)
│   ├── app/Http/          (Controllers, Middleware, Requests)
│   ├── app/Enums/         (7 enums)
│   ├── database/migrations/ (24 migrations)
│   ├── routes/api.php     (V1 REST endpoints)
│   ├── tests/             (Feature + Unit tests)
│   └── docker-compose.yml (PHP + MySQL + Redis)
├── lightbite-app/                   ← Flutter App (Dart)
│   ├── lib/core/          (API client, WebSocket, theme, widgets)
│   ├── lib/features/      (auth, home, cart, order, driver, etc.)
│   ├── lib/l10n/          (English + Arabic ARB)
│   ├── test/              (Widget + unit tests)
│   ├── AUDIT_REPORT.md    ← Full Flutter codebase audit
│   └── BEST_PRACTICES_FROM_MOBILE.md ← Extracted patterns
├── lightbite-rn/                    ← React Native App (TypeScript)
│   ├── app/               (30 screens — Expo Router)
│   ├── src/core/          (API client, theme, UI components, i18n)
│   ├── src/features/      (auth, home, cart, order, driver, etc.)
│   ├── __tests__/         (Schema + store + component tests)
│   ├── plop/              (Code generators)
│   └── .github/workflows/ (CI/CD: lint → typecheck → test → build)
├── lightbite-rn-docs/               ← Technical Documentation
│   ├── guide/             (Getting started, app overview)
│   ├── components/        (UI component docs)
│   ├── features/          (Feature documentation)
│   └── technical/         (Architecture, state, navigation, API)
```

---

## 📊 What's Built

### 📄 System Design — 13 Documents, ~400 Pages
> **Goal:** Design the full system before writing code.

Every architectural decision documented: vision, PRD, personas, user stories, functional & non-functional requirements, roadmap, system architecture, database ERD, API specification, design system, admin panel planning, and full traceability matrix.

📁 [system-desing/ →](system-desing/)

---

### 🧠 mobile-knowledge-hub — Engineering Knowledge Base > **203 files · 30,236 lines · 192 articles across 8 frameworks**

My first step out of Flutter — learning React by building a real project alongside the system design.

Interactive React + MDX knowledge hub for cross-framework mobile engineering. Each framework covered across 24 topics:

| Framework | Topics | Status |
|-----------|--------|--------|
| **Flutter** | Architecture, rendering, compilation, state, navigation, networking, DI, testing, CI/CD… | ✅ |
| **React Native** | Architecture, rendering, compilation, state, navigation, networking, DI, testing, CI/CD… | ✅ |
| **Android (Kotlin)** | Architecture, rendering, compilation, state, navigation, networking, DI, testing, CI/CD… | ✅ |
| **iOS (Swift)** | Architecture, rendering, compilation, state, navigation, networking, DI, testing, CI/CD… | ✅ |
| **Ionic** | Architecture, rendering, compilation, state, navigation, networking, DI, testing, CI/CD… | ✅ |
| **KMM** | Architecture, rendering, compilation, state, navigation, networking, DI, testing, CI/CD… | ✅ |
| **MAUI** | Architecture, rendering, compilation, state, navigation, networking, DI, testing, CI/CD… | ✅ |

Includes: best practices, common mistakes, decision matrices, framework comparisons, real project examples, and AI-assisted development guides for each framework.

📁 [mobile-knowledge-hub/ →](mobile-knowledge-hub/)

---

### 🖥️ lightbite-api — Laravel Backend
> **188 files · 26,055 lines**

| Layer | What's Inside |
|-------|-------------|
| **Models** | 19 Eloquent models — User, Restaurant, Order, Payment, Cart, MenuItem, Driver, Rating, Dispute, AuditLog… |
| **Services** | 8 service classes — Auth, Cart, Driver, Notification, Order, Payment, Restaurant, Theme |
| **API** | RESTful v1 — auth, restaurants, menu, cart, orders, driver, payments, addresses, admin |
| **Database** | 24 migrations, seeders, factories |
| **Security** | JWT + refresh token rotation, rate limiting, input validation, admin IP whitelist |
| **Admin Panel** | 20 Vue.js SPA screens (dashboard, orders, drivers, restaurants, disputes, analytics…) |
| **Testing** | Feature tests (auth, orders, cart, driver flow, state machine, edge cases) |
| **Infra** | Docker + docker-compose (PHP, MySQL, Redis), CI pipeline |

📁 [lightbite-api/ →](lightbite-api/)

---

### 📱 lightbite-app — Flutter Mobile App
> **241 files · 17,760 lines**

| Layer | What's Inside |
|-------|-------------|
| **Architecture** | Clean Architecture — data/domain/presentation layers |
| **DI** | get_it + injectable — 10 dependency modules |
| **State** | flutter_bloc + hydrated_bloc — 15 BLoC/Cubit classes |
| **Networking** | Dio + auth/refresh/connectivity interceptors |
| **Real-time** | WebSocket client with reconnection + event bus |
| **Routing** | GoRouter with auth guards |
| **UI** | 8 shared widgets (Button, Input, Card, StatusBadge, EmptyState, ErrorDisplay, Shimmer, OfflineBanner) |
| **i18n** | English + Arabic (ARB files matching backend keys) |
| **Theme** | Design system — colors, spacing, typography, semantic tokens |
| **Testing** | Widget tests for all UI components, unit tests for BLoCs & repositories |
| **Quality** | Full audit report + best practices extraction |

📄 [AUDIT_REPORT.md →](lightbite-app/AUDIT_REPORT.md)
📄 [BEST_PRACTICES_FROM_MOBILE.md →](lightbite-app/BEST_PRACTICES_FROM_MOBILE.md)
📁 [lightbite-app/ →](lightbite-app/)

---

### ⚛️ lightbite-rn — React Native App (Built from Zero)
> **230 files · 30,954 lines**

| Feature | Details |
|---------|---------|
| **Foundation** | Expo SDK 57 + TypeScript strict + ESLint (350+ rules) + Prettier + Stylelint |
| **Navigation** | Expo Router — file-based, auth guards, role-based tabs (customer + driver) |
| **Screens** | 30 screens — auth, onboarding, home, search, restaurant, menu, cart, checkout, tracking, address, driver… |
| **State** | Zustand + persist middleware — 15 stores (auth, home, cart, order, driver…) |
| **Validation** | Zod schemas — runtime type safety with TypeScript inference |
| **Networking** | Axios + auth/refresh interceptors + neverthrow error handling |
| **Theme** | Light/dark tokens from design system — colors, typography, spacing, shadows, radius |
| **UI** | 10 shared components (Button, Input, Card, StatusBadge, EmptyState, ErrorDisplay, Skeleton, OfflineBanner, ScreenHeader, BackButton) |
| **i18n** | English + Arabic (i18next, matched to Flutter ARB keys) |
| **Storage** | MMKV (high-performance synchronous) + SecureStore |
| **Testing** | Jest + RNTL — 32 test files (schemas, stores, components) |
| **CI/CD** | GitHub Actions: lint → typecheck → test → build |
| **Generators** | Plop.js — feature & component scaffolding with templates |
| **Docs** | RN-CLAUDE.md — prescriptive architecture standards for AI-assisted development |

📁 [lightbite-rn/ →](lightbite-rn/)

---

### 📘 lightbite-rn-docs — Technical Documentation
> **49 files · 38,233 lines**

VitePress site covering every aspect of the React Native app:
- **Guide:** Getting started, app overview
- **Components:** Button, Card, Input, StatusBadge, EmptyState, ErrorDisplay
- **Features:** Home, restaurant, menu, cart, checkout, order, address, driver flow
- **Technical:** Architecture, state management, navigation, API networking, theme system, localization, code quality

📁 [lightbite-rn-docs/ →](lightbite-rn-docs/)

---

## 🏗️ Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│                     LightBite Platform                        │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐ │
│  │ Flutter  │  │  React   │  │  Native  │  │    Ionic     │ │
│  │   App    │  │  Native  │  │  (iOS +  │  │  (Web +      │ │
│  │  (Dart)  │  │(TS/Expo) │  │ Android) │  │   Mobile)    │ │
│  │   ✅     │  │    ✅    │  │    🔜    │  │     🔜      │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────┬───────┘ │
│       │             │             │               │         │
│       └─────────────┼─────────────┼───────────────┘         │
│                     │             │                          │
│              ┌──────┴─────────────┴──────┐                  │
│              │    REST API + WebSocket    │                  │
│              │       Laravel (PHP)        │                  │
│              │    JWT Auth • Redis • SQL  │                  │
│              │            ✅               │                  │
│              └──────────────┬─────────────┘                  │
│                             │                                 │
│              ┌──────────────┼──────────────┐                 │
│              │              │              │                 │
│         ┌────┴────┐   ┌────┴────┐   ┌────┴────┐           │
│         │  MySQL  │   │  Redis  │   │ Stripe  │           │
│         └─────────┘   └─────────┘   └─────────┘           │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              Supporting Infrastructure                   │ │
│  │  Docker • GitHub Actions • VitePress Docs • MDX Hub     │ │
│  │                         ✅ ✅ ✅ ✅                       │ │
│  └─────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
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

## 📈 Totals

| Metric | Count |
|--------|-------|
| **Total files** | 911 |
| **Total lines** | ~143,000 |
| **Git commits** | 7 |
| **Frameworks** | Flutter, React Native, Laravel, Vue.js, React |
| **Design documents** | 13 (~400 pages) |
| **Database tables** | 24 |
| **API endpoints** | 40+ (REST v1) |
| **Mobile screens** | 50+ (Flutter) + 30 (React Native) |
| **UI components** | 8 (Flutter) + 10 (React Native) |
| **Tests** | 100+ test files across all projects |
| **Knowledge base** | 192 articles across 8 frameworks |

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

### Flutter
```bash
cd lightbite-app
flutter pub get
flutter run
```

### Documentation
```bash
cd lightbite-rn-docs && npm install && npm run dev
cd mobile-knowledge-hub && npm install && npm run dev
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Laravel 11, PHP 8.3, MySQL, Redis, Laravel Reverb (WebSockets) |
| **Mobile (Flutter)** | Flutter 3.10+, Dart, Bloc, Dio, GoRouter |
| **Mobile (React Native)** | React Native 0.86, Expo SDK 57, TypeScript, Zustand, Zod, neverthrow |
| **Admin Panel** | Vue.js 3, Pinia, Vue Router |
| **Documentation** | VitePress, MDX, React |
| **Knowledge Hub** | React 19, MDX, Zustand, Vite |
| **DevOps** | Docker, GitHub Actions, Pest, Jest |
| **Payments** | Stripe |
| **Maps** | Google Maps |

---

> *"I'm not here to build a food delivery app. I'm here to prove that with AI as a learning partner, a Flutter developer can become a Software Engineer."*
