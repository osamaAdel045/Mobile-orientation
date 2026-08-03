import { useLocalSearchParams } from 'expo-router';

import CustomerRestaurantScreen from '@/features/customer/restaurant/screens/CustomerRestaurantScreen';

export default function RestaurantRoute() {
  const { uuid } = useLocalSearchParams<{ uuid: string }>();
  return <CustomerRestaurantScreen uuid={uuid} />;
}
