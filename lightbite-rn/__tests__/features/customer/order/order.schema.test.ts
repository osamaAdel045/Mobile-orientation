import { orderSchema } from '@/features/customer/order/schemas/order.schema';

describe('CustomerOrderSchema', () => {
  it('validates valid input', () => {
    const result = orderSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});
