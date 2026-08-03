import { z } from 'zod';

export const orderSchema = z.object({
  // TODO: Add validation rules
});

export type CustomerOrderInput = z.infer<typeof orderSchema>;
