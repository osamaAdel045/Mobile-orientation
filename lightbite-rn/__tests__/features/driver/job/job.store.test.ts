import { useDriverJobStore } from '@/features/driver/job/store/job.store';

describe('DriverJobStore', () => {
  beforeEach(() => {
    useDriverJobStore.getState().reset();
  });

  it('initializes idle', () => {
    const state = useDriverJobStore.getState();
    expect(state.isAccepting).toBe(false);
    expect(state.isDeclining).toBe(false);
    expect(state.error).toBeNull();
  });
});
