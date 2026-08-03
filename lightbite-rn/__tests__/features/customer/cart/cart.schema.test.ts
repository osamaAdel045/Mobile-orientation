import { cartSchema } from '@/features/customer/cart/schemas/cart.schema';

const validCart = {
  uuid: 'cart-1',
  restaurant: { uuid: 'r1', name: 'Spice Route' },
  items: [
    {
      id: 1,
      menu_item: { uuid: 'mi-1', name: 'Hummus' },
      quantity: 2,
      unit_price: 'AED 22.00',
      subtotal: 'AED 44.00',
      special_instructions: null,
    },
  ],
  subtotal: 'AED 44.00',
  delivery_fee: 'AED 5.00',
  tax: 'AED 2.45',
  total: 'AED 51.45',
};

describe('CartSchema', () => {
  it('validates a valid cart payload', () => {
    const result = cartSchema.safeParse(validCart);
    expect(result.success).toBe(true);
  });

  it('rejects an empty payload', () => {
    const result = cartSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('rejects a payload missing a required field', () => {
    const result = cartSchema.safeParse({ uuid: 'cart-1' });
    expect(result.success).toBe(false);
  });
});
