import { Shield } from 'lucide-react';
import { Card } from '@/components/ui/card';

export function ApprovalProcessedState() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md p-8 text-center">
        <Shield className="mx-auto h-12 w-12 text-muted-foreground" />
        <h2 className="mt-4 text-heading text-xl text-navy">Permohonan Sudah Diproses</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Permohonan ini sudah diselesaikan sebelumnya.
        </p>
      </Card>
    </div>
  );
}
