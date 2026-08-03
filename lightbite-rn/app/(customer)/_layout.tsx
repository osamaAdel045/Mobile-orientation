import { Stack } from 'expo-router';

import { useTheme } from '@/core/hooks/useTheme';

export default function CustomerLayout() {
  const theme = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.neutral[0] },
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="restaurant/[uuid]" />
      <Stack.Screen name="menu-item" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
