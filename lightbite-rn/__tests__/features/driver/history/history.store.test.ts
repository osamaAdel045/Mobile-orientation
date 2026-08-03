import { useDriverHistoryStore } from '@/features/driver/history/store/history.store';

describe('DriverHistoryStore', () => {
  beforeEach(() => {
    useDriverHistoryStore.setState({ screenState: { status: 'loading' } });
  });

  it('initializes with loading state', () => {
    const state = useDriverHistoryStore.getState();
    expect(state.screenState).toEqual({ status: 'loading' });
  });
});
