import { useAuthStore } from '@/features/auth/store/auth.store';

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);
  const logout = useAuthStore((s) => s.logout);
  const clearError = useAuthStore((s) => s.clearError);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    isCustomer: user?.role === 'customer',
    isDriver: user?.role === 'driver',
    logout,
    clearError,
  };
}
