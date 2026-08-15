import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/core/hooks/useTheme';
import { useThemeController } from '@/core/hooks/useThemeController';
import { Button } from '@/core/ui/Button';
import { Card } from '@/core/ui/Card';
import { EmptyState } from '@/core/ui/EmptyState';
import { ErrorDisplay } from '@/core/ui/ErrorDisplay';
import { Skeleton } from '@/core/ui/Skeleton';
import { useAuthStore } from '@/features/auth/store/auth.store';

import { useDriverProfile } from '../hooks/useDriverProfile';

export default function DriverProfileScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark, preference, toggleTheme } = useThemeController();

  const user = useAuthStore((s) => s.user);
  const isLoggingOut = useAuthStore((s) => s.isLoading);
  const logout = useAuthStore((s) => s.logout);
  const { screenState, refresh } = useDriverProfile();

  // Reload driver stats each time the profile tab is focused.
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

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

  const renderHeader = () => (
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
  );

  const renderThemeToggle = () => (
    <Card style={{ marginBottom: theme.spacing.md }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View style={{ flex: 1, marginRight: theme.spacing.md }}>
          <Text
            style={{
              fontSize: theme.fontSize.base,
              fontWeight: theme.fontWeight.medium,
              color: theme.colors.neutral[900],
            }}
          >
            {t('theme.darkMode')}
          </Text>
          <Text
            style={{
              fontSize: theme.fontSize.sm,
              color: theme.colors.neutral[500],
              marginTop: theme.spacing.xs,
              textTransform: 'capitalize',
            }}
          >
            {t(`theme.${preference}`)}
          </Text>
        </View>
        <Switch
          value={isDark}
          onValueChange={toggleTheme}
          trackColor={{ false: theme.colors.neutral[300], true: theme.colors.primary[500] }}
          thumbColor={theme.colors.neutral[0]}
          accessibilityLabel={t('theme.darkMode')}
        />
      </View>
    </Card>
  );

  if (screenState.status === 'loading') {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.neutral[50] }}>
        <ScrollView
          contentContainerStyle={{
            padding: theme.spacing.md,
            paddingTop: insets.top + theme.spacing.md,
          }}
        >
          <Card style={{ alignItems: 'center', marginBottom: theme.spacing.md }}>
            <Skeleton
              width={72}
              height={72}
              borderRadius={theme.radius.full}
              style={{ marginBottom: theme.spacing.sm }}
            />
            <Skeleton width={140} height={20} style={{ marginBottom: theme.spacing.xs }} />
            <Skeleton width={180} height={14} />
          </Card>
          <Skeleton height={120} style={{ marginBottom: theme.spacing.md }} />
          <Skeleton height={110} style={{ marginBottom: theme.spacing.md }} />
        </ScrollView>
      </View>
    );
  }

  if (screenState.status === 'error') {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.neutral[50] }}>
        <ScrollView
          contentContainerStyle={{
            padding: theme.spacing.md,
            paddingTop: insets.top + theme.spacing.md,
          }}
        >
          {renderHeader()}
          <ErrorDisplay message={screenState.message} onRetry={refresh} />
        </ScrollView>
      </View>
    );
  }

  const summary = screenState.status === 'loaded' ? screenState.data : null;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.neutral[50] }}>
      <ScrollView
        contentContainerStyle={{
          padding: theme.spacing.md,
          paddingTop: insets.top + theme.spacing.md,
        }}
      >
        {renderHeader()}

        {screenState.status === 'empty' ? (
          <Card style={{ marginBottom: theme.spacing.md }}>
            <EmptyState message={t('driver.profileScreen.noStats')} />
          </Card>
        ) : (
          <>
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
                    {String(summary?.total_trips ?? 0)}
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
                    {summary?.rating != null ? `★ ${summary.rating.toFixed(1)}` : '—'}
                  </Text>
                </View>
              </View>
            </Card>

            {/* Vehicle info */}
            <Card style={{ marginBottom: theme.spacing.md }}>
              <Text
                style={{
                  fontSize: theme.fontSize.base,
                  fontWeight: theme.fontWeight.semibold,
                  color: theme.colors.neutral[900],
                  marginBottom: theme.spacing.sm,
                }}
              >
                {t('driver.profileScreen.vehicle')}
              </Text>
              {summary?.vehicle ? (
                <View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      marginBottom: theme.spacing.xs,
                    }}
                  >
                    <Text style={{ fontSize: theme.fontSize.sm, color: theme.colors.neutral[400] }}>
                      {t('driver.profileScreen.vehicleType')}
                    </Text>
                    <Text
                      style={{
                        fontSize: theme.fontSize.sm,
                        fontWeight: theme.fontWeight.medium,
                        color: theme.colors.neutral[900],
                        textTransform: 'capitalize',
                      }}
                    >
                      {summary.vehicle.type}
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Text style={{ fontSize: theme.fontSize.sm, color: theme.colors.neutral[400] }}>
                      {t('driver.profileScreen.vehiclePlate')}
                    </Text>
                    <Text
                      style={{
                        fontSize: theme.fontSize.sm,
                        fontWeight: theme.fontWeight.medium,
                        color: theme.colors.neutral[900],
                      }}
                    >
                      {summary.vehicle.plate_number ?? '—'}
                    </Text>
                  </View>
                </View>
              ) : (
                <Text style={{ fontSize: theme.fontSize.sm, color: theme.colors.neutral[500] }}>
                  {t('driver.profileScreen.noVehicle')}
                </Text>
              )}
            </Card>
          </>
        )}

        {renderThemeToggle()}

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
