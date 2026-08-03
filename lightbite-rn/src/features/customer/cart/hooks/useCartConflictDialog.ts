import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { useCartStore } from '../store/cart.store';

/**
 * Presents a confirmation dialog whenever the cart store is in a
 * DIFFERENT_RESTAURANT conflict. Mount once per screen that can trigger
 * (or surface) a cart add — only one screen is ever mounted at a time, so
 * this never double-prompts.
 */
export function useCartConflictDialog() {
  const { t } = useTranslation();
  const conflictRestaurant = useCartStore((s) => s.conflictRestaurant);
  const resolveConflict = useCartStore((s) => s.resolveConflict);

  useEffect(() => {
    if (!conflictRestaurant) return;

    Alert.alert(
      t('customer.cart.conflictTitle'),
      conflictRestaurant.name,
      [
        { text: t('customer.cart.cancel'), style: 'cancel' },
        {
          text: t('customer.cart.clearAndAdd'),
          style: 'destructive',
          onPress: () => resolveConflict(true),
        },
      ],
      { cancelable: true },
    );
  }, [conflictRestaurant, resolveConflict, t]);
}
