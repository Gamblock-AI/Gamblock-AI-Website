import { Shield } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useTranslations } from "next-intl";

export function ApprovalProcessedState() {
    const t = useTranslations('ApprovalProcessedState');
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md p-8 text-center">
        <Shield className="mx-auto h-12 w-12 text-muted-foreground" />
        <h2 className="mt-4 text-heading text-xl text-navy">{t('text_267')}</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {t('text_268')}</p>
      </Card>
    </div>
  );
}
