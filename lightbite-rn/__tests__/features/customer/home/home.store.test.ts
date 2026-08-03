import { useHomeStore } from '@/features/customer/home/store/home.store';

describe('CustomerHomeStore', () => {
  beforeEach(() => {
    useHomeStore.setState({ screenState: { status: 'loading' } });
  });

  it('initializes with loading state', () => {
    const state = useHomeStore.getState();
    expect(state.screenState).toEqual({ status: 'loading' });
  });
});
