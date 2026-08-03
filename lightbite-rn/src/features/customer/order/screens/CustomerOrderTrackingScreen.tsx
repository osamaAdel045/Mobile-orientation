import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/core/hooks/useTheme';
import { Card } from '@/core/ui/Card';
import { ErrorDisplay } from '@/core/ui/ErrorDisplay';
import { ScreenHeader } from '@/core/ui/ScreenHeader';
import { Skeleton } from '@/core/ui/Skeleton';
import { StatusBadge } from '@/core/ui/StatusBadge';

import { useCustomerOrderTracking } from '../hooks/useCustomerOrderTracking';
import type { DriverInfo, OrderStatus } from '../types';

const STATUS_FLOW: OrderStatus[] = [
  'pending',
  'confirmed',
  'preparing',
  'ready',
  'picked_up',
  'delivering',
  'delivered',
];

const TERMINAL_STATUSES: OrderStatus[] = ['delivered', 'rejected', 'cancelled'];

const STATUS_ICON: Record<OrderStatus, string> = {
  pending: '⏳',
  confirmed: '✅',
  preparing: '\u{1F468}‍\u{1F373}',
  ready: '\u{1F4E6}',
  picked_up: '\u{1F6F5}',
  delivering: '\u{1F69A}',
  delivered: '\u{1F3E1}',
  rejected: '❌',
  cancelled: '❌',
};

function formatClockTime(iso: string): string {
  const date = new Date(iso);
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

interface Props {
  uuid: string;
}

export default function CustomerOrderTrackingScreen({ uuid }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { trackingState, stopPolling, reload } = useCustomerOrderTracking(uuid);

  const isTerminal =
    trackingState.status === 'loaded' && TERMINAL_STATUSES.includes(trackingState.data.status);

  // Stop polling once the order reaches a final state.
  useEffect(() => {
    if (isTerminal) {
      stopPolling();
    }
  }, [isTerminal, stopPolling]);

  const renderHeader = useCallback(
    () => <ScreenHeader title={t('customer.order.tracking.title')} />,
    [t],
  );

  const renderDriverCard = useCallback(
    (driver: DriverInfo) => (
      <Card style={{ marginBottom: theme.spacing.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {driver.photo_url ? (
            <Image
              source={{ uri: driver.photo_url }}
              style={{
                width: 48,
                height: 48,
                borderRadius: theme.radius.full,
                backgroundColor: theme.colors.neutral[100],
              }}
            />
          ) : (
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: theme.radius.full,
                backgroundColor: theme.colors.primary[50],
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: theme.fontSize['2xl'] }}>{'\u{1F6F5}'}</Text>
            </View>
          )}
          <View style={{ flex: 1, marginLeft: theme.spacing.md }}>
            <Text
              style={{
                fontSize: theme.fontSize.xs,
                color: theme.colors.neutral[400],
              }}
            >
              {t('customer.order.driverName')}
            </Text>
            <Text
              style={{
                fontSize: theme.fontSize.base,
                fontWeight: theme.fontWeight.semibold,
                color: theme.colors.neutral[900],
              }}
            >
              {driver.name}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text
              style={{
                fontSize: theme.fontSize.sm,
                fontWeight: theme.fontWeight.medium,
                color: theme.colors.primary[500],
              }}
            >
              {`★ ${String(driver.rating.toFixed(1))}`}
            </Text>
            <Text style={{ fontSize: theme.fontSize.sm, color: theme.colors.neutral[500] }}>
              {t('customer.order.eta', { minutes: driver.eta_min })}
            </Text>
          </View>
        </View>
      </Card>
    ),
    [theme, t],
  );

  const renderTimeline = useCallback(
    (status: OrderStatus, historyByStatus: Record<string, string>) => {
      const currentIndex = STATUS_FLOW.indexOf(status);
      const fullyComplete = status === 'delivered';

      // Terminal failure states don't map to the happy-path stepper.
      if (currentIndex === -1) {
        return (
          <Card style={{ marginBottom: theme.spacing.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: theme.fontSize['3xl'], marginRight: theme.spacing.md }}>
                {STATUS_ICON[status]}
              </Text>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: theme.fontSize.lg,
                    fontWeight: theme.fontWeight.semibold,
                    color: theme.colors.neutral[900],
                    marginBottom: theme.spacing.xs,
                  }}
                >
                  {t(`customer.order.status.${status}`)}
                </Text>
                <StatusBadge status={status} />
              </View>
            </View>
          </Card>
        );
      }

      return (
        <Card style={{ marginBottom: theme.spacing.md }}>
          {STATUS_FLOW.map((step, index) => {
            const isDone = index < currentIndex || (fullyComplete && index === currentIndex);
            const isCurrent = index === currentIndex && !fullyComplete;
            const isLast = index === STATUS_FLOW.length - 1;
            const timestamp = historyByStatus[step];

            return (
              <View key={step} style={{ flexDirection: 'row' }}>
                <View style={{ alignItems: 'center', marginRight: theme.spacing.md }}>
                  {isDone || isCurrent ? (
                    <View
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: theme.radius.full,
                        backgroundColor: theme.colors.primary[500],
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Text
                        style={{
                          fontSize: theme.fontSize.xs,
                          fontWeight: theme.fontWeight.bold,
                          color: theme.colors.neutral[0],
                        }}
                      >
                        {'✓'}
                      </Text>
                    </View>
                  ) : (
                    <View
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: theme.radius.full,
                        backgroundColor: theme.colors.neutral[200],
                      }}
                    />
                  )}
                  {!isLast && (
                    <View
                      style={{
                        width: 2,
                        flex: 1,
                        minHeight: 28,
                        backgroundColor: isDone
                          ? theme.colors.primary[500]
                          : theme.colors.neutral[200],
                      }}
                    />
                  )}
                </View>
                <View
                  style={{
                    flex: 1,
                    paddingBottom: isLast ? 0 : theme.spacing.md,
                    justifyContent: 'center',
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text
                      style={{
                        fontSize: theme.fontSize.base,
                        fontWeight:
                          isDone || isCurrent
                            ? theme.fontWeight.semibold
                            : theme.fontWeight.regular,
                        color:
                          isDone || isCurrent
                            ? theme.colors.neutral[900]
                            : theme.colors.neutral[400],
                      }}
                    >
                      {t(`customer.order.status.${step}`)}
                    </Text>
                    {isCurrent ? (
                      <View
                        style={{
                          marginLeft: theme.spacing.sm,
                          paddingHorizontal: theme.spacing.sm,
                          paddingVertical: 2,
                          borderRadius: theme.radius.full,
                          backgroundColor: theme.colors.primary[50],
                        }}
                      >
                        <Text
                          style={{
                            fontSize: theme.fontSize.xs,
                            fontWeight: theme.fontWeight.medium,
                            color: theme.colors.primary[600],
                          }}
                        >
                          {t('customer.order.inProgress')}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                  {timestamp ? (
                    <Text style={{ fontSize: theme.fontSize.sm, color: theme.colors.neutral[400] }}>
                      {formatClockTime(timestamp)}
                    </Text>
                  ) : null}
                </View>
              </View>
            );
          })}
        </Card>
      );
    },
    [theme, t],
  );

  if (trackingState.status === 'loading') {
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
        <Skeleton height={120} style={{ marginBottom: theme.spacing.md }} />
        <Skeleton height={220} style={{ marginBottom: theme.spacing.md }} />
      </View>
    );
  }

  if (trackingState.status === 'error') {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.neutral[50] }}>
        {renderHeader()}
        <ErrorDisplay message={trackingState.message} onRetry={reload} />
      </View>
    );
  }

  const tracking = trackingState.data;

  const historyByStatus = Object.fromEntries(
    tracking.status_history.map((entry) => [entry.status, entry.timestamp]),
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.neutral[50] }}>
      {renderHeader()}
      <ScrollView contentContainerStyle={{ padding: theme.spacing.md }}>
        {/* Current status hero */}
        <Card style={{ marginBottom: theme.spacing.md }}>
          <View style={{ alignItems: 'center', paddingVertical: theme.spacing.sm }}>
            <Text style={{ fontSize: theme.fontSize['3xl'], marginBottom: theme.spacing.sm }}>
              {STATUS_ICON[tracking.status]}
            </Text>
            <Text
              style={{
                fontSize: theme.fontSize.lg,
                fontWeight: theme.fontWeight.semibold,
                color: theme.colors.neutral[900],
                marginBottom: theme.spacing.sm,
              }}
            >
              {t(`customer.order.status.${tracking.status}`)}
            </Text>
            <StatusBadge status={tracking.status} />
          </View>
        </Card>

        {/* Estimated delivery */}
        {tracking.estimated_delivery_at ? (
          <Card style={{ marginBottom: theme.spacing.md }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: theme.fontSize.sm, color: theme.colors.neutral[500] }}>
                {t('customer.order.estimatedDelivery')}
              </Text>
              <Text
                style={{
                  fontSize: theme.fontSize.base,
                  fontWeight: theme.fontWeight.semibold,
                  color: theme.colors.neutral[900],
                }}
              >
                {formatClockTime(tracking.estimated_delivery_at)}
              </Text>
            </View>
          </Card>
        ) : null}

        {/* Driver card */}
        {tracking.driver != null &&
        (tracking.status === 'delivering' || tracking.status === 'picked_up')
          ? renderDriverCard(tracking.driver)
          : null}

        {/* Status timeline */}
        {renderTimeline(tracking.status, historyByStatus)}
      </ScrollView>
    </View>
  );
}
