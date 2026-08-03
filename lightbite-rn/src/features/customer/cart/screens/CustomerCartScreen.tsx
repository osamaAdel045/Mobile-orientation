import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/core/hooks/useTheme';
import { Button } from '@/core/ui/Button';
import { Card } from '@/core/ui/Card';
import { EmptyState } from '@/core/ui/EmptyState';
import { ErrorDisplay } from '@/core/ui/ErrorDisplay';
import { ScreenHeader } from '@/core/ui/ScreenHeader';
import { Skeleton } from '@/core/ui/Skeleton';

import { useCartConflictDialog } from '../hooks/useCartConflictDialog';
import { useCustomerCart } from '../hooks/useCustomerCart';
import type { CartItem } from '../types';

export default function CustomerCartScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { screenState, isLoading, updateQuantity, removeItem, refresh } = useCustomerCart();

  useCartConflictDialog();

  if (screenState.status === 'loading') {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.neutral[0],
          padding: theme.spacing.md,
          paddingTop: insets.top + theme.spacing.md,
        }}
      >
        <Skeleton
          width={160}
          height={theme.fontSize['2xl']}
          style={{ marginBottom: theme.spacing.lg }}
        />
        <Skeleton height={96} style={{ marginBottom: theme.spacing.md }} />
        <Skeleton height={96} style={{ marginBottom: theme.spacing.md }} />
        <Skeleton height={96} style={{ marginBottom: theme.spacing.md }} />
        <Skeleton height={120} />
      </View>
    );
  }

  if (screenState.status === 'error') {
    return <ErrorDisplay message={screenState.message} onRetry={refresh} />;
  }

  if (screenState.status === 'empty') {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.neutral[0], justifyContent: 'center', alignItems: 'center', padding: theme.spacing.xl }}>
        <EmptyState message={t('customer.cart.empty')} />
        <Button
          title={t('customer.cart.browseRestaurants')}
          onPress={() => router.replace('/(customer)/(tabs)/home')}
          style={{ marginTop: theme.spacing.lg, minWidth: 200 }}
        />
      </View>
    );
  }

  const { data } = screenState;

  const handleCheckout = () => {
    // TODO: Validate cart and navigate to checkout flow (later batch).
    router.push('/(customer)/checkout');
  };

  const renderItem = ({ item }: { item: CartItem }) => (
    <Card style={{ marginBottom: theme.spacing.sm }}>
      <View
        style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}
      >
        <Text
          style={{
            flex: 1,
            marginRight: theme.spacing.sm,
            fontSize: theme.fontSize.base,
            fontWeight: theme.fontWeight.semibold,
            color: theme.colors.neutral[900],
          }}
        >
          {item.menu_item.name}
        </Text>
        <Text
          style={{
            fontSize: theme.fontSize.base,
            fontWeight: theme.fontWeight.medium,
            color: theme.colors.primary[600],
          }}
        >
          {item.subtotal}
        </Text>
      </View>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: theme.spacing.sm,
        }}
      >
        <Text style={{ fontSize: theme.fontSize.sm, color: theme.colors.neutral[500] }}>
          {item.unit_price}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
          <TouchableOpacity
            onPress={() => updateQuantity(item.id, item.quantity - 1)}
            disabled={isLoading}
            accessibilityLabel={t('customer.cart.decrement')}
            style={{
              width: 32,
              height: 32,
              borderRadius: theme.radius.sm,
              backgroundColor: theme.colors.neutral[100],
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: theme.fontSize.lg, color: theme.colors.neutral[700] }}>
              {'−'}
            </Text>
          </TouchableOpacity>
          <Text
            style={{
              minWidth: 24,
              textAlign: 'center',
              fontSize: theme.fontSize.base,
              fontWeight: theme.fontWeight.semibold,
              color: theme.colors.neutral[900],
            }}
          >
            {String(item.quantity)}
          </Text>
          <TouchableOpacity
            onPress={() => updateQuantity(item.id, item.quantity + 1)}
            disabled={isLoading}
            accessibilityLabel={t('customer.cart.increment')}
            style={{
              width: 32,
              height: 32,
              borderRadius: theme.radius.sm,
              backgroundColor: theme.colors.neutral[100],
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: theme.fontSize.lg, color: theme.colors.neutral[700] }}>
              {'+'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {item.special_instructions ? (
        <Text
          style={{
            fontSize: theme.fontSize.xs,
            color: theme.colors.neutral[400],
            marginTop: theme.spacing.xs,
          }}
        >
          {`${t('customer.cart.instructions')}: ${item.special_instructions}`}
        </Text>
      ) : null}

      <TouchableOpacity
        onPress={() => removeItem(item.id)}
        disabled={isLoading}
        accessibilityLabel={t('customer.cart.removeItem')}
        style={{ alignSelf: 'flex-start', marginTop: theme.spacing.sm }}
      >
        <Text
          style={{
            fontSize: theme.fontSize.sm,
            fontWeight: theme.fontWeight.medium,
            color: theme.colors.semantic.error,
          }}
        >
          {t('customer.cart.remove')}
        </Text>
      </TouchableOpacity>
    </Card>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.neutral[0] }}>
      <ScreenHeader title={t('customer.cart.title')} />

      <FlatList
        style={{ flex: 1 }}
        data={data.items}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={{
          padding: theme.spacing.md,
          paddingBottom: 120 + insets.bottom,
        }}
        ListFooterComponent={
          <Card style={{ marginTop: theme.spacing.sm }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: theme.spacing.xs,
              }}
            >
              <Text style={{ fontSize: theme.fontSize.base, color: theme.colors.neutral[500] }}>
                {t('customer.cart.subtotal')}
              </Text>
              <Text style={{ fontSize: theme.fontSize.base, color: theme.colors.neutral[900] }}>
                {data.subtotal}
              </Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: theme.spacing.xs,
              }}
            >
              <Text style={{ fontSize: theme.fontSize.base, color: theme.colors.neutral[500] }}>
                {t('customer.cart.deliveryFee')}
              </Text>
              <Text style={{ fontSize: theme.fontSize.base, color: theme.colors.neutral[900] }}>
                {data.delivery_fee}
              </Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: theme.spacing.sm,
              }}
            >
              <Text style={{ fontSize: theme.fontSize.base, color: theme.colors.neutral[500] }}>
                {t('customer.cart.tax')}
              </Text>
              <Text style={{ fontSize: theme.fontSize.base, color: theme.colors.neutral[900] }}>
                {data.tax}
              </Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                borderTopWidth: 1,
                borderTopColor: theme.colors.neutral[200],
                paddingTop: theme.spacing.sm,
              }}
            >
              <Text
                style={{
                  fontSize: theme.fontSize.lg,
                  fontWeight: theme.fontWeight.bold,
                  color: theme.colors.neutral[900],
                }}
              >
                {t('customer.cart.total')}
              </Text>
              <Text
                style={{
                  fontSize: theme.fontSize.lg,
                  fontWeight: theme.fontWeight.bold,
                  color: theme.colors.primary[600],
                }}
              >
                {data.total}
              </Text>
            </View>
          </Card>
        }
      />

      {/* Sticky Checkout bar */}
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          flexDirection: 'row',
          alignItems: 'center',
          padding: theme.spacing.md,
          paddingBottom: insets.bottom + theme.spacing.md,
          borderTopWidth: 1,
          borderTopColor: theme.colors.neutral[200],
          backgroundColor: theme.colors.neutral[0],
          ...theme.shadows.lg,
        }}
      >
        <Button
          title={t('customer.cart.checkout')}
          onPress={handleCheckout}
          size="lg"
          loading={isLoading}
          style={{ flex: 1 }}
        />
      </View>
    </View>
  );
}
