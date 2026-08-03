# Code Quality & Enforcement

LightBite React Native prevents the inconsistency that plagued the Flutter implementation by enforcing **every standard automatically**. If a human has to remember a rule, it will eventually be broken.

## The Golden Rule

> **Every standard must be enforced automatically. If a human has to remember it, it will fail.**

This is the lesson from the Flutter project, where an excellent 11.6 KB CLAUDE.md documented ideal standards — but zero of them were automated. Print statements survived in production. Raw color values spread to 15 files. One cubit broke the state pattern because nothing stopped it.

In React Native, every rule has a corresponding automated check.

## Enforcement Layers

| Layer | Tool | What It Catches |
|---|---|---|
| **Syntax** | TypeScript `strict: true` | Type errors, missing properties, `any` usage, unused variables |
| **Code quality** | ESLint | `console.log`, relative imports, naked JSX strings |
| **Style** | Stylelint | Raw hex colors (`#FFF`), `!important` flags, hardcoded `px` values |
| **Formatting** | Prettier | Consistent quotes, trailing commas, indentation |
| **Structure** | Plop.js generator | Folder structure, file naming, import patterns |
| **Integration** | CI pipeline | All checks run on every push — fails on any violation |

## ESLint Rules

ESLint is configured with **zero tolerance** for common quality issues:

| Rule | Level | What It Prevents |
|---|---|---|
| `no-console` | error | `console.log()` in production code (Flutter: 5 violations survived) |
| `@typescript-eslint/no-explicit-any` | error | Untyped code — must use explicit types |
| `no-restricted-imports` | error | Relative imports outside a feature — must use `@/` alias |
| `import/order` | error | Inconsistent import ordering |
| `i18next/no-literal-string` | warn | Naked strings in JSX — must use `t('key')` |
| `react/jsx-no-literals` | warn | Raw text in JSX — encourages i18n usage |

### Import Rules Detail

```typescript
// ❌ Forbidden — relative imports across features
import { apiClient } from '../../core/api/client';

// ✅ Required — @/ path alias
import { apiClient } from '@/core/api/client';

// ✅ Allowed — relative imports within the same feature
import { useAuth } from '../hooks/useAuth';
```

The `no-restricted-imports` rule blocks `./` and `../../` patterns that cross feature boundaries, while allowing `../` within a feature's own folder.

## Stylelint Rules

Stylelint enforces design system usage by **banning raw visual values**:

| Rule | What It Prevents |
|---|---|
| `color-no-hex: true` | Raw hex colors (`#F97316`) — must use `useTheme().colors.primary[500]` |
| `declaration-no-important: true` | `!important` overrides that break the design system |
| `unit-allowed-list` | Only `%`, `deg`, `s`, `ms`, `dpi` allowed — no `px` |

**Note:** Stylelint via `postcss-styled-syntax` inspects template-literal styles (styled-components/Emotion). `StyleSheet.create({})` objects are not parsed. The `useTheme()` hook and TypeScript types are the primary enforcement for StyleSheet-based styles.

## Scaffold Generator (Plop.js)

The Plop.js scaffold generator prevents structural drift by making it **easier to follow the pattern than to deviate**:

```bash
# Generate a new feature with all files in correct structure
npm run generate:feature customer/checkout

# Generates:
# src/features/customer/checkout/
# ├── types.ts          (CheckoutItem, CheckoutRequest interfaces)
# ├── schemas/
# │   └── checkout.schema.ts  (Zod validation)
# ├── api/
# │   └── checkout.api.ts     (API functions with Neverthrow)
# ├── store/
# │   └── checkout.store.ts   (Zustand with ScreenState)
# ├── hooks/
# │   └── useCheckout.ts      (Typed hook)
# └── screens/
#     └── CheckoutScreen.tsx   (Screen component)
#
# __tests__/features/customer/checkout/
# ├── checkout.store.test.ts
# └── checkout.schema.test.ts
```

For shared UI components:

```bash
npm run generate:component Badge

# Generates:
# src/core/ui/Badge.tsx
# __tests__/core/ui/Badge.test.tsx
```

### Why Generators Over Documentation

In the Flutter project, the folder structure was documented in CLAUDE.md but not enforced. Developers (including AI agents) inevitably created files with slightly different structures.

The generator eliminates this:
- **No manual file creation for features.** Run the generator.
- **One template, one pattern.** Every Zustand store follows the same shape. Every screen uses the same `ScreenState` discriminated union.
- **If the pattern needs to change, change the template.** All future features get the update automatically.

## CI Enforcement

All checks run in GitHub Actions on every push and PR:

```yaml
jobs:
  check:
    steps:
      - run: npm run typecheck
      - run: npm run lint
      - run: npm run stylelint
      - run: npm run format:check
  test:
    needs: check
    steps:
      - run: npm test -- --coverage
  build:
    needs: test
    steps:
      - run: npx expo export --platform web
```

**Any violation fails the build.** A `console.log` that slips through locally is caught in CI before it reaches code review.

## Flutter Comparison: What Changed

| Issue | Flutter (5.1/10) | React Native (8+/10 target) |
|---|---|---|
| Print statements in production | 5 files, `flutter analyze` passed | ESLint `no-console: error`, CI blocks |
| Raw color/spacing values | 15 files used `AppColors` directly | Stylelint `color-no-hex` + typed `useTheme()` |
| Pattern breaks (MenuCubit) | 1 file broke the cubit pattern | Scaffold generator — pattern can't drift |
| Hardcoded strings | Onboarding, home page | `eslint-plugin-i18next`, CI extraction check |
| Relative imports across features | `import 'app.dart'` in main.dart | `no-restricted-imports`, auto-fix |
| Untyped DI calls | `theme_di.dart` used untyped `sl()` | TypeScript catches at compile time |

## Next Steps

- [Architecture](./architecture) — layer dependency and folder structure
- [State Management](./state-management) — Zustand patterns and error handling
- [API & Networking](./api-networking) — Axios interceptors and token refresh
