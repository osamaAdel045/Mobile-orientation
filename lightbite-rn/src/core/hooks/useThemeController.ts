import { useThemeContext } from '@/core/theme/ThemeProvider';

/** Access the theme controller (toggle / preference) for in-app theming. */
export function useThemeController() {
  return useThemeContext();
}
