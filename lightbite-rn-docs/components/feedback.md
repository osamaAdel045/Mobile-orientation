# Feedback Components

## `<ErrorDisplay>`

Full-screen error state with optional retry button.

**File:** `src/core/ui/ErrorDisplay.tsx`

| Prop | Type | Description |
|---|---|---|
| `message` | `string` | Error message to display |
| `onRetry` | `() => void?` | If provided, shows "Try Again" button |

```tsx
import { ErrorDisplay } from '@/core/ui/ErrorDisplay';

<ErrorDisplay message="Something went wrong" onRetry={refresh} />
```

## `<EmptyState>`

Full-screen empty state with message.

**File:** `src/core/ui/EmptyState.tsx`

| Prop | Type | Description |
|---|---|---|
| `message` | `string` | Empty state message |

```tsx
import { EmptyState } from '@/core/ui/EmptyState';

<EmptyState message="No orders yet" />
```

## `<Skeleton>`

Shimmer loading placeholder for content that hasn't loaded yet.

**File:** `src/core/ui/Skeleton.tsx`

| Prop | Type | Default | Description |
|---|---|---|---|
| `width` | `number` | `100` | Width in pixels |
| `height` | `number` | `20` | Height in pixels |
| `borderRadius` | `number?` | `theme.radius.sm` (6) | Corner radius |
| `style` | `ViewStyle?` | — | Additional styles |

```tsx
import { Skeleton } from '@/core/ui/Skeleton';

<Skeleton width={200} height={24} />
<Skeleton width={150} height={150} borderRadius={12} />
```

Animation: smooth opacity pulse from 0.3 → 1 → 0.3, 800ms per cycle, loops indefinitely.

## `<OfflineBanner>`

Connectivity warning strip shown when the device is offline.

**File:** `src/core/ui/OfflineBanner.tsx`

| Prop | Type | Description |
|---|---|---|
| `visible` | `boolean` | Whether to show the banner |

```tsx
import { OfflineBanner } from '@/core/ui/OfflineBanner';

<OfflineBanner visible={!isConnected} />
```

Renders an amber strip with white "No internet connection" text. Returns `null` when `visible` is `false`.

## Next Steps

- [Cards](./cards)
- [Inputs & Forms](./inputs-forms)
