import { useLocalSearchParams } from 'expo-router';

import DriverDeliveryScreen from '@/features/driver/delivery/screens/DriverDeliveryScreen';
import type { DriverDeliveryJob } from '@/features/driver/delivery/types';

export default function DriverDeliveryRoute() {
  const params = useLocalSearchParams<{ job: string }>();
  const job = JSON.parse(params.job) as DriverDeliveryJob;

  return <DriverDeliveryScreen job={job} phase="delivering" />;
}
