import { useRouter } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, ScrollView, Text, View } from 'react-native';

import { useTheme } from '@/core/hooks/useTheme';
import { Button } from '@/core/ui/Button';
import { Card } from '@/core/ui/Card';
import { ScreenHeader } from '@/core/ui/ScreenHeader';

import { useDriverDelivery } from '../hooks/useDriverDelivery';
import type { DriverDeliveryJob } from '../types';

interface Props {
  job: DriverDeliveryJob;
  phase: 'pickup' | 'delivering';
}

export default function DriverDeliveryScreen({ job, phase }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const { isConfirming, completedEarnings, error, setJob, confirmPickup, confirmDelivery, clear } =
    useDriverDelivery();

  useEffect(() => {
    setJob(job, phase);
    return () => clear();
  }, [job, phase, setJob, clear]);

  const isPickup = phase === 'pickup';

  const handleNavigate = useCallback(() => {
    const lat = isPickup ? job.restaurant_lat : job.customer_lat;
    const lng = isPickup ? job.restaurant_lng : job.customer_lng;
    Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`).catch(
      () => undefined,
    );
  }, [isPickup, job]);

  const handleConfirm = useCallback(async () => {
    if (isPickup) {
      const success = await confirmPickup();
      if (success) {
        router.replace({
          pathname: '/(driver)/delivery',
          params: { job: JSON.stringify(job) },
        });
      }
    } else {
      await confirmDelivery();
    }
  }, [isPickup, confirmPickup, confirmDelivery, job, router]);

  const handleBackToHome = useCallback(() => {
    clear();
    router.dismissAll();
  }, [clear, router]);

  if (completedEarnings != null) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.neutral[50],
          justifyContent: 'center',
          alignItems: 'center',
          padding: theme.spacing.xl,
        }}
      >
        <Text style={{ fontSize: 56, marginBottom: theme.spacing.md }}>{'\u{1F389}'}</Text>
        <Text
          style={{
            fontSize: theme.fontSize.xl,
            fontWeight: theme.fontWeight.bold,
            color: theme.colors.neutral[900],
            marginBottom: theme.spacing.sm,
          }}
        >
          {t('driver.delivery.completed')}
        </Text>
        <Text style={{ fontSize: theme.fontSize.base, color: theme.colors.neutral[500] }}>
          {t('driver.delivery.completedMessage')}
        </Text>
        <Text
          style={{
            fontSize: theme.fontSize['3xl'],
            fontWeight: theme.fontWeight.bold,
            color: theme.colors.primary[600],
            marginVertical: theme.spacing.md,
          }}
        >
          {completedEarnings}
        </Text>
        <Button
          title={t('driver.delivery.backToHome')}
          onPress={handleBackToHome}
          size="lg"
          style={{ minWidth: 200 }}
        />
      </View>
    );
  }

  const locationName = isPickup ? job.restaurant.name : job.customer_area;
  const locationAddress = isPickup ? job.restaurant.address : null;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.neutral[50] }}>
      <ScreenHeader
        title={isPickup ? t('driver.delivery.pickupTitle') : t('driver.delivery.deliveryTitle')}
      />

      <ScrollView contentContainerStyle={{ padding: theme.spacing.md }}>
        {error ? (
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
            {error}
          </Text>
        ) : null}

        <Card style={{ marginBottom: theme.spacing.md }}>
          <Text style={{ fontSize: theme.fontSize.xs, color: theme.colors.neutral[400] }}>
            {isPickup ? t('driver.delivery.pickupFrom') : t('driver.delivery.deliverTo')}
          </Text>
          <Text
            style={{
              fontSize: theme.fontSize.lg,
              fontWeight: theme.fontWeight.semibold,
              color: theme.colors.neutral[900],
              marginTop: theme.spacing.xs,
            }}
          >
            {locationName}
          </Text>
          {locationAddress ? (
            <Text style={{ fontSize: theme.fontSize.sm, color: theme.colors.neutral[500] }}>
              {locationAddress}
            </Text>
          ) : null}
        </Card>

        <Card style={{ marginBottom: theme.spacing.md }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: theme.fontSize.xs, color: theme.colors.neutral[400] }}>
                {t('driver.delivery.jobEarnings')}
              </Text>
              <Text
                style={{
                  fontSize: theme.fontSize.lg,
                  fontWeight: theme.fontWeight.semibold,
                  color: theme.colors.primary[600],
                  marginTop: theme.spacing.xs,
                }}
              >
                {job.earnings}
              </Text>
            </View>
            <Text style={{ fontSize: theme.fontSize.sm, color: theme.colors.neutral[500] }}>
              {`${t('driver.delivery.distance')}: ${String(job.distance_km)} km`}
            </Text>
          </View>
        </Card>

        <Button
          title={t('driver.delivery.navigate')}
          onPress={handleNavigate}
          variant="secondary"
          size="lg"
          style={{ marginBottom: theme.spacing.md }}
        />
        <Button
          title={
            isPickup ? t('driver.delivery.confirmPickup') : t('driver.delivery.confirmDelivery')
          }
          onPress={handleConfirm}
          size="lg"
          loading={isConfirming}
        />
      </ScrollView>
    </View>
  );
}
