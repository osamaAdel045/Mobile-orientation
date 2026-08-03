import { loginSchema, registerSchema } from '@/features/auth/schemas/auth.schema';

describe('loginSchema', () => {
  it('validates a correct login input', () => {
    const result = loginSchema.safeParse({ email: 'test@example.com', password: 'Password1' });
    expect(result.success).toBe(true);
  });

  it('rejects empty email', () => {
    const result = loginSchema.safeParse({ email: '', password: 'Password1' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid email format', () => {
    const result = loginSchema.safeParse({ email: 'notanemail', password: 'Password1' });
    expect(result.success).toBe(false);
  });

  it('rejects empty password', () => {
    const result = loginSchema.safeParse({ email: 'test@example.com', password: '' });
    expect(result.success).toBe(false);
  });
});

describe('registerSchema', () => {
  const validInput = {
    name: 'Test User',
    email: 'test@example.com',
    phone: '+971501234567',
    password: 'Password1',
    confirmPassword: 'Password1',
    role: 'customer' as const,
  };

  it('validates a correct register input', () => {
    const result = registerSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it('rejects password without uppercase', () => {
    const result = registerSchema.safeParse({
      ...validInput,
      password: 'password1',
      confirmPassword: 'password1',
    });
    expect(result.success).toBe(false);
  });

  it('rejects password without number', () => {
    const result = registerSchema.safeParse({
      ...validInput,
      password: 'Password',
      confirmPassword: 'Password',
    });
    expect(result.success).toBe(false);
  });

  it('rejects password shorter than 8 chars', () => {
    const result = registerSchema.safeParse({
      ...validInput,
      password: 'Pa1',
      confirmPassword: 'Pa1',
    });
    expect(result.success).toBe(false);
  });

  it('rejects mismatched passwords', () => {
    const result = registerSchema.safeParse({ ...validInput, confirmPassword: 'Different1' });
    expect(result.success).toBe(false);
  });
});
