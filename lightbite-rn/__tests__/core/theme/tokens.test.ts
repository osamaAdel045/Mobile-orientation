import { lightTheme, darkTheme } from '@/core/theme/tokens';

describe('Theme tokens', () => {
  it('light theme has all required sections', () => {
    expect(lightTheme.colors).toBeDefined();
    expect(lightTheme.spacing).toBeDefined();
    expect(lightTheme.fontSize).toBeDefined();
    expect(lightTheme.radius).toBeDefined();
    expect(lightTheme.shadows).toBeDefined();
    expect(lightTheme.isDark).toBe(false);
  });

  it('dark theme inverts neutral colors', () => {
    expect(darkTheme.colors.neutral[0]).toBe('#111827');
    expect(darkTheme.colors.neutral[900]).toBe('#F9FAFB');
    expect(darkTheme.isDark).toBe(true);
  });

  it('dark theme preserves primary and semantic colors', () => {
    expect(darkTheme.colors.primary[500]).toBe(lightTheme.colors.primary[500]);
    expect(darkTheme.colors.semantic.error).toBe(lightTheme.colors.semantic.error);
  });

  it('spacing scale is consistent', () => {
    expect(lightTheme.spacing.xs).toBe(4);
    expect(lightTheme.spacing['2xl']).toBe(48);
  });
});
