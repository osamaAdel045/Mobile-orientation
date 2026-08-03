import { useEffect, useState } from 'react';
import { Animated, type ViewStyle } from 'react-native';

import { useTheme } from '@/core/hooks/useTheme';

interface SkeletonProps {
  width?: number;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({ width = 100, height = 20, borderRadius, style }: SkeletonProps) {
  const theme = useTheme();
  const [opacity] = useState(() => new Animated.Value(0.3));

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius: borderRadius ?? theme.radius.sm,
          backgroundColor: theme.colors.neutral[200],
          opacity,
        },
        style,
      ]}
    />
  );
}
