import { z } from 'zod';

export const addressLabelSchema = z.enum(['home', 'work', 'other'], {
  message: 'customer.address.validation.labelRequired',
});

export const addressSchema = z.object({
  label: addressLabelSchema,
  address: z.string().trim().min(1, 'customer.address.validation.addressRequired'),
  apartment: z.string().trim().optional(),
  lat: z.coerce.number().finite('customer.address.validation.coordinatesRequired'),
  lng: z.coerce.number().finite('customer.address.validation.coordinatesRequired'),
  is_default: z.boolean(),
});

export type AddressFormValues = z.infer<typeof addressSchema>;
