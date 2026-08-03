import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/core/hooks/useTheme';
import { Button } from '@/core/ui/Button';
import { Card } from '@/core/ui/Card';
import { Input } from '@/core/ui/Input';
import { ScreenHeader } from '@/core/ui/ScreenHeader';

import { useCustomerRateOrder } from '../hooks/useCustomerRateOrder';

const STARS = [1, 2, 3, 4, 5];

interface RateOrderScreenProps {
  uuid: string;
}

export default function RateOrderScreen({ uuid }: RateOrderScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isSubmitting, submit, reset } = useCustomerRateOrder();

  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (rating < 1) {
      setErrorMessage(t('customer.rateOrder.selectRating'));
      return;
    }
    setErrorMessage(null);

    const error = await submit(uuid, {
      rating,
      review: review.trim().length > 0 ? review.trim() : undefined,
    });

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    Alert.alert(t('customer.rateOrder.thanks'), t('customer.rateOrder.thanksMessage'), [
      {
        text: t('common.ok'),
        onPress: () => {
          reset();
          router.back();
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.neutral[0] }}>
      <ScreenHeader title={t('customer.rateOrder.title')} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: theme.spacing.md, paddingBottom: 96 + insets.bottom }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Star rating */}
        <Card style={{ alignItems: 'center', marginBottom: theme.spacing.md }}>
          <Text
            style={{
              fontSize: theme.fontSize.base,
              fontWeight: theme.fontWeight.semibold,
              color: theme.colors.neutral[900],
              marginBottom: theme.spacing.md,
            }}
          >
            {t('customer.rateOrder.yourRating')}
          </Text>
          <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
            {STARS.map((value) => {
              const selected = value <= rating;
              return (
                <TouchableOpacity
                  key={value}
                  onPress={() => setRating(value)}
                  accessibilityRole="button"
                  accessibilityLabel={t('customer.rateOrder.starRating', { value })}
                  accessibilityState={{ selected: value === rating }}
                >
                  <Text
                    style={{
                      fontSize: theme.fontSize['3xl'],
                      color: selected ? theme.colors.primary[500] : theme.colors.neutral[300],
                    }}
                  >
                    {selected ? '★' : '☆'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Text
            style={{
              fontSize: theme.fontSize.sm,
              color: theme.colors.neutral[400],
              marginTop: theme.spacing.sm,
            }}
          >
            {rating >= 1 ? `${rating}/5` : t('customer.rateOrder.tapToRate')}
          </Text>
        </Card>

        {/* Review */}
        <Input
          label={t('customer.rateOrder.reviewLabel')}
          placeholder={t('customer.rateOrder.reviewPlaceholder')}
          value={review}
          onChangeText={setReview}
          multiline
          style={{ height: 120, textAlignVertical: 'top' }}
        />

        {errorMessage ? (
          <Text
            style={{
              fontSize: theme.fontSize.sm,
              color: theme.colors.semantic.error,
              marginTop: theme.spacing.sm,
            }}
          >
            {errorMessage}
          </Text>
        ) : null}
      </ScrollView>

      {/* Sticky submit bar */}
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
          title={t('customer.rateOrder.submit')}
          onPress={handleSubmit}
          size="lg"
          loading={isSubmitting}
          style={{ width: '100%' }}
        />
      </View>
    </View>
  );
}
