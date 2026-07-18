import { Shield } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useTranslations } from 'next-intl';

export function ApprovalProcessedState() {
  const t = useTranslations('approvalFlow');
  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md p-8 text-center">
        <Shield className="text-muted-foreground mx-auto h-12 w-12" />
        <h2 className="text-heading text-navy mt-4 text-xl">
          {t('processedTitle')}
        </h2>
        <p className="text-muted-foreground mt-2 text-sm">
          {t('processedBody')}
        </p>
      </Card>
    </div>
  );
}
