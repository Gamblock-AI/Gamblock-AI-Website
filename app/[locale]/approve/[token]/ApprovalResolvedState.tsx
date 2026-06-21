import { CheckCircle, XCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';

export function ApprovalResolvedState({ status }: { status: 'approved' | 'denied' }) {
  const isApproved = status === 'approved';
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md p-8 text-center">
        {isApproved ? (
          <CheckCircle className="mx-auto h-12 w-12 text-sage" />
        ) : (
          <XCircle className="mx-auto h-12 w-12 text-crimson" />
        )}
        <h2 className="mt-4 text-heading text-xl text-navy">
          {isApproved ? 'Permohonan Disetujui' : 'Permohonan Ditolak'}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {isApproved
            ? 'Aplikasi akan dibuka dalam waktu singkat. Member akan menerima notifikasi.'
            : 'Permohonan telah ditolak. Aplikasi tetap terkunci.'}
        </p>
      </Card>
    </div>
  );
}
