# Localization

LightBite React Native uses **i18next** with **react-i18next** for internationalization. Supports English (en) and Arabic (ar) with RTL layout via Expo's built-in RTL support.

## Setup

```typescript
// src/i18n/index.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: require('./en.json') },
    ar: { translation: require('./ar.json') },
  },
  lng: Localization.getLocales()[0]?.languageCode ?? 'en',
  fallbackLng: 'en',
  compatibilityJSON: 'v4',
});
```

The device's locale is detected automatically via `expo-localization`.

## Translation Files

Translation keys are organized by domain:

```json
// src/i18n/en.json
{
  "common": {
    "ok": "OK",
    "cancel": "Cancel",
    "retry": "Try Again"
  },
  "auth": {
    "login": {
      "title": "Welcome Back",
      "submit": "Sign In"
    },
    "validation": {
      "emailRequired": "Email is required",
      "passwordMinLength": "Password must be at least 8 characters"
    }
  },
  "customer": {
    "home": "Home",
    "search": "Search"
  },
  "driver": {
    "home": "Home",
    "earnings": "Earnings"
  }
}
```

Arabic translations (`ar.json`) mirror the same key structure.

## Usage in Components

```typescript
import { useTranslation } from 'react-i18next';

function LoginScreen() {
  const { t } = useTranslation();

  return (
    <Text style={styles.title}>{t('auth.login.title')}</Text>
    <Input placeholder={t('auth.login.emailPlaceholder')} />
    <Button title={t('auth.login.submit')} onPress={handleLogin} />
  );
}
```

## Enforcement

ESLint with `eslint-plugin-i18next` warns on naked JSX strings:

```
i18next/no-literal-string: "warn"
```

This encourages using `t('key')` instead of raw strings. CI runs with `--max-warnings 0`, so any naked string blocks the build.

## Key Naming Convention

```
<domain>.<section>.<key>

Examples:
  auth.login.title          → "Welcome Back"
  auth.validation.emailRequired → "Email is required"
  customer.home             → "Home"
  onboarding.slide1.title   → "Discover Restaurants"
```

## Comparison with Flutter l10n

| Flutter | React Native |
|---|---|
| `AppLocalizations.of(context)!.authLoginTitle` | `t('auth.login.title')` |
| `.arb` files (JSON with `@` metadata) | Plain `.json` files |
| Generated Dart classes | Runtime key lookup (flexible, no codegen) |
| RTL via `MaterialApp` locale | RTL via Expo + i18next language detection |

## Best Practices

- **All user-facing strings go in JSON files.** No exceptions — even placeholder text.
- **Use the `common.*` namespace** for shared strings like "OK", "Cancel", "Try Again".
- **Don't concatenate translated strings.** Use interpolation: `t('greeting', { name })` instead of `t('hello') + name`.
- **Validation error messages use i18n keys.** Zod schemas store i18n keys as error messages — the hook resolves them with `t()`.

## Next Steps

- [Code Quality](./code-quality) — i18n ESLint rules
- [Architecture](./architecture) — where i18n files live
- [Navigation](./navigation) — tab labels use i18n keys
