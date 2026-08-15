# Theme System

LightBite React Native uses **typed design tokens** enforced by TypeScript and Stylelint. All visual values come from `useTheme()` — raw hex colors and hardcoded pixel values are blocked at build time.

## Design Tokens

Tokens match the cross-platform design system spec (`system-desing/11-design-system.md`) exactly:

| Category | Token Scale |
|---|---|
| Colors | Primary (50-900), Neutral (0-900), Semantic (success/warning/error/info + light) |
| Spacing | xs(4), sm(8), md(16), lg(24), xl(32), 2xl(48) |
| Font Size | xs(12), sm(14), base(16), lg(18), xl(20), 2xl(24), 3xl(30) |
| Font Weight | regular(400), medium(500), semibold(600), bold(700) |
| Border Radius | sm(6), md(12), lg(16), full(9999) |
| Shadows | sm, md, lg, xl (iOS shadow + Android elevation) |

## The `useTheme()` Hook

```typescript
// Returns typed ThemeTokens — never use raw values
import { useTheme } from '@/core/hooks/useTheme';

function MyComponent() {
  const theme = useTheme();

  return (
    <View style={{
      backgroundColor: theme.colors.primary[500],  // #F97316
      padding: theme.spacing.md,                     // 16
      borderRadius: theme.radius.sm,                 // 6
    }}>
      <Text style={{
        fontSize: theme.fontSize.base,               // 16
        fontWeight: theme.fontWeight.medium,          // '500'
        color: theme.colors.neutral[0],               // '#FFFFFF'
      }}>
        Hello
      </Text>
    </View>
  );
}
```

## Light & Dark Themes

```typescript
export const lightTheme: ThemeTokens = {
  colors: { primary, neutral, semantic },
  isDark: false,
};

export const darkTheme: ThemeTokens = {
  ...lightTheme,
  colors: {
    primary,  // Preserved
    neutral: {
      0: '#111827',   // Dark surface
      50: '#1F2937',  // Dark background
      900: '#F9FAFB', // Light text on dark
    },
    semantic, // Preserved
  },
  isDark: true,
};
```

Dark theme **inverts the neutral palette** (light backgrounds become dark, dark text becomes light) while **preserving primary and semantic colors**. Orange is still orange in dark mode.

## ThemeProvider

```typescript
// src/core/theme/ThemeProvider.tsx
export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);
  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme: () => setIsDark(!isDark) }}>
      {children}
    </ThemeContext.Provider>
  );
}
```

The provider wraps the entire app in the root layout. Currently starts in light mode — will later integrate with system preference via `useColorScheme()`.

## Enforcement

**Stylelint** blocks raw hex colors:
```
color-no-hex: true → "Use theme tokens via useTheme() instead of raw hex values"
```

**TypeScript** ensures correct token usage — `theme.colors.primary[500]` is typed as `'#F97316'`, so you can't accidentally pass a wrong value.

## Comparison with Flutter

| Flutter | React Native |
|---|---|
| `LightBiteTheme extends ThemeExtension` | `ThemeTokens` interface + context |
| `LightBiteTheme.of(context)` | `useTheme()` hook |
| `AppColors.primary500` (legacy, banned) | Typed `theme.colors.primary[500]` |
| `AppSpacing.md` (legacy, banned) | Typed `theme.spacing.md` |

## Best Practices

- **Always destructure:** `const theme = useTheme()` at the top of every component.
- **Never inline raw values.** If you find yourself writing `#F97316` or `16` in a style, stop — use the theme.
- **Stylelint catches hex, but not pixels in StyleSheet.create().** The hook and TypeScript are the primary enforcement for spacing/fontSize/radius.

## Next Steps

- [Architecture](./architecture) — where theme files live
- [Components](../components/buttons) — how components use the theme
- [Code Quality](./code-quality) — Stylelint enforcement
