import { Stack } from 'expo-router';

import { useTheme } from '@/core/hooks/useTheme';

export default function DriverLayout() {
  const theme = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.neutral[50] },
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="job-offer" options={{ presentation: 'modal' }} />
      <Stack.Screen name="pickup" />
      <Stack.Screen name="delivery" />
    </Stack>
  );
}
