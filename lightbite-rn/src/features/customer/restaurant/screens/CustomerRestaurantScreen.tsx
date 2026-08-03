import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/core/hooks/useTheme';
import { Button } from '@/core/ui/Button';
import { ErrorDisplay } from '@/core/ui/ErrorDisplay';
import { ScreenHeader } from '@/core/ui/ScreenHeader';
import { Skeleton } from '@/core/ui/Skeleton';
import { useCartStore } from '@/features/customer/cart/store/cart.store';

import { useCustomerRestaurant } from '../hooks/useCustomerRestaurant';
import type { MenuItem } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COVER_HEIGHT = 220;

interface Props {
  uuid: string;
}

export default function CustomerRestaurantScreen({ uuid }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    screenState,
    data,
    categories,
    selectedCategoryIndex,
    selectedCategory,
    selectCategory,
    load,
  } = useCustomerRestaurant(uuid);

  const cartItemCount = useCartStore((s) => s.getItemCount());

  const handleAddToCart = useCallback(
    (item: MenuItem) => {
      router.push({
        pathname: '/(customer)/menu-item',
        params: {
          item: JSON.stringify(item),
          restaurantName: data?.name ?? '',
          restaurantUuid: uuid,
        },
      });
    },
    [router, data, uuid],
  );

  const handleViewCartPress = useCallback(() => {
    router.push('/(customer)/cart');
  }, [router]);

  if (screenState.status === 'loading') {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.neutral[50] }}>
        <Skeleton width={SCREEN_WIDTH} height={COVER_HEIGHT} borderRadius={0} />
        <View style={{ padding: theme.spacing.md }}>
          <Skeleton width={220} height={28} style={{ marginBottom: theme.spacing.sm }} />
          <Skeleton width={160} height={16} style={{ marginBottom: theme.spacing.sm }} />
          <View style={{ flexDirection: 'row', gap: theme.spacing.sm, marginBottom: theme.spacing.md }}>
            <Skeleton width={80} height={24} borderRadius={theme.radius.full} />
            <Skeleton width={60} height={24} borderRadius={theme.radius.full} />
          </View>
          <View style={{ flexDirection: 'row', gap: theme.spacing.xs }}>
            <Skeleton width={60} height={36} borderRadius={theme.radius.full} />
            <Skeleton width={80} height={36} borderRadius={theme.radius.full} />
            <Skeleton width={70} height={36} borderRadius={theme.radius.full} />
          </View>
        </View>
        {[1, 2, 3].map((i) => (
          <View key={i} style={{ flexDirection: 'row', padding: theme.spacing.md, borderBottomWidth: 1, borderBottomColor: theme.colors.neutral[100] }}>
            <Skeleton width={80} height={80} borderRadius={theme.radius.sm} />
            <View style={{ flex: 1, marginLeft: theme.spacing.md }}>
              <Skeleton width={180} height={20} style={{ marginBottom: 8 }} />
              <Skeleton width={120} height={14} style={{ marginBottom: 4 }} />
              <Skeleton width={60} height={16} />
            </View>
          </View>
        ))}
      </View>
    );
  }

  if (screenState.status === 'error') {
    return <ErrorDisplay message={screenState.message} onRetry={load} />;
  }

  if (!data) return null;

  const itemCount = selectedCategory?.items.length ?? 0;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.neutral[50] }}>
      <ScreenHeader />

      <FlatList
        data={selectedCategory?.items ?? []}
        keyExtractor={(item) => item.uuid}
        ListHeaderComponent={
          <View>
            {/* Cover Image — edge-to-edge */}
            <View style={{ height: COVER_HEIGHT, backgroundColor: theme.colors.neutral[200] }}>
              {data.cover_url ? (
                <Image
                  source={{ uri: data.cover_url }}
                  style={{ width: SCREEN_WIDTH, height: COVER_HEIGHT }}
                />
              ) : (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ fontSize: 56, opacity: 0.3 }}>{'\u{1F374}'}</Text>
                </View>
              )}
              {/* Gradient overlay at bottom of cover */}
              <View
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 60,
                  backgroundColor: 'rgba(0,0,0,0.3)',
                }}
              />
            </View>

            {/* Restaurant Info Card — overlaps cover */}
            <View
              style={{
                marginTop: -24,
                marginHorizontal: theme.spacing.md,
                backgroundColor: theme.colors.neutral[0],
                borderRadius: theme.radius.md,
                padding: theme.spacing.md,
                ...theme.shadows.md,
              }}
            >
              <Text style={{ fontSize: theme.fontSize.xl, fontWeight: theme.fontWeight.bold, color: theme.colors.neutral[900] }}>
                {data.name}
              </Text>
              <Text style={{ fontSize: theme.fontSize.sm, color: theme.colors.neutral[500], marginTop: theme.spacing.xs }} numberOfLines={2}>
                {data.description}
              </Text>

              {/* Tags row */}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: theme.spacing.sm, gap: theme.spacing.xs }}>
                {data.cuisine_types.map((cuisine) => (
                  <View key={cuisine} style={{ backgroundColor: theme.colors.primary[50], paddingHorizontal: theme.spacing.sm, paddingVertical: 2, borderRadius: theme.radius.full }}>
                    <Text style={{ fontSize: theme.fontSize.xs, color: theme.colors.primary[700], textTransform: 'capitalize' }}>
                      {cuisine.replace('_', ' ')}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Stats row */}
              <View style={{ flexDirection: 'row', marginTop: theme.spacing.md, gap: theme.spacing.lg }}>
                {data.rating != null && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs }}>
                    <Text style={{ fontSize: theme.fontSize.sm, color: theme.colors.primary[500] }}>{'\u{2B50}'}</Text>
                    <Text style={{ fontSize: theme.fontSize.sm, fontWeight: theme.fontWeight.semibold, color: theme.colors.neutral[900] }}>
                      {data.rating.toFixed(1)}
                    </Text>
                    {data.review_count != null && (
                      <Text style={{ fontSize: theme.fontSize.xs, color: theme.colors.neutral[400] }}>
                        {`(${data.review_count})`}
                      </Text>
                    )}
                  </View>
                )}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs }}>
                  <Text style={{ fontSize: theme.fontSize.sm }}>{'\u{1F6CD}'}</Text>
                  <Text style={{ fontSize: theme.fontSize.sm, color: theme.colors.neutral[700] }}>{data.delivery_fee}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs }}>
                  <Text style={{ fontSize: theme.fontSize.sm }}>{'\u{1F552}'}</Text>
                  <Text style={{ fontSize: theme.fontSize.sm, color: theme.colors.neutral[700] }}>
                    {`${data.delivery_time_min} min`}
                  </Text>
                </View>
              </View>

              {/* Open/Closed + Address */}
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: theme.spacing.sm, gap: theme.spacing.sm }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: data.is_open ? theme.colors.semantic.success : theme.colors.semantic.error }} />
                <Text style={{ fontSize: theme.fontSize.xs, color: data.is_open ? theme.colors.semantic.success : theme.colors.semantic.error, fontWeight: theme.fontWeight.medium }}>
                  {data.is_open ? t('customer.restaurant.open') : t('common.closed')}
                </Text>
                <Text style={{ fontSize: theme.fontSize.xs, color: theme.colors.neutral[400] }}>{'·'}</Text>
                <Text style={{ fontSize: theme.fontSize.xs, color: theme.colors.neutral[400], flex: 1 }} numberOfLines={1}>
                  {data.address}
                </Text>
              </View>
            </View>

            {/* Category Tabs */}
            {categories.length > 1 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginTop: theme.spacing.md }}
                contentContainerStyle={{ paddingHorizontal: theme.spacing.md, gap: theme.spacing.sm }}
              >
                {categories.map((category, index) => {
                  const isActive = index === selectedCategoryIndex;
                  return (
                    <TouchableOpacity
                      key={category.name}
                      onPress={() => selectCategory(index)}
                      style={{
                        paddingHorizontal: theme.spacing.md,
                        paddingVertical: theme.spacing.sm,
                        borderRadius: theme.radius.full,
                        backgroundColor: isActive ? theme.colors.primary[500] : theme.colors.neutral[0],
                        ...theme.shadows.sm,
                      }}
                    >
                      <Text style={{ fontSize: theme.fontSize.sm, fontWeight: isActive ? theme.fontWeight.semibold : theme.fontWeight.regular, color: isActive ? theme.colors.neutral[0] : theme.colors.neutral[700] }}>
                        {category.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}

            {/* Section title */}
            <View style={{ paddingHorizontal: theme.spacing.md, paddingTop: theme.spacing.md, paddingBottom: theme.spacing.xs }}>
              <Text style={{ fontSize: theme.fontSize.base, fontWeight: theme.fontWeight.semibold, color: theme.colors.neutral[900] }}>
                {selectedCategory?.name ?? t('customer.restaurant.menu')}
              </Text>
              <Text style={{ fontSize: theme.fontSize.xs, color: theme.colors.neutral[400] }}>
                {t('customer.restaurant.itemsCount', { count: itemCount })}
              </Text>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <View
            style={{
              flexDirection: 'row',
              paddingHorizontal: theme.spacing.md,
              paddingVertical: theme.spacing.sm,
              backgroundColor: theme.colors.neutral[0],
              borderBottomWidth: 1,
              borderBottomColor: theme.colors.neutral[50],
              opacity: item.is_available ? 1 : 0.5,
            }}
          >
            {/* Item image */}
            <TouchableOpacity
              onPress={() => handleAddToCart(item)}
              disabled={!item.is_available}
              activeOpacity={0.7}
            >
              {item.image_url ? (
                <Image
                  source={{ uri: item.image_url }}
                  style={{ width: 88, height: 88, borderRadius: theme.radius.md, backgroundColor: theme.colors.neutral[100] }}
                />
              ) : (
                <View style={{ width: 88, height: 88, borderRadius: theme.radius.md, backgroundColor: theme.colors.neutral[100], justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ fontSize: theme.fontSize['2xl'], color: theme.colors.neutral[300] }}>{'\u{1F37D}'}</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Item details */}
            <TouchableOpacity
              style={{ flex: 1, marginLeft: theme.spacing.md, justifyContent: 'center' }}
              onPress={() => handleAddToCart(item)}
              disabled={!item.is_available}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: theme.fontSize.base, fontWeight: theme.fontWeight.semibold, color: theme.colors.neutral[900] }} numberOfLines={1}>
                {item.name}
              </Text>
              {item.description ? (
                <Text style={{ fontSize: theme.fontSize.sm, color: theme.colors.neutral[400], marginTop: 2 }} numberOfLines={2}>
                  {item.description}
                </Text>
              ) : null}
              <Text style={{ fontSize: theme.fontSize.base, fontWeight: theme.fontWeight.semibold, color: theme.colors.neutral[900], marginTop: theme.spacing.xs }}>
                {item.price}
              </Text>
            </TouchableOpacity>

            {/* Add button */}
            {item.is_available && (
              <TouchableOpacity
                onPress={() => handleAddToCart(item)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: theme.radius.sm,
                  backgroundColor: theme.colors.primary[50],
                  justifyContent: 'center',
                  alignItems: 'center',
                  alignSelf: 'center',
                  marginLeft: theme.spacing.sm,
                }}
                accessibilityLabel={t('customer.restaurant.addToCart')}
                accessibilityRole="button"
              >
                <Text style={{ fontSize: theme.fontSize.xl, color: theme.colors.primary[600], lineHeight: theme.fontSize.xl }}>{'+'}</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 96 + insets.bottom }}
      />

      {/* Sticky View Cart bar */}
      {cartItemCount > 0 && (
        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.spacing.sm,
            padding: theme.spacing.md,
            paddingBottom: insets.bottom + theme.spacing.md,
            paddingTop: theme.spacing.sm,
            backgroundColor: theme.colors.neutral[0],
            borderTopWidth: 1,
            borderTopColor: theme.colors.neutral[200],
            ...theme.shadows.lg,
          }}
        >
          <View
            style={{
              minWidth: 44,
              height: 44,
              borderRadius: theme.radius.sm,
              backgroundColor: theme.colors.primary[500],
              justifyContent: 'center',
              alignItems: 'center',
              paddingHorizontal: theme.spacing.sm,
            }}
          >
            <Text style={{ fontSize: theme.fontSize.base, fontWeight: theme.fontWeight.bold, color: theme.colors.neutral[0] }}>
              {cartItemCount}
            </Text>
          </View>
          <Button title={t('customer.restaurant.viewCart')} onPress={handleViewCartPress} style={{ flex: 1 }} size="lg" />
        </View>
      )}
    </View>
  );
}
