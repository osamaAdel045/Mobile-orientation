import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/core/hooks/useTheme';
import { Button } from '@/core/ui/Button';
import { Card } from '@/core/ui/Card';
import { useAuthStore } from '@/features/auth/store/auth.store';

export default function DriverProfileScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const user = useAuthStore((s) => s.user);
  const isLoggingOut = useAuthStore((s) => s.isLoading);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    Alert.alert(
      t('driver.profileScreen.logoutConfirmTitle'),
      t('driver.profileScreen.logoutConfirmMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('driver.profileScreen.logout'),
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

        {/* Driver stats */}
        <Card style={{ marginBottom: theme.spacing.md }}>
          <Text
            style={{
              fontSize: theme.fontSize.base,
              fontWeight: theme.fontWeight.semibold,
              color: theme.colors.neutral[900],
              marginBottom: theme.spacing.sm,
            }}
          >
            {t('driver.profileScreen.stats')}
          </Text>
          <View style={{ flexDirection: 'row' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: theme.fontSize.xs, color: theme.colors.neutral[400] }}>
                {t('driver.profileScreen.totalTrips')}
              </Text>
              <Text
                style={{
                  fontSize: theme.fontSize.xl,
                  fontWeight: theme.fontWeight.bold,
                  color: theme.colors.neutral[900],
                  marginTop: theme.spacing.xs,
                }}
              >
                {'—'}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: theme.fontSize.xs, color: theme.colors.neutral[400] }}>
                {t('driver.profileScreen.rating')}
              </Text>
              <Text
                style={{
                  fontSize: theme.fontSize.xl,
                  fontWeight: theme.fontWeight.bold,
                  color: theme.colors.neutral[900],
                  marginTop: theme.spacing.xs,
                }}
              >
                {'—'}
              </Text>
            </View>
          </View>
          <Text
            style={{
              fontSize: theme.fontSize.xs,
              color: theme.colors.neutral[400],
              marginTop: theme.spacing.sm,
            }}
          >
            {t('driver.profileScreen.comingSoon')}
          </Text>
        </Card>

        {/* Vehicle info placeholder */}
        <Card style={{ marginBottom: theme.spacing.md }}>
          <Text
            style={{
              fontSize: theme.fontSize.base,
              fontWeight: theme.fontWeight.semibold,
              color: theme.colors.neutral[900],
              marginBottom: theme.spacing.xs,
            }}
          >
            {t('driver.profileScreen.vehicle')}
          </Text>
          <Text style={{ fontSize: theme.fontSize.sm, color: theme.colors.neutral[500] }}>
            {t('driver.profileScreen.vehicleComingSoon')}
          </Text>
        </Card>

        <Button
          title={t('driver.profileScreen.logout')}
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
