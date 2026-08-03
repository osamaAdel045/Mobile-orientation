import { useTranslation } from 'react-i18next';
import { FlatList, RefreshControl, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/core/hooks/useTheme';
import { Card } from '@/core/ui/Card';
import { EmptyState } from '@/core/ui/EmptyState';
import { ErrorDisplay } from '@/core/ui/ErrorDisplay';
import { Skeleton } from '@/core/ui/Skeleton';
import { StatusBadge } from '@/core/ui/StatusBadge';

import { useDriverHistory } from '../hooks/useDriverHistory';
import type { DriverOrder } from '../types';

function formatOrderDate(iso: string): string {
  return iso.slice(0, 10);
}

export default function DriverHistoryScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { screenState, refresh } = useDriverHistory();

  const renderOrderCard = ({ item }: { item: DriverOrder }) => (
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
        {formatOrderDate(item.completed_at)}
      </Text>

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTopWidth: 1,
          borderTopColor: theme.colors.neutral[100],
          marginTop: theme.spacing.sm,
          paddingTop: theme.spacing.sm,
        }}
      >
        <Text style={{ fontSize: theme.fontSize.sm, color: theme.colors.neutral[500] }}>
          {t('driver.historyScreen.distance', { value: String(item.distance_km) })}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ fontSize: theme.fontSize.sm, color: theme.colors.neutral[500] }}>
            {t('driver.historyScreen.earnings')}
          </Text>
          <Text
            style={{
              fontSize: theme.fontSize.base,
              fontWeight: theme.fontWeight.semibold,
              color: theme.colors.primary[600],
              marginLeft: theme.spacing.sm,
            }}
          >
            {item.earnings}
          </Text>
        </View>
      </View>
    </Card>
  );

  const renderHeader = () => (
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
        {t('driver.historyScreen.title')}
      </Text>
    </View>
  );

  if (screenState.status === 'loading') {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.neutral[50] }}>
        {renderHeader()}
        <View style={{ padding: theme.spacing.md }}>
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
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.neutral[50] }}>
        {renderHeader()}
        <ErrorDisplay message={screenState.message} onRetry={refresh} />
      </View>
    );
  }

  if (screenState.status === 'empty') {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.neutral[50] }}>
        {renderHeader()}
        <EmptyState message={t('driver.historyScreen.empty')} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.neutral[50] }}>
      {renderHeader()}
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
      />
    </View>
  );
}
