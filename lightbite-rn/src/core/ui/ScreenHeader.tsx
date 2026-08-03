import { useRouter } from 'expo-router';
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/core/hooks/useTheme';

interface ScreenHeaderProps {
  title?: string;
  onBack?: () => void;
  rightElement?: React.ReactNode;
}

export function ScreenHeader({ title, onBack, rightElement }: ScreenHeaderProps) {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        backgroundColor: theme.colors.neutral[0],
        paddingTop: insets.top + theme.spacing.xs,
        paddingBottom: theme.spacing.sm,
        paddingHorizontal: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.neutral[100],
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: 44 + insets.top + theme.spacing.xs + theme.spacing.sm,
      }}
    >
      {/* Back button */}
      <TouchableOpacity
        onPress={onBack ?? (() => router.back())}
        accessibilityLabel="Go back"
        accessibilityRole="button"
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        style={{
          width: 36,
          height: 36,
          borderRadius: theme.radius.sm,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text style={{ fontSize: theme.fontSize.xl, color: theme.colors.neutral[900] }}>{'←'}</Text>
      </TouchableOpacity>

      {/* Title */}
      {title ? (
        <Text
          style={{
            flex: 1,
            fontSize: theme.fontSize.lg,
            fontWeight: theme.fontWeight.semibold,
            color: theme.colors.neutral[900],
            marginLeft: theme.spacing.sm,
            textAlign: 'center',
          }}
          numberOfLines={1}
        >
          {title}
        </Text>
      ) : (
        <View style={{ flex: 1 }} />
      )}

      {/* Right element or spacer to balance the back button */}
      {rightElement ?? <View style={{ width: 36 }} />}
    </View>
  );
}
