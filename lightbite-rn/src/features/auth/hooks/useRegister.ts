import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { registerSchema, type RegisterInput } from '@/features/auth/schemas/auth.schema';
import { useAuthStore } from '@/features/auth/store/auth.store';

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  role?: string;
}

export function useRegister() {
  const { t } = useTranslation();
  const register = useAuthStore((s) => s.register);
  const isLoading = useAuthStore((s) => s.isLoading);
  const serverError = useAuthStore((s) => s.error);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const handleRegister = async (input: RegisterInput) => {
    setFormErrors({});

    const result = registerSchema.safeParse(input);
    if (!result.success) {
      const errors: FormErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof FormErrors;
        if (field && !errors[field]) {
          errors[field] = t(issue.message);
        }
      }
      setFormErrors(errors);
      return false;
    }

    return register(input);
  };

  return { handleRegister, isLoading, formErrors, serverError };
}
