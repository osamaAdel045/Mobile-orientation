import { useLocalSearchParams } from 'expo-router';

import RateOrderScreen from '@/features/customer/rate-order/screens/RateOrderScreen';

export default function RateOrderRoute() {
  const { uuid } = useLocalSearchParams<{
    uuid: string;
  }>();
  return <RateOrderScreen uuid={uuid} />;
}
