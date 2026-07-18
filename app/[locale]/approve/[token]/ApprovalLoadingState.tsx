import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function ApprovalLoadingState() {
  const t = useTranslations('approvalFlow');
  return (
    <div className="bg-background flex min-h-screen items-center justify-center">
      <Loader2
        className="text-navy h-8 w-8 animate-spin"
        aria-label={t('loading')}
      />
    </div>
  );
}
