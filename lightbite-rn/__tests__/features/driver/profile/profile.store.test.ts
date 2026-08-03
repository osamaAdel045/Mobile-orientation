import { useDriverProfileStore } from '@/features/driver/profile/store/profile.store';

describe('DriverProfileStore', () => {
  beforeEach(() => {
    useDriverProfileStore.setState({ screenState: { status: 'loading' } });
  });

  it('initializes with loading state', () => {
    const state = useDriverProfileStore.getState();
    expect(state.screenState).toEqual({ status: 'loading' });
  });
});
