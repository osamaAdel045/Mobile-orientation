import { useRouter, Link } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/core/hooks/useTheme';
import { Button } from '@/core/ui/Button';
import { Input } from '@/core/ui/Input';
import { useLogin } from '@/features/auth/hooks/useLogin';

export default function LoginScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { handleLogin, isLoading, formErrors, serverError } = useLogin();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onSubmit = async () => {
    const success = await handleLogin({ email: email.trim(), password });
    if (success) {
      router.replace('/');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.colors.neutral[0] }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={-insets.bottom}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          padding: theme.spacing.lg,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <Text
          style={{
            fontSize: theme.fontSize['2xl'],
            fontWeight: theme.fontWeight.bold,
            color: theme.colors.neutral[900],
            marginBottom: theme.spacing.xs,
          }}
        >
          {t('auth.login.title')}
        </Text>
        <Text
          style={{
            fontSize: theme.fontSize.base,
            color: theme.colors.neutral[500],
            marginBottom: theme.spacing.xl,
          }}
        >
          {t('auth.login.subtitle')}
        </Text>

        {serverError && (
          <Text
            style={{
              color: theme.colors.semantic.error,
              backgroundColor: theme.colors.semantic.errorLight,
              padding: theme.spacing.md,
              borderRadius: theme.radius.sm,
              marginBottom: theme.spacing.md,
              fontSize: theme.fontSize.sm,
            }}
          >
            {serverError}
          </Text>
        )}

        <Input
          label={t('auth.login.email')}
          placeholder={t('auth.login.emailPlaceholder')}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          error={formErrors.email}
        />

        <Input
          label={t('auth.login.password')}
          placeholder={t('auth.login.passwordPlaceholder')}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          error={formErrors.password}
        />

        <Button
          title={t('auth.login.submit')}
          onPress={onSubmit}
          loading={isLoading}
          style={{ marginTop: theme.spacing.md }}
        />

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            marginTop: theme.spacing.lg,
          }}
        >
          <Text style={{ color: theme.colors.neutral[500], fontSize: theme.fontSize.sm }}>
            {t('auth.login.noAccount')}{' '}
          </Text>
          <Link href="/(auth)/register">
            <Text
              style={{
                color: theme.colors.primary[500],
                fontSize: theme.fontSize.sm,
                fontWeight: theme.fontWeight.medium,
              }}
            >
              {t('auth.login.register')}
            </Text>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
