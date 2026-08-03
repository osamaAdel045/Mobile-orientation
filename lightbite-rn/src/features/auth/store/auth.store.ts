import { create } from 'zustand';

import { setAuthToken } from '@/core/api/auth.interceptor';
import { SecureStorage } from '@/core/storage/secure-storage';

import { loginApi, registerApi, logoutApi, refreshTokenApi } from '../api/auth.api';
import type { LoginInput, RegisterInput } from '../schemas/auth.schema';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  checkAuth: () => Promise<void>;
  login: (input: LoginInput) => Promise<boolean>;
  register: (input: RegisterInput) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  checkAuth: async () => {
    set({ isLoading: true });

    const token = await SecureStorage.getAccessToken();
    const userData = await SecureStorage.getUserData();

    if (token && userData) {
      try {
        const user = JSON.parse(userData) as User;
        setAuthToken(token);
        set({ user, isAuthenticated: true, isLoading: false });
        return;
      } catch {
        // Corrupted data — clear and continue
      }
    }

    // Try refresh if we have a refresh token but no access token
    const refreshToken = await SecureStorage.getRefreshToken();
    if (refreshToken) {
      const result = await refreshTokenApi();
      if (result.isOk()) {
        const userDataAfterRefresh = await SecureStorage.getUserData();
        if (userDataAfterRefresh) {
          const user = JSON.parse(userDataAfterRefresh) as User;
          set({ user, isAuthenticated: true, isLoading: false });
          return;
        }
      }
    }

    set({ isLoading: false });
  },

  login: async (input) => {
    set({ isLoading: true, error: null });
    const result = await loginApi(input);

    return result.match(
      (data) => {
        set({ user: data.user, isAuthenticated: true, isLoading: false });
        return true;
      },
      (error) => {
        set({ error: error.message, isLoading: false });
        return false;
      },
    );
  },

  register: async (input) => {
    set({ isLoading: true, error: null });
    const result = await registerApi({
      name: input.name,
      email: input.email,
      phone: input.phone,
      password: input.password,
      password_confirmation: input.password,
      role: input.role,
    });

    return result.match(
      (data) => {
        set({ user: data.user, isAuthenticated: true, isLoading: false });
        return true;
      },
      (error) => {
        set({ error: error.message, isLoading: false });
        return false;
      },
    );
  },

  logout: async () => {
    set({ isLoading: true });
    await logoutApi();
    set({ user: null, isAuthenticated: false, isLoading: false, error: null });
  },

  clearError: () => set({ error: null }),
}));
