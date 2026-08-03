import { useLocalSearchParams } from 'expo-router';

import MenuItemScreen from '@/features/customer/menu-item/screens/MenuItemScreen';
import type { MenuItem } from '@/features/customer/restaurant/types';

export default function MenuItemRoute() {
  const params = useLocalSearchParams<{
    item: string;
    restaurantName: string;
    restaurantUuid: string;
  }>();

  const item = JSON.parse(params.item) as MenuItem;
  const restaurantName = params.restaurantName;
  const restaurantUuid = params.restaurantUuid;

  return (
    <MenuItemScreen item={item} restaurantName={restaurantName} restaurantUuid={restaurantUuid} />
  );
}
