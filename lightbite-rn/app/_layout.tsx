import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useConnectivityStore } from '@/core/connectivity';
import { ThemeProvider } from '@/core/theme/ThemeProvider';
import { OfflineBanner } from '@/core/ui/OfflineBanner';
import { WebSocketProvider } from '@/core/websocket';
import { useAuthStore } from '@/features/auth/store/auth.store';
import i18n from '@/i18n';

function RootLayoutInner() {
  const checkAuth = useAuthStore((s) => s.checkAuth);
  const isLoading = useAuthStore((s) => s.isLoading);
  const isOffline = useConnectivityStore((s) => s.isOffline);

  useEffect(() => {
    checkAuth();
    useConnectivityStore.getState().startMonitoring();
    return () => useConnectivityStore.getState().stopMonitoring();
  }, [checkAuth]);

  if (isLoading) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <View style={{ flex: 1 }}>
        <OfflineBanner visible={isOffline} />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(customer)" />
          <Stack.Screen name="(driver)" />
        </Stack>
      </View>
    </SafeAreaProvider>
  );
}

export default function RootLayout() {
  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider>
        <WebSocketProvider>
          <RootLayoutInner />
        </WebSocketProvider>
      </ThemeProvider>
    </I18nextProvider>
  );
}
