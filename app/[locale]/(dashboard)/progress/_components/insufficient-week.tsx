import { ShieldCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Link } from '@/i18n/routing';
import { ROUTES } from '@/routes';

export function InsufficientWeek({ recordedCount }: { recordedCount: number }) {
  const t = useTranslations('weeklyReview');

  return (
    <Card className="overflow-hidden rounded-3xl">
      <div className="mx-auto flex max-w-xl flex-col items-center px-5 py-12 text-center sm:px-8 sm:py-16">
        <div className="bg-navy/[0.06] text-navy flex size-12 items-center justify-center rounded-2xl">
          <ShieldCheck className="size-6" />
        </div>
        <h2 className="text-navy mt-5 text-xl font-bold tracking-tight sm:text-2xl">
          {t('insufficientTitle')}
        </h2>
        <p className="text-muted-foreground mt-3 text-sm leading-6 sm:text-base">
          {t('insufficientBody')}
        </p>
        <p className="text-navy mt-2 text-sm font-semibold">
          {t('recordedSummary', { count: recordedCount })}
        </p>
        <Button
          size="lg"
          nativeButton={false}
          className="mt-7 min-h-11 w-full sm:w-auto"
          render={<Link href={ROUTES.DASHBOARD} />}
        >
          {t('goCheckIn')}
        </Button>
      </div>
    </Card>
  );
}
