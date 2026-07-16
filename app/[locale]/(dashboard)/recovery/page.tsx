'use client';

import { useState } from 'react';
import {
  Archive,
  ArrowRight,
  BookOpen,
  Check,
  CircleAlert,
  CircleHelp,
  Clock3,
  HeartHandshake,
  LockKeyhole,
  NotebookPen,
  Pause,
  Play,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { IntentionEditor } from '@/components/dashboard/today/intention-editor';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useRecoveryJourney } from '@/hooks/use-recovery-journey';
import { useReflections } from '@/hooks/use-reflections';
import { toastError, toastSuccess } from '@/lib/feedback';
import { Link } from '@/i18n/routing';
import type { IntentionStatus, SkillId } from '@/lib/recovery/types';
import { ROUTES } from '@/routes';
import {
  DashboardNotice,
  DashboardPage,
  DashboardPageHeader,
} from '@/components/dashboard/dashboard-page';

const SKILLS: readonly {
  id: SkillId;
  title: string;
  summary: string;
  practice: string;
  minutes: number;
}[] = [
  {
    id: 'grounding_reset',
    title: 'skillPauseTitle',
    summary: 'skillPauseSummary',
    practice: 'skillPausePractice',
    minutes: 5,
  },
  {
    id: 'gentle_movement',
    title: 'skillMoveTitle',
    summary: 'skillMoveSummary',
    practice: 'skillMovePractice',
    minutes: 10,
  },
  {
    id: 'focus_sprint',
    title: 'skillFocusTitle',
    summary: 'skillFocusSummary',
    practice: 'skillFocusPractice',
    minutes: 15,
  },
  {
    id: 'budgeting_basics',
    title: 'skillBudgetTitle',
    summary: 'skillBudgetSummary',
    practice: 'skillBudgetPractice',
    minutes: 10,
  },
  {
    id: 'creative_reset',
    title: 'skillCreativeTitle',
    summary: 'skillCreativeSummary',
    practice: 'skillCreativePractice',
    minutes: 10,
  },
  {
    id: 'social_connection',
    title: 'skillReachTitle',
    summary: 'skillReachSummary',
    practice: 'skillReachPractice',
    minutes: 5,
  },
] as const;

const STATUS_KEY: Record<IntentionStatus, string> = {
  active: 'statusActive',
  paused: 'statusPaused',
  archived: 'statusArchived',
};

function SkillPractice({
  title,
  summary,
  practice,
  minutes,
}: {
  title: string;
  summary: string;
  practice: string;
  minutes: number;
}) {
  const t = useTranslations('recoveryDashboard');
  const hubT = useTranslations('recoveryHub');
  const [open, setOpen] = useState(false);

  return (
    <article className="flex h-full flex-col rounded-2xl border border-border bg-card p-5 shadow-soft transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-px hover:border-navy/35 hover:shadow-card motion-reduce:transform-none motion-reduce:transition-none">
      <div className="flex items-start justify-between gap-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-navy text-white shadow-sm">
          <Sparkles className="size-5" aria-hidden="true" />
        </span>
        <span className="bg-muted text-muted-foreground inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold">
          <Clock3 className="size-3.5" aria-hidden="true" />
          {t('minutes', { count: minutes })}
        </span>
      </div>
      <h3 className="text-navy mt-4 text-lg font-bold">{title}</h3>
      <p className="text-muted-foreground mt-2 flex-1 text-sm leading-6">
        {summary}
      </p>

      {open ? (
        <div
          className="mt-4 rounded-xl border border-border bg-muted/35 p-4 text-sm leading-7 text-foreground"
          role="region"
          aria-live="polite"
        >
          {practice}
        </div>
      ) : null}

      <Button
        type="button"
        variant={open ? 'outline' : 'primary'}
        className="mt-5 h-11 w-full"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        {open ? (
          <Check className="size-4" aria-hidden="true" />
        ) : (
          <Play className="size-4" aria-hidden="true" />
        )}
        {open ? t('skillClose') : hubT('learnMore')}
      </Button>
    </article>
  );
}

export default function RecoveryPage() {
  const t = useTranslations('recoveryHub');
  const recoveryT = useTranslations('recoveryDashboard');
  const locale = useLocale();
  const {
    state,
    persistence,
    activeIntention,
    createIntention,
    updateIntention,
    setIntentionStatus,
    clearRecoveryData,
  } = useRecoveryJourney();
  const [clearOpen, setClearOpen] = useState(false);
  const [cleared, setCleared] = useState(false);

  const otherIntentions = state.intentions
    .filter((intention) => intention.id !== activeIntention?.id)
    .slice(0, 6);
  const dateFormatter = new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
  });

  const saveIntention = (value: string) => {
    setCleared(false);
    if (activeIntention) {
      updateIntention(activeIntention.id, { title: value });
    } else {
      createIntention({ title: value });
    }
  };

  const clearLocalState = () => {
    clearRecoveryData();
    setCleared(true);
    setClearOpen(false);
  };

  const {
    reflections,
    loading: reflectionsLoading,
    error: reflectionsError,
    submitting,
    createReflection,
    refetch: refetchReflections,
  } = useReflections();
  const [journalText, setJournalText] = useState('');
  const [journalMood, setJournalMood] = useState(() =>
    t('journalMoodNeutral'),
  );

  const handleJournalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!journalText.trim()) return;
    try {
      await createReflection(journalText.trim(), journalMood);
      setJournalText('');
      toastSuccess(t('journalSaved'));
    } catch (err) {
      toastError(err, t('journalSaveError'));
    }
  };

  return (
    <DashboardPage>
      <DashboardPageHeader
        icon={HeartHandshake}
        eyebrow={t('eyebrow')}
        title={t('title')}
        description={t('description')}
        aside={
          <DashboardNotice
            icon={LockKeyhole}
            title={t('privateTitle')}
            className="shadow-soft"
          >
            {t('privateBody')}
          </DashboardNotice>
        }
      />

      {persistence === 'memory' ? (
        <div
          className="border-amber/30 bg-amber/[0.06] text-foreground rounded-2xl border p-4 text-sm leading-6"
          role="status"
        >
          {recoveryT('memoryOnlyWarning')}
        </div>
      ) : null}

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

          <IntentionEditor
            value={activeIntention?.title}
            onSave={saveIntention}
          />

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
                onClick={() =>
                  setIntentionStatus(activeIntention.id, 'archived')
                }
              >
                <Archive className="size-4" aria-hidden="true" />
                {t('archiveIntention')}
              </Button>
            </div>
          ) : null}

          <div className="border-t border-border bg-muted/35 p-5 sm:p-6">
            <h3 className="text-navy text-sm font-bold">{t('historyTitle')}</h3>
            {otherIntentions.length === 0 ? (
              <p className="text-muted-foreground mt-2 text-sm leading-6">
                {t('historyEmpty')}
              </p>
            ) : (
              <div className="divide-border border-border bg-card mt-3 divide-y rounded-2xl border">
                {otherIntentions.map((intention) => (
                  <div
                    key={intention.id}
                    className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="text-foreground text-sm leading-6 font-semibold">
                        {intention.title}
                      </p>
                      <p className="text-muted-foreground mt-1 text-xs">
                        {t(STATUS_KEY[intention.status])} ·{' '}
                        {t('updatedAt', {
                          date: dateFormatter.format(
                            new Date(intention.updatedAt)
                          ),
                        })}
                      </p>
                    </div>
                    {intention.status === 'paused' ? (
                      <Button
                        type="button"
                        variant="outline"
                        className="h-11 shrink-0"
                        onClick={() =>
                          setIntentionStatus(intention.id, 'active')
                        }
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
        </Card>
      </section>

      <section aria-labelledby="recovery-journal-title">
        <Card className="overflow-hidden rounded-2xl">
          <div className="flex flex-col gap-3 border-b border-border p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
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
              onSubmit={handleJournalSubmit}
              className="space-y-5 p-5 sm:p-6"
            >
              <div className="max-w-xs space-y-2">
                <label
                  htmlFor="journal-mood"
                  className="text-sm font-semibold text-foreground"
                >
                  {t('journalMoodLabel')}
                </label>
                <input
                  id="journal-mood"
                  type="text"
                  value={journalMood}
                  onChange={(e) => setJournalMood(e.target.value)}
                  placeholder={t('journalMoodPlaceholder')}
                  className="h-11 w-full rounded-xl border border-input bg-card px-3 text-base outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-muted-foreground focus-visible:border-navy/35 focus-visible:ring-2 focus-visible:ring-navy/35 motion-reduce:transition-none sm:text-sm"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="journal-reflection"
                  className="text-sm font-semibold text-foreground"
                >
                  {t('journalTextLabel')}
                </label>
                <textarea
                  id="journal-reflection"
                  value={journalText}
                  onChange={(e) => setJournalText(e.target.value)}
                  placeholder={t('journalInputPlaceholder')}
                  className="min-h-32 w-full rounded-2xl border border-input bg-card p-4 text-base leading-6 outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-muted-foreground focus-visible:border-navy/35 focus-visible:ring-2 focus-visible:ring-navy/35 motion-reduce:transition-none sm:text-sm"
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

            <aside className="border-t border-border bg-muted/35 p-5 sm:p-6 lg:border-t-0 lg:border-l">
              <h3 className="text-sm font-bold text-navy">
                {t('journalHistoryTitle')}
              </h3>

              {reflectionsLoading ? (
                <div className="mt-4 space-y-3" role="status">
                  <Skeleton className="h-20 w-full rounded-2xl" />
                  <Skeleton className="h-20 w-full rounded-2xl" />
                  <span className="sr-only">{t('journalLoading')}</span>
                </div>
              ) : reflectionsError ? (
                <div
                  className="mt-4 rounded-2xl border border-amber/40 bg-amber/[0.10] p-4"
                  role="alert"
                >
                  <div className="flex items-start gap-2.5">
                    <CircleAlert
                      className="mt-0.5 size-5 shrink-0 text-amber"
                      aria-hidden="true"
                    />
                    <p className="text-sm leading-6 text-foreground">
                      {t('journalError')}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-3 h-11"
                    onClick={() => void refetchReflections()}
                  >
                    <RefreshCw className="size-4" aria-hidden="true" />
                    {t('journalRetry')}
                  </Button>
                </div>
              ) : reflections.length === 0 ? (
                <div className="mt-4 flex min-h-40 flex-col items-center justify-center rounded-2xl border border-dashed border-navy/25 bg-card/75 p-5 text-center">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-navy text-white shadow-sm">
                    <NotebookPen className="size-5" aria-hidden="true" />
                  </span>
                  <p className="mt-3 text-sm font-bold text-navy">
                    {t('journalEmpty')}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    {t('journalEmptyHint')}
                  </p>
                </div>
            ) : (
              <div className="mt-3 divide-y divide-border">
                {reflections.map((ref) => (
                  <div
                    key={ref.id}
                    className="py-4 first:pt-2 last:pb-0"
                  >
                    <p className="text-xs font-bold text-sage">
                      {ref.mood}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-navy">
                      {ref.text}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {dateFormatter.format(new Date(ref.created_at))}
                    </p>
                  </div>
                ))}
              </div>
            )}
            </aside>
          </div>
        </Card>
      </section>

      <section aria-labelledby="recovery-skills-title">
        <div>
          <h2
            id="recovery-skills-title"
            className="text-navy text-2xl font-bold tracking-tight"
          >
            {t('skillsTitle')}
          </h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            {t('skillsDescription')}
          </p>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {SKILLS.map((skill) => (
            <SkillPractice
              key={skill.id}
              title={recoveryT(skill.title)}
              summary={recoveryT(skill.summary)}
              practice={recoveryT(skill.practice)}
              minutes={skill.minutes}
            />
          ))}
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <section
          className="rounded-2xl border border-border bg-card p-5 shadow-soft"
          aria-labelledby="recovery-education-title"
        >
          <span className="flex size-10 items-center justify-center rounded-xl bg-navy text-white shadow-sm">
            <BookOpen className="size-[1.125rem]" aria-hidden="true" />
          </span>
          <h2
            id="recovery-education-title"
            className="mt-4 text-base leading-6 font-bold text-navy"
          >
            {t('educationTitle')}
          </h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            {t('educationBody')}
          </p>
          <Link
            href={ROUTES.EDUCATION}
            className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-bold text-navy outline-none transition-colors hover:text-sage focus-visible:ring-2 focus-visible:ring-navy/30"
          >
            {t('educationAction')}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </section>

        <section
          className="rounded-2xl border border-border bg-card p-5 shadow-soft"
          aria-labelledby="recovery-support-title"
        >
          <span className="flex size-10 items-center justify-center rounded-xl bg-navy text-white shadow-sm">
            <CircleHelp className="size-[1.125rem]" aria-hidden="true" />
          </span>
          <h2
            id="recovery-support-title"
            className="mt-4 text-base leading-6 font-bold text-navy"
          >
            {t('supportTitle')}
          </h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            {t('supportBody')}
          </p>
          <Link
            href={ROUTES.SUPPORT}
            className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-bold text-navy outline-none transition-colors hover:text-sage focus-visible:ring-2 focus-visible:ring-navy/30"
          >
            {t('supportAction')}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </section>
      </div>

      <section
        className="rounded-3xl border border-border bg-card p-5 shadow-soft sm:p-6"
        aria-labelledby="clear-local-title"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-2xl">
            <h2
              id="clear-local-title"
              className="text-navy text-base font-bold"
            >
              {t('deleteLocalTitle')}
            </h2>
            <p className="text-muted-foreground mt-2 text-sm leading-6">
              {t('deleteLocalBody')}
            </p>
          </div>
          <Dialog open={clearOpen} onOpenChange={setClearOpen}>
            <DialogTrigger
              render={
                <Button
                  variant="outline"
                  className="border-crimson/25 text-crimson hover:bg-crimson/5 h-11 shrink-0"
                />
              }
            >
              <Trash2 className="size-4" aria-hidden="true" />
              {t('deleteLocalAction')}
            </DialogTrigger>
            <DialogContent
              className="max-w-md rounded-2xl p-5"
              showCloseButton={false}
            >
              <DialogHeader>
                <DialogTitle className="text-navy text-lg font-bold">
                  {t('deleteLocalTitle')}
                </DialogTitle>
                <DialogDescription className="leading-6">
                  {t('deleteLocalBody')}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="-mx-5 mt-2 -mb-5 px-5">
                <DialogClose render={<Button variant="outline" size="lg" />}>
                  {recoveryT('intentionCancel')}
                </DialogClose>
                <Button
                  variant="destructive"
                  size="lg"
                  onClick={clearLocalState}
                >
                  {t('deleteLocalConfirm')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <p
          className="text-sage mt-3 min-h-5 text-sm font-semibold"
          aria-live="polite"
        >
          {cleared ? recoveryT('localDataCleared') : null}
        </p>
      </section>

      <footer className="text-muted-foreground flex items-start gap-2 text-xs leading-5">
        <ShieldCheck
          className="text-sage mt-0.5 size-4 shrink-0"
          aria-hidden="true"
        />
        {t('privateBody')}
      </footer>
    </DashboardPage>
  );
}
