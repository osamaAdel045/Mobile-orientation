import { checkoutSchema } from '@/features/customer/checkout/schemas/checkout.schema';

describe('CustomerCheckoutSchema', () => {
  it('validates valid input', () => {
    const result = checkoutSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});
