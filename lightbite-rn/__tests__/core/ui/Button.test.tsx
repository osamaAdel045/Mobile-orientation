import { render, fireEvent } from '@testing-library/react-native';

import { Button } from '@/core/ui/Button';

jest.mock('@/core/hooks/useTheme', () => ({
  useTheme: () => ({
    colors: {
      primary: { 500: '#F97316' },
      neutral: { 0: '#FFFFFF', 200: '#E5E7EB', 400: '#9CA3AF', 900: '#111827' },
      semantic: { error: '#DC2626' },
    },
    spacing: { xs: 4, sm: 8, md: 16, lg: 24 },
    fontSize: { xs: 12, sm: 14, base: 16, lg: 18 },
    fontWeight: { regular: '400', medium: '500', semibold: '600', bold: '700' },
    radius: { sm: 6, md: 12, lg: 16, full: 9999 },
    shadows: { sm: {} },
    lineHeight: { base: 24 },
    isDark: false,
  }),
}));

describe('Button', () => {
  it('renders title text', () => {
    const { getByText } = render(<Button title="Submit" onPress={jest.fn()} />);
    expect(getByText('Submit')).toBeTruthy();
  });

  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button title="Submit" onPress={onPress} />);
    fireEvent.press(getByText('Submit'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button title="Submit" onPress={onPress} disabled />);
    fireEvent.press(getByText('Submit'));
    expect(onPress).not.toHaveBeenCalled();
  });
});
