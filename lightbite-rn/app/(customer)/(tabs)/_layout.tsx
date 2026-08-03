import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/core/hooks/useTheme';
import { useCartStore } from '@/features/customer/cart/store/cart.store';

export default function CustomerTabsLayout() {
  const { t } = useTranslation();
  const theme = useTheme();
  const cartItemCount = useCartStore((s) => s.getItemCount());

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary[500],
        tabBarInactiveTintColor: theme.colors.neutral[400],
        tabBarStyle: {
          backgroundColor: theme.colors.neutral[0],
          borderTopColor: theme.colors.neutral[200],
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: t('customer.home'),
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: t('customer.cart.title'),
          tabBarIcon: ({ color, size }) => <Ionicons name="cart-outline" size={size} color={color} />,
          tabBarBadge: cartItemCount > 0 ? cartItemCount : undefined,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: t('customer.orders'),
          tabBarIcon: ({ color, size }) => <Ionicons name="receipt-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('customer.profile'),
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
