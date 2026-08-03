import { useTranslation } from 'react-i18next';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/core/hooks/useTheme';
import { Card } from '@/core/ui/Card';
import { ErrorDisplay } from '@/core/ui/ErrorDisplay';
import { Skeleton } from '@/core/ui/Skeleton';

import { useDriverEarnings } from '../hooks/useDriverEarnings';

export default function DriverEarningsScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { screenState, refresh } = useDriverEarnings();

  const renderStatCard = (label: string, amount: string, trips: number | null) => (
    <Card style={{ marginBottom: theme.spacing.md }}>
      <Text style={{ fontSize: theme.fontSize.sm, color: theme.colors.neutral[500] }}>{label}</Text>
      <Text
        style={{
          fontSize: theme.fontSize['2xl'],
          fontWeight: theme.fontWeight.bold,
          color: theme.colors.primary[600],
          marginTop: theme.spacing.xs,
        }}
      >
        {amount}
      </Text>
      {trips != null ? (
        <Text style={{ fontSize: theme.fontSize.sm, color: theme.colors.neutral[500] }}>
          {t('driver.earningsScreen.trips', { count: trips })}
        </Text>
      ) : null}
    </Card>
  );

  if (screenState.status === 'loading') {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.neutral[50],
          paddingTop: insets.top + theme.spacing.md,
          padding: theme.spacing.md,
        }}
      >
        <Skeleton
          width={160}
          height={theme.fontSize['2xl']}
          style={{ marginBottom: theme.spacing.lg }}
        />
        <Skeleton height={140} style={{ marginBottom: theme.spacing.md }} />
        <Skeleton height={140} style={{ marginBottom: theme.spacing.md }} />
        <Skeleton height={100} />
      </View>
    );
  }

  if (screenState.status === 'error') {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.neutral[50] }}>
        <View
          style={{
            backgroundColor: theme.colors.neutral[0],
            paddingHorizontal: theme.spacing.md,
            paddingTop: insets.top + theme.spacing.md,
            paddingBottom: theme.spacing.sm,
          }}
        >
          <Text
            style={{
              fontSize: theme.fontSize['2xl'],
              fontWeight: theme.fontWeight.bold,
              color: theme.colors.neutral[900],
            }}
          >
            {t('driver.earningsScreen.title')}
          </Text>
        </View>
        <ErrorDisplay message={screenState.message} onRetry={refresh} />
      </View>
    );
  }

  const earnings = screenState.data;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.neutral[50] }}>
      <View
        style={{
          backgroundColor: theme.colors.neutral[0],
          paddingHorizontal: theme.spacing.md,
          paddingTop: insets.top + theme.spacing.md,
          paddingBottom: theme.spacing.sm,
        }}
      >
        <Text
          style={{
            fontSize: theme.fontSize['2xl'],
            fontWeight: theme.fontWeight.bold,
            color: theme.colors.neutral[900],
          }}
        >
          {t('driver.earningsScreen.title')}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: theme.spacing.md }}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={refresh}
            tintColor={theme.colors.primary[500]}
          />
        }
      >
        {renderStatCard(
          t('driver.earningsScreen.today'),
          earnings.today_earnings,
          earnings.today_trips,
        )}
        {renderStatCard(
          t('driver.earningsScreen.thisWeek'),
          earnings.this_week_earnings,
          earnings.this_week_trips,
        )}
        {renderStatCard(t('driver.earningsScreen.avgPerTrip'), earnings.avg_per_trip, null)}
      </ScrollView>
    </View>
  );
}
