'use client';

import { StudentCheckInGate } from '@/components/dashboard/today/student-check-in-gate';
import { useRecoveryJourney } from '@/hooks/use-recovery-journey';

/**
 * Keeps the required daily check-in available from every authenticated
 * dashboard route. Role visibility is enforced by StudentCheckInGate.
 */
export function StudentDailyCheckInGate() {
  const recovery = useRecoveryJourney();

  return (
    <StudentCheckInGate
      completed={Boolean(recovery.todayCheckIn)}
      onSave={recovery.recordDailyCheckIn}
    />
  );
}
