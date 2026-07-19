'use client';

import { AdminDashboard } from '@/components/dashboard/admin-dashboard';
import { PartnerDashboard } from '@/components/dashboard/partner-dashboard';
import { StudentDashboard } from '@/components/dashboard/student-dashboard';
import { useLocalUser } from '@/hooks/use-local-user';

export default function DashboardPage() {
  const user = useLocalUser();
  const firstName = user.display_name?.trim().split(/\s+/)[0] || '';
  const isPartner = user.role === 'partner';

  if (user.role === 'admin') {
    return <AdminDashboard name={firstName} />;
  }

  return isPartner ? (
    <PartnerDashboard name={firstName} />
  ) : (
    <StudentDashboard name={firstName} />
  );
}
