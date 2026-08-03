import { profileSchema } from '@/features/driver/profile/schemas/profile.schema';

describe('DriverProfileSchema', () => {
  it('validates valid input', () => {
    const result = profileSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});
