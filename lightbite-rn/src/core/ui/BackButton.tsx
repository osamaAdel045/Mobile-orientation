import { useRouter } from 'expo-router';
import { TouchableOpacity, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/core/hooks/useTheme';

interface BackButtonProps {
  onPress?: () => void;
}

export function BackButton({ onPress }: BackButtonProps) {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <TouchableOpacity
      onPress={onPress ?? (() => router.back())}
      style={{
        position: 'absolute',
        top: insets.top + theme.spacing.sm,
        left: theme.spacing.md,
        zIndex: 10,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: theme.colors.neutral[0],
        justifyContent: 'center',
        alignItems: 'center',
        ...theme.shadows.sm,
      }}
      accessibilityLabel="Go back"
      accessibilityRole="button"
    >
      <Text style={{ fontSize: theme.fontSize.lg, color: theme.colors.neutral[700] }}>{'←'}</Text>
    </TouchableOpacity>
  );
}
