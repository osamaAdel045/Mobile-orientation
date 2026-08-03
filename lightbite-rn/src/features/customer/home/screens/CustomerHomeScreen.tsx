import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/core/hooks/useTheme';
import { Card } from '@/core/ui/Card';
import { EmptyState } from '@/core/ui/EmptyState';
import { ErrorDisplay } from '@/core/ui/ErrorDisplay';
import { Skeleton } from '@/core/ui/Skeleton';

import { useCustomerHome } from '../hooks/useCustomerHome';
import type { Restaurant } from '../types';

const CUISINE_OPTIONS = [
  'lebanese',
  'middle_eastern',
  'italian',
  'indian',
  'chinese',
  'japanese',
  'american',
  'mexican',
  'thai',
];

export default function CustomerHomeScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    screenState,
    refresh,
    loadMore,
    setQuery,
    setCuisine,
    query,
    selectedCuisine,
    isLoadingMore,
    hasMore,
  } = useCustomerHome();

  const handleRestaurantPress = useCallback(
    (restaurant: Restaurant) => {
      router.push(`/(customer)/restaurant/${restaurant.uuid}`);
    },
    [router],
  );

  const handleEndReached = useCallback(() => {
    if (hasMore && !isLoadingMore) {
      loadMore();
    }
  }, [hasMore, isLoadingMore, loadMore]);

  const renderRestaurantCard = useCallback(
    ({ item }: { item: Restaurant }) => (
      <TouchableOpacity onPress={() => handleRestaurantPress(item)} activeOpacity={0.8}>
        <Card style={{ marginBottom: theme.spacing.md }}>
          <View style={{ flexDirection: 'row' }}>
            {item.logo_url ? (
              <Image
                source={{ uri: item.logo_url }}
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: theme.radius.sm,
                  backgroundColor: theme.colors.neutral[100],
                }}
              />
            ) : (
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: theme.radius.sm,
                  backgroundColor: theme.colors.neutral[100],
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: theme.fontSize['2xl'], color: theme.colors.neutral[300] }}>
                  {'\u{1F37D}'}
                </Text>
              </View>
            )}
            <View style={{ flex: 1, marginLeft: theme.spacing.md }}>
              <Text
                style={{
                  fontSize: theme.fontSize.lg,
                  fontWeight: theme.fontWeight.semibold,
                  color: theme.colors.neutral[900],
                }}
                numberOfLines={1}
              >
                {item.name}
              </Text>
              <Text
                style={{
                  fontSize: theme.fontSize.sm,
                  color: theme.colors.neutral[500],
                  marginTop: 2,
                }}
              >
                {item.cuisine_types.join(', ')}
              </Text>
              <View
                style={{ flexDirection: 'row', alignItems: 'center', marginTop: theme.spacing.xs }}
              >
                {item.rating != null ? (
                  <Text
                    style={{
                      fontSize: theme.fontSize.sm,
                      color: theme.colors.primary[500],
                      fontWeight: theme.fontWeight.medium,
                    }}
                  >
                    {`★ ${item.rating.toFixed(1)}`}
                  </Text>
                ) : null}
                {item.review_count != null ? (
                  <Text
                    style={{
                      fontSize: theme.fontSize.sm,
                      color: theme.colors.neutral[400],
                      marginLeft: theme.spacing.sm,
                    }}
                  >
                    {`(${item.review_count})`}
                  </Text>
                ) : null}
              </View>
              <View style={{ flexDirection: 'row', marginTop: theme.spacing.xs }}>
                <Text style={{ fontSize: theme.fontSize.xs, color: theme.colors.neutral[500] }}>
                  {`${item.delivery_time_min} min`}
                </Text>
                <Text
                  style={{
                    fontSize: theme.fontSize.xs,
                    color: theme.colors.neutral[500],
                    marginLeft: theme.spacing.sm,
                  }}
                >
                  {`• ${item.delivery_fee}`}
                </Text>
              </View>
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    ),
    [theme, handleRestaurantPress],
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
        style={{ flex: 1, backgroundColor: theme.colors.neutral[50], padding: theme.spacing.md }}
      >
        {[1, 2, 3].map((i) => (
          <Card key={i} style={{ marginBottom: theme.spacing.md }}>
            <View style={{ flexDirection: 'row' }}>
              <Skeleton width={80} height={80} borderRadius={theme.radius.sm} />
              <View style={{ flex: 1, marginLeft: theme.spacing.md }}>
                <Skeleton width={200} height={20} style={{ marginBottom: 8 }} />
                <Skeleton width={150} height={14} style={{ marginBottom: 4 }} />
                <Skeleton width={100} height={14} />
              </View>
            </View>
          </Card>
        ))}
      </View>
    );
  }

  if (screenState.status === 'error') {
    return <ErrorDisplay message={screenState.message} onRetry={refresh} />;
  }

  if (screenState.status === 'empty') {
    return <EmptyState message={t('common.noResults')} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.neutral[50] }}>
      {/* Search Bar */}
      <View
        style={{
          backgroundColor: theme.colors.neutral[0],
          paddingHorizontal: theme.spacing.md,
          paddingTop: insets.top + theme.spacing.md,
          paddingBottom: theme.spacing.sm,
        }}
      >
        <View style={{ marginBottom: theme.spacing.sm }}>
          <Text style={{ fontSize: theme.fontSize.xs, color: theme.colors.neutral[400] }}>
            {t('customer.deliveryTo')}
          </Text>
          <Text
            style={{
              fontSize: theme.fontSize.base,
              fontWeight: theme.fontWeight.semibold,
              color: theme.colors.neutral[900],
            }}
          >
            {'Dubai Marina'}
          </Text>
        </View>
        <TextInput
          placeholder={t('customer.searchRestaurants')}
          placeholderTextColor={theme.colors.neutral[400]}
          value={query}
          onChangeText={setQuery}
          style={{
            height: 44,
            borderRadius: theme.radius.sm,
            backgroundColor: theme.colors.neutral[100],
            paddingHorizontal: theme.spacing.md,
            fontSize: theme.fontSize.base,
            color: theme.colors.neutral[900],
          }}
        />
      </View>

      {/* Cuisine Filter Chips */}
      <View style={{ backgroundColor: theme.colors.neutral[0], paddingBottom: theme.spacing.sm }}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CUISINE_OPTIONS}
          keyExtractor={(item) => item}
          contentContainerStyle={{ paddingHorizontal: theme.spacing.md, gap: theme.spacing.sm }}
          renderItem={({ item }) => {
            const isSelected = selectedCuisine === item;
            return (
              <TouchableOpacity
                onPress={() => setCuisine(isSelected ? null : item)}
                style={{
                  paddingHorizontal: theme.spacing.md,
                  paddingVertical: theme.spacing.xs,
                  borderRadius: theme.radius.full,
                  backgroundColor: isSelected
                    ? theme.colors.primary[500]
                    : theme.colors.neutral[100],
                }}
              >
                <Text
                  style={{
                    fontSize: theme.fontSize.sm,
                    fontWeight: theme.fontWeight.medium,
                    color: isSelected ? theme.colors.neutral[0] : theme.colors.neutral[700],
                    textTransform: 'capitalize',
                  }}
                >
                  {item.replace('_', ' ')}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Restaurant List */}
      <FlatList
        data={screenState.data}
        keyExtractor={(item) => item.uuid}
        renderItem={renderRestaurantCard}
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
