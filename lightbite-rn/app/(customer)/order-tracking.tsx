import { useLocalSearchParams } from 'expo-router';

import CustomerOrderTrackingScreen from '@/features/customer/order/screens/CustomerOrderTrackingScreen';

export default function OrderTrackingRoute() {
  const { uuid } = useLocalSearchParams<{ uuid: string }>();
  return <CustomerOrderTrackingScreen uuid={uuid} />;
}
