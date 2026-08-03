# Navigation

LightBite React Native uses **Expo Router** for file-system routing. Every file in `app/` becomes a route automatically — no separate router config file.

## File-System Routing

| File | Route |
|---|---|
| `app/(auth)/login.tsx` | `/login` |
| `app/(customer)/home.tsx` | `/customer/home` |
| `app/(driver)/home.tsx` | `/driver/home` |

Group directories (`(auth)`, `(customer)`, `(driver)`) don't appear in URLs — they organize layouts.

## Auth Guard

The root `app/_layout.tsx` provides global providers (i18n, theme) and calls `checkAuth()` on mount. The `app/index.tsx` redirect acts as the auth guard:

```typescript
export default function Index() {
  const { isAuthenticated, user, isLoading } = useAuthStore();

  if (isLoading) return null;

  if (!isAuthenticated) return <Redirect href="/(auth)/onboarding" />;
  if (user?.role === 'driver') return <Redirect href="/(driver)/home" />;
  return <Redirect href="/(customer)/home" />;
}
```

## Layout Hierarchy

```
app/_layout.tsx                  # Root: I18nextProvider → ThemeProvider → Stack
├── app/index.tsx                # Redirect based on auth/role
├── app/(auth)/_layout.tsx       # Stack: onboarding → login → register
│   ├── app/(auth)/onboarding.tsx
│   ├── app/(auth)/login.tsx
│   └── app/(auth)/register.tsx
├── app/(customer)/_layout.tsx   # Tabs: Home, Search, Orders, Profile
│   ├── app/(customer)/home.tsx
│   ├── app/(customer)/search.tsx
│   ├── app/(customer)/orders.tsx
│   └── app/(customer)/profile.tsx
└── app/(driver)/_layout.tsx     # Tabs: Home, Earnings, History, Profile
    ├── app/(driver)/home.tsx
    ├── app/(driver)/earnings.tsx
    ├── app/(driver)/history.tsx
    └── app/(driver)/profile.tsx
```

## Tab Navigation

Customer and driver layouts use `@react-navigation/bottom-tabs` via Expo Router's `Tabs` component:

```typescript
// app/(customer)/_layout.tsx
export default function CustomerLayout() {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary[500],
        tabBarInactiveTintColor: theme.colors.neutral[400],
        tabBarStyle: {
          backgroundColor: theme.colors.neutral[0],
          borderTopColor: theme.colors.neutral[200],
        },
      }}
    >
      <Tabs.Screen name="home" options={{ title: t('customer.home') }} />
      <Tabs.Screen name="search" options={{ title: t('customer.search') }} />
      <Tabs.Screen name="orders" options={{ title: t('customer.orders') }} />
      <Tabs.Screen name="profile" options={{ title: t('customer.profile') }} />
    </Tabs>
  );
}
```

## Comparison with Flutter GoRouter

| Flutter | React Native |
|---|---|
| `GoRouter` config file with `GoRoute` tree | File-system: `app/` directory IS the route tree |
| `StatefulShellRoute.indexedStack` | `Tabs` component with per-tab screens |
| `redirect` guard function | `Redirect` component in `index.tsx` |
| `BlocProvider(create: (_) => sl<X>()..load())` per route | No provider needed — Zustand is global |
| Deep linking via `GoRouter` config | Deep linking is automatic via Expo Router |

## Screen Header

All pushed screens use the `ScreenHeader` component — a full-width app bar with a back arrow and centered title:

```tsx
import { ScreenHeader } from '@/core/ui/ScreenHeader';

<ScreenHeader title={t('customer.cart.title')} />
<ScreenHeader onBack={customHandler} />
```

The header handles its own safe area insets and renders a consistent 44px+ bar with a border-bottom. Tab-root screens (Home, Cart, Orders, Profile) don't use ScreenHeader since they're navigation roots.

## Best Practices

- **Layout files own their children's shared UI.** Tab bars, headers, and background colors go in layouts, not individual screens.
- **Redirect at the root.** Don't spread auth checks across every screen — the index redirect handles it.
- **Screens are thin.** Route files should be lightweight wrappers that delegate to feature hooks.

## Next Steps

- [Architecture](./architecture) — layer dependency and how navigation fits
- [State Management](./state-management) — how auth state drives routing decisions
- [Localization](./localization) — how tab labels use i18n keys
