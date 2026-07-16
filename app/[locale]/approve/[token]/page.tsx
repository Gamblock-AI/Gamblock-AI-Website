'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useApprovalVerification } from '@/hooks/use-approval';
import { ApprovalLoadingState } from './ApprovalLoadingState';
import { ApprovalErrorState } from './ApprovalErrorState';
import { ApprovalResolvedState } from './ApprovalResolvedState';
import { ApprovalProcessedState } from './ApprovalProcessedState';
import { ApprovalRequestForm } from './ApprovalRequestForm';

export default function ApprovePage() {
  const params = useParams();
  const token = params?.token as string;
  const { details, loading, error } = useApprovalVerification(token);
  const [resolved, setResolved] = useState<'approved' | 'denied' | null>(null);

  if (loading) {
    return <ApprovalLoadingState />;
  }

  if (error || !details) {
    return (
      <ApprovalErrorState
        message={error ?? 'Tautan persetujuan tidak dapat digunakan.'}
      />
    );
  }

  if (resolved) {
    return <ApprovalResolvedState status={resolved} />;
  }

  if (details.status !== 'pending') {
    return <ApprovalProcessedState />;
  }

  return (
    <ApprovalRequestForm
      details={details}
      token={token}
      onResolved={(status) => setResolved(status)}
    />
  );
}
