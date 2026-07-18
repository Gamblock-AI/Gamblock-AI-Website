import { CheckCircle, XCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useTranslations } from 'next-intl';

export function ApprovalResolvedState({
  status,
}: {
  status: 'approved' | 'denied';
}) {
  const t = useTranslations('approvalFlow');
  const isApproved = status === 'approved';
  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md p-8 text-center">
        {isApproved ? (
          <CheckCircle className="text-sage mx-auto h-12 w-12" />
        ) : (
          <XCircle className="text-crimson mx-auto h-12 w-12" />
        )}
        <h2 className="text-heading text-navy mt-4 text-xl">
          {isApproved ? t('approvedTitle') : t('deniedTitle')}
        </h2>
        <p className="text-muted-foreground mt-2 text-sm">
          {isApproved ? t('approvedBody') : t('deniedBody')}
        </p>
      </Card>
    </div>
  );
}
