import { useDriverEarningsStore } from '@/features/driver/earnings/store/earnings.store';

describe('DriverEarningsStore', () => {
  beforeEach(() => {
    useDriverEarningsStore.setState({ screenState: { status: 'loading' } });
  });

  it('initializes with loading state', () => {
    const state = useDriverEarningsStore.getState();
    expect(state.screenState).toEqual({ status: 'loading' });
  });
});
