# Cards

## `<Card>`

Base card container with theme-aware styling.

**File:** `src/core/ui/Card.tsx`

### Styling

| Property | Value |
|---|---|
| Background | `theme.colors.neutral[0]` |
| Border Radius | `theme.radius.md` (12px) |
| Padding | `theme.spacing.md` (16px) |
| Shadow | `theme.shadows.sm` |

### Props

| Prop | Type | Description |
|---|---|---|
| `children` | `React.ReactNode` | Card content |
| `style` | `ViewStyle?` | Additional styles |

### Usage

```tsx
import { Card } from '@/core/ui/Card';

<Card>
  <Text>Restaurant Name</Text>
  <Text>Cuisine • Rating</Text>
</Card>
```

## `<StatusBadge>`

Order status pill with semantic color.

**File:** `src/core/ui/StatusBadge.tsx`

### Status Map

| Status | Label | Color |
|---|---|---|
| `pending` | Pending | Warning (Amber) |
| `confirmed` | Confirmed | Info (Blue) |
| `preparing` | Preparing | Warning (Amber) |
| `ready` | Ready | Success (Green) |
| `picked_up` | Picked Up | Info (Blue) |
| `delivering` | Delivering | Warning (Amber) |
| `delivered` | Delivered | Success (Green) |
| `rejected` | Rejected | Error (Red) |
| `cancelled` | Cancelled | Error (Red) |

### Props

| Prop | Type | Description |
|---|---|---|
| `status` | `OrderStatus` | One of the 9 order statuses |

### Usage

```tsx
import { StatusBadge } from '@/core/ui/StatusBadge';

<StatusBadge status="delivering" />
```

## Next Steps

- [Buttons](./buttons)
- [Feedback](./feedback)
