import { useLocalSearchParams } from 'expo-router';

import DriverDeliveryScreen from '@/features/driver/delivery/screens/DriverDeliveryScreen';
import type { DriverDeliveryJob } from '@/features/driver/delivery/types';
import type { DeliveryPhase } from '@/features/driver/home/types';

export default function DriverDeliveryRoute() {
  const params = useLocalSearchParams<{ job: string; phase?: string }>();
  const job = JSON.parse(params.job) as DriverDeliveryJob;
  const phase: DeliveryPhase = (params.phase as DeliveryPhase) || 'pickup';

  return <DriverDeliveryScreen job={job} phase={phase} />;
}
