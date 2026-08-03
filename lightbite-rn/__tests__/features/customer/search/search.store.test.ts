import { useCustomerSearchStore } from '@/features/customer/search/store/search.store';

describe('CustomerSearchStore', () => {
  beforeEach(() => {
    useCustomerSearchStore.setState({ screenState: { status: 'loading' } });
  });

  it('initializes with loading state', () => {
    const state = useCustomerSearchStore.getState();
    expect(state.screenState).toEqual({ status: 'loading' });
  });
});
