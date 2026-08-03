import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { loginSchema, type LoginInput } from '@/features/auth/schemas/auth.schema';
import { useAuthStore } from '@/features/auth/store/auth.store';

interface FormErrors {
  email?: string;
  password?: string;
}

export function useLogin() {
  const { t } = useTranslation();
  const login = useAuthStore((s) => s.login);
  const isLoading = useAuthStore((s) => s.isLoading);
  const serverError = useAuthStore((s) => s.error);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const handleLogin = async (input: LoginInput) => {
    setFormErrors({});

    const result = loginSchema.safeParse(input);
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

    return login(input);
  };

  return { handleLogin, isLoading, formErrors, serverError };
}
