'use client';

import { useParams } from 'next/navigation';
import { AdminAreaClient } from '../../_components/admin-area-client';

export default function AdminContentDetailPage() {
  const { id } = useParams<{ id: string }>();

  return <AdminAreaClient area="content" moduleID={id} />;
}
