import { useDriverJobStore } from '../store/job.store';

export function useDriverJob() {
  const isAccepting = useDriverJobStore((s) => s.isAccepting);
  const isDeclining = useDriverJobStore((s) => s.isDeclining);
  const error = useDriverJobStore((s) => s.error);
  const acceptJob = useDriverJobStore((s) => s.acceptJob);
  const rejectJob = useDriverJobStore((s) => s.rejectJob);
  const clearError = useDriverJobStore((s) => s.clearError);

  return { isAccepting, isDeclining, error, acceptJob, rejectJob, clearError };
}
