'use client';

import { PartnerDashboard } from '@/components/dashboard/partner-dashboard';
import { StudentDashboard } from '@/components/dashboard/student-dashboard';
import { useLocalUser } from '@/hooks/use-local-user';

export default function DashboardPage() {
  const user = useLocalUser();
  const firstName = user.display_name?.trim().split(/\s+/)[0] || '';
  const isPartner = user.role === 'partner' || user.role === 'platform_admin';

  return isPartner ? (
    <PartnerDashboard name={firstName} />
  ) : (
    <StudentDashboard name={firstName} />
  );
}
