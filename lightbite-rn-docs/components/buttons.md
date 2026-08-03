# Buttons

## `<Button>`

The primary call-to-action component. All visual values come from `useTheme()`.

**File:** `src/core/ui/Button.tsx`

### Variants

| Variant | Background | Text Color | Border | Usage |
|---|---|---|---|---|
| `primary` | `theme.colors.primary[500]` | White | None | Main CTAs |
| `secondary` | White | `theme.colors.neutral[900]` | `neutral[200]` | Secondary actions |
| `danger` | `theme.colors.semantic.error` | White | None | Destructive actions |
| `ghost` | Transparent | `theme.colors.primary[500]` | None | Subtle actions |

### Sizes

| Size | Height | Font Size | Min Touch Target |
|---|---|---|---|
| `sm` | 32px | `theme.fontSize.sm` (14) | 44px |
| `md` | 44px | `theme.fontSize.base` (16) | 44px |
| `lg` | 52px | `theme.fontSize.lg` (18) | 44px |

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `title` | `string` | Required | Button text |
| `onPress` | `() => void` | Required | Press handler |
| `variant` | `'primary' \| 'secondary' \| 'danger' \| 'ghost'` | `'primary'` | Visual variant |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size preset |
| `disabled` | `boolean` | `false` | Disabled state (gray background) |
| `loading` | `boolean` | `false` | Shows spinner, disables press |
| `style` | `ViewStyle` | — | Additional container styles |

### Accessibility

- `accessibilityRole="button"`
- `accessibilityState={{ disabled }}` — reflects disabled state to screen readers

### Usage

```tsx
import { Button } from '@/core/ui/Button';

<Button title="Sign In" onPress={handleLogin} />
<Button title="Delete" onPress={handleDelete} variant="danger" size="sm" />
<Button title="Cancel" onPress={handleClose} variant="ghost" />
<Button title="Loading..." onPress={handleSubmit} loading />
<Button title="Submit" onPress={handleSubmit} disabled />
```

## Next Steps

- [Inputs & Forms](./inputs-forms)
- [Feedback](./feedback)
