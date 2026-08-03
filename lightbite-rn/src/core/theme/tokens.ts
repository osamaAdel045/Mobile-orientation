import { neutral, primary, semantic } from '@/core/theme/colors';
import { radius } from '@/core/theme/radius';
import { shadows } from '@/core/theme/shadows';
import { spacing } from '@/core/theme/spacing';
import { fontSize, fontWeight, lineHeight } from '@/core/theme/typography';

export interface ThemeTokens {
  colors: {
    primary: typeof primary;
    neutral: Record<keyof typeof neutral, string>;
    semantic: typeof semantic;
  };
  spacing: typeof spacing;
  fontSize: typeof fontSize;
  fontWeight: typeof fontWeight;
  lineHeight: typeof lineHeight;
  radius: typeof radius;
  shadows: typeof shadows;
  isDark: boolean;
}

export const lightTheme: ThemeTokens = {
  colors: { primary, neutral, semantic },
  spacing,
  fontSize,
  fontWeight,
  lineHeight,
  radius,
  shadows,
  isDark: false,
};

export const darkTheme: ThemeTokens = {
  ...lightTheme,
  colors: {
    primary,
    neutral: {
      ...neutral,
      0: '#111827',
      50: '#1F2937',
      100: '#374151',
      200: '#4B5563',
      700: '#D1D5DB',
      900: '#F9FAFB',
    },
    semantic,
  },
  isDark: true,
};
