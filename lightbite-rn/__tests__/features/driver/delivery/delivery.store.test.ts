import { useDriverDeliveryStore } from '@/features/driver/delivery/store/delivery.store';

describe('DriverDeliveryStore', () => {
  beforeEach(() => {
    useDriverDeliveryStore.getState().clear();
  });

  it('initializes idle', () => {
    const state = useDriverDeliveryStore.getState();
    expect(state.job).toBeNull();
    expect(state.phase).toBe('pickup');
    expect(state.isConfirming).toBe(false);
    expect(state.completedEarnings).toBeNull();
    expect(state.error).toBeNull();
  });
});
