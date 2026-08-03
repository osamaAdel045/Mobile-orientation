# State Management

LightBite React Native uses **Zustand** with **Neverthrow** for type-safe error handling. This is the React Native equivalent of Flutter's BLoC/Cubit + dartz `Either` pattern.

## Why Zustand

Zustand is to React Native what Cubit is to Flutter — a lightweight, boilerplate-free state solution. Unlike Redux, there's no provider tree, no actions/reducers ceremony, and no context nesting. A store is a plain function.

| Flutter | React Native |
|---|---|
| `Cubit<T>` | Zustand `create<T>()` |
| `emit(State.loaded(data))` | `set({ screenState: { status: 'loaded', data } })` |
| `BlocProvider` per route | Global access via `useStore()` — no provider needed |
| `HydratedBloc` | Zustand `persist` middleware + MMKV |

## Screen State Pattern

Every feature uses the same **discriminated union** — TypeScript's equivalent of Dart sealed classes:

```typescript
type ScreenState<T> =
  | { status: 'loading' }
  | { status: 'loaded'; data: T }
  | { status: 'error'; message: string }
  | { status: 'empty' };
```

This pattern is enforced by the scaffold generator. Every Zustand store created via `npm run generate:feature` includes this.

## Store Template

```typescript
import { create } from 'zustand';

interface FeatureStore {
  screenState: ScreenState<Item[]>;
  load: () => Promise<void>;
}

export const useFeatureStore = create<FeatureStore>((set) => ({
  screenState: { status: 'loading' },

  load: async () => {
    set({ screenState: { status: 'loading' } });

    const result = await fetchItems();

    result.match(
      (data) => {
        if (data.length === 0) {
          set({ screenState: { status: 'empty' } });
        } else {
          set({ screenState: { status: 'loaded', data } });
        }
      },
      (error) => {
        set({ screenState: { status: 'error', message: error.message } });
      },
    );
  },
}));
```

## Error Handling: Neverthrow

All API functions return `Result<T, AppError>` from the **Neverthrow** library. Components and hooks use `.match()` to handle success and error cases — **never try/catch**.

```typescript
// ✅ Correct — .match() handles both branches
result.match(
  (data) => { /* success */ },
  (error) => { /* failure */ },
);

// ❌ Forbidden — try/catch in components or hooks
try {
  const data = await fetchItems();
} catch (e) {
  // ESLint won't catch this, but CR will
}
```

This is the direct equivalent of dartz `Either.fold()` in the Flutter app.

## Auth Store (Global)

The auth store is the only global Zustand store:

```typescript
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  checkAuth: () => Promise<void>;
  login: (input: LoginInput) => Promise<boolean>;
  register: (input: RegisterInput) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
}
```

It persists tokens to **SecureStore** (encrypted) and restores session on app launch via `checkAuth()`.

## Hook Pattern

Each feature exposes a typed hook that selects only what the component needs:

```typescript
// src/features/auth/hooks/useAuth.ts
export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const logout = useAuthStore((s) => s.logout);

  return {
    user,
    isAuthenticated,
    isLoading,
    isCustomer: user?.role === 'customer',
    isDriver: user?.role === 'driver',
    logout,
  };
}
```

Selective subscriptions (`(s) => s.user`) prevent unnecessary re-renders — the component only re-renders when `user` changes, not when any other store field changes.

## Best Practices

- **One store per feature.** Don't create one giant store for everything.
- **Hooks over direct store access.** Components import hooks, not stores directly.
- **`.match()` over try/catch.** Neverthrow forces explicit error handling — embrace it.
- **Selective subscriptions.** Always use selector functions (`(s) => s.field`) to minimize re-renders.
- **No derived state in stores.** Compute derived values in hooks, not in the store itself.

## Next Steps

- [API & Networking](./api-networking) — how API calls return `Result<T, AppError>`
- [Architecture](./architecture) — how stores fit into the feature-first structure
- [Navigation](./navigation) — how auth state drives routing
