import { create } from 'zustand';

interface MenuItemStore {
  quantity: number;
  specialInstructions: string;
  increment: () => void;
  decrement: () => void;
  setSpecialInstructions: (text: string) => void;
  reset: () => void;
}

export const useMenuItemStore = create<MenuItemStore>((set) => ({
  quantity: 1,
  specialInstructions: '',

  increment: () => set((s) => ({ quantity: Math.min(s.quantity + 1, 99) })),
  decrement: () => set((s) => ({ quantity: Math.max(s.quantity - 1, 1) })),
  setSpecialInstructions: (text) => set({ specialInstructions: text }),
  reset: () => set({ quantity: 1, specialInstructions: '' }),
}));
