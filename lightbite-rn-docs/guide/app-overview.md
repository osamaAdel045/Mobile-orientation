# App Overview

LightBite is a **food delivery platform** with three user roles: **customer**, **driver**, and **restaurant**. This React Native implementation covers customer and driver apps in a single codebase using Expo Router's file-system routing.

## User Roles

### Customer

- Browse restaurants near you with real-time menus
- Add items to cart, customize quantities
- Checkout with delivery address selection
- Real-time order tracking with driver location on map
- Order history and reordering
- Rate completed orders

### Driver

- Toggle online/offline availability
- Receive job offers with 30-second countdown
- Accept or decline deliveries
- Navigation to restaurant and customer via Google Maps
- Pickup and delivery confirmation
- Earnings dashboard and trip history

## Navigation

```
Onboarding → Login/Register
                  ↓
          Auth Guard (role check)
           ↓                  ↓
    Customer Tabs        Driver Tabs
    - Home               - Home
    - Search             - Earnings
    - Orders             - History
    - Profile            - Profile
```

- **Unauthenticated users** → Onboarding carousel → Login / Register
- **Authenticated customers** → Customer tab shell (Home, Search, Orders, Profile)
- **Authenticated drivers** → Driver tab shell (Home, Earnings, History, Profile)

## Feature Inventory (Foundation Sprint)

| Feature | Status | Details |
|---|---|---|
| Auth (login/register) | ✅ Built | Email + password, Zod validation, JWT tokens, SecureStore persistence |
| Onboarding | ✅ Built | 3-slide carousel with skip/navigation |
| Navigation shell | ✅ Built | Expo Router, auth guard, role-based tabs |
| Theme (light/dark) | ✅ Built | Typed tokens, ThemeProvider, toggle support |
| i18n (en/ar) | ✅ Built | i18next, device locale detection, ~90 keys per language |
| Customer home | ✅ Built | Restaurant listing, search, cuisine filters, infinite scroll |
| Restaurant detail | ✅ Built | Cover image, menu categories, items list |
| Menu item detail | ✅ Built | Quantity selector, special instructions, add-to-cart |
| Cart | ✅ Built | CRUD, quantity controls, cross-restaurant conflict resolution |
| Address | ✅ Built | CRUD, default badge, checkout selection |
| Checkout | ✅ Built | Order summary, address selection, idempotency key, confirmation |
| Order history | ✅ Built | Status badges, pagination, Track Order / Reorder |
| Order tracking | ✅ Built | Status timeline stepper, driver card, 15s auto-polling |
| Search | ✅ Built | Auto-focus, debounced search, persisted recent searches |
| Rate order | ✅ Built | 5-star rating, review text, API submission |
| Customer profile | ✅ Built | Avatar, addresses link, logout |
| **Driver app** | | |
| Driver home | ✅ Built | Online/offline toggle, 5s-30s job polling, active delivery card |
| Driver job offer | ✅ Built | 30s countdown, accept/decline, auto-decline on expiry |
| Driver pickup | ✅ Built | Restaurant location, Navigate, Confirm Pickup |
| Driver delivery | ✅ Built | Customer location, Navigate, Confirm Delivery, earnings summary |
| Driver earnings | ✅ Built | Today/week/avg cards, pull-to-refresh |
| Driver history | ✅ Built | Past trips with StatusBadge, pull-to-refresh |
| Driver profile | ✅ Built | Avatar, vehicle placeholder, logout |

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Expo SDK 57 (managed workflow) |
| **Language** | TypeScript 6.0 (strict mode) |
| **Navigation** | Expo Router 4 (file-system routing) |
| **State** | Zustand 5 + Neverthrow 8 |
| **HTTP** | Axios 1 (interceptor chain) |
| **Validation** | Zod 4 (runtime + types) |
| **Storage** | Expo SecureStore (tokens) + MMKV 4 (cache) |
| **i18n** | i18next + react-i18next |
| **Tests** | 35 suites, 124 tests passing |
| **CI/CD** | GitHub Actions (lint → typecheck → test → build) |
| **Backend** | Laravel 13 (see `lightbite-api/`) |

## Quality Baseline

Every standard is enforced automatically:

| Enforcement | Tool |
|---|---|
| No `console.log` | ESLint `no-console: error` |
| No raw hex colors | Stylelint `color-no-hex: true` |
| No raw pixel values | TypeScript typed `useTheme()` |
| No hardcoded strings | ESLint `i18next/no-literal-string` |
| No relative imports across features | ESLint `no-restricted-imports` |
| Consistent file structure | Plop.js scaffold generator |
| All checks on every push | GitHub Actions CI |

## Next Steps

- [Getting Started](./getting-started) — run the project locally
- [Architecture](../technical/architecture) — layer dependency and folder structure
- [Code Quality](../technical/code-quality) — how enforcement works
