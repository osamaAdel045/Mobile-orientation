import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/core/hooks/useTheme';
import { Button } from '@/core/ui/Button';
import { Card } from '@/core/ui/Card';
import { useAuthStore } from '@/features/auth/store/auth.store';

interface MenuRow {
  key: string;
  label: string;
  onPress?: () => void;
  disabled?: boolean;
}

export default function CustomerProfileScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const user = useAuthStore((s) => s.user);
  const isLoggingOut = useAuthStore((s) => s.isLoading);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    Alert.alert(
      t('customer.profileScreen.logoutConfirmTitle'),
      t('customer.profileScreen.logoutConfirmMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('customer.profileScreen.logout'),
          style: 'destructive',
          onPress: () => {
            logout().then(() => {
              router.replace('/');
            });
          },
        },
      ],
    );
  };

  const menuRows: MenuRow[] = [
    {
      key: 'addresses',
      label: t('customer.profileScreen.savedAddresses'),
      onPress: () => router.push('/(customer)/address'),
    },
    {
      key: 'payments',
      label: t('customer.profileScreen.paymentMethods'),
      disabled: true,
    },
    {
      key: 'settings',
      label: t('customer.profileScreen.settings'),
      disabled: true,
    },
  ];

  const firstLetter = user?.name?.charAt(0)?.toUpperCase() ?? '';

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.neutral[50] }}>
      <ScrollView
        contentContainerStyle={{
          padding: theme.spacing.md,
          paddingTop: insets.top + theme.spacing.md,
        }}
      >
        {/* Profile header */}
        <Card style={{ alignItems: 'center', marginBottom: theme.spacing.md }}>
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: theme.radius.full,
              backgroundColor: theme.colors.primary[500],
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: theme.spacing.sm,
            }}
          >
            <Text
              style={{
                fontSize: theme.fontSize['3xl'],
                fontWeight: theme.fontWeight.bold,
                color: theme.colors.neutral[0],
              }}
            >
              {firstLetter}
            </Text>
          </View>
          <Text
            style={{
              fontSize: theme.fontSize.xl,
              fontWeight: theme.fontWeight.semibold,
              color: theme.colors.neutral[900],
            }}
          >
            {user?.name ?? ''}
          </Text>
          <Text
            style={{
              fontSize: theme.fontSize.sm,
              color: theme.colors.neutral[500],
              marginTop: theme.spacing.xs,
            }}
          >
            {user?.email ?? ''}
          </Text>
        </Card>

        {/* Menu */}
        <Card style={{ marginBottom: theme.spacing.md }}>
          {menuRows.map((row, index) => (
            <View key={row.key}>
              <TouchableOpacity
                onPress={row.onPress}
                disabled={row.disabled}
                activeOpacity={row.disabled ? 1 : 0.8}
                accessibilityRole="button"
                accessibilityState={{ disabled: row.disabled }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingVertical: theme.spacing.md,
                }}
              >
                <Text
                  style={{
                    fontSize: theme.fontSize.base,
                    fontWeight: theme.fontWeight.medium,
                    color: row.disabled ? theme.colors.neutral[400] : theme.colors.neutral[900],
                  }}
                >
                  {row.label}
                </Text>
                <Text
                  style={{
                    fontSize: theme.fontSize.lg,
                    color: row.disabled ? theme.colors.neutral[300] : theme.colors.neutral[400],
                  }}
                >
                  {'›'}
                </Text>
              </TouchableOpacity>
              {index < menuRows.length - 1 ? (
                <View style={{ height: 1, backgroundColor: theme.colors.neutral[100] }} />
              ) : null}
            </View>
          ))}
        </Card>

        <Button
          title={t('customer.profileScreen.logout')}
          onPress={handleLogout}
          variant="danger"
          size="lg"
          loading={isLoggingOut}
          style={{ width: '100%' }}
        />
      </ScrollView>
    </View>
  );
}
