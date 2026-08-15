# Architecture

LightBite React Native follows **Clean Architecture with feature-first organization**. This is the same architecture as the Flutter reference implementation, adapted idiomatically to React Native patterns.

## Layer Dependency

```
screens → hooks → store → api
                          ↘
                       websocket (live events → store)
                       connectivity (offline signal → UI)
```

Data flows in one direction. Screens are thin — they render UI and delegate all logic to hooks. Hooks coordinate between Zustand stores and UI state. Stores hold business logic and call API functions. API functions make HTTP requests and return typed results.

### The canonical data flow

```
API call → Result<T, AppError> (Neverthrow) → Zustand store
       → Screen with discriminated-union states (loading | loaded | error | empty)
```

1. A feature's `api/` module makes the HTTP call and returns a `Result<T, AppError>` — it never throws.
2. The Zustand store consumes the result with `.match()` and writes a **discriminated union** screen state: `{ status: 'loading' } | { status: 'loaded'; data: T } | { status: 'error'; message: string } | { status: 'empty' }`.
3. The Screen switches on `status` and renders loading skeletons, data, error, or empty states — a separate `loaded` branch is not possible to hit by accident, because the union is exhaustive.

Real-time events enter the same funnel from the other side: the WebSocket client dispatches an event, the store maps it to a state update, and the screen re-renders. No component ever talks to a socket or an HTTP client directly.

## Folder Structure

```
src/
├── app/                    # Expo Router file-system routes (thin)
├── core/                   # Cross-cutting: api client, storage, theme, websocket, connectivity, shared UI
│   ├── api/               # Axios instance with interceptor chain
│   ├── websocket/         # Reverb (Pusher-protocol) client, config, provider, hooks
│   ├── connectivity/      # Offline detection: WebSocket state + /health probe
│   ├── storage/           # SecureStore + MMKV wrappers
│   ├── theme/             # Typed design tokens (colors, spacing, typography)
│   ├── hooks/             # Shared hooks (useTheme, useAppState)
│   └── ui/                # Shared components (Button, Input, Card, OfflineBanner, etc.)
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
│       ├── delivery/
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
- **Unidirectional data flow for live data too.** WebSocket events enter through the store layer and produce the same discriminated-union states as HTTP responses — screens never subscribe to sockets directly.
- **WebSocket primary, polling fallback.** Stores subscribe to Reverb channels for real-time updates (order tracking, driver jobs) and only poll while the socket is disconnected.

## Comparison with Flutter Implementation

| Flutter | React Native |
|---|---|
| BLoC / Cubit + sealed states | Zustand + TypeScript discriminated unions |
| dartz `Either<Failure, T>` | Neverthrow `Result<T, AppError>` |
| GoRouter + StatefulShellRoute | Expo Router file-system routing |
| Dio + interceptors | Axios + interceptors |
| `web_socket_channel` (or polling) | Reverb Pusher-protocol client in `core/websocket/` |
| `fromJson`/`toJson` models | Zod schemas (validation + types) |
| `get_it` DI | Zustand global stores (no DI container needed) |

## Next Steps

- [Code Quality & Enforcement](./code-quality) — how ESLint, Stylelint, and the scaffold generator prevent inconsistency
- [State Management](./state-management) — Zustand patterns, screen states, and error handling
- [API & Networking](./api-networking) — Axios interceptors, token refresh, Zod validation, and the WebSocket (Reverb) client
- [Theme System](./theme-system) — dark mode, system preference, and typed design tokens
