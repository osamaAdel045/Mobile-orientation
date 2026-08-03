import { useLocalSearchParams } from 'expo-router';

import DriverJobScreen from '@/features/driver/job/screens/DriverJobScreen';
import type { DriverJob } from '@/features/driver/job/types';

export default function DriverJobOfferRoute() {
  const params = useLocalSearchParams<{ job: string }>();
  const job = JSON.parse(params.job) as DriverJob;

  return <DriverJobScreen job={job} />;
}
