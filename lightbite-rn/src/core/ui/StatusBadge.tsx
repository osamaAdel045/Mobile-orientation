import { View, Text } from 'react-native';

import { useTheme } from '@/core/hooks/useTheme';

type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'picked_up'
  | 'delivering'
  | 'delivered'
  | 'rejected'
  | 'cancelled';

interface StatusBadgeProps {
  status: OrderStatus;
}

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; colorKey: 'warning' | 'info' | 'success' | 'error' }
> = {
  pending: { label: 'Pending', colorKey: 'warning' },
  confirmed: { label: 'Confirmed', colorKey: 'info' },
  preparing: { label: 'Preparing', colorKey: 'warning' },
  ready: { label: 'Ready', colorKey: 'success' },
  picked_up: { label: 'Picked Up', colorKey: 'info' },
  delivering: { label: 'Delivering', colorKey: 'warning' },
  delivered: { label: 'Delivered', colorKey: 'success' },
  rejected: { label: 'Rejected', colorKey: 'error' },
  cancelled: { label: 'Cancelled', colorKey: 'error' },
};

const COLOR_MAP = {
  warning: { bg: 'warningLight', text: 'warning' },
  info: { bg: 'infoLight', text: 'info' },
  success: { bg: 'successLight', text: 'success' },
  error: { bg: 'errorLight', text: 'error' },
} as const;

export function StatusBadge({ status }: StatusBadgeProps) {
  const theme = useTheme();
  const config = STATUS_CONFIG[status];
  const colors = COLOR_MAP[config.colorKey];

  return (
    <View
      style={{
        backgroundColor: theme.colors.semantic[colors.bg],
        borderRadius: theme.radius.full,
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.xs,
        alignSelf: 'flex-start',
      }}
    >
      <Text
        style={{
          fontSize: theme.fontSize.xs,
          fontWeight: theme.fontWeight.medium,
          color: theme.colors.semantic[colors.text],
        }}
      >
        {config.label}
      </Text>
    </View>
  );
}
