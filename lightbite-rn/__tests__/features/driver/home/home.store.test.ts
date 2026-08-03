import { useDriverHomeStore } from '@/features/driver/home/store/home.store';

describe('DriverHomeStore', () => {
  beforeEach(() => {
    useDriverHomeStore.getState().reset();
  });

  it('initializes offline with no job and no active delivery', () => {
    const state = useDriverHomeStore.getState();
    expect(state.isOnline).toBe(false);
    expect(state.isTogglingOnline).toBe(false);
    expect(state.jobOffer).toBeNull();
    expect(state.activeDelivery).toBeNull();
    expect(state.pollingError).toBeNull();
  });

  it('updates job offer and active delivery state', () => {
    useDriverHomeStore.getState().setJobOffer(null);
    expect(useDriverHomeStore.getState().jobOffer).toBeNull();

    useDriverHomeStore.getState().setActiveDelivery(null);
    expect(useDriverHomeStore.getState().activeDelivery).toBeNull();
  });
});
