import {
  Archive,
  History,
  Pause,
  RotateCcw,
  Save,
  Smartphone,
  Target,
} from 'lucide-react';
import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { NativeSelect } from '@/components/common/native-select';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import type { UseRecoveryJourneyResult } from '@/hooks/use-recovery-journey';
import type {
  CreateIntentionInput,
  IntentionFocusPeriod,
  IntentionStatus,
  RecoveryIntention,
} from '@/lib/recovery/types';

const statusKey: Record<IntentionStatus, string> = {
  active: 'statusActive',
  paused: 'statusPaused',
  archived: 'statusArchived',
};

interface IntentionSectionProps {
  activeIntention: RecoveryIntention | null;
  intentions: RecoveryIntention[];
  onSave: (value: CreateIntentionInput) => void;
  setIntentionStatus: UseRecoveryJourneyResult['setIntentionStatus'];
}

export function IntentionSection({
  activeIntention,
  intentions,
  onSave,
  setIntentionStatus,
}: IntentionSectionProps) {
  const t = useTranslations('recoveryHub');
  const formT = useTranslations('recoveryDashboard');
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
        <div className="border-border border-b p-4 sm:p-5">
          <div>
            <h2
              id="recovery-intention-title"
              className="text-navy text-lg font-bold"
            >
              {t('intentionTitle')}
            </h2>
            <p className="text-muted-foreground mt-0.5 max-w-2xl text-sm leading-5">
              {t('intentionDescription')}
            </p>
          </div>
        </div>
        <div className="p-4 sm:p-5">
          {activeIntention ? (
            <div className="mb-4 flex items-center gap-3">
              <span className="bg-sage/10 text-sage flex size-11 shrink-0 items-center justify-center rounded-full">
                <Target className="size-5" aria-hidden="true" />
              </span>
              <span className="bg-sage/10 text-sage inline-flex min-h-8 items-center rounded-full px-3 text-xs font-semibold">
                {t('statusActive')}
              </span>
            </div>
          ) : (
            <div className="mb-4">
              <p className="text-navy font-semibold">{t('noIntention')}</p>
              <p className="text-muted-foreground mt-0.5 text-sm leading-5">
                {t('noIntentionBody')}
              </p>
            </div>
          )}
          <IntentionInlineForm
            key={activeIntention?.id ?? 'new'}
            intention={activeIntention}
            onSave={onSave}
            t={formT}
          />
          {activeIntention ? (
            <div className="border-border mt-4 flex flex-col gap-2 border-t pt-4 sm:flex-row">
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
        </div>
        <IntentionHistory
          intentions={otherIntentions}
          dateFormatter={dateFormatter}
          setIntentionStatus={setIntentionStatus}
        />
        <div className="border-border bg-azure/20 flex items-start gap-3 border-t p-4 sm:p-5">
          <span className="bg-background text-navy flex size-9 shrink-0 items-center justify-center rounded-full">
            <Smartphone className="size-4" aria-hidden="true" />
          </span>
          <div>
            <p className="text-navy text-sm font-semibold">
              {t('reminderAndroidTitle')}
            </p>
            <p className="text-muted-foreground mt-0.5 text-sm leading-5">
              {t('reminderAndroidBody')}
            </p>
          </div>
        </div>
      </Card>
    </section>
  );
}

function IntentionInlineForm({
  intention,
  onSave,
  t,
}: {
  intention: RecoveryIntention | null;
  onSave: (value: CreateIntentionInput) => void;
  t: ReturnType<typeof useTranslations>;
}) {
  const [title, setTitle] = useState(intention?.title ?? '');
  const [nextAction, setNextAction] = useState(intention?.nextAction ?? '');
  const [focusPeriod, setFocusPeriod] = useState<IntentionFocusPeriod>(
    intention?.focusPeriod ?? 'this_week',
  );

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title.trim() || !nextAction.trim()) return;

    onSave({
      title: title.trim(),
      nextAction: nextAction.trim(),
      focusPeriod,
    });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="recovery-intention"
            className="text-foreground text-sm font-semibold"
          >
            {t('intentionInputLabel')}
          </label>
          <Textarea
            id="recovery-intention"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder={t('intentionPlaceholder')}
            maxLength={240}
            rows={3}
            className="min-h-24 rounded-xl px-3 py-3 leading-6"
            required
          />
          <p
            className="text-muted-foreground text-right text-xs"
            aria-live="polite"
          >
            {title.length}/240
          </p>
        </div>
        <div className="space-y-2">
          <label
            htmlFor="recovery-next-action"
            className="text-foreground text-sm font-semibold"
          >
            {t('intentionNextActionLabel')}
          </label>
          <Textarea
            id="recovery-next-action"
            value={nextAction}
            onChange={(event) => setNextAction(event.target.value)}
            placeholder={t('intentionNextActionPlaceholder')}
            maxLength={160}
            rows={3}
            className="min-h-24 rounded-xl px-3 py-3 leading-6"
            required
          />
          <p
            className="text-muted-foreground text-right text-xs"
            aria-live="polite"
          >
            {nextAction.length}/160
          </p>
        </div>
      </div>
      <div className="border-border grid gap-x-4 gap-y-2 border-t pt-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <div className="space-y-2">
          <div className="space-y-2">
            <label
              htmlFor="recovery-focus-period"
              className="text-foreground text-sm font-semibold"
            >
              {t('intentionFocusPeriodLabel')}
            </label>
            <NativeSelect
              id="recovery-focus-period"
              value={focusPeriod}
              onChange={(event) =>
                setFocusPeriod(event.target.value as IntentionFocusPeriod)
              }
            >
              <option value="today">{t('focusToday')}</option>
              <option value="this_week">{t('focusThisWeek')}</option>
              <option value="two_weeks">{t('focusTwoWeeks')}</option>
              <option value="one_month">{t('focusOneMonth')}</option>
            </NativeSelect>
          </div>
        </div>
        <Button
          type="submit"
          size="lg"
          className="h-11 w-full sm:min-w-48 sm:w-auto"
          disabled={!title.trim() || !nextAction.trim()}
        >
          <Save className="size-4" aria-hidden="true" />
          {t('intentionSave')}
        </Button>
        <p className="text-muted-foreground text-xs leading-5 sm:col-start-1">
          {t('intentionFocusPeriodHelp')}
        </p>
      </div>
    </form>
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
    <div className="border-border bg-muted/25 border-t p-4 sm:p-5">
      <h3 className="text-navy flex items-center gap-2 text-sm font-bold">
        <History className="size-4" aria-hidden="true" />
        {t('historyTitle')}
      </h3>
      {intentions.length === 0 ? (
        <p className="text-muted-foreground mt-1 text-sm leading-5">
          {t('historyEmpty')}
        </p>
      ) : (
        <div className="divide-border mt-3 divide-y">
          {intentions.map((intention) => (
            <div
              key={intention.id}
              className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between"
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
