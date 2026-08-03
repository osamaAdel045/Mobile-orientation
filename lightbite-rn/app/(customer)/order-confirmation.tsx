import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/core/hooks/useTheme';
import { Button } from '@/core/ui/Button';
import { Card } from '@/core/ui/Card';
import { ScreenHeader } from '@/core/ui/ScreenHeader';
import { useCheckoutStore } from '@/features/customer/checkout/store/checkout.store';

export default function OrderConfirmationScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const orderResult = useCheckoutStore((s) => s.orderResult);
  const resetCheckout = useCheckoutStore((s) => s.reset);

  // Guard against deep links without a placed order.
  useEffect(() => {
    if (!orderResult) {
      router.replace('/(customer)/(tabs)/home');
    }
  }, [orderResult, router]);

  if (!orderResult) {
    return null;
  }

  const handleTrackOrder = () => {
    resetCheckout();
    router.replace({
      pathname: '/(customer)/order-tracking',
      params: { uuid: orderResult.uuid },
    });
  };

  const handleBackToHome = () => {
    resetCheckout();
    router.replace('/(customer)/(tabs)/home');
  };

  const renderRow = (label: string, value: string) => (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.sm,
      }}
    >
      <Text style={{ fontSize: theme.fontSize.sm, color: theme.colors.neutral[500] }}>{label}</Text>
      <Text
        style={{
          fontSize: theme.fontSize.base,
          fontWeight: theme.fontWeight.medium,
          color: theme.colors.neutral[900],
        }}
      >
        {value}
      </Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.neutral[0] }}>
      <ScreenHeader onBack={handleBackToHome} />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: theme.spacing.lg,
          paddingBottom: insets.bottom + theme.spacing.lg,
        }}
      >
        {/* Success checkmark */}
        <View
          style={{
            width: theme.spacing['2xl'] * 2,
            height: theme.spacing['2xl'] * 2,
            borderRadius: theme.radius.full,
            backgroundColor: theme.colors.semantic.successLight,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: theme.spacing.lg,
          }}
        >
          <Text
            style={{
              fontSize: theme.fontSize['3xl'],
              fontWeight: theme.fontWeight.bold,
              color: theme.colors.semantic.success,
            }}
          >
            {'✓'}
          </Text>
        </View>

        <Text
          style={{
            fontSize: theme.fontSize['3xl'],
            fontWeight: theme.fontWeight.bold,
            color: theme.colors.neutral[900],
            textAlign: 'center',
          }}
        >
          {t('customer.checkout.orderConfirmed')}
        </Text>
        <Text
          style={{
            fontSize: theme.fontSize.base,
            color: theme.colors.neutral[500],
            textAlign: 'center',
            marginTop: theme.spacing.xs,
            marginBottom: theme.spacing.lg,
          }}
        >
          {t('customer.checkout.confirmedMessage')}
        </Text>

        <Card style={{ width: '100%', marginBottom: theme.spacing.lg }}>
          {renderRow(t('customer.checkout.orderNumber'), orderResult.order_number)}
          {renderRow(t('customer.checkout.restaurant'), orderResult.restaurant.name)}
          {renderRow(
            t('customer.checkout.estimatedDelivery'),
            t('customer.checkout.estimatedDeliveryValue', {
              minutes: orderResult.estimated_delivery_min,
            }),
          )}
        </Card>

        <Button
          title={t('customer.checkout.trackOrder')}
          onPress={handleTrackOrder}
          size="lg"
          style={{ width: '100%', marginBottom: theme.spacing.sm }}
        />
        <Button
          title={t('customer.checkout.backToHome')}
          onPress={handleBackToHome}
          variant="secondary"
          size="lg"
          style={{ width: '100%' }}
        />
      </ScrollView>
    </View>
  );
}
