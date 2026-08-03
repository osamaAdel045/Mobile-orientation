import { useMenuItemStore } from '@/features/customer/menu-item/store/menu-item.store';

export function useMenuItem() {
  const quantity = useMenuItemStore((s) => s.quantity);
  const specialInstructions = useMenuItemStore((s) => s.specialInstructions);
  const increment = useMenuItemStore((s) => s.increment);
  const decrement = useMenuItemStore((s) => s.decrement);
  const setSpecialInstructions = useMenuItemStore((s) => s.setSpecialInstructions);

  return { quantity, specialInstructions, increment, decrement, setSpecialInstructions };
}
