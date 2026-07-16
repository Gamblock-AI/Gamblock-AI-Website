import { Archive, Pause, RotateCcw } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { IntentionEditor } from '@/components/dashboard/today/intention-editor';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { UseRecoveryJourneyResult } from '@/hooks/use-recovery-journey';
import type { IntentionStatus, RecoveryIntention } from '@/lib/recovery/types';

const statusKey: Record<IntentionStatus, string> = {
  active: 'statusActive',
  paused: 'statusPaused',
  archived: 'statusArchived',
};

interface IntentionSectionProps {
  activeIntention: RecoveryIntention | null;
  intentions: RecoveryIntention[];
  onSave: (value: string) => void;
  setIntentionStatus: UseRecoveryJourneyResult['setIntentionStatus'];
}

export function IntentionSection({
  activeIntention,
  intentions,
  onSave,
  setIntentionStatus,
}: IntentionSectionProps) {
  const t = useTranslations('recoveryHub');
  const locale = useLocale();
  const otherIntentions = intentions
    .filter((intention) => intention.id !== activeIntention?.id)
    .slice(0, 6);
  const dateFormatter = new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
  });

  return (
    <section aria-labelledby="recovery-intention-title">
      <Card className="overflow-hidden rounded-2xl">
        <div className="border-border flex flex-col gap-3 border-b p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
          <div>
            <h2
              id="recovery-intention-title"
              className="text-navy text-xl font-bold"
            >
              {t('intentionTitle')}
            </h2>
            <p className="text-muted-foreground mt-1 max-w-2xl text-sm leading-6">
              {t('intentionDescription')}
            </p>
          </div>
          {activeIntention ? (
            <span className="bg-sage/10 text-sage inline-flex min-h-8 items-center self-start rounded-full px-3 text-xs font-semibold">
              {t('statusActive')}
            </span>
          ) : null}
        </div>
        <IntentionEditor value={activeIntention?.title} onSave={onSave} />
        {activeIntention ? (
          <div className="flex flex-wrap gap-2 px-5 py-4 sm:px-6">
            <Button
              type="button"
              variant="outline"
              className="h-11"
              onClick={() => setIntentionStatus(activeIntention.id, 'paused')}
            >
              <Pause className="size-4" aria-hidden="true" />
              {t('pauseIntention')}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="h-11"
              onClick={() => setIntentionStatus(activeIntention.id, 'archived')}
            >
              <Archive className="size-4" aria-hidden="true" />
              {t('archiveIntention')}
            </Button>
          </div>
        ) : null}
        <IntentionHistory
          intentions={otherIntentions}
          dateFormatter={dateFormatter}
          setIntentionStatus={setIntentionStatus}
        />
      </Card>
    </section>
  );
}

function IntentionHistory({
  intentions,
  dateFormatter,
  setIntentionStatus,
}: {
  intentions: RecoveryIntention[];
  dateFormatter: Intl.DateTimeFormat;
  setIntentionStatus: UseRecoveryJourneyResult['setIntentionStatus'];
}) {
  const t = useTranslations('recoveryHub');

  return (
    <div className="border-border bg-muted/35 border-t p-5 sm:p-6">
      <h3 className="text-navy text-sm font-bold">{t('historyTitle')}</h3>
      {intentions.length === 0 ? (
        <p className="text-muted-foreground mt-2 text-sm leading-6">
          {t('historyEmpty')}
        </p>
      ) : (
        <div className="divide-border border-border bg-card mt-3 divide-y rounded-2xl border">
          {intentions.map((intention) => (
            <div
              key={intention.id}
              className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="text-foreground text-sm leading-6 font-semibold">
                  {intention.title}
                </p>
                <p className="text-muted-foreground mt-1 text-xs">
                  {t(statusKey[intention.status])} ·{' '}
                  {t('updatedAt', {
                    date: dateFormatter.format(new Date(intention.updatedAt)),
                  })}
                </p>
              </div>
              {intention.status === 'paused' ? (
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 shrink-0"
                  onClick={() => setIntentionStatus(intention.id, 'active')}
                >
                  <RotateCcw className="size-4" aria-hidden="true" />
                  {t('resumeIntention')}
                </Button>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
