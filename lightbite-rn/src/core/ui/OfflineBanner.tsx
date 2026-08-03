import { View, Text } from 'react-native';

import { useTheme } from '@/core/hooks/useTheme';

interface OfflineBannerProps {
  visible: boolean;
}

const OFFLINE_MESSAGE = 'No internet connection';

export function OfflineBanner({ visible }: OfflineBannerProps) {
  const theme = useTheme();

  if (!visible) return null;

  return (
    <View
      style={{
        backgroundColor: theme.colors.semantic.warning,
        paddingVertical: theme.spacing.sm,
        alignItems: 'center',
      }}
    >
      <Text
        style={{
          fontSize: theme.fontSize.sm,
          fontWeight: theme.fontWeight.medium,
          color: theme.colors.neutral[0],
        }}
      >
        {OFFLINE_MESSAGE}
      </Text>
    </View>
  );
}
