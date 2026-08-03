import { useThemeContext } from '@/core/theme/ThemeProvider';

export function useTheme() {
  return useThemeContext().theme;
}
