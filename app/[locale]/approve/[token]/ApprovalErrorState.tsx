import { XCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useTranslations } from 'next-intl';

export function ApprovalErrorState({ message }: { message: string }) {
  const t = useTranslations('approvalFlow');
  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md p-8 text-center">
        <XCircle className="text-crimson mx-auto h-12 w-12" />
        <h2 className="text-heading text-navy mt-4 text-xl">
          {t('errorTitle')}
        </h2>
        <p className="text-muted-foreground mt-2 text-sm">{message}</p>
      </Card>
    </div>
  );
}
