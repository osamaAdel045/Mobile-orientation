# Getting Started

LightBite React Native is built with **Expo SDK 57** (managed workflow), **Expo Router** for file-system routing, **Zustand** for state management, and **TypeScript strict mode** throughout.

## Prerequisites

- **Node.js** 20.19+ or 22.13+ or 24.3+ (recommended: 24+)
- **npm** 10+
- **iOS Simulator** (macOS with Xcode) or **Android Emulator** for device testing
- **Expo Go** app on physical device (optional — for quick testing)

## Quick Start

```bash
cd /Users/mac/mobile_orintaion/lightbite-rn

# Install dependencies
npm ci

# Start the dev server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android
```

## Project Dependencies

### Core Runtime

| Package | Purpose |
|---|---|
| `expo` ~57.0 | Expo SDK — managed workflow, build tools |
| `expo-router` 5+ | File-system routing, deep linking |
| `react` 19.2 | UI framework |
| `react-native` 0.86 | Native runtime |
| `zustand` 5+ | Lightweight state management |
| `neverthrow` 7+ | `Result<T,E>` type for error handling |
| `zod` 3+ | Runtime schema validation + TypeScript types |
| `axios` 1+ | HTTP client with interceptor chain |
| `i18next` + `react-i18next` | Internationalization (en/ar) |
| `react-native-mmkv` | Synchronous key-value storage |
| `expo-secure-store` | Encrypted storage for tokens |
| `expo-localization` | Device locale detection |
| `@react-navigation/bottom-tabs` | Tab navigation for role shells |

### Dev Tooling

| Package | Purpose |
|---|---|
| `typescript` ~6.0 | Strict type checking |
| `eslint` + plugins | Code quality: no `console.log`, no relative imports, no raw strings |
| `prettier` | Consistent formatting |
| `stylelint` | No raw hex colors — must use theme tokens |
| `jest` + `jest-expo` + `@testing-library/react-native` | Unit and component testing |
| `msw` | Mock Service Worker for API test mocking |
| `plop` | Scaffold generator for features and components |
| `babel-plugin-module-resolver` | `@/` import path alias → `src/` |

## Available Scripts

| Script | Purpose |
|---|---|
| `npm start` | Start Expo dev server |
| `npm run ios` | Run on iOS simulator |
| `npm run android` | Run on Android emulator |
| `npm run lint` | ESLint check (zero warnings required) |
| `npm run format` | Prettier auto-format |
| `npm run typecheck` | TypeScript compilation check |
| `npm run check` | Full check: typecheck + lint + stylelint + format |
| `npm test` | Run all Jest tests |
| `npm run generate:feature <name>` | Scaffold a new feature folder |
| `npm run generate:component <Name>` | Scaffold a new shared UI component |

## Path Aliases

All imports use the `@/` prefix instead of relative paths:

```typescript
// ✅ Correct — path alias
import { useTheme } from '@/core/hooks/useTheme';
import { apiClient } from '@/core/api/client';

// ❌ Forbidden — relative imports fail ESLint
import { useTheme } from '../../core/hooks/useTheme';
```

## Project Structure

```
lightbite-rn/
├── app/                    # Expo Router routes (file-system routing)
├── src/
│   ├── core/              # Cross-cutting: api, storage, theme, hooks, ui
│   ├── features/          # Feature modules: auth, customer/*, driver/*
│   └── i18n/              # Translation files (en.json, ar.json)
├── __tests__/             # Test files mirroring src/ structure
├── plop/                  # Scaffold generator templates
└── .github/workflows/     # CI pipeline
```

## Next Steps

- [App Overview](./app-overview) — feature inventory and user flows
- [Architecture](../technical/architecture) — layer dependency, folder structure, and Flutter comparison
- [Code Quality & Enforcement](../technical/code-quality) — how automated tooling prevents inconsistency
