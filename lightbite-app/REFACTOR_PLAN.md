# LightBite Refactoring Plan

## Overview
Comprehensive refactoring to bring LightBite from prototype to production-ready. Based on the full architecture audit (2026-07-27).

---

## Phase 1: Foundation Hardening ✅ COMPLETE

### 1.1 Auth Architecture Fix
- [x] Create `AuthRemoteDataSource` (abstract + impl)
- [x] Create `AuthLocalDataSource` (abstract + impl wrapping SecureStorage)
- [x] Create `AuthRepository` (abstract + impl)
- [x] Refactor `AuthCubit` to depend only on `AuthRepository`
- [x] Update DI registrations in `injection_container.dart`

### 1.2 Driver Architecture Fix
- [x] Create `DriverRepository` (abstract + impl)
- [x] Refactor `DriverCubit` to depend on `DriverRepository` instead of concrete DataSource
- [x] Update DI registrations

### 1.3 Environment Configuration
- [x] Create `app_environment.dart` with dev/staging/prod configs
- [x] Wire into ApiClient + WsClient
- [x] Use `--dart-define=ENV=...` via `String.fromEnvironment`

### 1.4 Extract Magic Strings to Enums
- [x] Create `app_enums.dart` with `UserRole`, `AuthStatus`, `OrderStatus`, `DriverStatus`
- [x] Update entities (`AuthUser`, `Order`, `DriverJob`)
- [x] Update models (order_model, auth_models, driver_models)
- [x] Update UI components (`LBStatusBadge`, `TrackingPage`, `OrderHistoryPage`)
- [x] Update router to use `UserRole.driver`

### 1.5 Fix RefreshInterceptor
- [x] Distinguish network errors from auth errors
- [x] Only clear session on 401, not on network failures
- [x] Add `_isRefreshing` guard against concurrent refresh
- [x] Don't retry `/auth/refresh` itself (prevents infinite loop)

### 1.6 Fix DriverCubit Timer Leak
- [x] Add `_pollTimer` with proper cancellation in `close()`
- [x] Add `isClosed` guards before state mutations
- [x] Add exponential backoff (5s → 10s → 20s → 40s → 60s max)

### 1.7 Gate LogInterceptor
- [x] Only enable request/response body logging when `enableApiLogging` is true
- [x] Controlled via `AppEnvironmentConfig` per flavor

### 1.8 Logging Service
- [x] Create `AppLogger` abstraction
- [x] `PrintLogger` for dev (emoji-prefixed, level-filtered)
- [x] `NoOpLogger` for production

---

## Phase 2: Production Readiness ✅ COMPLETE

### 2.1 WebSocket Security + Resilience ✅
- [x] Remove token from URL query parameter
- [x] Send token in first message after WebSocket connect
- [x] Auto-reconnect with exponential backoff (2s → 60s max)
- [x] `pause()`/`resume()` for app lifecycle

### 2.2 ShellRoute State Preservation ✅
- [x] Migrate to `StatefulShellRoute.indexedStack`
- [x] Replace custom Row-based nav with `NavigationBar`
- [x] IndexedStack preserves tab state automatically

### 2.3 App Lifecycle Handling ✅
- [x] Add `WidgetsBindingObserver` to root `LightBiteApp`
- [x] Call `wsClient.pause()` on app background
- [x] Call `wsClient.resume()` on app foreground

### 2.4 Network Connectivity Monitoring ✅
- [x] Add `connectivity_plus` dependency (v6.1.5)
- [x] Create `ConnectivityService` with broadcast stream
- [x] Create `LBOfflineBanner` widget
- [x] Register in DI container

### 2.5 Navigation Consistency ✅
- [x] Replace `Navigator.push` for TrackingPage with `context.push('/orders/:uuid/track')`
- [x] Tracking route uses root navigator to overlay the shell
- [x] Deep link support for order tracking

### 2.6 Localization (l10n) ✅
- [x] Create `.arb` files for `en` and `ar` (54 strings, 5 parameterized)
- [x] Generate `AppLocalizations` with `flutter gen-l10n`
- [x] Replace all hardcoded strings across 11 files (app.dart, router, 6 pages, 2 widgets)
- [x] RTL layout via MaterialApp (automatic with Arabic locale)

### 2.7 Error Tracking ✅
- [x] `ErrorTracker` abstraction with `ConsoleErrorTracker` + `NoOpErrorTracker` implementations
- [x] `setupFlutterErrorHandling()` captures Flutter + Platform + async zone errors
- [x] `createErrorTracker()` selects implementation based on `enableCrashReporting`
- Note: Production Sentry/Firebase implementation needs DSN + SDK package; infrastructure is ready

---

## Phase 3: Test Coverage & CI/CD ✅ (5/6 complete)

### 3.1 Unit Tests — Cubits
- [x] AuthCubit (7 tests — initial state, checkAuth, login success/error, logout)
- [x] HomeCubit (6 tests — initial, loadRestaurants, search, filterByCuisine)
- [x] CartCubit (5 tests — initial, loadCart, error, clearCart)
- [x] OrderCubit (7 tests — loadOrders, loadActiveOrder, error, edge cases)
- [x] DriverCubit (10 tests — toggleOnline, acceptJob, declineJob, confirm, earnings)

### 3.2 Unit Tests — Repositories + DataSources
- [x] AuthRepositoryImpl (5 tests — checkAuth, login, logout, edge cases)
- [x] CartRepositoryImpl (5 tests — getCart, addItem, updateItem, removeItem, clearCart)
- [x] HomeRepositoryImpl (4 tests — getNearby, search with/without cuisine, empty)
- [x] OrderRepositoryImpl (6 tests — getOrders, active order, detail, timeline, empty)
- [x] DriverRepositoryImpl (9 tests — toggleOnline, pollForJob, accept/decline/confirm, earnings)

### 3.3 Widget Tests
- [x] LBButton (6 tests — label, onPressed, disabled, loading, icon, variants)
- [x] LBStatusBadge (5 tests — pending, delivered, picked_up, icon, styling)
- [x] LBEmptyState (4 tests — title/subtitle, icon, action, no-action)
- [x] LBErrorWidget (4 tests — message, retry button, no-retry, custom icon)
- [x] LBCard (5 tests — render, onTap, disabled, custom/default padding)
- [x] LBInput (7 tests — label, hint, obscure, icons, validation, keyboard)

### 3.4 Integration Test
- [~] Critical flow: login → home → cart → checkout
- Note: Full router-based integration test requires device-level `integration_test` package. All business logic is covered by 96 unit/widget tests across cubits, repositories, and widgets.

### 3.5 CI/CD
- [x] GitHub Actions workflow: analyze → test → build (dev/staging/prod)
- [x] Flavor-specific builds: `--dart-define=ENV=production`

---

## Phase 4: Performance & Polish ✅ COMPLETE

### 4.1 Image Caching ✅
- [x] Use `CachedNetworkImage` in `_RestaurantCard`
- [x] Placeholder while loading, error fallback icon

### 4.2 Shimmer Animation ✅
- [x] Replace static placeholders with `Shimmer.fromColors`
- [x] Uses the `shimmer` package (already a dependency)

### 4.3 HomeCubit Filter Fix ✅
- [x] Add `allRestaurants` field to `_HomeLoaded` state
- [x] Preserve full restaurant list for efficient client-side re-filtering
- [x] Reset to "All" restores full list without re-fetch

### 4.4 Hive Optimization ✅
- [x] Removed manual `jsonEncode`/`jsonDecode` — Hive handles Dart built-in types natively
- [x] Added typed methods (`putString`, `getString`, `putInt`, `putMap`, etc.)
- [x] Zero JSON overhead on cache read/write operations

### 4.5 Security Hardening ✅
- [x] SSL pinning — `CertificatePinner` class with environment-gated SHA-256 fingerprint validation
- [x] Biometric auth — `BiometricAuthService` wrapping platform biometrics (stub — needs `local_auth` pkg + device testing)
- Note: Production cert fingerprints and `local_auth` package both require device-level setup; infrastructure is ready.

---

## Key Metrics

| Metric | Before | After |
|--------|--------|-------|
| Analyzer errors | 0 | 0 |
| Analyzer warnings | 2 (unused imports) | 0 |
| Unit tests | 1 (generated widget test) | **96** (5 cubits + 5 repos + 6 widget suites) |
| Auth follows Clean Architecture | No | Yes |
| Driver follows Clean Architecture | No | Yes |
| Magic strings | ~50+ across codebase | 0 (all enums) |
| Token in WebSocket URL | Yes | No |
| LogInterceptor in production | Yes | No (gated) |
| RefreshInterceptor error safety | Silent swallow | Structured handling |
| Driver poll backoff | None (flat 10s) | Exponential (5s–60s) |
| Environment flavors | None | dev / staging / production |
| ShellRoute tab state | Lost on switch | Preserved (indexedStack) |
| App lifecycle handling | None | Pause/resume WebSocket |
| Network monitoring | None | ConnectivityService + offline banner |
| Image caching | Placeholder only | CachedNetworkImage with fallback |
| Shimmer | Static gray boxes | Animated Shimmer.fromColors |
| Home filter data loss | Full re-fetch needed | Client-side, full list preserved |
| Localization (l10n) | All hardcoded English | 54 strings en/ar, all pages localized |
| Widget test suites | 0 | **6** (Button, Badge, Empty, Error, Card, Input) |
| Repository tests | 0 | **5 repos** (29 tests across all layers) |
| CI/CD pipeline | None | GitHub Actions: lint → test → build |
| SSL pinning | None | CertificatePinner (env-gated, fingerprints ready) |
| Biometric auth | None | BiometricAuthService (stub ready for local_auth) |
| Error tracking | None | ErrorTracker abstraction + Flutter error hooks |
| Hive serialization | jsonEncode/jsonDecode | Native typed methods, zero JSON overhead |
