import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/core/hooks/useTheme';
import { Button } from '@/core/ui/Button';
import { Card } from '@/core/ui/Card';

import { useDriverJob } from '../hooks/useDriverJob';
import type { DriverJob } from '../types';

const OFFER_SECONDS = 30;

interface Props {
  job: DriverJob;
}

export default function DriverJobScreen({ job }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isAccepting, isDeclining, error, acceptJob, rejectJob } = useDriverJob();

  const [secondsLeft, setSecondsLeft] = useState(OFFER_SECONDS);
  const hasRespondedRef = useRef(false);

  // Countdown timer — cleared on unmount.
  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleDecline = useCallback(async () => {
    if (hasRespondedRef.current) return;
    hasRespondedRef.current = true;
    await rejectJob(job.uuid);
    router.back();
  }, [job.uuid, rejectJob, router]);

  const handleAccept = useCallback(async () => {
    if (hasRespondedRef.current) return;
    hasRespondedRef.current = true;
    const success = await acceptJob(job);
    if (success) {
      router.replace({
        pathname: '/(driver)/pickup',
        params: { job: JSON.stringify(job) },
      });
    } else {
      hasRespondedRef.current = false;
    }
  }, [acceptJob, job, router]);

  // Auto-decline when the timer expires.
  useEffect(() => {
    if (secondsLeft === 0) {
      handleDecline();
    }
  }, [secondsLeft, handleDecline]);

  const isResponding = isAccepting || isDeclining;

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.neutral[0],
        paddingTop: insets.top,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.sm,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          disabled={isResponding}
          accessibilityLabel={t('common.cancel')}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: theme.colors.neutral[100],
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: theme.fontSize.lg, color: theme.colors.neutral[700] }}>
            {'✕'}
          </Text>
        </TouchableOpacity>
        <Text
          style={{
            fontSize: theme.fontSize.lg,
            fontWeight: theme.fontWeight.semibold,
            color: theme.colors.neutral[900],
          }}
        >
          {t('driver.job.title')}
        </Text>
        <View
          style={{
            backgroundColor:
              secondsLeft <= 10 ? theme.colors.semantic.errorLight : theme.colors.neutral[100],
            borderRadius: theme.radius.full,
            paddingHorizontal: theme.spacing.sm,
            paddingVertical: theme.spacing.xs,
          }}
        >
          <Text
            style={{
              fontSize: theme.fontSize.sm,
              fontWeight: theme.fontWeight.medium,
              color: secondsLeft <= 10 ? theme.colors.semantic.error : theme.colors.neutral[700],
            }}
          >
            {`${secondsLeft}s`}
          </Text>
        </View>
      </View>

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

        <Card style={{ alignItems: 'center', marginBottom: theme.spacing.md }}>
          <Text style={{ fontSize: theme.fontSize.sm, color: theme.colors.neutral[500] }}>
            {t('driver.job.earnings')}
          </Text>
          <Text
            style={{
              fontSize: theme.fontSize['3xl'],
              fontWeight: theme.fontWeight.bold,
              color: theme.colors.primary[600],
              marginTop: theme.spacing.xs,
            }}
          >
            {job.earnings}
          </Text>
          <Text style={{ fontSize: theme.fontSize.sm, color: theme.colors.neutral[500] }}>
            {`${t('driver.job.distance')}: ${String(job.distance_km)} km`}
          </Text>
        </Card>

        <Card style={{ marginBottom: theme.spacing.md }}>
          <Text style={{ fontSize: theme.fontSize.xs, color: theme.colors.neutral[400] }}>
            {t('driver.job.restaurant')}
          </Text>
          <Text
            style={{
              fontSize: theme.fontSize.lg,
              fontWeight: theme.fontWeight.semibold,
              color: theme.colors.neutral[900],
              marginTop: theme.spacing.xs,
            }}
          >
            {job.restaurant.name}
          </Text>
          <Text style={{ fontSize: theme.fontSize.sm, color: theme.colors.neutral[500] }}>
            {job.restaurant.address}
          </Text>
        </Card>

        <Card>
          <Text style={{ fontSize: theme.fontSize.xs, color: theme.colors.neutral[400] }}>
            {t('driver.job.deliverTo')}
          </Text>
          <Text
            style={{
              fontSize: theme.fontSize.lg,
              fontWeight: theme.fontWeight.semibold,
              color: theme.colors.neutral[900],
              marginTop: theme.spacing.xs,
            }}
          >
            {job.customer_area}
          </Text>
        </Card>
      </ScrollView>

      <View
        style={{
          flexDirection: 'row',
          gap: theme.spacing.md,
          padding: theme.spacing.md,
          paddingBottom: insets.bottom + theme.spacing.md,
          borderTopWidth: 1,
          borderTopColor: theme.colors.neutral[200],
          backgroundColor: theme.colors.neutral[0],
        }}
      >
        <Button
          title={t('driver.job.decline')}
          onPress={handleDecline}
          variant="danger"
          size="lg"
          loading={isDeclining}
          disabled={isAccepting}
          style={{ flex: 1 }}
        />
        <Button
          title={t('driver.job.accept')}
          onPress={handleAccept}
          size="lg"
          loading={isAccepting}
          disabled={isDeclining}
          style={{ flex: 1 }}
        />
      </View>
    </View>
  );
}
