import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/core/hooks/useTheme';
import { Card } from '@/core/ui/Card';
import { EmptyState } from '@/core/ui/EmptyState';
import { ErrorDisplay } from '@/core/ui/ErrorDisplay';
import { Skeleton } from '@/core/ui/Skeleton';
import { StatusBadge } from '@/core/ui/StatusBadge';

import { useCustomerOrder } from '../hooks/useCustomerOrder';
import type { Order } from '../types';

function formatOrderDate(iso: string): string {
  return iso.slice(0, 10);
}

export default function CustomerOrderScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { screenState, hasMore, isLoadingMore, loadMore, refresh } = useCustomerOrder();

  const handleTrackPress = useCallback(
    (order: Order) => {
      router.push({
        pathname: '/(customer)/order-tracking',
        params: { uuid: order.uuid, orderNumber: order.order_number },
      });
    },
    [router],
  );

  const handleOrderAgainPress = useCallback(
    (order: Order) => {
      router.push(`/(customer)/restaurant/${order.restaurant.uuid}`);
    },
    [router],
  );

  const handleRatePress = useCallback(
    (order: Order) => {
      router.push({
        pathname: '/(customer)/rate-order',
        params: { uuid: order.uuid, restaurantName: order.restaurant.name },
      });
    },
    [router],
  );

  const handleEndReached = useCallback(() => {
    if (hasMore && !isLoadingMore) {
      loadMore();
    }
  }, [hasMore, isLoadingMore, loadMore]);

  const renderOrderCard = useCallback(
    ({ item }: { item: Order }) => {
      const firstItem = item.items[0];
      const extraCount = item.items.length - 1;

      return (
        <TouchableOpacity onPress={() => handleTrackPress(item)} activeOpacity={0.8}>
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
                {item.order_number}
              </Text>
              <StatusBadge status={item.status} />
            </View>

            <Text
              style={{
                fontSize: theme.fontSize.base,
                fontWeight: theme.fontWeight.medium,
                color: theme.colors.neutral[700],
              }}
              numberOfLines={1}
            >
              {item.restaurant.name}
            </Text>
            <Text style={{ fontSize: theme.fontSize.sm, color: theme.colors.neutral[400] }}>
              {formatOrderDate(item.created_at)}
            </Text>

            <View
              style={{
                borderTopWidth: 1,
                borderTopColor: theme.colors.neutral[100],
                marginTop: theme.spacing.sm,
                paddingTop: theme.spacing.sm,
              }}
            >
              <Text
                style={{ fontSize: theme.fontSize.sm, color: theme.colors.neutral[500] }}
                numberOfLines={1}
              >
                {firstItem ? `${firstItem.name} × ${String(firstItem.quantity)}` : null}
                {extraCount > 0
                  ? `  ${t('customer.order.moreItems', { count: extraCount })}`
                  : null}
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: theme.spacing.xs,
                }}
              >
                <Text
                  style={{
                    fontSize: theme.fontSize.sm,
                    color: theme.colors.neutral[500],
                    fontWeight: theme.fontWeight.medium,
                  }}
                >
                  {t('customer.order.total')}
                </Text>
                <Text
                  style={{
                    fontSize: theme.fontSize.base,
                    fontWeight: theme.fontWeight.semibold,
                    color: theme.colors.primary[600],
                  }}
                >
                  {item.total}
                </Text>
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: theme.spacing.sm,
                }}
              >
                <Text
                  style={{
                    fontSize: theme.fontSize.sm,
                    fontWeight: theme.fontWeight.medium,
                    color: theme.colors.primary[500],
                  }}
                >
                  {t('customer.order.trackOrder')}
                </Text>
                <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
                  {item.status === 'delivered' ? (
                    <TouchableOpacity
                      onPress={() => handleRatePress(item)}
                      hitSlop={8}
                      accessibilityLabel={t('customer.order.rate')}
                    >
                      <Text
                        style={{
                          fontSize: theme.fontSize.sm,
                          fontWeight: theme.fontWeight.medium,
                          color: theme.colors.primary[500],
                        }}
                      >
                        {t('customer.order.rate')}
                      </Text>
                    </TouchableOpacity>
                  ) : null}
                  <TouchableOpacity
                    onPress={() => handleOrderAgainPress(item)}
                    hitSlop={8}
                    accessibilityLabel={t('customer.order.orderAgain')}
                  >
                    <Text
                      style={{
                        fontSize: theme.fontSize.sm,
                        fontWeight: theme.fontWeight.medium,
                        color: theme.colors.neutral[400],
                      }}
                    >
                      {t('customer.order.orderAgain')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Card>
        </TouchableOpacity>
      );
    },
    [theme, t, handleTrackPress, handleRatePress, handleOrderAgainPress],
  );

  const renderFooter = useCallback(() => {
    if (!isLoadingMore) return null;
    return (
      <View style={{ paddingVertical: theme.spacing.md }}>
        <ActivityIndicator size="small" color={theme.colors.primary[500]} />
      </View>
    );
  }, [isLoadingMore, theme]);

  if (screenState.status === 'loading') {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.neutral[50],
          paddingTop: insets.top + theme.spacing.md,
        }}
      >
        <Skeleton
          width={160}
          height={theme.fontSize['2xl']}
          style={{ marginHorizontal: theme.spacing.md, marginBottom: theme.spacing.lg }}
        />
        <View style={{ paddingHorizontal: theme.spacing.md }}>
          {[1, 2, 3].map((i) => (
            <Card key={i} style={{ marginBottom: theme.spacing.md }}>
              <Skeleton width={180} height={18} style={{ marginBottom: theme.spacing.sm }} />
              <Skeleton width={120} height={16} style={{ marginBottom: theme.spacing.xs }} />
              <Skeleton width={90} height={12} />
            </Card>
          ))}
        </View>
      </View>
    );
  }

  if (screenState.status === 'error') {
    return <ErrorDisplay message={screenState.message} onRetry={refresh} />;
  }

  if (screenState.status === 'empty') {
    return <EmptyState message={t('customer.order.noOrders')} />;
  }

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
          {t('customer.order.title')}
        </Text>
      </View>

      <FlatList
        data={screenState.data}
        keyExtractor={(item) => item.uuid}
        renderItem={renderOrderCard}
        contentContainerStyle={{ padding: theme.spacing.md }}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={refresh}
            tintColor={theme.colors.primary[500]}
          />
        }
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.3}
        ListFooterComponent={renderFooter}
      />
    </View>
  );
}
