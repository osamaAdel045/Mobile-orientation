# LightBite React Native — Architecture & Engineering Standards

> **CRITICAL:** This document is PRESCRIPTIVE, not descriptive. It was written BEFORE feature code. Every rule below is enforced by tooling (ESLint, Stylelint, TypeScript, scaffold generator, CI). If you find a violation in code, the tooling has failed — fix the tooling.

## Architecture

Clean Architecture, feature-first: `screens → hooks/store → api` (unidirectional data flow).

```
app/          Expo Router file-system routes (thin — delegates to screens)
src/
├── core/     Cross-cutting: api client, storage, theme, shared UI
└── features/ One folder per feature: auth, home, restaurant, cart, etc.
```

Each feature contains: `api/` (endpoints), `store/` (Zustand), `hooks/` (React hooks), `screens/` (page components), `schemas/` (Zod), `types.ts`.

## State Management: Zustand + Neverthrow

- **Screen state:** TypeScript discriminated union — `{ status: 'loading' } | { status: 'loaded'; data: T } | { status: 'error'; message: string } | { status: 'empty' }`
- **Error handling:** Neverthrow `Result<T, AppError>` from all API calls. NEVER use try/catch in components or hooks.
- **Persistence:** Zustand `persist` middleware + MMKV for cached data (auth tokens use SecureStore only).
- **Global state:** `useAuthStore` (user, tokens, role). Feature stores are scoped to their feature.

## Navigation: Expo Router

- File-system routing. Add `app/(customer)/home.tsx` → route `/customer/home`.
- Tab layouts use `(customer)/_layout.tsx` with Bottom Tabs.
- Auth guard in root `_layout.tsx` — redirects unauthenticated users to `(auth)` group.
- Deep linking is automatic via Expo Router.

## Data Layer: Axios + Zod

- `core/api/client.ts` — singleton Axios instance with interceptor chain: Connectivity → Auth → Refresh → Logging.
- All API responses validated with Zod schemas before reaching stores.
- Refresh interceptor implements queue-safe token refresh (same logic as Flutter's RefreshInterceptor).

## Theme: Typed Design Tokens

- ALL visual values come from `useTheme()` hook. NEVER use raw hex colors, raw pixel values, or inline styles.
- `core/theme/tokens.ts` is the single source of truth, matching `system-desing/11-design-system.md`.
- Light and dark themes both defined as `ThemeTokens` objects.

## i18n: i18next

- ALL user-facing strings in `src/i18n/en.json` and `ar.json`.
- Use `useTranslation()` hook: `const { t } = useTranslation(); <Text>{t('home.greeting')}</Text>`.
- CI fails if any naked string is found in JSX.

## Testing: Jest + RNTL + MSW

- **Store tests:** Plain Jest — Zustand stores are pure functions, no special harness needed.
- **Component tests:** React Native Testing Library — `render(<Screen />)`, query by text/role/testID.
- **API tests:** Mock Service Worker intercepts at network layer — no mocking modules.
- **Test file location:** `__tests__/` mirroring `src/` structure.

## Folder Rules

- Feature folders follow EXACT structure: `api/store/hooks/screens/schemas/types.ts`
- Shared UI components in `src/core/ui/` — feature screens import from here, never create ad-hoc buttons/inputs.
- Scaffold generator enforces this — `npm run generate:feature <name>` creates the template.

## Forbidden Patterns

| ❌ Forbidden                                | ✅ Required                                 |
| ------------------------------------------- | ------------------------------------------- |
| `console.log()` in any file                 | ESLint error — zero tolerance               |
| Raw hex colors (`#FFF`) in JSX              | `useTheme().colors.primary[500]`            |
| Raw pixel values (`padding: 16`) in styles  | `useTheme().spacing.md`                     |
| `try/catch` in components or hooks          | `result.match(okFn, errFn)` from Neverthrow |
| `any` type (without eslint-disable comment) | Explicit TypeScript types                   |
| Relative imports (`../../core/api`)         | `@/core/api/client`                         |
| Hardcoded strings in JSX                    | `t('key')` from i18next                     |
| Manual file creation for features           | `npm run generate:feature <name>`           |
| Ad-hoc buttons/inputs in feature screens    | Import from `@/core/ui/`                    |
| Direct MMKV/SecureStore access in features  | Through `@/core/storage/` wrappers only     |
