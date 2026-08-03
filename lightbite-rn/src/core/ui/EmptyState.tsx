import { View, Text } from 'react-native';

import { useTheme } from '@/core/hooks/useTheme';

interface EmptyStateProps {
  message: string;
}

export function EmptyState({ message }: EmptyStateProps) {
  const theme = useTheme();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: theme.spacing.xl,
      }}
    >
      <Text
        style={{
          fontSize: theme.fontSize.base,
          color: theme.colors.neutral[400],
          textAlign: 'center',
        }}
      >
        {message}
      </Text>
    </View>
  );
}
