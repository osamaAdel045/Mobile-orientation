import * as SecureStore from 'expo-secure-store';

const KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user_data',
  THEME_PREFERENCE: 'theme_preference',
} as const;

export type ThemePreference = 'light' | 'dark' | 'system';

export const SecureStorage = {
  async setAccessToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(KEYS.ACCESS_TOKEN, token);
  },

  async getAccessToken(): Promise<string | null> {
    return SecureStore.getItemAsync(KEYS.ACCESS_TOKEN);
  },

  async setRefreshToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(KEYS.REFRESH_TOKEN, token);
  },

  async getRefreshToken(): Promise<string | null> {
    return SecureStore.getItemAsync(KEYS.REFRESH_TOKEN);
  },

  async setUserData(data: string): Promise<void> {
    await SecureStore.setItemAsync(KEYS.USER, data);
  },

  async getUserData(): Promise<string | null> {
    return SecureStore.getItemAsync(KEYS.USER);
  },

  async setThemePreference(preference: ThemePreference): Promise<void> {
    await SecureStore.setItemAsync(KEYS.THEME_PREFERENCE, preference);
  },

  async getThemePreference(): Promise<ThemePreference | null> {
    const value = await SecureStore.getItemAsync(KEYS.THEME_PREFERENCE);
    if (value === 'light' || value === 'dark' || value === 'system') {
      return value;
    }
    return null;
  },

  async clearAll(): Promise<void> {
    await Promise.all([
      SecureStore.deleteItemAsync(KEYS.ACCESS_TOKEN),
      SecureStore.deleteItemAsync(KEYS.REFRESH_TOKEN),
      SecureStore.deleteItemAsync(KEYS.USER),
      SecureStore.deleteItemAsync(KEYS.THEME_PREFERENCE),
    ]);
  },
};
