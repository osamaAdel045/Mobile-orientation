import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/core/hooks/useTheme';
import { Button } from '@/core/ui/Button';
import { Card } from '@/core/ui/Card';
import { EmptyState } from '@/core/ui/EmptyState';
import { ErrorDisplay } from '@/core/ui/ErrorDisplay';
import { Input } from '@/core/ui/Input';
import { ScreenHeader } from '@/core/ui/ScreenHeader';
import { Skeleton } from '@/core/ui/Skeleton';
import type { CartItem } from '@/features/customer/cart/types';

import { useCustomerCheckout } from '../hooks/useCustomerCheckout';

export default function CustomerCheckoutScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    cartScreenState,
    refreshCart,
    addressScreenState,
    addresses,
    selectedAddress,
    selectedUuid,
    selectAddress,
    refreshAddresses,
    isPlacingOrder,
    orderError,
    customerNote,
    setCustomerNote,
    placeOrder,
  } = useCustomerCheckout();

  // Ensure cart and address data are available on mount (deep-link safe).
  useEffect(() => {
    refreshCart();
    refreshAddresses();
  }, [refreshCart, refreshAddresses]);

  // Auto-select the default (or first) address when none is selected yet.
  useEffect(() => {
    if (!selectedUuid && addresses.length > 0) {
      const defaultAddress = addresses.find((a) => a.is_default) ?? addresses[0];
      if (defaultAddress) selectAddress(defaultAddress.uuid);
    }
  }, [addresses, selectedUuid, selectAddress]);

  if (cartScreenState.status === 'loading') {
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
        <Skeleton height={120} style={{ marginBottom: theme.spacing.md }} />
        <Skeleton height={96} style={{ marginBottom: theme.spacing.md }} />
        <Skeleton height={96} style={{ marginBottom: theme.spacing.md }} />
      </View>
    );
  }

  if (cartScreenState.status === 'error') {
    return <ErrorDisplay message={cartScreenState.message} onRetry={refreshCart} />;
  }

  if (cartScreenState.status === 'empty') {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.neutral[0] }}>
        <EmptyState message={t('customer.cart.empty')} />
      </View>
    );
  }

  const { data: cart } = cartScreenState;

  const handleChangeAddress = () => {
    router.push('/(customer)/address-picker');
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) return;
    const success = await placeOrder();
    if (success) {
      router.push('/(customer)/order-confirmation');
    }
  };

  const renderItem = (item: CartItem) => (
    <View
      key={item.id}
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: theme.spacing.sm,
      }}
    >
      <View style={{ flex: 1, marginRight: theme.spacing.md }}>
        <Text
          style={{
            fontSize: theme.fontSize.base,
            fontWeight: theme.fontWeight.medium,
            color: theme.colors.neutral[900],
          }}
        >
          {item.menu_item.name}
        </Text>
        <Text style={{ fontSize: theme.fontSize.sm, color: theme.colors.neutral[500] }}>
          {`${t('customer.checkout.quantity')}: ${String(item.quantity)}`}
        </Text>
        <Text style={{ fontSize: theme.fontSize.sm, color: theme.colors.neutral[500] }}>
          {item.unit_price}
        </Text>
      </View>
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
  );

  const renderSummaryRow = (label: string, value: string, bold = false) => (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.xs,
      }}
    >
      <Text
        style={{
          fontSize: bold ? theme.fontSize.lg : theme.fontSize.base,
          fontWeight: bold ? theme.fontWeight.bold : theme.fontWeight.regular,
          color: theme.colors.neutral[900],
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          fontSize: bold ? theme.fontSize.lg : theme.fontSize.base,
          fontWeight: bold ? theme.fontWeight.bold : theme.fontWeight.medium,
          color: bold ? theme.colors.primary[600] : theme.colors.neutral[900],
        }}
      >
        {value}
      </Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.neutral[0] }}>
      <ScreenHeader title={t('customer.checkout.title')} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: theme.spacing.md,
          paddingBottom: 96 + insets.bottom,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Order summary */}
        <Card style={{ marginBottom: theme.spacing.md }}>
          <Text
            style={{
              fontSize: theme.fontSize.lg,
              fontWeight: theme.fontWeight.semibold,
              color: theme.colors.neutral[900],
              marginBottom: theme.spacing.md,
            }}
          >
            {t('customer.checkout.orderSummary')}
          </Text>
          {cart.items.map(renderItem)}
          <View
            style={{
              borderTopWidth: 1,
              borderTopColor: theme.colors.neutral[200],
              paddingTop: theme.spacing.sm,
              marginTop: theme.spacing.xs,
            }}
          >
            {renderSummaryRow(t('customer.cart.subtotal'), cart.subtotal)}
            {renderSummaryRow(t('customer.cart.deliveryFee'), cart.delivery_fee)}
            {renderSummaryRow(t('customer.cart.tax'), cart.tax)}
            {renderSummaryRow(t('customer.cart.total'), cart.total, true)}
          </View>
        </Card>

        {/* Delivery address */}
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
                fontSize: theme.fontSize.lg,
                fontWeight: theme.fontWeight.semibold,
                color: theme.colors.neutral[900],
              }}
            >
              {t('customer.checkout.deliveryAddress')}
            </Text>
            <TouchableOpacity
              onPress={handleChangeAddress}
              accessibilityLabel={t('customer.checkout.changeAddress')}
              disabled={isPlacingOrder}
            >
              <Text
                style={{
                  fontSize: theme.fontSize.sm,
                  fontWeight: theme.fontWeight.medium,
                  color: theme.colors.primary[600],
                }}
              >
                {t('customer.checkout.changeAddress')}
              </Text>
            </TouchableOpacity>
          </View>

          {addressScreenState.status === 'loading' ? (
            <Skeleton height={theme.fontSize.base} style={{ marginTop: theme.spacing.sm }} />
          ) : selectedAddress ? (
            <View>
              <Text
                style={{
                  fontSize: theme.fontSize.base,
                  fontWeight: theme.fontWeight.semibold,
                  color: theme.colors.neutral[900],
                }}
              >
                {t(`customer.address.${selectedAddress.label}`)}
              </Text>
              <Text
                style={{
                  fontSize: theme.fontSize.sm,
                  color: theme.colors.neutral[500],
                  marginTop: theme.spacing.xs,
                }}
              >
                {selectedAddress.address}
              </Text>
              {selectedAddress.apartment ? (
                <Text
                  style={{
                    fontSize: theme.fontSize.sm,
                    color: theme.colors.neutral[400],
                    marginTop: theme.spacing.xs,
                  }}
                >
                  {selectedAddress.apartment}
                </Text>
              ) : null}
            </View>
          ) : (
            <View>
              <Text
                style={{
                  fontSize: theme.fontSize.sm,
                  color: theme.colors.semantic.error,
                  marginBottom: theme.spacing.sm,
                }}
              >
                {t('customer.checkout.selectAddressError')}
              </Text>
              <Button
                title={t('customer.checkout.selectAddress')}
                onPress={handleChangeAddress}
                variant="secondary"
                size="sm"
              />
            </View>
          )}
        </Card>

        {/* Customer note */}
        <Input
          label={t('customer.checkout.customerNote')}
          placeholder={t('customer.checkout.customerNotePlaceholder')}
          value={customerNote}
          onChangeText={setCustomerNote}
          multiline
        />

        {orderError ? (
          <Text
            style={{
              fontSize: theme.fontSize.sm,
              color: theme.colors.semantic.error,
              marginTop: theme.spacing.sm,
            }}
          >
            {orderError}
          </Text>
        ) : null}
      </ScrollView>

      {/* Sticky Place Order bar */}
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          padding: theme.spacing.md,
          paddingBottom: insets.bottom + theme.spacing.md,
          borderTopWidth: 1,
          borderTopColor: theme.colors.neutral[200],
          backgroundColor: theme.colors.neutral[0],
          ...theme.shadows.lg,
        }}
      >
        <Button
          title={t('customer.checkout.placeOrder')}
          onPress={handlePlaceOrder}
          size="lg"
          loading={isPlacingOrder}
          style={{ width: '100%' }}
        />
      </View>
    </View>
  );
}
