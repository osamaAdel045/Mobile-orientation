import { useState } from 'react';
import { View, TextInput, Text, type TextInputProps, type ViewStyle } from 'react-native';

import { useTheme } from '@/core/hooks/useTheme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export function Input({ label, error, containerStyle, ...props }: InputProps) {
  const theme = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const borderColor = error
    ? theme.colors.semantic.error
    : isFocused
      ? theme.colors.primary[500]
      : theme.colors.neutral[200];

  const backgroundColor = error ? theme.colors.semantic.errorLight : theme.colors.neutral[0];

  return (
    <View style={[{ marginBottom: theme.spacing.md }, containerStyle]}>
      {label && (
        <Text
          style={{
            fontSize: theme.fontSize.sm,
            fontWeight: theme.fontWeight.medium,
            color: theme.colors.neutral[700],
            marginBottom: theme.spacing.xs,
          }}
        >
          {label}
        </Text>
      )}
      <TextInput
        {...props}
        onFocus={(e) => {
          setIsFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          props.onBlur?.(e);
        }}
        placeholderTextColor={theme.colors.neutral[400]}
        style={[
          {
            height: 48,
            borderRadius: theme.radius.sm,
            borderWidth: 1.5,
            borderColor,
            backgroundColor,
            paddingHorizontal: theme.spacing.md,
            fontSize: theme.fontSize.base,
            color: theme.colors.neutral[900],
          },
          props.style,
        ]}
      />
      {error && (
        <Text
          style={{
            fontSize: theme.fontSize.xs,
            color: theme.colors.semantic.error,
            marginTop: theme.spacing.xs,
          }}
        >
          {error}
        </Text>
      )}
    </View>
  );
}
