# CLAUDE.md — LightBite Flutter App

## Project Overview

**LightBite** — Food delivery platform with customer + driver apps.
- **Framework:** Flutter 3.38+ / Dart 3.10+
- **Pattern:** Clean Architecture (feature-first) + BLoC
- **Target:** Reference implementation for cross-platform comparison (React Native, Android, iOS, Ionic)

---

## Quick Reference

```bash
flutter pub get          # Install dependencies
dart analyze lib/        # Static analysis (must be zero errors)
flutter test             # Run all tests (must all pass)
```

---

## Architecture

### Layer Dependency Rule

```
presentation → domain ← data
```

- **Domain** is pure Dart — zero framework imports (no Flutter, no Dio, no Hive)
- **Data** implements domain interfaces
- **Presentation** depends on domain (use cases) and framework

### Folder Structure

```
lib/
├── app/
│   ├── di/                  # Dependency injection (1 module per feature)
│   │   ├── injection_container.dart   # Orchestrator
│   │   ├── core_di.dart
│   │   ├── auth_di.dart / home_di.dart / cart_di.dart / etc.
│   └── router/
│       └── app_router.dart  # GoRouter configuration
├── core/
│   ├── bloc/base_cubit.dart # Safe emit (checks isClosed)
│   ├── bus/                 # Event bus (SessionExpired, ConnectivityChanged)
│   ├── config/              # AppEnvironmentConfig (reads from .env)
│   ├── connectivity/        # ConnectivityService interface + impl
│   ├── errors/              # Failure types + DioException mapper
│   ├── logger/              # AppLogger interface + PrintLogger + LoggerKey
│   ├── network/             # ApiClient, interceptors (auth, refresh, connectivity)
│   ├── storage/             # SecureStorage, LocalCache
│   ├── theme/               # LightBiteTheme (ThemeExtension), AppTheme (light + dark)
│   └── widgets/             # Reusable LB-prefixed widgets
└── features/
    ├── auth/                # Login, register, token management
    ├── customer/
    │   ├── home/            # Restaurant listing, search, cuisine filters
    │   ├── restaurant/      # Menu categories, items
    │   ├── cart/            # Cart CRUD
    │   ├── checkout/        # Address selection, place order
    │   ├── order/           # Order history, tracking
    │   ├── address/         # Address management
    │   └── profile/         # User profile
    ├── driver/
    │   ├── home/            # Online/offline, job polling, delivery workflow
    │   ├── earnings/        # Driver earnings
    │   ├── history/         # Delivery history
    │   └── profile/         # Driver profile
    └── theme/               # ThemeCubit

Each feature follows:
feature/
├── data/
│   ├── datasources/     # Abstract + impl (remote data access)
│   ├── models/          # DTOs with fromJson/toJson + toEntity()
│   └── repositories/    # Implements domain repository interface
├── domain/
│   ├── entities/        # Pure Dart classes (Equatable, no serialization)
│   ├── repositories/    # Abstract interface
│   └── usecases/        # Single-purpose classes with typed params
└── presentation/
    ├── cubit/           # State class (Dart sealed) + Cubit
    └── pages/           # Flutter widgets
```

---

## State Management

### Decision Tree

| State Type | Tool |
|---|---|
| Screen state (loading/data/error/empty) | **Cubit + sealed state class** |
| App-wide state (auth, theme) | **Cubit (lazy singleton)** + `HydratedMixin` |
| Simple observed value (tab selection, focus, scroll) | **ValueNotifier + ValueListenableBuilder** |
| Trivial ephemeral UI (password toggle) | **setState** (only for `_obscurePassword`-style booleans) |

### Cubit Pattern (must follow exactly)

```dart
// State: use Dart 3 sealed class + Equatable
sealed class FeatureState extends Equatable {
  const FeatureState();
  R maybeWhen<R>({R Function(Data d)? loaded, R Function(String m)? error, required R Function() orElse}) =>
    switch (this) { FeatureLoaded(:final data) => loaded?.call(data) ?? orElse(), FeatureError(:final message) => error?.call(message) ?? orElse(), _ => orElse() };
}
class FeatureInitial extends FeatureState { const FeatureInitial(); @override List<Object?> get props => []; }
class FeatureLoading extends FeatureState { const FeatureLoading(); @override List<Object?> get props => []; }
class FeatureLoaded extends FeatureState { const FeatureLoaded(this.data); final Data data; @override List<Object?> get props => [data]; }
class FeatureError extends FeatureState { const FeatureError(this.message); final String message; @override List<Object?> get props => [message]; }

// Cubit: extend BaseCubit, inject use cases
class FeatureCubit extends BaseCubit<FeatureState> {
  FeatureCubit(this._useCase) : super(const FeatureInitial());
  final FeatureUseCase _useCase;

  Future<void> loadData() async {
    emit(const FeatureLoading());
    final result = await _useCase();
    result.fold(
      (failure) => emit(FeatureError(failure.message)),
      (data) => emit(FeatureLoaded(data)),
    );
  }
}
```

### Page Pattern

```dart
class FeaturePage extends StatelessWidget {
  const FeaturePage({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => sl<FeatureCubit>()..loadData(),  // DI via router, not in build
      child: const _FeatureView(),
    );
  }
}

class _FeatureView extends StatelessWidget {
  const _FeatureView();
  @override
  Widget build(BuildContext context) {
    return BlocBuilder<FeatureCubit, FeatureState>(
      builder: (context, state) => state.maybeWhen(
        loaded: (data) => _buildContent(context, data),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (msg) => LBErrorWidget(message: msg, onRetry: () => context.read<FeatureCubit>().loadData()),
        orElse: () => const Center(child: CircularProgressIndicator()),
      ),
    );
  }
}
```

---

## Error Handling

### Either<Failure, T> Pattern (mandatory)

```dart
// Repository returns Either — NEVER throws for business errors
abstract class FeatureRepository {
  Future<Either<Failure, Data>> getData();
}

// Repository implementation maps DioException → Failure
class FeatureRepositoryImpl implements FeatureRepository {
  @override
  Future<Either<Failure, Data>> getData() async {
    try {
      final response = await _dataSource.fetch();
      return Right(response.toEntity());
    } on DioException catch (e) {
      return Left(mapDioExceptionToFailure(e));
    } catch (e) {
      return const Left(ServerFailure());
    }
  }
}

// Cubit handles both paths
result.fold(
  (failure) => emit(ErrorState(failure.message)),
  (data) => emit(LoadedState(data)),
);
```

### Failure Types (in `core/errors/failures.dart`)

- `NetworkFailure` — connectivity/timeout
- `ServerFailure` — 5xx, malformed response
- `AuthFailure` — 401, 403
- `ValidationFailure` — invalid input
- `NotFoundFailure` — 404
- `CacheFailure` — local storage error

---

## Networking

### API Client

- **One instance** — `ApiClient` singleton, configured in `core_di.dart`
- **Interceptors chain:** `ConnectivityInterceptor` → `AuthInterceptor` → `RefreshInterceptor` → `LogInterceptor` (debug only)
- **Token refresh** — queue-safe via `RefreshInterceptor` with `_pendingQueue`

### Adding a new API call

1. Add method to data source interface + impl
2. Call through repository impl
3. Use case delegates to repository
4. Cubit calls use case

---

## Dependency Injection

### Registration Rules

| Type | Registration | Example |
|---|---|---|
| Core services (ApiClient, SecureStorage, Logger) | `registerLazySingleton` | `sl.registerLazySingleton<ApiClient>(...)` |
| Repositories | `registerLazySingleton` | `sl.registerLazySingleton<AuthRepository>(...)` |
| Use cases | `registerLazySingleton` | `sl.registerLazySingleton<LoginUser>(...)` |
| App-wide Cubits (AuthCubit) | `registerLazySingleton` | `sl.registerLazySingleton<AuthCubit>(...)` |
| Page-level Cubits | `registerFactory` | `sl.registerFactory<HomeCubit>(...)` |

### Adding a new feature

1. Create the 3-layer feature structure (`data/`, `domain/`, `presentation/`)
2. Create `<feature>_di.dart` in `lib/app/di/`
3. Import and call `register<Feature>()` from `injection_container.dart`
4. Register Cubit in the GoRouter route builder using `BlocProvider(create: (_) => sl<FeatureCubit>()..init())`

---

## Theme & Design System

### Accessing Design Tokens

```dart
final theme = LightBiteTheme.of(context);
// theme.colors.primary500, theme.spacing.md, theme.radius.sm, theme.typography.labelLarge
```

### Rules

- **NEVER** use `AppColors.*` directly in widgets — always go through `LightBiteTheme.of(context)`
- **NEVER** hardcode spacing values — use `theme.spacing.*`
- **NEVER** hardcode border radius — use `theme.radius.*`
- Custom widgets (`LB*`) must work in both light and dark themes

---

## Forbidden Patterns

| ❌ Forbidden | ✅ Required Alternative |
|---|---|
| `sl<Repository>()` in pages | Pages call Cubits, Cubits call use cases, use cases call repositories |
| `setState` for business/loading/error state | Cubit + sealed state |
| `try/catch` in Cubits | `result.fold()` on Either |
| Bare `catch (_)` without logging | `on DioException catch (e)` or add logging |
| `print()` in production code | `AppLogger` via DI |
| `AppColors.primary500` in widgets | `LightBiteTheme.of(context).colors.primary500` |
| `Navigator.of(context).push()` | GoRouter routes via `context.go()` |
| Relative imports inside `lib/` | `package:lightbite_app/...` imports |

---

## Accessibility

- Every custom widget (`LB*`) must have a `Semantics` widget
- Touch targets ≥ 44×44px
- Font scaling tested up to 200%

---

## Testing

### Required tests per feature

| Level | Minimum Tests |
|---|---|
| **Cubit** | initial state + loading→success + loading→error + all public methods |
| **Repository impl** | success path for every method + network error path |
| **Custom widget** | rendering + interaction (tap, input) + visual variants (loading, error, empty, disabled) |

### Test Setup

```dart
import 'package:hydrated_bloc/hydrated_bloc.dart';
import 'dart:io';

void main() {
  setUp(() async {
    HydratedBloc.storage = await HydratedStorage.build(
      storageDirectory: HydratedStorageDirectory(
        Directory.systemTemp.createTempSync('test_').path,
      ),
    );
  });
}
```

---

## Acceptance Criteria for New Features

When building a new feature, verify:

1. ✅ `data/` layer: data source interface + impl, model with `fromJson`/`toEntity`, repository impl
2. ✅ `domain/` layer: entity (Equatable), repository interface (returns `Either<Failure, T>`), use case with typed params
3. ✅ `presentation/` layer: Dart 3 sealed state, Cubit extends `BaseCubit` + uses `result.fold()`, page uses `BlocBuilder` with `maybeWhen`
4. ✅ DI module created and registered in `injection_container.dart`
5. ✅ Cubit provided in GoRouter route via `BlocProvider(create: ...)`
6. ✅ No `sl<>()` in page files
7. ✅ No `setState` for business state
8. ✅ No `try/catch` in Cubit
9. ✅ Theme tokens via `LightBiteTheme.of(context)`, not `AppColors.*`
10. ✅ Tests: cubit (min 3 cases), repository (min 2 paths)
11. ✅ `dart analyze lib/` — zero errors
12. ✅ `flutter test` — all pass
