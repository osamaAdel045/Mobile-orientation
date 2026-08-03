import { z } from 'zod';

export const profileSchema = z.object({
  // TODO: Add validation rules
});

export type DriverProfileInput = z.infer<typeof profileSchema>;
