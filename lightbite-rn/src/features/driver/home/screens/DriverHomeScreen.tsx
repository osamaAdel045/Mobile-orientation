import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/core/hooks/useTheme';
import { Button } from '@/core/ui/Button';
import { Card } from '@/core/ui/Card';
import { useAuthStore } from '@/features/auth/store/auth.store';

import { useDriverHome } from '../hooks/useDriverHome';
import { useDriverHomeStore } from '../store/home.store';
import type { ActiveDelivery, DeliveryPhase } from '../types';

const PHASE_LABEL_KEY: Record<DeliveryPhase, string> = {
  pickup: 'driver.homeScreen.pickup',
  picked_up: 'driver.homeScreen.pickedUp',
  delivering: 'driver.homeScreen.delivering',
};

export default function DriverHomeScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const user = useAuthStore((s) => s.user);
  const {
    isOnline,
    isTogglingOnline,
    jobOffer,
    activeDelivery,
    pollingError,
    handleToggleOnline,
    startPolling,
    stopPolling,
  } = useDriverHome();

  // Poll for jobs while online, not on an active delivery, and the screen is focused.
  useFocusEffect(
    useCallback(() => {
      if (isOnline && !activeDelivery) {
        startPolling();
      } else {
        stopPolling();
      }
      return () => stopPolling();
    }, [isOnline, activeDelivery, startPolling, stopPolling]),
  );

  // Navigate to the job offer when a job arrives.
  useEffect(() => {
    if (jobOffer) {
      router.push({
        pathname: '/(driver)/job-offer',
        params: { job: JSON.stringify(jobOffer) },
      });
      useDriverHomeStore.getState().setJobOffer(null);
    }
  }, [jobOffer, router]);

  const handleResumeDelivery = useCallback(
    (delivery: ActiveDelivery) => {
      const pathname = delivery.phase === 'pickup' ? '/(driver)/pickup' : '/(driver)/delivery';
      router.push({
        pathname,
        params: { job: JSON.stringify(delivery.job) },
      });
    },
    [router],
  );

  const renderHeader = () => (
    <View
      style={{
        backgroundColor: theme.colors.neutral[0],
        paddingHorizontal: theme.spacing.md,
        paddingTop: insets.top + theme.spacing.md,
        paddingBottom: theme.spacing.md,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text
          style={{
            fontSize: theme.fontSize['2xl'],
            fontWeight: theme.fontWeight.bold,
            color: theme.colors.neutral[900],
          }}
          numberOfLines={1}
        >
          {user?.name ?? ''}
        </Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: theme.spacing.sm,
            paddingVertical: theme.spacing.xs,
            borderRadius: theme.radius.full,
            backgroundColor: isOnline
              ? theme.colors.semantic.successLight
              : theme.colors.neutral[100],
          }}
        >
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: theme.radius.full,
              marginRight: theme.spacing.xs,
              backgroundColor: isOnline ? theme.colors.semantic.success : theme.colors.neutral[400],
            }}
          />
          <Text
            style={{
              fontSize: theme.fontSize.sm,
              fontWeight: theme.fontWeight.medium,
              color: isOnline ? theme.colors.semantic.success : theme.colors.neutral[500],
            }}
          >
            {isOnline ? t('driver.homeScreen.online') : t('driver.homeScreen.offline')}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderIdleState = () => (
    <View style={{ alignItems: 'center', paddingTop: theme.spacing['2xl'] }}>
      <Text style={{ fontSize: 48, marginBottom: theme.spacing.md }}>{'\u{1F69A}'}</Text>
      {isOnline ? (
        <Text
          style={{
            fontSize: theme.fontSize.base,
            fontWeight: theme.fontWeight.medium,
            color: theme.colors.neutral[500],
            textAlign: 'center',
            marginBottom: theme.spacing.xs,
          }}
        >
          {t('driver.homeScreen.waitingForJobs')}
        </Text>
      ) : null}
      {isOnline && pollingError ? (
        <Text
          style={{
            fontSize: theme.fontSize.sm,
            color: theme.colors.neutral[400],
            textAlign: 'center',
            marginBottom: theme.spacing.md,
          }}
        >
          {t('driver.homeScreen.pollRetrying')}
        </Text>
      ) : null}
      <Button
        title={isOnline ? t('driver.homeScreen.goOffline') : t('driver.homeScreen.goOnline')}
        onPress={handleToggleOnline}
        size="lg"
        loading={isTogglingOnline}
        style={{
          minWidth: 220,
          backgroundColor: isOnline ? theme.colors.semantic.error : theme.colors.primary[500],
        }}
      />
    </View>
  );

  const renderActiveDelivery = (delivery: ActiveDelivery) => (
    <Card style={{ marginBottom: theme.spacing.md }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: theme.spacing.sm,
        }}
      >
        <Text
          style={{
            fontSize: theme.fontSize.base,
            fontWeight: theme.fontWeight.semibold,
            color: theme.colors.neutral[900],
          }}
        >
          {t('driver.homeScreen.activeDelivery')}
        </Text>
        <View
          style={{
            backgroundColor: theme.colors.primary[50],
            borderRadius: theme.radius.full,
            paddingHorizontal: theme.spacing.sm,
            paddingVertical: theme.spacing.xs,
          }}
        >
          <Text
            style={{
              fontSize: theme.fontSize.xs,
              fontWeight: theme.fontWeight.medium,
              color: theme.colors.primary[600],
              textTransform: 'capitalize',
            }}
          >
            {t(PHASE_LABEL_KEY[delivery.phase])}
          </Text>
        </View>
      </View>

      <Text
        style={{
          fontSize: theme.fontSize.lg,
          fontWeight: theme.fontWeight.semibold,
          color: theme.colors.neutral[900],
        }}
        numberOfLines={1}
      >
        {delivery.job.restaurant.name}
      </Text>
      <Text style={{ fontSize: theme.fontSize.sm, color: theme.colors.neutral[500] }}>
        {`${t('driver.homeScreen.deliverTo')}: ${delivery.job.customer_area}`}
      </Text>

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: theme.spacing.sm,
        }}
      >
        <Text style={{ fontSize: theme.fontSize.sm, color: theme.colors.neutral[500] }}>
          {t('driver.homeScreen.earnings')}
        </Text>
        <Text
          style={{
            fontSize: theme.fontSize.base,
            fontWeight: theme.fontWeight.semibold,
            color: theme.colors.primary[600],
          }}
        >
          {delivery.job.earnings}
        </Text>
      </View>

      <Button
        title={t('driver.homeScreen.resume')}
        onPress={() => handleResumeDelivery(delivery)}
        style={{ marginTop: theme.spacing.md }}
      />
    </Card>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.neutral[50] }}>
      {renderHeader()}
      <ScrollView
        contentContainerStyle={{ padding: theme.spacing.md }}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={() => {
              if (isOnline) startPolling();
            }}
            tintColor={theme.colors.primary[500]}
          />
        }
      >
        {activeDelivery ? renderActiveDelivery(activeDelivery) : renderIdleState()}
      </ScrollView>
    </View>
  );
}
