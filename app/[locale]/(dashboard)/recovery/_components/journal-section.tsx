import { type FormEvent, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useReflections } from '@/hooks/use-reflections';
import { toastError, toastSuccess } from '@/lib/feedback';
import { ReflectionHistory } from './reflection-history';

export function JournalSection() {
  const t = useTranslations('recoveryHub');
  const [journalText, setJournalText] = useState('');
  const [journalMood, setJournalMood] = useState(() => t('journalMoodNeutral'));
  const { reflections, loading, error, submitting, createReflection, refetch } =
    useReflections();

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!journalText.trim()) return;
    try {
      await createReflection(journalText.trim(), journalMood);
      setJournalText('');
      toastSuccess(t('journalSaved'));
    } catch (requestError) {
      toastError(requestError, t('journalSaveError'));
    }
  };

  return (
    <section aria-labelledby="recovery-journal-title">
      <Card className="overflow-hidden rounded-2xl">
        <div className="border-border flex flex-col gap-3 border-b p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
          <div>
            <h2
              id="recovery-journal-title"
              className="text-navy text-xl font-bold"
            >
              {t('journalTitle')}
            </h2>
            <p className="text-muted-foreground mt-1 max-w-2xl text-sm leading-6">
              {t('journalDescription')}
            </p>
          </div>
        </div>
        <div className="grid lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)]">
          <form
            onSubmit={(event) => void submit(event)}
            className="space-y-5 p-5 sm:p-6"
          >
            <div className="max-w-xs space-y-2">
              <label
                htmlFor="journal-mood"
                className="text-foreground text-sm font-semibold"
              >
                {t('journalMoodLabel')}
              </label>
              <input
                id="journal-mood"
                type="text"
                value={journalMood}
                onChange={(event) => setJournalMood(event.target.value)}
                placeholder={t('journalMoodPlaceholder')}
                className="border-input bg-card placeholder:text-muted-foreground focus-visible:border-navy/35 focus-visible:ring-navy/35 h-11 w-full rounded-xl border px-3 text-base transition-[border-color,box-shadow] duration-200 outline-none focus-visible:ring-2 motion-reduce:transition-none sm:text-sm"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="journal-reflection"
                className="text-foreground text-sm font-semibold"
              >
                {t('journalTextLabel')}
              </label>
              <textarea
                id="journal-reflection"
                value={journalText}
                onChange={(event) => setJournalText(event.target.value)}
                placeholder={t('journalInputPlaceholder')}
                className="border-input bg-card placeholder:text-muted-foreground focus-visible:border-navy/35 focus-visible:ring-navy/35 min-h-32 w-full rounded-2xl border p-4 text-base leading-6 transition-[border-color,box-shadow] duration-200 outline-none focus-visible:ring-2 motion-reduce:transition-none sm:text-sm"
              />
            </div>
            <Button
              type="submit"
              size="lg"
              className="h-11 w-full sm:w-auto"
              disabled={submitting || !journalText.trim()}
            >
              {submitting ? t('journalSubmitting') : t('journalSubmit')}
            </Button>
          </form>
          <ReflectionHistory
            reflections={reflections}
            loading={loading}
            error={error}
            onRetry={() => void refetch()}
          />
        </div>
      </Card>
    </section>
  );
}
