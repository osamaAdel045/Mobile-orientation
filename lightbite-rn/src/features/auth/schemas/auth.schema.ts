import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1, 'auth.validation.emailRequired').email('auth.validation.emailInvalid'),
  password: z.string().min(1, 'auth.validation.passwordRequired'),
});

export const registerSchema = z
  .object({
    name: z.string().min(1, 'auth.validation.nameRequired'),
    email: z.string().min(1, 'auth.validation.emailRequired').email('auth.validation.emailInvalid'),
    phone: z.string().min(1, 'auth.validation.phoneRequired'),
    password: z
      .string()
      .min(8, 'auth.validation.passwordMinLength')
      .regex(/[A-Z]/, 'auth.validation.passwordUppercase')
      .regex(/[0-9]/, 'auth.validation.passwordNumber'),
    confirmPassword: z.string().min(1, 'auth.validation.confirmPasswordRequired'),
    role: z.enum(['customer', 'driver'], { message: 'auth.validation.roleRequired' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'auth.validation.passwordsMustMatch',
    path: ['confirmPassword'],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
