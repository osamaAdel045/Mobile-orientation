# LightBite KMP — Architecture & Build Guide

> Kotlin Multiplatform + Compose Multiplatform. Built from the official JetBrains template.

## Versions (in `gradle.properties`)

```properties
kotlin.version=1.9.22
agp.version=8.2.2
compose.version=1.5.12
```

## Build & Run

### iOS Simulator (Xcode — preferred)

```bash
open iosApp/iosApp.xcodeproj
# Then ⌘R in Xcode
```

### iOS Simulator (command line)

```bash
xcodebuild -project iosApp/iosApp.xcodeproj -scheme iosApp \
  -sdk iphonesimulator26.2 -arch x86_64 build && \
xcrun simctl boot "iPhone 16 Pro iOS26" 2>/dev/null && \
xcrun simctl install "iPhone 16 Pro iOS26" \
  /Users/mac/Library/Developer/Xcode/DerivedData/iosApp-gqaxryieulebsraprvwxxcteblax/Build/Products/Debug-iphonesimulator/LightBite.app && \
xcrun simctl launch "iPhone 16 Pro iOS26" com.lightbite.app
```

### iOS framework only

```bash
./gradlew :shared:compileKotlinIosX64
./gradlew :shared:linkDebugFrameworkIosX64
```

### Android

```bash
./gradlew :androidApp:assembleDebug
```

## Project Structure

```
shared/                         ← All Kotlin code (business + Compose UI)
├── src/commonMain/kotlin/com/lightbite/
│   ├── core/                   ← errors, api, storage, theme, ui, i18n, viewmodel
│   └── features/               ← auth, customer/*, driver/* (domain + data + presentation)
├── src/androidMain/            ← Android actuals (AppLogger, NetworkMonitor, Storage)
├── src/iosMain/                ← iOS actuals + Main.ios.kt
├── src/commonTest/             ← Shared tests
iosApp/                         ← Official Xcode project (JetBrains template)
├── iosApp.xcodeproj/
├── iosApp/iOSApp.swift
├── iosApp/ContentView.swift    ← import shared → Main_iosKt.MainViewController()
├── iosApp/Info.plist
└── Configuration/Config.xcconfig
androidApp/                     ← Android app module
```

## Architecture Rules

```
Screen (@Composable) → ViewModel → Repository → DataSource → ApiClient
```

- `shared/commonMain` is pure Kotlin — no Android SDK, no iOS SDK
- `shared/androidMain` has Android `actual` implementations
- `shared/iosMain` has iOS `actual` implementations
- ViewModels MUST use `SupervisorJob + CoroutineExceptionHandler` (see `core/viewmodel/ViewModel.kt`)
- ViewModels MUST NOT do heavy work in `init {}` — use `LaunchedEffect` in composable
- On iOS, Kotlin/Native crashes on unhandled coroutine exceptions (SIGABRT)

## iOS Gotchas

| Issue | Fix |
|-------|-----|
| `PlistSanityCheck` crash on iOS 26 | Use template's Info.plist with `$(PRODUCT_NAME)` |
| `Kotlin_ObjCExport_trapOnUndeclaredException` | Don't throw from ObjC-exposed functions; wrap in try-catch at entry |
| Koin `startKoin` crashes on iOS | Don't use Koin on iOS — manual DI or delay init |
| `terminateWithUnhandledException` (SIGABRT) | Every `CoroutineScope` must have `CoroutineExceptionHandler` |
| Simulator only supports x86_64 on Intel Mac | Use `-arch x86_64` and `iosX64` target |
| iOS 26.2 SDK requires min deployment 26.0 | Set `IPHONEOS_DEPLOYMENT_TARGET = 26.0` in Xcode project |
| Framework must be static | `isStatic = true` in `binaries.framework` |
| `Dispatchers.Main` = `DarwinMainDispatcher` on iOS | Must be handled explicitly in ViewModel scope |

## State: ScreenState<T> + AppResult<T>

```kotlin
sealed interface ScreenState<out T> {
    data object Loading : ScreenState<Nothing>
    data class Loaded<T>(val data: T) : ScreenState<T>
    data class Error(val message: String) : ScreenState<Nothing>
    data object Empty : ScreenState<Nothing>
}

sealed class AppResult<out T> {
    data class Success<T>(val data: T) : AppResult<T>()
    data class Failure(val error: AppError) : AppResult<Nothing>()
}
```

## Forbidden Patterns

| ❌ | ✅ |
|----|-----|
| `println()` in production | `AppLogger` |
| `runCatching` in ViewModels | `AppResult` + `when` |
| `init {}` doing I/O | `LaunchedEffect` in composable |
| Hardcoded strings in `Text()` | `Strings.xxx` or `stringResource()` |
| Raw `Color(0x…)` / `N.dp` / `N.sp` | `LightBiteTheme` tokens |
| `GlobalScope.launch` | `viewModelScope` + `CoroutineExceptionHandler` |
| Koin on iOS (currently broken) | Manual DI or pure Compose state |
| String literals in `Info.plist` | Use `$(VARIABLES)` from Config.xcconfig |

## Tests

- `shared/src/commonTest/` — ViewModel + Repository tests
- Framework: `kotlin.test` with `runTest`, MockK, Turbine
- Run: `./gradlew :shared:allTests`
