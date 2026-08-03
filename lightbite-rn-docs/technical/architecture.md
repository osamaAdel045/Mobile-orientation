# Architecture

LightBite React Native follows **Clean Architecture with feature-first organization**. This is the same architecture as the Flutter reference implementation, adapted idiomatically to React Native patterns.

## Layer Dependency

```
screens → hooks → store → api
```

Data flows in one direction. Screens are thin — they render UI and delegate all logic to hooks. Hooks coordinate between Zustand stores and UI state. Stores hold business logic and call API functions. API functions make HTTP requests and return typed results.

## Folder Structure

```
src/
├── app/                    # Expo Router file-system routes (thin)
├── core/                   # Cross-cutting: api client, storage, theme, shared UI
│   ├── api/               # Axios instance with interceptor chain
│   ├── storage/           # SecureStore + MMKV wrappers
│   ├── theme/             # Typed design tokens (colors, spacing, typography)
│   ├── hooks/             # Shared hooks (useTheme, useAppState)
│   └── ui/                # Shared components (Button, Input, Card, etc.)
├── features/              # One folder per feature domain
│   ├── auth/
│   │   ├── api/           # Auth API endpoints
│   │   ├── store/         # Zustand auth store
│   │   ├── hooks/         # useAuth, useLogin, useRegister
│   │   ├── screens/       # LoginScreen, RegisterScreen
│   │   ├── schemas/       # Zod validation schemas
│   │   └── types.ts       # TypeScript types
│   ├── customer/
│   │   ├── home/          # Same structure per sub-feature
│   │   ├── restaurant/
│   │   ├── cart/
│   │   ├── checkout/
│   │   ├── order/
│   │   └── profile/
│   └── driver/
│       ├── home/
│       ├── earnings/
│       ├── history/
│       └── profile/
└── i18n/                  # en.json, ar.json translation files
```

## Key Principles

- **Every standard enforced automatically.** Scaffold generator creates the folder structure. ESLint blocks `console.log` and raw imports. Stylelint blocks raw color values. TypeScript strict mode catches type errors at compile time.
- **One pattern per concern.** Every feature uses the same Zustand store pattern, the same Zod validation approach, the same screen state discriminated union. No exceptions.
- **Neverthrow over try/catch.** All API functions return `Result<T, AppError>`. Components and hooks use `.match()` — never try/catch.
- **Theme tokens over raw values.** Every color, spacing value, font size, and border radius comes from `useTheme()`. Raw hex values fail Stylelint in CI.

## Comparison with Flutter Implementation

| Flutter | React Native |
|---|---|
| BLoC / Cubit + sealed states | Zustand + TypeScript discriminated unions |
| dartz `Either<Failure, T>` | Neverthrow `Result<T, AppError>` |
| GoRouter + StatefulShellRoute | Expo Router file-system routing |
| Dio + interceptors | Axios + interceptors |
| `fromJson`/`toJson` models | Zod schemas (validation + types) |
| `get_it` DI | Zustand global stores (no DI container needed) |

## Next Steps

- [Code Quality & Enforcement](./code-quality) — how ESLint, Stylelint, and the scaffold generator prevent inconsistency
- [State Management](./state-management) — Zustand patterns, screen states, and error handling
- [API & Networking](./api-networking) — Axios interceptors, token refresh, and Zod validation
