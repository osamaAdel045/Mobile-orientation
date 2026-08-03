import { View, Text } from 'react-native';

import { useTheme } from '@/core/hooks/useTheme';
import { Button } from '@/core/ui/Button';

interface ErrorDisplayProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorDisplay({ message, onRetry }: ErrorDisplayProps) {
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
          fontSize: theme.fontSize.lg,
          color: theme.colors.neutral[500],
          textAlign: 'center',
          marginBottom: theme.spacing.md,
        }}
      >
        {message}
      </Text>
      {onRetry && <Button title="Try Again" onPress={onRetry} variant="secondary" />}
    </View>
  );
}
