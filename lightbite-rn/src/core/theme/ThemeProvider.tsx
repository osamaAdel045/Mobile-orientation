import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useColorScheme } from 'react-native';

import { SecureStorage, type ThemePreference } from '@/core/storage/secure-storage';
import { ThemeTokens, lightTheme, darkTheme } from '@/core/theme/tokens';

interface ThemeContextValue {
  theme: ThemeTokens;
  isDark: boolean;
  preference: ThemePreference;
  toggleTheme: () => void;
  setPreference: (preference: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function isThemePreference(value: string | null): value is ThemePreference {
  return value === 'light' || value === 'dark' || value === 'system';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>('system');
  const [isReady, setIsReady] = useState(false);

  // Restore the persisted preference once (avoid a light-mode flash).
  useEffect(() => {
    let mounted = true;
    void SecureStorage.getThemePreference().then((saved) => {
      if (!mounted) return;
      if (isThemePreference(saved)) setPreferenceState(saved);
      setIsReady(true);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const isDark =
    preference === 'dark' || (preference === 'system' && systemScheme === 'dark');

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
    void SecureStorage.setThemePreference(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setPreference(isDark ? 'light' : 'dark');
  }, [isDark, setPreference]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme: isDark ? darkTheme : lightTheme,
      isDark,
      preference,
      toggleTheme,
      setPreference,
    }),
    [isDark, preference, toggleTheme, setPreference],
  );

  if (!isReady) return null;

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeContext(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return ctx;
}
