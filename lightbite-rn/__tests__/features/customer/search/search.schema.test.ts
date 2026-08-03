import { searchSchema } from '@/features/customer/search/schemas/search.schema';

describe('CustomerSearchSchema', () => {
  it('validates valid input', () => {
    const result = searchSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});
