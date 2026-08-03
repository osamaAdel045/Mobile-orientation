import { z } from 'zod';

export const checkoutSchema = z.object({
  // TODO: Add validation rules
});

export type CustomerCheckoutInput = z.infer<typeof checkoutSchema>;
