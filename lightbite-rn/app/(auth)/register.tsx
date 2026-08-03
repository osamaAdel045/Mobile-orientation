import { useRouter, Link } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/core/hooks/useTheme';
import { Button } from '@/core/ui/Button';
import { Input } from '@/core/ui/Input';
import { useRegister } from '@/features/auth/hooks/useRegister';
import type { UserRole } from '@/features/auth/types';

export default function RegisterScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { handleRegister, isLoading, formErrors, serverError } = useRegister();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('customer');

  const onSubmit = async () => {
    const success = await handleRegister({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      password,
      confirmPassword,
      role,
    });
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
          padding: theme.spacing.lg,
          paddingTop: theme.spacing['2xl'],
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
          {t('auth.register.title')}
        </Text>
        <Text
          style={{
            fontSize: theme.fontSize.base,
            color: theme.colors.neutral[500],
            marginBottom: theme.spacing.xl,
          }}
        >
          {t('auth.register.subtitle')}
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

        {/* Role selector */}
        <Text
          style={{
            fontSize: theme.fontSize.sm,
            fontWeight: theme.fontWeight.medium,
            color: theme.colors.neutral[700],
            marginBottom: theme.spacing.sm,
          }}
        >
          {t('auth.register.selectRole')}
        </Text>
        <View
          style={{ flexDirection: 'row', gap: theme.spacing.sm, marginBottom: theme.spacing.lg }}
        >
          {(['customer', 'driver'] as const).map((option) => {
            const isSelected = role === option;
            return (
              <TouchableOpacity
                key={option}
                onPress={() => setRole(option)}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                style={{
                  flex: 1,
                  paddingVertical: theme.spacing.md,
                  borderRadius: theme.radius.sm,
                  borderWidth: 2,
                  borderColor: isSelected ? theme.colors.primary[500] : theme.colors.neutral[200],
                  backgroundColor: isSelected ? theme.colors.primary[50] : theme.colors.neutral[0],
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    fontSize: theme.fontSize.base,
                    fontWeight: theme.fontWeight.medium,
                    color: isSelected ? theme.colors.primary[600] : theme.colors.neutral[500],
                  }}
                >
                  {option === 'customer'
                    ? t('auth.register.roleCustomer')
                    : t('auth.register.roleDriver')}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Input
          label={t('auth.register.name')}
          placeholder={t('auth.register.namePlaceholder')}
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          error={formErrors.name}
        />

        <Input
          label={t('auth.register.email')}
          placeholder={t('auth.register.emailPlaceholder')}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          error={formErrors.email}
        />

        <Input
          label={t('auth.register.phone')}
          placeholder={t('auth.register.phonePlaceholder')}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          error={formErrors.phone}
        />

        <Input
          label={t('auth.register.password')}
          placeholder={t('auth.register.passwordPlaceholder')}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          error={formErrors.password}
        />

        <Input
          label={t('auth.register.confirmPassword')}
          placeholder={t('auth.register.confirmPasswordPlaceholder')}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          error={formErrors.confirmPassword}
        />

        {role === 'driver' ? (
          <>
            <Text
              style={{
                fontSize: theme.fontSize.sm,
                fontWeight: theme.fontWeight.medium,
                color: theme.colors.neutral[700],
                marginBottom: theme.spacing.sm,
              }}
            >
              {t('auth.register.driverDetails')}
            </Text>

            <View
              style={{
                borderWidth: 1,
                borderColor: theme.colors.neutral[200],
                borderRadius: theme.radius.sm,
                padding: theme.spacing.md,
                marginBottom: theme.spacing.md,
                backgroundColor: theme.colors.neutral[50],
              }}
            >
              <Text
                style={{
                  fontSize: theme.fontSize.base,
                  fontWeight: theme.fontWeight.medium,
                  color: theme.colors.neutral[700],
                }}
              >
                {t('auth.register.license')}
              </Text>
              <Text style={{ fontSize: theme.fontSize.sm, color: theme.colors.neutral[400] }}>
                {t('auth.register.licenseComingSoon')}
              </Text>
            </View>

            <View
              style={{
                borderWidth: 1,
                borderColor: theme.colors.neutral[200],
                borderRadius: theme.radius.sm,
                padding: theme.spacing.md,
                marginBottom: theme.spacing.lg,
                backgroundColor: theme.colors.neutral[50],
              }}
            >
              <Text
                style={{
                  fontSize: theme.fontSize.base,
                  fontWeight: theme.fontWeight.medium,
                  color: theme.colors.neutral[700],
                }}
              >
                {t('auth.register.vehicleType')}
              </Text>
              <Text style={{ fontSize: theme.fontSize.sm, color: theme.colors.neutral[400] }}>
                {t('auth.register.vehicleTypeComingSoon')}
              </Text>
            </View>
          </>
        ) : null}

        <Button
          title={t('auth.register.submit')}
          onPress={onSubmit}
          loading={isLoading}
          style={{ marginTop: theme.spacing.md }}
        />

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            marginTop: theme.spacing.lg,
            marginBottom: theme.spacing.xl,
          }}
        >
          <Text style={{ color: theme.colors.neutral[500], fontSize: theme.fontSize.sm }}>
            {t('auth.register.haveAccount')}{' '}
          </Text>
          <Link href="/(auth)/login">
            <Text
              style={{
                color: theme.colors.primary[500],
                fontSize: theme.fontSize.sm,
                fontWeight: theme.fontWeight.medium,
              }}
            >
              {t('auth.register.login')}
            </Text>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
