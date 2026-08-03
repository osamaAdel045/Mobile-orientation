import { addressSchema } from '@/features/customer/address/schemas/address.schema';

describe('CustomerAddressSchema', () => {
  it('accepts a valid address', () => {
    const result = addressSchema.safeParse({
      label: 'home',
      address: 'Marina Walk, Dubai Marina',
      apartment: 'Tower 5, Apt 1203',
      lat: 25.0801,
      lng: 55.14,
      is_default: true,
    });
    expect(result.success).toBe(true);
  });

  it('coerces string coordinates to numbers', () => {
    const result = addressSchema.safeParse({
      label: 'work',
      address: 'Downtown Dubai',
      lat: '25.08',
      lng: '55.14',
      is_default: false,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.lat).toBe(25.08);
      expect(result.data.lng).toBe(55.14);
    }
  });

  it('rejects a missing address', () => {
    const result = addressSchema.safeParse({
      label: 'home',
      address: '',
      lat: 0,
      lng: 0,
      is_default: false,
    });
    expect(result.success).toBe(false);
  });

  it('rejects an unknown label', () => {
    const result = addressSchema.safeParse({
      label: 'vacation',
      address: 'Somewhere',
      lat: 0,
      lng: 0,
      is_default: false,
    });
    expect(result.success).toBe(false);
  });
});
