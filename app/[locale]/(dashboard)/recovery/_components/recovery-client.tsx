'use client';

import { useLocalUser } from '@/hooks/use-local-user';
import { PartnerProgress } from './partner-progress';
import { StudentProgress } from './student-progress';
import type { RangeDays } from './progress-utils';

export function RecoveryClient({ range }: { range: RangeDays }) {
  const user = useLocalUser();
  return user.role === 'partner' ? (
    <PartnerProgress />
  ) : (
    <StudentProgress key={range} range={range} />
  );
}
