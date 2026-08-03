import { useAuthStore } from '@/features/auth/store/auth.store';

jest.mock('@/core/storage/secure-storage', () => ({
  SecureStorage: {
    getAccessToken: jest.fn().mockResolvedValue(null),
    getRefreshToken: jest.fn().mockResolvedValue(null),
    getUserData: jest.fn().mockResolvedValue(null),
    setAccessToken: jest.fn().mockResolvedValue(undefined),
    setRefreshToken: jest.fn().mockResolvedValue(undefined),
    setUserData: jest.fn().mockResolvedValue(undefined),
    clearAll: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('@/core/api/auth.interceptor', () => ({
  setAuthToken: jest.fn(),
}));

jest.mock('@/core/api/client', () => ({
  apiClient: {
    post: jest.fn(),
  },
}));

describe('AuthStore', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      error: null,
    });
  });

  it('initializes with loading state', () => {
    const state = useAuthStore.getState();
    expect(state.isLoading).toBe(true);
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
  });

  it('clearError resets error to null', () => {
    useAuthStore.setState({ error: 'Something went wrong' });
    useAuthStore.getState().clearError();
    expect(useAuthStore.getState().error).toBeNull();
  });

  it('logout clears state', async () => {
    useAuthStore.setState({
      user: {
        uuid: 'test',
        name: 'Test',
        email: 'test@test.com',
        role: 'customer',
        status: 'verified',
      },
      isAuthenticated: true,
    });

    await useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.error).toBeNull();
  });
});
