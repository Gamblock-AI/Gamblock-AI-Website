'use client';

import { useLocalUser } from '@/hooks/use-local-user';
import { PartnerProgress } from './partner-progress';
import { StudentProgress } from './student-progress';

export function ProgressClient() {
  const user = useLocalUser();
  return user.role === 'partner' ? <PartnerProgress /> : <StudentProgress />;
}
