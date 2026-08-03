# Inputs & Forms

## `<Input>`

Text input with label, focus states, and error display.

**File:** `src/core/ui/Input.tsx`

### States

| State | Border Color | Background |
|---|---|---|
| Default | `theme.colors.neutral[200]` | White |
| Focus | `theme.colors.primary[500]` | White |
| Error | `theme.colors.semantic.error` | `semantic.errorLight` |
| Disabled | Inherited from RN `TextInput` | Inherited |

### Props

| Prop | Type | Description |
|---|---|---|
| `label` | `string?` | Label above the input |
| `error` | `string?` | Error message below the input |
| `containerStyle` | `ViewStyle?` | Additional wrapper styles |
| *(All `TextInput` props)* | — | Passed through to underlying `TextInput` |

### Usage

```tsx
import { Input } from '@/core/ui/Input';

<Input
  label={t('auth.login.email')}
  placeholder={t('auth.login.emailPlaceholder')}
  value={email}
  onChangeText={setEmail}
  keyboardType="email-address"
  autoCapitalize="none"
  error={formErrors.email}
/>

<Input
  label={t('auth.login.password')}
  placeholder={t('auth.login.passwordPlaceholder')}
  value={password}
  onChangeText={setPassword}
  secureTextEntry
  error={formErrors.password}
/>
```

## Form Validation

Forms use **Zod schemas** for validation, integrated via feature hooks:

```typescript
// src/features/auth/hooks/useLogin.ts
const result = loginSchema.safeParse(input);
if (!result.success) {
  // Map Zod issues to form field errors with i18n messages
  const errors: FormErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof FormErrors;
    errors[field] = t(issue.message);
  }
  setFormErrors(errors);
  return false;
}
```

Zod schema error messages are i18n keys — the hook resolves them with `t()` before displaying.

## Next Steps

- [Buttons](./buttons)
- [Feedback](./feedback)
- [State Management](../technical/state-management) — how form state flows through Zustand
