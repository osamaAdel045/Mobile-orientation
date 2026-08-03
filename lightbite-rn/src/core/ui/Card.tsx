import React from 'react';
import { View, type ViewStyle } from 'react-native';

import { useTheme } from '@/core/hooks/useTheme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function Card({ children, style }: CardProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        {
          backgroundColor: theme.colors.neutral[0],
          borderRadius: theme.radius.md,
          padding: theme.spacing.md,
          ...theme.shadows.sm,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
