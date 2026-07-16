import { CircleAlert, NotebookPen, RefreshCw } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { ReflectionEntry } from '@/hooks/use-reflections';

interface ReflectionHistoryProps {
  reflections: ReflectionEntry[];
  loading: boolean;
  error: unknown;
  onRetry: () => void;
}

export function ReflectionHistory({
  reflections,
  loading,
  error,
  onRetry,
}: ReflectionHistoryProps) {
  const t = useTranslations('recoveryHub');
  const locale = useLocale();
  const dateFormatter = new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
  });

  return (
    <aside className="border-border bg-muted/35 border-t p-5 sm:p-6 lg:border-t-0 lg:border-l">
      <h3 className="text-navy text-sm font-bold">
        {t('journalHistoryTitle')}
      </h3>
      {loading ? (
        <div className="mt-4 space-y-3" role="status">
          <Skeleton className="h-20 w-full rounded-2xl" />
          <Skeleton className="h-20 w-full rounded-2xl" />
          <span className="sr-only">{t('journalLoading')}</span>
        </div>
      ) : error ? (
        <div
          className="border-amber/40 bg-amber/[0.10] mt-4 rounded-2xl border p-4"
          role="alert"
        >
          <div className="flex items-start gap-2.5">
            <CircleAlert
              className="text-amber mt-0.5 size-5 shrink-0"
              aria-hidden="true"
            />
            <p className="text-foreground text-sm leading-6">
              {t('journalError')}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            className="mt-3 h-11"
            onClick={onRetry}
          >
            <RefreshCw className="size-4" aria-hidden="true" />
            {t('journalRetry')}
          </Button>
        </div>
      ) : reflections.length === 0 ? (
        <div className="border-navy/25 bg-card/75 mt-4 flex min-h-40 flex-col items-center justify-center rounded-2xl border border-dashed p-5 text-center">
          <span className="bg-navy flex size-10 items-center justify-center rounded-xl text-white shadow-sm">
            <NotebookPen className="size-5" aria-hidden="true" />
          </span>
          <p className="text-navy mt-3 text-sm font-bold">
            {t('journalEmpty')}
          </p>
          <p className="text-muted-foreground mt-1 text-xs leading-5">
            {t('journalEmptyHint')}
          </p>
        </div>
      ) : (
        <div className="divide-border mt-3 divide-y">
          {reflections.map((reflection) => (
            <div key={reflection.id} className="py-4 first:pt-2 last:pb-0">
              <p className="text-sage text-xs font-bold">{reflection.mood}</p>
              <p className="text-navy mt-2 text-sm leading-6">
                {reflection.text}
              </p>
              <p className="text-muted-foreground mt-2 text-xs">
                {dateFormatter.format(new Date(reflection.created_at))}
              </p>
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}
