# Best Practices from Monsha'at Mobile — Applicable to LightBite

**Source:** `/Users/mac/StudioProjects/Mobile` — 973 Dart files, enterprise ERP Flutter app (v1.1.7+108)
**Target:** `/Users/mac/mobile_orintaion/lightbite-app` — Food delivery platform

---

## How to Read This Document

Each section below identifies a best practice from the Monsha'at Mobile project, explains why it matters, maps it to the corresponding LightBite audit finding, and provides a concrete implementation recommendation.

---

## 1. Environment Configuration — `.env` + `flutter_dotenv`

**What Monsha'at does:**
Uses a `.env` file with `flutter_dotenv` package. All API URLs, API keys, Sentry DSN, WebSocket URLs, and environment flags are in one file with `PRODUCTION_` and `DEVELOPMENT_` prefixed variants.

```env
PRODUCTION_BASE_URL="https://pservices.monshaat.gov.sa/ERP/TaskService/api"
DEVELOPMENT_BASE_URL="https://publicapis.monshaat.gov.sa/ERP/TaskService/api"
SENTRY_DSN="https://...@o4504355189882880.ingest.us.sentry.io/4508280247943168"
DEV_MODE=false
```

**Why it matters:** Centralizes all configuration. No hardcoded URLs in Dart files. Easy to add new environments. Secrets can be gitignored while keeping the structure visible.

**Maps to LightBite issues:**
- C2 (Move DI/router out of core) — the DI currently reads `AppEnvironmentConfig.current` statically
- `AppConfig` (dead code) vs `AppEnvironmentConfig` (duplicate configuration sources)
- Hardcoded `wsUrl`, `apiBaseUrl` in `app_config.dart`

**Recommendation for LightBite:**
```env
# .env (add to .gitignore, keep .env.example in git)
PRODUCTION_BASE_URL="https://api.lightbite.com/api/v1"
DEVELOPMENT_BASE_URL="http://localhost:8001/api/v1"
PRODUCTION_WS_URL="wss://ws.lightbite.com"
DEVELOPMENT_WS_URL="ws://localhost:8001/ws"
SENTRY_DSN="https://..."
ENV=development
```

```yaml
# pubspec.yaml additions
dependencies:
  flutter_dotenv: ^5.2.1

flutter:
  assets:
    - .env
```

```dart
// lib/core/config/app_environment.dart — refactored
import 'package:flutter_dotenv/flutter_dotenv.dart';

class AppEnvironmentConfig {
  final String apiBaseUrl;
  final String wsUrl;
  final String sentryDsn;
  final bool isDevelopment;

  AppEnvironmentConfig._({
    required this.apiBaseUrl,
    required this.wsUrl,
    required this.sentryDsn,
    required this.isDevelopment,
  });

  static AppEnvironmentConfig get current => _instance;
  static late final _instance = AppEnvironmentConfig._(
    apiBaseUrl: dotenv.env['${dotenv.env['ENV']?.toUpperCase() ?? 'DEVELOPMENT'}_BASE_URL'] ?? '',
    wsUrl: dotenv.env['${dotenv.env['ENV']?.toUpperCase() ?? 'DEVELOPMENT'}_WS_URL'] ?? '',
    sentryDsn: dotenv.env['SENTRY_DSN'] ?? '',
    isDevelopment: dotenv.env['ENV'] == 'development',
  );
}
```

---

## 2. Sentry Crash Reporting

**What Monsha'at does:**
Integrates `sentry_flutter` as a wrapper around `runApp`. Adds `SentryNavigatorObserver` for breadcrumb tracking. Uses `SentryAssetBundle` for asset loading monitoring.

```dart
// main.dart — Monsha'at pattern
sentryWrapper(Function() run) async {
  await SentryFlutter.init(
    (options) {
      options.dsn = dotenv.get('SENTRY_DSN');
      options.tracesSampleRate = 1.0;
      options.profilesSampleRate = 1.0;
    },
    appRunner: () => run(),
  );
}

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await dotenv.load(fileName: ".env");
  await sentryWrapper(() => guardedMain());
}
```

```dart
// MaterialApp
MaterialApp(
  navigatorObservers: [
    SentryNavigatorObserver(),
  ],
)
```

**Why it matters:** Catches ALL errors — even during startup before `runApp`. Provides breadcrumb navigation tracking. Tracks performance traces. The LightBite `setupFlutterErrorHandling()` function exists but is never called, and its `runZonedGuarded` body is empty.

**Maps to LightBite issues:** C1 (Error handling never wired)

**Recommendation for LightBite:**
```yaml
# pubspec.yaml
dependencies:
  sentry_flutter: ^8.14.2
```

```dart
// lib/main.dart
import 'package:sentry_flutter/sentry_flutter.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await dotenv.load(fileName: ".env");
  await LocalCache.init();
  await initDependencies();

  await SentryFlutter.init(
    (options) {
      options.dsn = dotenv.env['SENTRY_DSN'];
      options.tracesSampleRate = 1.0;
      options.environment = dotenv.env['ENV'];
    },
    appRunner: () => runApp(const LightBiteApp()),
  );
}
```

---

## 3. `hydrated_bloc` for Persistent State

**What Monsha'at does:**
Uses `hydrated_bloc` to automatically persist and restore Bloc/Cubit state. `AppBloc`, `ThemeBloc`, and others use `HydratedMixin` with `fromJson`/`toJson`. User preferences (theme, locale, text scale) survive app restarts without manual SharedPreferences calls.

```dart
class AppBloc extends MyBloc<AppState> with HydratedMixin {
  AppBloc._(this.authRepo, this.releaseNotesRepo) : super(const AppState()) {
    hydrate(); // Restore persisted state on creation
  }

  @override
  AppState fromJson(Map<String, dynamic> json) => AppState(...);

  @override
  Map<String, dynamic> toJson(AppState state) => {...};
}
```

**Why it matters:** Eliminates manual SharedPreferences/Hive code for state persistence. User preferences are automatically restored. Reduces bugs where state is lost on app restart.

**Maps to LightBite issues:** LightBite uses `SecureStorage` and `LocalCache` (Hive) directly in Cubits. Auth state, theme, and locale don't persist automatically.

**Recommendation for LightBite:**
```yaml
# pubspec.yaml
dependencies:
  hydrated_bloc: ^9.1.5
```

```dart
// lib/features/auth/presentation/cubit/auth_cubit.dart
class AuthCubit extends HydratedCubit<AuthState> {
  AuthCubit({required this.authRepository}) : super(const AuthState.initial());

  @override
  AuthState? fromJson(Map<String, dynamic> json) {
    // Restore from persisted storage
    return json['user'] != null
        ? AuthState.authenticated(AuthUser.fromJson(json['user']))
        : const AuthState.initial();
  }

  @override
  Map<String, dynamic>? toJson(AuthState state) {
    return state.maybeWhen(
      authenticated: (user) => {'user': user.toJson()},
      orElse: () => null,
    );
  }
}
```

---

## 4. `dartz` Either<L,R> for Error Handling

**What Monsha'at does:**
All API calls and repository methods return `Either<String, dynamic>`. No throwing exceptions for business errors. The `ApiService.request()` method returns `Left(errorMessage)` or `Right(data)`. Repositories fold over the result.

```dart
// ApiService
Future<Either<String, dynamic>> request({...}) async {
  if (!checkConnectivity) return const Left(ApiErrors.noInternet);
  try {
    final response = await dio.request(...);
    // validate response
    return Right(apiResponse);
  } on DioException catch (e) {
    return const Left(ApiErrors.timeout); // or specific error
  }
}

// Repository
Future<Either<String, List<Restaurant>>> getNearbyRestaurants() async {
  final result = await apiService.request(url: '/restaurants', ...);
  return result.fold(
    (error) => Left(error),
    (data) => Right((data as List).map((e) => RestaurantModel.fromJson(e).toEntity()).toList()),
  );
}

// Cubit
Future<void> loadRestaurants() async {
  emit(state.copyWith(isLoading: true));
  final result = await getNearbyRestaurants();
  result.fold(
    (failure) => emit(state.copyWith(isLoading: false, error: failure)),
    (restaurants) => emit(state.copyWith(isLoading: false, restaurants: restaurants)),
  );
}
```

**Why it matters:** Type-safe error handling. No uncaught exceptions across layers. Errors are values, not control flow. Makes testing trivial — just check `isLeft()`/`isRight()`.

**Maps to LightBite issues:** A2 (Standardize Either<Failure, Success>), C4 (Token refresh failures), multiple silent catch blocks.

**Recommendation for LightBite:** Add `dartz: ^0.10.1` and refactor all repository interfaces to return `Either<Failure, T>`.

---

## 5. ThemeExtension for Design System

**What Monsha'at does:**
Uses a custom `ThemeExtension<CustomTheme>` that carries the ENTIRE design system: text fonts, sizes, weights, line heights, colors, tab themes, icon themes, app bar themes, splash type, story config, and login themes. This enables runtime theme switching between 6 theme variants (primary, darkBlue, green, foundation, ramadan, dark).

```dart
class CustomTheme extends ThemeExtension<CustomTheme> {
  final TextFonts textFonts;
  final TextLineHeights textLineHeights;
  final TextWeights textWeights;
  final TextSizes textSizes;
  final AppColors appColors;
  final AppBarTheme backgroundAppBarTheme;
  final TabBarThemeData segmentedTabBarTheme;
  // ... 20+ more theme properties

  static CustomTheme of(BuildContext context) =>
      Theme.of(context).extension<CustomTheme>()!;

  @override
  ThemeExtension<CustomTheme> copyWith({...}) => CustomTheme(...);

  @override
  ThemeExtension<CustomTheme> lerp(CustomTheme? other, double t) => CustomTheme(...);
}
```

**Why it matters:** Every widget accesses design tokens via `CustomTheme.of(context).appColors.primary` instead of hardcoding colors. Theme switching works globally. Adding a new theme variant means creating a new `CustomTheme` instance.

**Maps to LightBite issues:** A3 (Theme-aware custom widgets), A4 (Dark theme support), `LBButton`/`LBCard`/`LBInput` hardcoding colors instead of using the theme.

**Recommendation for LightBite:**
```dart
// lib/core/theme/extensions/lightbite_theme.dart
class LightBiteTheme extends ThemeExtension<LightBiteTheme> {
  final LightBiteColors colors;
  final LightBiteSpacing spacing;
  final LightBiteRadius radius;
  final LightBiteTypography typography;

  static LightBiteTheme of(BuildContext context) =>
      Theme.of(context).extension<LightBiteTheme>()!;
  // ... copyWith, lerp
}

// Usage in widgets
class LBButton extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final theme = LightBiteTheme.of(context);
    return ElevatedButton(
      style: ElevatedButton.styleFrom(
        backgroundColor: theme.colors.primary500,
        shape: RoundedRectangleBorder(
          borderRadius: theme.radius.md,
        ),
      ),
      child: Text('Submit', style: theme.typography.labelLarge),
    );
  }
}
```

---

## 6. Firebase Remote Config for Dynamic Configuration

**What Monsha'at does:**
Uses `firebase_remote_config` for:
- **Dynamic theming:** App theme and available themes fetched from Remote Config, so themes can change without an app store release
- **Force updates:** Minimum app version fetched from Remote Config; forces users to update
- **Feature flags:** Enables/disables features remotely

```dart
// Theme fetching from Remote Config
Future fetchRemoteTheme() async {
  await FirebaseRemoteConfig.instance.fetchAndActivate();
  final remoteTheme = FirebaseRemoteConfig.instance.getString('theme');
  final themeVersion = FirebaseRemoteConfig.instance.getInt('themeVersion');
  // Compare with local version, update if remote is newer
}

// Force update check
static Future<bool> checkUpdate() async {
  final remoteVersion = FirebaseRemoteConfig.instance.getString('android_version_live');
  return isVersionHigher(remoteVersion, localVersion, localBuild);
}
```

**Why it matters:** Zero-downtime configuration changes. Force critical updates. A/B test features. Change UI themes for holidays/seasons.

**Maps to LightBite issues:** F4 (Feature flags), no remote configuration exists.

**Recommendation for LightBite:**
```yaml
# pubspec.yaml
dependencies:
  firebase_core: ^3.10.0
  firebase_remote_config: ^5.3.1
```

---

## 7. Centralized Navigation via `Nav` Abstract Class

**What Monsha'at does:**
ALL navigation goes through a single `Nav` abstract class. Every screen has a typed static method (e.g., `Nav.login(context)`, `Nav.article(context, model)`). Uses `Nav.mainNavKey` as the global navigator key. Supports `_push`, `_replace`, `_replaceAll`, `_pushBottomSheet`, `_pushDialog` as private helpers.

```dart
abstract class Nav {
  static final mainNavKey = GlobalKey<NavigatorState>();

  static login(BuildContext context) async => await _replaceAll(
    context, PageKey.login, const LoginPage(),
  );

  static article(BuildContext context, ArticleModel model, {bool replace = false}) async =>
    replace
      ? await _replace(context, PageKey.article, ArticlePage(model: model))
      : await _push(context, PageKey.article, ArticlePage(model: model));

  static Future<T?> _push<T>(BuildContext context, PageKey key, Widget page) async {
    await _closeDrawer(context);
    if (!context.mounted) return null;
    return await Navigator.of(context).push<T>(
      MaterialPageRoute(settings: RouteSettings(name: key.name), builder: (context) => page),
    );
  }
}
```

**Why it matters:** No scattered `Navigator.of(context).push()`. All routes are discoverable in one file. Type-safe navigation parameters. Consistent transition behavior. Easy to add analytics tracking to all navigation. Easy to migrate to a different router.

**Maps to LightBite issues:** LightBite uses `GoRouter` with `sl<>()` calls in route builders. Routes import feature pages directly with relative imports. The router is in `core/` which violates Clean Architecture.

**Recommendation for LightBite:** Consider replacing `GoRouter` with the `Nav` pattern, OR properly structure `GoRouter`:
```dart
// lib/app/router/app_router.dart
abstract class Nav {
  static final router = GoRouter(
    navigatorKey: _rootNavigatorKey,
    initialLocation: '/splash',
    routes: [
      // Routes defined here or in feature-specific route modules
    ],
  );

  // Typed navigation helpers
  static void login(BuildContext context) => context.go('/login');
  static void home(BuildContext context) => context.go('/home');
  static void tracking(BuildContext context, String orderId) => context.go('/tracking/$orderId');
}
```

---

## 8. Event Bus for Cross-Cutting Events

**What Monsha'at does:**
Uses the `event_bus` package for cross-cutting events. `UserLoggedOutEvent` is fired from the API service when a 401 is detected. `AppBloc` subscribes to this event and clears user state globally. All Cubits use `EventBusCubitMixin` to access the bus.

```dart
// Event definition
class UserLoggedOutEvent {}

// API Service fires event
if (statusCode == 401) {
  bus.fire(const UserLoggedOutEvent());
  clearUser();
}

// AppBloc subscribes
class AppBloc extends MyBloc<AppState> with HydratedMixin {
  AppBloc._(this.authRepo, this.releaseNotesRepo) : super(const AppState()) {
    hydrate();
    subscribe<UserLoggedOutEvent>((event) {
      loggedOut();
    });
  }
}
```

**Why it matters:** Decouples the API layer from UI state. When a 401 is detected anywhere (API service, WebSocket, background service), one event clears auth state everywhere. No manual coordination between services.

**Maps to LightBite issues:** C4 (Token refresh race condition), the `RefreshInterceptor` doesn't communicate auth failures to the rest of the app.

**Recommendation for LightBite:**
```yaml
dependencies:
  event_bus: ^2.0.1
```

```dart
// lib/core/bus/app_events.dart
class SessionExpiredEvent {}
class ConnectivityChangedEvent { final bool isConnected; ConnectivityChangedEvent(this.isConnected); }

// lib/core/bus/event_bus.dart — global instance
import 'package:event_bus/event_bus.dart';
final appBus = EventBus();

// In ApiClient or RefreshInterceptor
if (statusCode == 401) {
  appBus.fire(SessionExpiredEvent());
}

// In AuthCubit
class AuthCubit extends Cubit<AuthState> {
  late final StreamSubscription _sessionSub;

  AuthCubit() : super(const AuthState.initial()) {
    _sessionSub = appBus.on<SessionExpiredEvent>().listen((_) => logout());
  }

  @override
  Future<void> close() {
    _sessionSub.cancel();
    return super.close();
  }
}
```

---

## 9. Base Bloc/Cubit Class (`MyBloc`)

**What Monsha'at does:**
Creates a `MyBloc<S>` base class that extends `Cubit<S>` with `EventBusCubitMixin<S>` and adds a safe `emit()` override that checks `isClosed`.

```dart
abstract class MyBloc<S> extends Cubit<S> with EventBusCubitMixin<S> {
  MyBloc(super.initialState);

  @override
  void emit(S state) {
    if (!isClosed) {
      super.emit(state);
    }
  }
}
```

**Why it matters:** Prevents `StateError (Bad state: Cannot emit new states after calling close)` crashes. All Cubits get event bus access. Consistent base class for all state management.

**Recommendation for LightBite:**
```dart
// lib/core/bloc/base_cubit.dart
abstract class BaseCubit<S> extends Cubit<S> {
  BaseCubit(super.initialState);

  @override
  void emit(S state) {
    if (!isClosed) {
      super.emit(state);
    }
  }
}
```

---

## 10. Structured Logging with Categories

**What Monsha'at does:**
Uses a `logger` function with a `LoggerKey` enum for categorized logging. Uses `dart:developer`'s `log()` function which supports named log channels. JSON prettification for structured output.

```dart
enum LoggerKey {
  FCM_TOKEN, FCM_NOTIFICATION, API_REQUEST, API_RESPONSE,
  API_ERROR, CACHE, BLOC_OBS, FORCE_UPDATE, NAV,
}

void logger(LoggerKey title, Object? val) {
  if (kDebugMode) {
    final message = JsonEncoder.withIndent('\t').convert(val);
    log('$message', name: title.name.toUpperCase());
  }
}
```

**Why it matters:** Logs are filterable by category. API logs are structured JSON. Production builds strip all logs (kDebugMode guard). Easy to add log forwarding to Sentry.

**Maps to LightBite issues:** `print()` used throughout instead of `debugPrint()` or proper logging. `PrintLogger` exists but is never wired.

**Recommendation for LightBite:** Adopt this exact pattern — it's simple and effective.

---

## 11. Force Update Mechanism

**What Monsha'at does:**
`ForceUpdate` class checks Firebase Remote Config for minimum supported version. If the installed version is lower, the user is redirected to a `ForceUpdatePage` that links to the app store. Version comparison handles both version number and build number.

```dart
abstract class ForceUpdate {
  static Future<bool> checkUpdate() async {
    final remoteVersion = FirebaseRemoteConfig.instance.getString('android_version_live');
    return isVersionHigher(remoteVersion, localVersion, localBuild);
  }

  static bool isVersionHigher(String remote, String local, String build) {
    // Semantic version comparison logic
  }
}
```

**Why it matters:** Critical for enterprise apps — forces users to update when API-breaking changes are deployed. No support burden from outdated app versions.

**Recommendation for LightBite:** Implement this pattern once Firebase Remote Config is integrated.

---

## 12. FreeRASP — Root/Jailbreak Detection

**What Monsha'at does:**
Uses `freerasp` (Talsec) for detecting: app integrity violations, obfuscation issues, debug mode, device binding changes, hooks, missing passcode, privileged access, secure hardware unavailability, simulator/emulator, and unofficial app stores. Shows a security alert screen when threats are detected.

```dart
Future<void> initializeFreeRASP() async {
  final config = TalsecConfig(
    androidConfig: AndroidConfig(
      packageName: appPackageName,
      signingCertHashes: ['pNiRk9u7NAV08bWg8i5y/AocZwpN/ECwNTmtCbuy0oM='],
      supportedStores: ['com.android.vending'],
    ),
    iosConfig: IOSConfig(
      bundleIds: ['com.lightbite.app', 'com.lightbite.staging'],
      teamId: 'YOUR_TEAM_ID',
    ),
  );
  await Talsec.instance.start(config);
}
```

**Why it matters:** Required for fintech/food-delivery apps handling payments. Prevents running on compromised devices.

**Maps to LightBite issues:** F8 (Biometric authentication), no security hardening exists.

**Recommendation for LightBite:**
```yaml
dependencies:
  freerasp: 7.2.2
```

---

## 13. Connectivity-Aware API Layer

**What Monsha'at does:**
The `ApiService.request()` method checks connectivity BEFORE every API call. If offline, returns `Left(ApiErrors.noInternet)` immediately instead of waiting for a timeout.

```dart
final checkConnectivity = await connectionService.checkConnectivity();
if (!checkConnectivity) {
  recordError(ApiErrors.noInternet, stackTrace: StackTrace.current);
  return const Left(ApiErrors.noInternet);
}
```

**Why it matters:** Immediate feedback when offline. No 30-second timeout waits. Better UX.

**Maps to LightBite issues:** A7 (ConnectivityService needs interface), `ConnectivityService` exists but isn't registered in DI or used in `ApiClient`.

**Recommendation for LightBite:** Inject `ConnectivityService` into `ApiClient`. Check connectivity before every request.

---

## 14. `size_config` for Responsive Scaling

**What Monsha'at does:**
Uses `size_config` with a reference design size (430x932). Widgets use `.h` and `.w` extensions for consistent scaling. Supports tablet layout with a width threshold (600px).

```dart
SizeConfigInit(
  referenceWidth: 430,
  referenceHeight: 932,
  builder: (context, orientation) => MaterialApp(...),
);

// Usage in widgets
SizedBox(height: 16.h),
Container(width: 100.w),
```

**Why it matters:** Consistent sizing across all devices. One design scales everywhere. No manual `MediaQuery` calculations.

**Recommendation for LightBite:**
```yaml
dependencies:
  size_config: ^2.0.3
```

---

## 15. `DioInterceptToCurl` for API Debugging

**What Monsha'at does:**
Uses `dio_intercept_to_curl` package in debug mode. Every API request is printed as a ready-to-use cURL command.

```dart
if (kDebugMode) {
  di<Dio>().interceptors.add(DioInterceptToCurl(printOnSuccess: true));
}
```

**Why it matters:** Makes API debugging trivial — copy the cURL command, paste in terminal/Postman. No need to manually reconstruct headers, body, query params.

**Recommendation for LightBite:**
```yaml
dependencies:
  dio_intercept_to_curl: ^0.2.0
```

---

## 16. Certificate Pinning (Real, Not Stub)

**What Monsha'at does:**
Uses `http_certificate_pinning` package for production SSL pinning. Also loads a PEM certificate file for custom SSL trust on internal servers.

```dart
// Load trusted certificates
final file = await rootBundle.loadString('assets/certificates/certificates.pem');
final sslCert = SecurityContext.defaultContext..setTrustedCertificates(file);
dio.httpClientAdapter = IOHttpClientAdapter(
  createHttpClient: () => HttpClient(context: sslCert),
);

// Certificate pinning via package
if (!isAllowPinInterceptor && !kDebugMode) {
  dio.interceptors.add(CertificatePinningInterceptor());
}
```

**Why it matters:** The LightBite `CertificatePinner` class has incorrect fingerprint computation and is never called. Monsha'at uses a production-tested package approach.

**Maps to LightBite issues:** LightBite's `CertificatePinner` is dead code with broken `_fingerprint` method.

**Recommendation for LightBite:** Replace the custom `CertificatePinner` with the `http_certificate_pinning` package.

---

## 17. Custom Packages Folder for Vendored Dependencies

**What Monsha'at does:**
Maintains a `custom_packages/` directory with locally modified versions of packages:
- `chewie-1.10.0` (video player)
- `pin_code_fields-8.0.1` (OTP input)
- `smooth_page_indicator-1.2.0` (page indicators)
- `instagram_page_indicator-0.1.1`
- `use_optimistic-1.0.2` (custom-built optimistic update helper)

Referenced in `pubspec.yaml` via `path:`:
```yaml
dependencies:
  chewie:
    path: custom_packages/chewie-1.10.0
```

**Why it matters:** Allows forking packages when bugs need immediate fixes or features need customization. No waiting for upstream PRs. Clear version tracking in folder names.

**Recommendation for LightBite:** Adopt this pattern if any packages need local modifications.

---

## 18. `use_optimistic` — Custom Optimistic Update Pattern

**What Monsha'at does:**
Built a custom `use_optimistic` package that handles optimistic UI updates with rollback. This is a CRITICAL pattern for food delivery apps where actions like "add to cart" or "place order" should feel instant.

**Recommendation for LightBite:** Build or adopt an optimistic update pattern for cart operations. This is critical for food delivery UX.

---

## 19. DI Registration Convention

**What Monsha'at does:**
Clear, consistent DI registration patterns:
- `registerSingleton` for services, repos, and shared state (ApiService, CacheHelper, all Repos, ThemeBloc)
- `registerFactory` for page-level Blocs (creates new instance each time)
- `registerLazySingleton` for services that need lazy initialization

```dart
// Singleton — one instance for app lifetime
di.registerSingleton(ApiService(di(), di(), di()));
di.registerSingleton(AuthRepo(di(), di(), di()));

// Factory — new instance per resolution
di.registerFactory(() => LoginBloc(di()));
di.registerFactory(() => RequestsBloc(di(), di(), di()));
```

**Why it matters:** Prevents memory leaks (factory Blocs are created fresh). Ensures shared state consistency (singleton repos and services). Clear mental model for developers.

**Maps to LightBite issues:** C3 (AuthCubit registered as factory instead of singleton), inconsistent registration patterns.

**Recommendation for LightBite:**
```dart
// Core services — singletons
sl.registerSingleton<ApiClient>(ApiClient());
sl.registerSingleton<SecureStorage>(SecureStorage());
sl.registerSingleton<ConnectivityService>(ConnectivityServiceImpl());

// Repos — singletons
sl.registerSingleton<AuthRepository>(AuthRepositoryImpl(remote: sl(), local: sl()));

// Feature Cubits — factories (new per screen visit)
sl.registerFactory<LoginCubit>(() => LoginCubit(authRepository: sl()));

// App-wide Cubits — lazy singletons
sl.registerLazySingleton<AuthCubit>(() => AuthCubit(authRepository: sl()));
```

---

## 20. Safe Utilities Pattern

**What Monsha'at does:**
Provides extension methods for safe List/String/Map access that never throw:

```dart
extension SafeList<E> on List<E> {
  E? get safeFirst => isEmpty ? null : first;
  E? get safeLast => isEmpty ? null : last;
  E? safeElementAt(int index) => index < length ? this[index] : null;
}
```

Combined with `valid_data.dart` for type-safe JSON parsing:
```dart
String validateString(dynamic src, [String defaultValue = '']) { ... }
int validateInt(dynamic src, [int defaultValue = 0]) { ... }
bool isTrue(dynamic src) { ... }
```

**Why it matters:** Prevents null-check and index-out-of-bounds crashes when parsing API responses. Defensive programming for dynamic JSON.

**Maps to LightBite issues:** LightBite has similar utilities but with some issues: bare `catch (_)`, `validateJsonListWithOption` duplication, `isTrue`/`isSuccess` duplication.

**Recommendation for LightBite:** Clean up and consolidate the existing `safe_utils.dart` and `valid_data.dart`.

---

## 21. `flutter_background_service` for Background Work

**What Monsha'at does:**
Uses `flutter_background_service` for background tasks like FCM handling and periodic data sync.

```dart
await BackgroundService.init();
```

**Why it matters:** For a food delivery app, background services are critical for: order status polling, location tracking for drivers, push notification handling.

**Recommendation for LightBite:** Add `flutter_background_service` and `flutter_local_notifications` for the driver-facing features.

---

## 22. Multiple Theme Variants with Remote Config

**What Monsha'at does:**
Supports 6 theme variants: `primary`, `darkBlue`, `green`, `foundation`, `ramadan`, `dark`. Themes can be switched at runtime. Theme list is fetched from Remote Config so new themes can be added without an app update.

**Why it matters:** Beyond just light/dark mode — seasonal themes (Ramadan), brand variants, accessibility themes. A food delivery app could have: standard, dark, holiday-season, high-contrast accessibility theme.

**Recommendation for LightBite:** Start with light + dark. Build the infrastructure for multiple themes via `ThemeExtension`.

---

## 23. `flutter_debug_overlay` for Development

**What Monsha'at does:**
Shows a debug overlay with HTTP request inspector during development. Tappable to see full request/response details.

```dart
if (kDebugMode) {
  return DebugOverlay(
    httpBucket: httpBucket,
    opacity: 1,
    child: trueChild,
  );
}
```

**Recommendation for LightBite:**
```yaml
dev_dependencies:
  flutter_debug_overlay: ^0.1.9
```

---

## Summary: Priority Best Practices to Apply

### Immediate (Phase 1 — Critical)
| # | Practice | Maps to LightBite Issue |
|---|---|---|
| 1 | `.env` + `flutter_dotenv` for environment config | C2 (config duplication) |
| 2 | Sentry crash reporting | C1 (error handling never wired) |
| 3 | Event bus for auth/session management | C4 (token refresh race condition) |
| 4 | `hydrated_bloc` for state persistence | C3 (AuthCubit factory vs singleton) |
| 5 | Real certificate pinning via package | Dead code replacement |
| 6 | Connectivity-aware API layer | A7 (ConnectivityService interface) |

### Next (Phase 2 — Architecture)
| # | Practice | Maps to LightBite Issue |
|---|---|---|
| 7 | `dartz` Either for typed error handling | A2 |
| 8 | `ThemeExtension` for design system | A3, A4 |
| 9 | Centralized `Nav` class | Router refactoring |
| 10 | `MyBloc` base class with safe emit | State management robustness |
| 11 | Structured logging with categories | PrintLogger wiring |
| 12 | DI registration convention | Feature DI modules |

### Future (Phase 3–5)
| # | Practice | Maps to LightBite Issue |
|---|---|---|
| 13 | Firebase Remote Config | F4 (feature flags) |
| 14 | `size_config` for responsive design | Responsive layout |
| 15 | FreeRASP for root/jailbreak detection | F8 (security) |
| 16 | `DioInterceptToCurl` | Developer experience |
| 17 | `flutter_background_service` | Driver features |
| 18 | `flutter_debug_overlay` | Developer experience |
| 19 | `flutter_launcher_icons` + `flutter_native_splash` | App polish |
| 20 | Custom packages folder | Dependency management |

---

## What NOT to Copy from Monsha'at

These are patterns that exist in Monsha'at but should NOT be adopted by LightBite:

1. **Layer-first organization:** Monsha'at uses `models/`, `pages/`, `repos/` at the top level (layer-first), while LightBite uses `features/auth/`, `features/cart/` (feature-first). **LightBite's feature-first approach is BETTER** for this project size and cross-platform comparison goals.

2. **Monolithic DI file:** Monsha'at has a single 317-line `di.dart` with all registrations. LightBite should adopt feature-level DI modules (as recommended in A5 of the audit).

3. **Manual navigation instead of `go_router`:** Monsha'at uses raw `Navigator.push()`. LightBite's `go_router` is better for deep linking, typed routes, and cross-platform consistency.

4. **No use cases:** Neither project has widespread use cases. Only LightBite's `customer/home` has them. Both need this improvement.

5. **String-based API errors:** Monsha'at uses `Either<String, dynamic>` where `String` is the error type. LightBite should use typed `Failure` subclasses (as recommended in A2).

---

## Final Assessment

The Monsha'at Mobile project is a **production enterprise app** with real security, monitoring, and configuration management. Its strengths are in the infrastructure layer (Sentry, Remote Config, environment management, certificate pinning, root detection, background services) — exactly where LightBite is weakest.

The LightBite project has stronger architecture fundamentals (feature-first, Clean Architecture in mature features, `go_router`, `freezed`, consistent BLoC patterns) — exactly where Monsha'at takes shortcuts.

**The ideal approach:** Apply Monsha'at's infrastructure best practices to LightBite's architectural foundation. The result will be a reference implementation that is both well-architected AND production-hardened.
