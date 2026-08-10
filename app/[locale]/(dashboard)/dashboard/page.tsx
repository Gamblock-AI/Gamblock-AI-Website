'use client';

import { Suspense } from 'react';

import { AdminDashboard } from '@/components/dashboard/admin-dashboard';
import { PartnerDashboard } from '@/components/dashboard/partner-dashboard';
import { StudentDashboard } from '@/components/dashboard/student-dashboard';
import { useLocalUser } from '@/hooks/use-local-user';

function DashboardContent() {
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

export default function DashboardPage() {
  // Suspense boundary for useSearchParams (partner dashboard reads query
  // params to drive the group/search/period filters).
  return (
    <Suspense fallback={null}>
      <DashboardContent />
    </Suspense>
  );
}
