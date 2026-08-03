import { Redirect } from 'expo-router';

import { useAuthStore } from '@/features/auth/store/auth.store';

export default function Index() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);

  if (isLoading) return null;

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/onboarding" />;
  }

  if (user?.role === 'driver') {
    return <Redirect href="/(driver)/home" />;
  }

  return <Redirect href="/(customer)/home" />;
}
