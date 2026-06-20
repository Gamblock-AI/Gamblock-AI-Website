import { XCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';

export function ApprovalErrorState({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md p-8 text-center">
        <XCircle className="mx-auto h-12 w-12 text-crimson" />
        <h2 className="mt-4 text-heading text-xl text-navy">Gagal Memverifikasi</h2>
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
      </Card>
    </div>
  );
}
