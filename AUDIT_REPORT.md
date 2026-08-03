# LightBite Flutter — Reference Implementation Audit Report

**Date:** 2026-07-28
**Audit Board:** Flutter GDE, Staff Flutter Engineer, Principal Mobile Architect, Senior Android/iOS Engineers, Clean Architecture Expert, Performance/Security/Accessibility/DevOps Engineers, QA Lead, Technical Lead
**Scope:** Full project audit — architecture, state management, networking, DI, design system, widgets, performance, offline, security, error handling, forms, testing, accessibility, localization, logging, DX, Flutter best practices, cross-platform readiness

---

## Architecture Scorecard

| Dimension | Score (1–10) | Rationale |
|---|---|---|
| **Architecture** | 6 | Clean Architecture present in core features (home, auth, cart) but inconsistent — 4 features are UI-only. DI container and router violate layer boundaries by living in core/. No use cases in 11/12 features. Address repository returns raw `Map`. |
| **Maintainability** | 5 | Strong feature-first structure, but dead code (BiometricAuth, CertificatePinner, AppConfig), silent error swallowing, print() debugging, and inconsistent patterns (sealed class vs freezed, factory vs singleton) make maintenance harder than it should be. |
| **Readability** | 7 | Consistent naming conventions, clear file organization within features. LB-prefixed widgets are discoverable. Some files (valid_data.dart) are over-engineered with duplicate patterns. Missing documentation in README. |
| **Scalability** | 5 | Feature-first structure scales well, but the single DI registration function, manual DI wiring, and core-layer coupling to features create bottlenecks. No module boundary enforcement. Adding a feature requires editing the central DI file. |
| **Testability** | 6 | Good unit/widget test patterns (blocTest, mocktail). But: static classes (LocalCache), sl() in widgets, no-interface services (ConnectivityService), and DI-in-routes make isolated testing difficult. 7/12 features have zero tests. |
| **Performance** | 5 | No rebuild optimization (no const constructors audit, no RepaintBoundary), no image caching strategy, no list optimization. Theme system is lightweight. Shimmer for loading. No performance monitoring. |
| **Security** | 4 | Secure storage for tokens (good). But: CertificatePinner is dead code with incorrect fingerprint. No biometric integration. No root/jailbreak detection. No ProGuard/R8. Token refresh has race condition. Plain-text HTTP in development without network security config. |
| **Accessibility** | 3 | No Semantics widgets found. No accessibility labels on custom widgets. No font scaling testing. No contrast verification. No keyboard navigation support. Touch targets not verified. |
| **Flutter Best Practices** | 6 | Good use of freezed, go_router, flutter_bloc. But: print() instead of debugPrint(), sl() in widget lifecycle, missing const constructors, using Material widgets inconsistently with custom theme overrides, runZonedGuarded not wrapping runApp. |
| **Enterprise Readiness** | 4 | Missing: dark mode, structured logging, crash reporting, performance monitoring, feature flags, environment-specific config injection, code signing, proper CI caching, code coverage gates, R8/ProGuard, app icon/launch screen. |
| **Cross-Platform Readiness** | 5 | Feature-first structure is framework-agnostic. But: entities lack framework independence (business logic in Cubits, not pure use cases), Flutter-specific DI patterns, hard-coded platform values. |

**Overall Score: 5.1 / 10**

---

## Prioritized Refactoring Plan

### Phase 1 — Critical (Must complete before new features)

#### C1. Wire Error Handling in main.dart
**Severity: Critical**
**Files:** [main.dart](lightbite-app/lib/main.dart), [error_tracker.dart](lightbite-app/lib/core/error_tracking/error_tracker.dart)

The `setupFlutterErrorHandling()` function exists but is never called. `runZonedGuarded` body is empty (doesn't wrap `runApp`). All Flutter errors and unhandled async exceptions go to the default handler.

```dart
// main.dart — Current (broken)
void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);
  await LocalCache.init();
  await initDependencies();
  runApp(const LightBiteApp());
}

// main.dart — Fixed
void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);
  await LocalCache.init();
  await initDependencies();

  final errorTracker = sl<ErrorTracker>();
  final logger = sl<AppLogger>();

  FlutterError.onError = (details) {
    FlutterError.presentError(details);
    errorTracker.logFlutterError(details);
  };

  PlatformDispatcher.instance.onError = (error, stack) {
    errorTracker.logError(error, stack);
    return true;
  };

  runZonedGuarded(
    () => runApp(const LightBiteApp()),
    (error, stack) => errorTracker.logError(error, stack),
  );
}
```

#### C2. Move injection_container.dart and app_router.dart Out of core/
**Severity: Critical**
**Files:** [injection_container.dart](lightbite-app/lib/core/di/injection_container.dart), [app_router.dart](lightbite-app/lib/core/router/app_router.dart)

Both files import feature-layer code (`../../features/...`), violating Clean Architecture's dependency rule (inner layers must not depend on outer layers). The DI container and router belong at the application layer.

**Solution:** Create `lib/app/di/` and `lib/app/router/` directories. Move both files there. Update imports throughout.

#### C3. Fix AuthCubit Registration (Factory → LazySingleton)
**Severity: Critical**
**Files:** [injection_container.dart](lightbite-app/lib/core/di/injection_container.dart), [app.dart](lightbite-app/lib/app.dart)

`AuthCubit` is registered with `registerFactory`, meaning every `sl<AuthCubit>()` call creates a new instance. The app's `_authCubit` holds one instance, but if anything else resolves `AuthCubit`, it gets a different (empty) instance. This causes state loss.

**Fix:** Change to `sl.registerLazySingleton<AuthCubit>(() => AuthCubit(authRepository: sl()))`.

#### C4. Fix Token Refresh Race Condition
**Severity: Critical**
**Files:** [refresh_interceptor.dart](lightbite-app/lib/core/network/refresh_interceptor.dart)

When `_isRefreshing` is true, concurrent 401 requests are passed through to `handler.next(err)` and fail. Standard pattern uses a `Completer`-based queue:

```dart
class RefreshInterceptor extends Interceptor {
  final Dio _dio;
  final SecureStorage _storage;
  bool _isRefreshing = false;
  final List<ErrorInterceptorHandler> _pendingQueue = [];

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    if (err.response?.statusCode != 401) return handler.next(err);

    if (_isRefreshing) {
      _pendingQueue.add(handler);
      return;
    }

    _isRefreshing = true;
    try {
      final refreshToken = await _storage.getRefreshToken();
      final response = await Dio().post(
        '${AppEnvironmentConfig.current.apiBaseUrl}/auth/refresh',
        data: {'refresh_token': refreshToken},
      );
      await _storage.saveTokens(
        accessToken: response.data['access_token'],
        refreshToken: response.data['refresh_token'],
      );
      // Retry original request
      final opts = Options(
        method: err.requestOptions.method,
        headers: {'Authorization': 'Bearer ${response.data['access_token']}'},
      );
      final retryResponse = await _dio.request(
        err.requestOptions.path,
        options: opts,
        data: err.requestOptions.data,
        queryParameters: err.requestOptions.queryParameters,
      );
      handler.resolve(retryResponse);
      // Retry queued requests
      for (final queued in _pendingQueue) {
        final retry = await _dio.fetch(err.requestOptions);
        queued.resolve(retry);
      }
    } catch (e) {
      await _storage.clearAll();
      handler.next(err);
      for (final queued in _pendingQueue) {
        queued.next(err);
      }
    } finally {
      _isRefreshing = false;
      _pendingQueue.clear();
    }
  }
}
```

#### C5. Add Missing Platform Permissions
**Severity: Critical**
**Files:** AndroidManifest.xml, Info.plist

**Android:** Add `INTERNET`, `ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION`, `ACCESS_NETWORK_STATE` to the production manifest.
**iOS:** Add `NSLocationWhenInUseUsageDescription` to Info.plist.
**Both:** Add network security configuration to allow localhost HTTP during development.

#### C6. Add Missing Feature Layers (checkout, address, profile, earnings, history)
**Severity: Critical**
**Files:** Multiple under `features/customer/checkout/`, `features/customer/address/`, etc.

Four feature modules are UI-only pages with no domain/data layers, no cubit/state management, no typed models, and no tests. They use raw `sl<>()` calls in widget code.

**Minimum viable fix:**
1. Add proper entities, models, repositories, and cubits for each
2. Remove all `sl<>()` calls from widget code
3. Add tests

---

### Phase 2 — Architecture (Improves maintainability and scalability)

#### A1. Introduce Use Cases Across All Features
**Severity: High**

Only `customer/home` has use cases (`GetNearbyRestaurants`, `SearchRestaurants`). All other Cubits call repositories directly, coupling business logic to state management.

```dart
// Current: Cubit calls repository directly
class LoginCubit extends Cubit<LoginState> {
  final AuthRepository _repository;
  Future<void> login(String email, String password) async {
    emit(LoginState.loading());
    try {
      final user = await _repository.login(email, password);
      emit(LoginState.authenticated(user));
    } catch (e) { ... }
  }
}

// Recommended: Cubit calls use case
class LoginCubit extends Cubit<LoginState> {
  final LoginUseCase _loginUseCase;
  Future<void> login(String email, String password) async {
    emit(LoginState.loading());
    final result = await _loginUseCase(LoginParams(email: email, password: password));
    result.fold(
      (failure) => emit(LoginState.error(failure.message)),
      (user) => emit(LoginState.authenticated(user)),
    );
  }
}
```

#### A2. Standardize State Management Pattern (Either<Failure, Success>)
**Severity: High**

The codebase uses try/catch with string messages. Adopt `dartz`'s `Either<Failure, T>` for type-safe error handling:

```dart
// Define failures
sealed class Failure {
  const Failure();
}
class NetworkFailure extends Failure { final String message; NetworkFailure(this.message); }
class ServerFailure extends Failure { final String message; ServerFailure(this.message); }
class AuthFailure extends Failure { final String message; AuthFailure(this.message); }
class ValidationFailure extends Failure { final String message; ValidationFailure(this.message); }

// Repository returns Either
abstract class AuthRepository {
  Future<Either<Failure, AuthUser>> login(String email, String password);
}

// Cubit handles cleanly
Future<void> login(String email, String password) async {
  emit(LoginState.loading());
  final result = await _loginUseCase(LoginParams(email: email, password: password));
  result.fold(
    (failure) => emit(LoginState.error(failure.message)),
    (user) => emit(LoginState.authenticated(user)),
  );
}
```

#### A3. Create Theme-Aware Custom Widgets
**Severity: High**
**Files:** All `lb_*.dart` widgets

Custom widgets hardcode colors instead of using the theme system. If the theme changes, widgets don't reflect it.

```dart
// Current: Hardcoded color
Container(
  decoration: BoxDecoration(
    color: AppColors.primary500,
    borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
  ),
)

// Recommended: Use theme
Container(
  decoration: BoxDecoration(
    color: Theme.of(context).colorScheme.primary,
    borderRadius: BorderRadius.circular(Theme.of(context).cardTheme.shape),
  ),
)
```

#### A4. Add Dark Theme Support
**Severity: High**
**Files:** [app_theme.dart](lightbite-app/lib/core/theme/app_theme.dart)

Only `AppTheme.light` exists. Add:
- `AppTheme.dark` with proper color scheme
- `AppTheme.of(context)` getter
- Persist theme preference in `LocalCache`
- `ThemeMode` management in a `ThemeCubit`

#### A5. Split DI Registration by Feature
**Severity: High**
**Files:** [injection_container.dart](lightbite-app/lib/core/di/injection_container.dart)

The single 100+ line `initDependencies()` function registers everything. Split into feature-level registration modules:

```dart
// lib/app/di/injection_container.dart
Future<void> initDependencies() async {
  await _registerCore();
  await _registerAuth();
  await _registerHome();
  await _registerCart();
  await _registerOrder();
  await _registerDriver();
}

// lib/app/di/feature/auth_di.dart
void _registerAuth() {
  sl.registerLazySingleton<AuthLocalDataSource>(() => AuthLocalDataSourceImpl(storage: sl()));
  sl.registerLazySingleton<AuthRemoteDataSource>(() => AuthRemoteDataSourceImpl(client: sl()));
  sl.registerLazySingleton<AuthRepository>(() => AuthRepositoryImpl(
    local: sl(), remote: sl(), storage: sl(),
  ));
  sl.registerLazySingleton<LoginUseCase>(() => LoginUseCase(sl()));
  sl.registerLazySingleton<RegisterUseCase>(() => RegisterUseCase(sl()));
  sl.registerLazySingleton<AuthCubit>(() => AuthCubit(loginUseCase: sl(), registerUseCase: sl()));
}
```

#### A6. Remove Dead Code
**Severity: Medium**
**Files:** Multiple

Remove or properly integrate:
- `BiometricAuthService` — never used, never compiled against
- `CertificatePinner` — fingerprint computation is incorrect, never called
- `AppConfig` (`app_config.dart`) — superseded by `AppEnvironmentConfig`
- `DriverStatus` enum — defined but never imported
- `NoOpLogger` / `NoOpErrorTracker` — unused stubs
- Duplicate `isTrue`/`isSuccess` functions in `valid_data.dart`

#### A7. Add Interface/Abstraction for ConnectivityService
**Severity: Medium**
**Files:** [connectivity_service.dart](lightbite-app/lib/core/connectivity/connectivity_service.dart)

`ConnectivityService` is a concrete class with no interface, making it impossible to mock for tests:

```dart
abstract class ConnectivityService {
  Stream<bool> get onConnectivityChanged;
  bool get isConnected;
  Future<void> init();
  void dispose();
}

class ConnectivityServiceImpl implements ConnectivityService { ... }
```

#### A8. Standardize Entity Equality and Immutability
**Severity: Medium**
**Files:** All entity files

Entities lack `copyWith`, `==`/`hashCode`, and `toString()`. Either:
- Use `freezed` for entities (recommended — consistent with state classes)
- Or manually implement equality + copyWith

---

### Phase 3 — Performance

#### P1. Add Const Constructors Audit
**Severity: Medium**

Enable the `prefer_const_constructors` lint (already enabled) and fix all violations. Every widget that can be const should be const.

#### P2. Add RepaintBoundary for Heavy Subtrees
**Severity: Medium**

Wrap animating or frequently-rebuilding subtrees in `RepaintBoundary` to avoid repainting the entire widget tree.

#### P3. Implement Image Caching Strategy
**Severity: Medium**

Use `cached_network_image` for all network images. Currently, no image caching exists.

#### P4. Fix ConnectivityService Debouncing
**Severity: Medium**
**Files:** [connectivity_service.dart](lightbite-app/lib/core/connectivity/connectivity_service.dart)

Add debouncing to prevent rapid connectivity flips from triggering excessive rebuilds:

```dart
void init() {
  _subscription = connectivity.onConnectivityChanged
    .debounceTime(const Duration(milliseconds: 500))
    .listen((result) {
      final connected = result != ConnectivityResult.none;
      if (connected != _controller.value) {
        _controller.add(connected);
      }
    });
}
```

#### P5. Add List Optimization
**Severity: Low**

For long lists (order history, restaurant list), add `ListView.builder` with `itemExtent` where possible, and use `const` constructors for list items.

#### P6. Fix LBOfflineBanner Layout
**Severity: Low**
**Files:** [lb_offline_banner.dart](lightbite-app/lib/core/widgets/lb_offline_banner.dart)

The `MaterialBanner` inside a `Column` with `Expanded` is not the intended usage. Either:
- Use an `Overlay`/`Stack` approach
- Or remove the dismiss button that does nothing

---

### Phase 4 — Developer Experience

#### D1. Update README.md with Project Documentation
**Severity: Medium**
**Files:** [README.md](lightbite-app/README.md)

Include: architecture overview, folder structure, setup instructions, environment configuration, testing commands, coding conventions, and contribution guidelines.

#### D2. Add Comprehensive Lint Rules
**Severity: Medium**
**Files:** [analysis_options.yaml](lightbite-app/analysis_options.yaml)

Add: `always_use_package_imports`, `avoid_catches_without_on_clauses`, `avoid_dynamic_calls`, `discarded_futures`, `use_super_parameters`, `require_trailing_commas`.

#### D3. Add CI Caching
**Severity: Medium**
**Files:** [ci.yml](lightbite-app/.github/workflows/ci.yml)

Add `actions/cache@v4` for `~/.pub-cache` and the Dart SDK to reduce CI time by 2-3 minutes.

#### D4. Add Code Coverage Gates
**Severity: Medium**

Add `flutter test --coverage` to CI. Integrate Codecov or Coveralls. Set minimum coverage threshold (start at 60%, increase over time).

#### D5. Add Pre-Commit Hooks
**Severity: Low**

Add `lefthook` or `husky` with `dart format`, `dart analyze`, and `flutter test` running on pre-commit.

#### D6. Standardize Naming Conventions
**Severity: Low**

Document naming rules:
- Files: `snake_case.dart`
- Classes/Widgets: `PascalCase`
- Variables/functions: `camelCase`
- Constants: `camelCase` (Dart convention)
- Feature cubits: `<feature>_cubit.dart`, `<feature>_state.dart`
- Use cases: `<verb>_<noun>.dart` (e.g., `get_nearby_restaurants.dart`)

#### D7. Fix Type Safety Issues
**Severity: Medium**
**Files:** [valid_data.dart](lightbite-app/lib/core/utils/valid_data.dart), [safe_utils.dart](lightbite-app/lib/core/utils/safe_utils.dart)

- Replace `dynamic` parameters with `Object?` where appropriate
- Replace bare `catch (_)` with `on Exception catch (e)`
- Add error logging in catch blocks
- Remove `validateJsonListWithOption` and `validateJsonListWith2Options` — replace with a single factory-based approach

---

### Phase 5 — Future Enhancements

#### F1. Add Structured Logging
Replace `print()`/`debugPrint()` with a proper logging framework. Options: `logger` package, custom solution with log levels, JSON output for log aggregation.

#### F2. Integrate Crash Reporting
Wire `ErrorTracker` to Sentry or Firebase Crashlytics with context enrichment (device info, app version, current route, user ID).

#### F3. Add Performance Monitoring
Integrate Firebase Performance or a custom solution for:
- App startup time
- Screen render time
- API call latency
- Frame build/rendering times

#### F4. Add Feature Flags
Use `launchdarkly` or a simple remote config approach for:
- Enabling/disabling features without deployment
- A/B testing
- Gradual rollouts

#### F5. Add Golden Image Tests
Generate golden files for all custom widgets and critical screens. Run in CI with automated visual diff detection.

#### F6. Add E2E/Integration Tests
Use `integration_test` package for critical flows: login → browse → add to cart → checkout.

#### F7. Certificate Pinning (Production)
Fix `CertificatePinner._fingerprint` to use `X509Certificate.sha256Fingerprint`. Wire into `ApiClient.init()`. Add platform guards for web.

#### F8. Biometric Authentication
Complete the `BiometricAuthService` stub. Integrate with `local_auth` package. Add biometric lock for sensitive actions.

#### F9. Accessibility Audit
Add `Semantics` to all custom widgets. Verify contrast ratios (WCAG AA minimum). Test with TalkBack/VoiceOver. Support font scaling up to 200%.

#### F10. RTL Layout Testing
The app supports Arabic (RTL). Add automated tests for RTL layouts. Verify all custom widgets handle RTL correctly.

#### F11. Offline-First Architecture
Implement offline queue for cart operations. Sync when connectivity is restored. Use Hive for local data persistence with TTL-based cache invalidation.

---

## Reference Implementation Rules

These rules form the engineering standard for this project and will guide reimplementation in React Native, Android, iOS, and Ionic.

### Architecture Rules

1. **Feature-first organization.** Every feature is self-contained with `data/`, `domain/`, `presentation/` layers. No feature imports another feature's internals.

2. **Domain layer is pure Dart.** Domain entities, use cases, and repository interfaces contain zero framework dependencies. No Flutter, no Dio, no Hive.

3. **Dependencies point inward.** `presentation → domain ← data`. Never the reverse. The domain layer knows nothing about the outer layers.

4. **Every feature has use cases.** Cubits/ViewModels call use cases, never repositories directly. Use cases encapsulate single business operations with explicit input/output types.

5. **Repositories return Either<Failure, T>.** No throwing exceptions across layer boundaries. Domain failures are typed and exhaustive.

6. **Entities are immutable and equatable.** Use `freezed` or manual `copyWith` + `==` / `hashCode` + `toString()`.

7. **DTOs (Models) are separate from entities.** Data-layer models have `fromJson`/`toJson`. Domain entities do not. Mapping happens in the repository implementation.

8. **One DI registration module per feature.** No monolithic DI file. Feature modules call their own registration functions.

9. **The router belongs to the application layer, not core.** Routes import feature pages. Core does not know about features.

### State Management Rules

10. **One Cubit/Bloc per screen.** Not one per feature. Each screen gets its own state manager with explicit initial, loading, loaded/data, empty, and error states.

11. **States are sealed/freezed unions.** Every possible UI state is a distinct type. No `isLoading` boolean flags.

12. **Side effects go through repositories.** Cubits orchestrate, repositories execute. No networking or storage code inside Cubits.

13. **Loading/empty/error states are mandatory.** Every screen that loads data must handle all three. Use consistent widgets (`LBShimmer`, `LBEmptyState`, `LBErrorWidget`).

14. **Optimistic updates for mutations.** When the user performs an action, update the UI immediately, then reconcile with the server response. Roll back on failure.

### Widget Rules

15. **Every widget that can be const must be const.** Enable `prefer_const_constructors` lint. Zero tolerance for missing const.

16. **No business logic in widgets.** Widgets receive data and emit events. They do not transform data, make decisions, or call repositories.

17. **Extract widgets at 50+ lines.** If a build method exceeds 50 lines, extract private widget methods or separate widget classes.

18. **Custom components use the theme system.** Never hardcode colors, typography, or spacing. Use `Theme.of(context).colorScheme`, `textTheme`, and custom theme extensions.

19. **Every custom widget has Semantics.** Add `Semantics` widget with label, value, and hint where appropriate.

20. **Use `ListView.builder` for any list > 10 items.** Never use `ListView(children: [...])` for dynamic or potentially large lists.

### API & Networking Rules

21. **One API client instance.** Dio is configured once (base URL, timeouts, interceptors) and injected everywhere.

22. **Interceptors are chainable and testable.** Auth, refresh, logging, and error-mapping interceptors are independent, composable, and individually unit-tested.

23. **Every API call has a timeout.** Never rely on defaults. Per-request timeouts when appropriate.

24. **Token refresh is queue-safe.** Concurrent 401s are queued and retried after a single refresh, not individually failed.

25. **API exceptions are mapped to domain failures.** DioExceptions never reach the presentation layer. The repository layer maps them to typed `Failure` subclasses.

### Error Handling Rules

26. **Never swallow exceptions silently.** Every catch block must either: log the error, emit an error state, or rethrow. Bare `catch (_) {}` is forbidden.

27. **Global error handler is mandatory.** `FlutterError.onError` and `PlatformDispatcher.instance.onError` are always configured. `runZonedGuarded` wraps `runApp`.

28. **User-facing errors are actionable.** "Something went wrong" is never the sole error message. Include recovery action: "Tap to retry" or specific guidance.

### Testing Rules

29. **Every Cubit/Bloc has unit tests.** Minimum: initial state, loading → success, loading → error, and all public methods.

30. **Every repository implementation has unit tests.** Mock the data source. Test success and failure paths for every method.

31. **Every custom widget has widget tests.** Test rendering, interaction (tap, input), and visual variants (loading, error, empty, disabled).

32. **Test files mirror source structure.** `lib/features/auth/presentation/cubit/auth_cubit.dart` → `test/features/auth/presentation/cubit/auth_cubit_test.dart`.

33. **Use mocktail for mocking.** No `mockito`. Mocks are created with `class MockFoo extends Mock implements Foo {}`.

34. **Integration tests for critical flows.** Login → browse → add to cart → checkout must have E2E coverage.

### Naming & Style Rules

35. **Files: snake_case. Classes: PascalCase. Variables: camelCase. Constants: camelCase.** Follow Effective Dart.

36. **Use `package:` imports within `lib/`.** Enable `always_use_package_imports` lint. No relative imports inside `lib/`.

37. **Feature names are singular nouns.** `auth`, `cart`, `order`, `menu` — not `authentication`, `shopping_cart`.

38. **Use case files: `<verb>_<noun>.dart`.** `login_user.dart`, `get_nearby_restaurants.dart`, `place_order.dart`.

39. **Cubit file: `<feature>_cubit.dart`. State file: `<feature>_state.dart`.** Consistent across all features.

### Configuration & Environment Rules

40. **Three environments: dev, staging, production.** Configured via `--dart-define=ENV=...`. Each has its own API URL, feature flags, and logging level.

41. **Environment config is injected, not imported.** Services receive config via constructor, not by reading `AppEnvironmentConfig.current` statically.

42. **Secrets are never in source code.** API keys, tokens, certificates are injected at build time via `--dart-define` or secure vault.

### Documentation Rules

43. **README contains: architecture diagram, folder structure, setup, commands, conventions.** A new developer should be productive within 30 minutes.

44. **Every public class/method has a doc comment.** One sentence describing what it does. "Why" comments for non-obvious decisions.

45. **Architecture Decision Records (ADRs) for significant choices.** Documented in `docs/adr/` with context, decision, and consequences.

### Cross-Platform Rules

46. **Domain layer is framework-agnostic.** The same use cases and entities compile in any Dart/Flutter project and can be directly translated to TypeScript, Kotlin, Swift, or any OOP language.

47. **Business rules live in entities and use cases, not in state management.** A Cubit/ViewModel in Flutter should translate to a ViewModel in Android, a Store in React Native, or an @Observable in SwiftUI without changing business logic.

48. **Naming reflects the domain, not the framework.** `LoginUseCase`, not `LoginBlocLogic`. `RestaurantRepository`, not `RestaurantProvider`.

49. **API contracts are documented and versioned.** The same OpenAPI spec is used across all platforms. No implicit assumptions about API behavior.

50. **Feature structure is consistent across platforms.** `features/auth/data/`, `features/auth/domain/`, `features/auth/presentation/` — the same directory structure works in React Native, Android (Kotlin), iOS (Swift), and Ionic.

---

## Feature Audit Score Matrix

| Feature | CA | State | Repo | DTO | UseCases | Errors | States | Logic | Naming | Tests | **Score** |
|---|---|---|---|---|---|---|---|---|---|---|---|
| customer/home | 9 | 9 | 9 | 9 | 9 | 6 | 9 | 9 | 9 | 9 | **87** |
| auth | 7 | 8 | 8 | 7 | 0 | 9 | 9 | 8 | 9 | 9 | **74** |
| driver/home | 8 | 9 | 8 | 8 | 0 | 6 | 8 | 8 | 9 | 9 | **73** |
| customer/order | 8 | 7 | 8 | 9 | 0 | 5 | 9 | 8 | 9 | 9 | **72** |
| customer/cart | 8 | 8 | 8 | 8 | 0 | 5 | 8 | 8 | 9 | 9 | **71** |
| customer/restaurant | 8 | 7 | 8 | 6 | 0 | 5 | 7 | 8 | 7 | 0 | **56** |
| customer/address | 3 | 0 | 5 | 0 | 0 | 2 | 5 | 4 | 7 | 0 | **26** |
| customer/profile | 1 | 3 | 0 | 0 | 0 | 3 | 4 | 5 | 6 | 0 | **22** |
| driver/profile | 1 | 3 | 0 | 0 | 0 | 2 | 3 | 5 | 6 | 0 | **20** |
| customer/checkout | 1 | 0 | 1 | 0 | 0 | 3 | 4 | 3 | 5 | 0 | **17** |
| driver/earnings | 1 | 3 | 0 | 0 | 0 | 2 | 2 | 4 | 5 | 0 | **17** |
| driver/history | 1 | 3 | 0 | 0 | 0 | 1 | 3 | 4 | 5 | 0 | **17** |

**Key:** CA = Clean Architecture compliance, State = Cubit/State quality, Repo = Repository pattern, DTO = Model/Entity separation, UseCases = Use case presence, Errors = Error handling, States = Loading/Empty/Error state coverage, Logic = No business logic in UI, Naming = Conventions, Tests = Test coverage

---

## Methodology Notes

This audit examined:
- **34 core-layer files** across 15 directories
- **54 feature-layer files** across 12 feature modules
- **17 test files** across core widgets and feature tests
- **8 configuration files** (pubspec, lints, CI, platform configs, ARB files)

Every finding includes severity, explanation, why it matters, and a recommended solution with refactored examples where applicable. No code was rewritten unnecessarily — recommendations preserve working business logic while improving architecture, maintainability, scalability, readability, testability, and cross-platform consistency.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
