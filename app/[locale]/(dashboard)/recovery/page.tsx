'use client';

import { useState } from 'react';
import {
  Archive,
  ArrowRight,
  BookOpen,
  Check,
  CircleHelp,
  Clock3,
  LockKeyhole,
  Pause,
  Play,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { IntentionEditor } from '@/components/dashboard/today/intention-editor';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
import { toastError } from '@/lib/feedback';
import { Link } from '@/i18n/routing';
import type { IntentionStatus, SkillId } from '@/lib/recovery/types';
import { ROUTES } from '@/routes';

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
    <article className="flex h-full flex-col rounded-[1.5rem] border border-border bg-card p-5 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <span className="flex size-11 items-center justify-center rounded-xl bg-azure text-navy">
          <Sparkles className="size-5" aria-hidden="true" />
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
          <Clock3 className="size-3.5" aria-hidden="true" />
          {t('minutes', { count: minutes })}
        </span>
      </div>
      <h3 className="mt-4 text-lg font-bold text-navy">{title}</h3>
      <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">{summary}</p>

      {open ? (
        <div className="mt-4 rounded-2xl border border-navy/15 bg-navy/[0.035] p-4 text-sm leading-7 text-foreground" role="region" aria-live="polite">
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
        {open ? <Check className="size-4" aria-hidden="true" /> : <Play className="size-4" aria-hidden="true" />}
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
  const dateFormatter = new Intl.DateTimeFormat(locale, { dateStyle: 'medium' });

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

  const { reflections, submitting, createReflection } = useReflections();
  const [journalText, setJournalText] = useState('');
  const [journalMood, setJournalMood] = useState('Neutral');

  const handleJournalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!journalText.trim()) return;
    try {
      await createReflection(journalText.trim(), journalMood);
      setJournalText('');
    } catch (err) {
      toastError(err, 'Failed to save reflection');
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-7 pb-8">
      <header className="grid gap-5 border-b border-border pb-7 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
        <div>
          <p className="text-xs font-bold tracking-[0.12em] text-sage uppercase">{t('eyebrow')}</p>
          <h1 className="mt-2 max-w-3xl text-3xl leading-tight font-extrabold tracking-tight text-navy sm:text-4xl">
            {t('title')}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
            {t('description')}
          </p>
        </div>
        <div className="flex items-start gap-3 rounded-2xl border border-sage/20 bg-sage/[0.06] p-4">
          <LockKeyhole className="mt-0.5 size-5 shrink-0 text-sage" aria-hidden="true" />
          <div>
            <p className="text-sm font-bold text-navy">{t('privateTitle')}</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">{t('privateBody')}</p>
          </div>
        </div>
      </header>

      {persistence === 'memory' ? (
        <div className="rounded-2xl border border-amber/30 bg-amber/[0.06] p-4 text-sm leading-6 text-foreground" role="status">
          {recoveryT('memoryOnlyWarning')}
        </div>
      ) : null}

      <section aria-labelledby="recovery-intention-title">
        <Card className="overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-border p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
            <div>
              <h2 id="recovery-intention-title" className="text-xl font-bold text-navy">
                {t('intentionTitle')}
              </h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                {t('intentionDescription')}
              </p>
            </div>
            {activeIntention ? (
              <span className="inline-flex min-h-8 items-center self-start rounded-full bg-sage/10 px-3 text-xs font-semibold text-sage">
                {t('statusActive')}
              </span>
            ) : null}
          </div>

          <IntentionEditor value={activeIntention?.title} onSave={saveIntention} />

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

          <div className="border-t border-border bg-muted/20 p-5 sm:p-6">
            <h3 className="text-sm font-bold text-navy">{t('historyTitle')}</h3>
            {otherIntentions.length === 0 ? (
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{t('historyEmpty')}</p>
            ) : (
              <div className="mt-3 divide-y divide-border rounded-2xl border border-border bg-card">
                {otherIntentions.map((intention) => (
                  <div key={intention.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-sm leading-6 font-semibold text-foreground">{intention.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {t(STATUS_KEY[intention.status])} · {t('updatedAt', { date: dateFormatter.format(new Date(intention.updatedAt)) })}
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
        </Card>
      </section>

      <section aria-labelledby="recovery-journal-title">
        <Card className="overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-border p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
            <div>
              <h2 id="recovery-journal-title" className="text-xl font-bold text-navy">
                {t('journalTitle')}
              </h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                {t('journalDescription')}
              </p>
            </div>
          </div>
          <div className="p-5 sm:p-6">
            <form onSubmit={handleJournalSubmit} className="space-y-4">
              <div className="flex gap-4">
                <input 
                  type="text" 
                  value={journalMood}
                  onChange={(e) => setJournalMood(e.target.value)}
                  placeholder={t('journalMoodPlaceholder')}
                  className="h-11 rounded-xl border border-input px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-navy/30"
                />
              </div>
              <textarea
                value={journalText}
                onChange={(e) => setJournalText(e.target.value)}
                placeholder={t('journalInputPlaceholder')}
                className="min-h-24 w-full rounded-xl border border-input p-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-navy/30"
              />
              <Button type="submit" disabled={submitting || !journalText.trim()}>
                {submitting ? t('journalSubmitting') : t('journalSubmit')}
              </Button>
            </form>
          </div>
          <div className="border-t border-border bg-muted/20 p-5 sm:p-6">
            {reflections.length === 0 ? (
              <p className="text-sm leading-6 text-muted-foreground">{t('journalEmpty')}</p>
            ) : (
              <div className="space-y-4">
                {reflections.map((ref) => (
                  <div key={ref.id} className="rounded-xl border border-border bg-card p-4">
                    <p className="text-xs font-semibold text-sage">{ref.mood}</p>
                    <p className="mt-2 text-sm text-navy">{ref.text}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {dateFormatter.format(new Date(ref.created_at))}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </section>

      <section aria-labelledby="recovery-skills-title">
        <div>
          <h2 id="recovery-skills-title" className="text-2xl font-bold tracking-tight text-navy">
            {t('skillsTitle')}
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{t('skillsDescription')}</p>
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
        <section className="rounded-[1.5rem] border border-navy/15 bg-azure/45 p-5" aria-labelledby="recovery-education-title">
          <BookOpen className="size-6 text-navy" aria-hidden="true" />
          <h2 id="recovery-education-title" className="mt-4 text-lg font-bold text-navy">{t('educationTitle')}</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{t('educationBody')}</p>
          <Link
            href={ROUTES.EDUCATION}
            className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl text-sm font-semibold text-navy outline-none hover:underline focus-visible:ring-2 focus-visible:ring-navy/30"
          >
            {t('educationAction')}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </section>

        <section className="rounded-[1.5rem] border border-sage/20 bg-sage/[0.055] p-5" aria-labelledby="recovery-support-title">
          <CircleHelp className="size-6 text-sage" aria-hidden="true" />
          <h2 id="recovery-support-title" className="mt-4 text-lg font-bold text-navy">{t('supportTitle')}</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{t('supportBody')}</p>
          <Link
            href={ROUTES.SUPPORT}
            className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl text-sm font-semibold text-navy outline-none hover:underline focus-visible:ring-2 focus-visible:ring-navy/30"
          >
            {t('supportAction')}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </section>
      </div>

      <section className="rounded-[1.5rem] border border-border bg-card p-5 sm:p-6" aria-labelledby="clear-local-title">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-2xl">
            <h2 id="clear-local-title" className="text-base font-bold text-navy">{t('deleteLocalTitle')}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{t('deleteLocalBody')}</p>
          </div>
          <Dialog open={clearOpen} onOpenChange={setClearOpen}>
            <DialogTrigger
              render={
                <Button variant="outline" className="h-11 shrink-0 border-crimson/25 text-crimson hover:bg-crimson/5" />
              }
            >
              <Trash2 className="size-4" aria-hidden="true" />
              {t('deleteLocalAction')}
            </DialogTrigger>
            <DialogContent className="max-w-md rounded-2xl p-5" showCloseButton={false}>
              <DialogHeader>
                <DialogTitle className="text-lg font-bold text-navy">{t('deleteLocalTitle')}</DialogTitle>
                <DialogDescription className="leading-6">{t('deleteLocalBody')}</DialogDescription>
              </DialogHeader>
              <DialogFooter className="-mx-5 -mb-5 mt-2 px-5">
                <DialogClose render={<Button variant="outline" size="lg" />}>
                  {recoveryT('intentionCancel')}
                </DialogClose>
                <Button variant="destructive" size="lg" onClick={clearLocalState}>
                  {t('deleteLocalConfirm')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <p className="mt-3 min-h-5 text-sm font-semibold text-sage" aria-live="polite">
          {cleared ? recoveryT('localDataCleared') : null}
        </p>
      </section>

      <footer className="flex items-start gap-2 text-xs leading-5 text-muted-foreground">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-sage" aria-hidden="true" />
        {t('privateBody')}
      </footer>
    </div>
  );
}
