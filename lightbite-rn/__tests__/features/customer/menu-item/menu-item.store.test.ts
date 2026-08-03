import { useMenuItemStore } from '@/features/customer/menu-item/store/menu-item.store';

describe('MenuItemStore', () => {
  beforeEach(() => {
    useMenuItemStore.getState().reset();
  });

  it('initializes with quantity 1 and empty special instructions', () => {
    const state = useMenuItemStore.getState();
    expect(state.quantity).toBe(1);
    expect(state.specialInstructions).toBe('');
  });

  it('increments quantity', () => {
    useMenuItemStore.getState().increment();
    expect(useMenuItemStore.getState().quantity).toBe(2);
  });

  it('caps quantity at 99', () => {
    useMenuItemStore.setState({ quantity: 99 });
    useMenuItemStore.getState().increment();
    expect(useMenuItemStore.getState().quantity).toBe(99);
  });

  it('decrements quantity', () => {
    useMenuItemStore.setState({ quantity: 3 });
    useMenuItemStore.getState().decrement();
    expect(useMenuItemStore.getState().quantity).toBe(2);
  });

  it('floors quantity at 1', () => {
    useMenuItemStore.getState().decrement();
    expect(useMenuItemStore.getState().quantity).toBe(1);
  });

  it('sets special instructions', () => {
    useMenuItemStore.getState().setSpecialInstructions('No onions');
    expect(useMenuItemStore.getState().specialInstructions).toBe('No onions');
  });

  it('resets to defaults', () => {
    useMenuItemStore.getState().increment();
    useMenuItemStore.getState().setSpecialInstructions('Extra sauce');
    useMenuItemStore.getState().reset();
    expect(useMenuItemStore.getState().quantity).toBe(1);
    expect(useMenuItemStore.getState().specialInstructions).toBe('');
  });
});
