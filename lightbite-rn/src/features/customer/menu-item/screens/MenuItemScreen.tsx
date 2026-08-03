import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/core/hooks/useTheme';
import { Button } from '@/core/ui/Button';
import { useCartConflictDialog } from '@/features/customer/cart/hooks/useCartConflictDialog';
import { useCartStore } from '@/features/customer/cart/store/cart.store';

import { useMenuItem } from '../hooks/useMenuItem';
import { useMenuItemStore } from '../store/menu-item.store';
import type { MenuItem } from '../types';

interface Props {
  item: MenuItem;
  restaurantName: string;
  restaurantUuid: string;
}

export default function MenuItemScreen({ item, restaurantName }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { quantity, specialInstructions, increment, decrement, setSpecialInstructions } =
    useMenuItem();

  const addItem = useCartStore((s) => s.addItem);
  const isCartLoading = useCartStore((s) => s.isLoading);
  useCartConflictDialog();

  const handleAddToCart = useCallback(async () => {
    const success = await addItem({
      menu_item_uuid: item.uuid,
      quantity,
      special_instructions: specialInstructions.trim() ? specialInstructions : undefined,
    });
    if (success) {
      useMenuItemStore.getState().reset();
      router.back();
    }
  }, [addItem, item.uuid, quantity, specialInstructions, router]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.neutral[0] }}>
      <ScrollView>
        {/* Close button */}
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityLabel={t('customer.menuItem.close')}
          style={{
            position: 'absolute',
            top: insets.top + theme.spacing.md,
            right: theme.spacing.md,
            zIndex: 10,
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: theme.colors.neutral[0],
            justifyContent: 'center',
            alignItems: 'center',
            ...theme.shadows.sm,
          }}
        >
          <Text style={{ fontSize: theme.fontSize.lg, color: theme.colors.neutral[700] }}>
            {'✕'}
          </Text>
        </TouchableOpacity>

        {/* Item Image */}
        {item.image_url ? (
          <Image
            source={{ uri: item.image_url }}
            style={{ width: '100%', height: 280, backgroundColor: theme.colors.neutral[100] }}
          />
        ) : (
          <View
            style={{
              width: '100%',
              height: 280,
              backgroundColor: theme.colors.neutral[100],
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 64, color: theme.colors.neutral[300] }}>{'\u{1F37D}'}</Text>
          </View>
        )}

        {/* Details */}
        <View style={{ padding: theme.spacing.md }}>
          <Text style={{ fontSize: theme.fontSize.xs, color: theme.colors.neutral[400] }}>
            {restaurantName}
          </Text>
          <Text
            style={{
              fontSize: theme.fontSize['2xl'],
              fontWeight: theme.fontWeight.bold,
              color: theme.colors.neutral[900],
              marginTop: theme.spacing.xs,
            }}
          >
            {item.name}
          </Text>
          {item.description ? (
            <Text
              style={{
                fontSize: theme.fontSize.base,
                color: theme.colors.neutral[500],
                marginTop: theme.spacing.sm,
                lineHeight: theme.fontSize.base * 1.5,
              }}
            >
              {item.description}
            </Text>
          ) : null}
          <Text
            style={{
              fontSize: theme.fontSize.xl,
              fontWeight: theme.fontWeight.bold,
              color: theme.colors.primary[600],
              marginTop: theme.spacing.md,
            }}
          >
            {item.price}
          </Text>

          {!item.is_available && (
            <Text
              style={{
                fontSize: theme.fontSize.sm,
                color: theme.colors.semantic.error,
                marginTop: theme.spacing.sm,
              }}
            >
              {t('customer.menuItem.currentlyUnavailable')}
            </Text>
          )}
        </View>

        {/* Quantity Selector */}
        <View style={{ paddingHorizontal: theme.spacing.md }}>
          <Text
            style={{
              fontSize: theme.fontSize.sm,
              fontWeight: theme.fontWeight.medium,
              color: theme.colors.neutral[700],
              marginBottom: theme.spacing.sm,
            }}
          >
            {t('customer.menuItem.quantity')}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}>
            <TouchableOpacity
              onPress={decrement}
              disabled={quantity <= 1}
              accessibilityLabel={t('customer.menuItem.decrement')}
              style={{
                width: 40,
                height: 40,
                borderRadius: theme.radius.sm,
                backgroundColor:
                  quantity <= 1 ? theme.colors.neutral[100] : theme.colors.primary[50],
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: theme.fontSize.xl,
                  color: quantity <= 1 ? theme.colors.neutral[300] : theme.colors.primary[600],
                }}
              >
                {'−'}
              </Text>
            </TouchableOpacity>
            <Text
              style={{
                fontSize: theme.fontSize.xl,
                fontWeight: theme.fontWeight.semibold,
                color: theme.colors.neutral[900],
                minWidth: 30,
                textAlign: 'center',
              }}
            >
              {String(quantity)}
            </Text>
            <TouchableOpacity
              onPress={increment}
              disabled={quantity >= 99}
              accessibilityLabel={t('customer.menuItem.increment')}
              style={{
                width: 40,
                height: 40,
                borderRadius: theme.radius.sm,
                backgroundColor:
                  quantity >= 99 ? theme.colors.neutral[100] : theme.colors.primary[50],
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: theme.fontSize.xl,
                  color: quantity >= 99 ? theme.colors.neutral[300] : theme.colors.primary[600],
                }}
              >
                {'+'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Special Instructions */}
        <View style={{ padding: theme.spacing.md }}>
          <Text
            style={{
              fontSize: theme.fontSize.sm,
              fontWeight: theme.fontWeight.medium,
              color: theme.colors.neutral[700],
              marginBottom: theme.spacing.sm,
            }}
          >
            {t('customer.menuItem.specialInstructions')}
          </Text>
          <TextInput
            value={specialInstructions}
            onChangeText={setSpecialInstructions}
            placeholder={t('customer.menuItem.specialInstructionsPlaceholder')}
            placeholderTextColor={theme.colors.neutral[400]}
            multiline
            numberOfLines={3}
            style={{
              minHeight: 80,
              borderRadius: theme.radius.sm,
              borderWidth: 1,
              borderColor: theme.colors.neutral[200],
              padding: theme.spacing.md,
              fontSize: theme.fontSize.base,
              color: theme.colors.neutral[900],
              textAlignVertical: 'top',
            }}
          />
        </View>
      </ScrollView>

      {/* Bottom Add to Cart */}
      <View
        style={{
          padding: theme.spacing.md,
          paddingBottom: insets.bottom + theme.spacing.md,
          borderTopWidth: 1,
          borderTopColor: theme.colors.neutral[200],
          backgroundColor: theme.colors.neutral[0],
        }}
      >
        <Button
          title={`${t('customer.menuItem.addToCart')}${quantity > 1 ? ` (${quantity})` : ''}`}
          onPress={handleAddToCart}
          size="lg"
          disabled={!item.is_available}
          loading={isCartLoading}
        />
      </View>
    </View>
  );
}
