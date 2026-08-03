import { render } from '@testing-library/react-native';

import { StatusBadge } from '@/core/ui/StatusBadge';

jest.mock('@/core/hooks/useTheme', () => ({
  useTheme: () => ({
    colors: {
      semantic: {
        warning: '#F59E0B',
        warningLight: '#FEF3C7',
        info: '#2563EB',
        infoLight: '#DBEAFE',
        success: '#16A34A',
        successLight: '#DCFCE7',
        error: '#DC2626',
        errorLight: '#FEE2E2',
      },
    },
    spacing: { xs: 4, sm: 8 },
    fontSize: { xs: 12 },
    fontWeight: { medium: '500' },
    radius: { full: 9999 },
    shadows: { sm: {} },
    lineHeight: { base: 24 },
    isDark: false,
  }),
}));

describe('StatusBadge', () => {
  it('renders correct label for each status', () => {
    const { getByText } = render(<StatusBadge status="pending" />);
    expect(getByText('Pending')).toBeTruthy();
  });

  it('renders delivered status', () => {
    const { getByText } = render(<StatusBadge status="delivered" />);
    expect(getByText('Delivered')).toBeTruthy();
  });

  it('renders cancelled status', () => {
    const { getByText } = render(<StatusBadge status="cancelled" />);
    expect(getByText('Cancelled')).toBeTruthy();
  });
});
