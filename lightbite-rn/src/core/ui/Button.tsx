import { TouchableOpacity, Text, ActivityIndicator, type ViewStyle } from 'react-native';

import { useTheme } from '@/core/hooks/useTheme';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

const HEIGHT_MAP: Record<ButtonSize, number> = { sm: 32, md: 44, lg: 52 };

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
}: ButtonProps) {
  const theme = useTheme();

  const variantStyles: Record<ButtonVariant, { bg: string; text: string; border?: string }> = {
    primary: { bg: theme.colors.primary[500], text: theme.colors.neutral[0] },
    secondary: {
      bg: theme.colors.neutral[0],
      text: theme.colors.neutral[900],
      border: theme.colors.neutral[200],
    },
    danger: { bg: theme.colors.semantic.error, text: theme.colors.neutral[0] },
    ghost: { bg: 'transparent', text: theme.colors.primary[500] },
  };

  const vs = variantStyles[variant];
  const height = HEIGHT_MAP[size];
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={[
        {
          height,
          backgroundColor: isDisabled ? theme.colors.neutral[200] : vs.bg,
          borderRadius: theme.radius.sm,
          paddingHorizontal: theme.spacing.md,
          justifyContent: 'center',
          alignItems: 'center',
          minWidth: 44,
          borderWidth: vs.border ? 1 : 0,
          borderColor: vs.border,
        },
        style,
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={
            variant === 'secondary' || variant === 'ghost'
              ? theme.colors.primary[500]
              : theme.colors.neutral[0]
          }
        />
      ) : (
        <Text
          style={{
            color: isDisabled ? theme.colors.neutral[400] : vs.text,
            fontSize: theme.fontSize[size === 'sm' ? 'sm' : 'base'],
            fontWeight: theme.fontWeight.medium,
          }}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}
