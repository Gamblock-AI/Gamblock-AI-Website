'use client';

import { type FormEvent, useMemo, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Check,
  CircleHelp,
  Download,
  EyeOff,
  FileSpreadsheet,
  Footprints,
  LampDesk,
  Leaf,
  LockKeyhole,
  MessageCircleHeart,
  NotebookPen,
  ShieldCheck,
  Sprout,
  Target,
  UsersRound,
  Waves,
  X,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import {
  DashboardNotice,
  DashboardPage,
  DashboardPageHeader,
  DashboardStatus,
} from '@/components/dashboard/dashboard-page';
import { Button } from '@/components/ui/button';
import { useAccountability } from '@/hooks/use-accountability';
import { useEducationModules } from '@/hooks/use-education';
import { useLocalUser } from '@/hooks/use-local-user';
import {
  useProgressSnapshot,
  type ProgressSnapshot,
} from '@/hooks/use-progress-snapshot';
import {
  useRecoveryExperience,
  type WeeklyReview,
} from '@/hooks/use-recovery-experience';
import { useReflections } from '@/hooks/use-reflections';
import { Link } from '@/i18n/routing';
import { toastError, toastSuccess } from '@/lib/feedback';
import { ROUTES } from '@/routes';

type RangeDays = 7 | 30 | 90;
type ActivityDay = ProgressSnapshot['activity_days'][number];

const CATEGORY_ICONS = {
  check_ins: ShieldCheck,
  practices: Waves,
  journals: NotebookPen,
  missions: Target,
  education: BookOpen,
  reviews: CalendarDays,
} as const;

const KEEPSAKES = [Sprout, LampDesk, NotebookPen, BookOpen, Leaf] as const;

export function ProgressClient() {
  const user = useLocalUser();
  return user.role === 'partner' ? <PartnerProgress /> : <StudentProgress />;
}

function StudentProgress() {
  const p = useTranslations('progressExperience');
  const [range, setRange] = useState<RangeDays>(30);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [confirmExport, setConfirmExport] = useState<'csv' | 'pdf' | null>(
    null
  );
  const snapshot = useProgressSnapshot(range);

  const days = useMemo(() => buildCalendarDays(range), [range]);
  const activityMap = useMemo(
    () =>
      new Map(
        (snapshot.data?.activity_days ?? []).map((item) => [item.date, item])
      ),
    [snapshot.data?.activity_days]
  );
  const selected = selectedDate ? activityMap.get(selectedDate) : undefined;

  const exportData = () => {
    const payload = JSON.stringify(
      {
        exported_at: new Date().toISOString(),
        range_days: range,
        progress: snapshot.data,
      },
      null,
      2
    );
    if (confirmExport === 'csv') {
      downloadText(
        `gamblock-progress-${range}d.csv`,
        progressCsv(snapshot.data),
        'text/csv;charset=utf-8'
      );
    } else if (confirmExport === 'pdf') {
      const popup = window.open('', '_blank', 'noopener,noreferrer');
      if (popup) {
        popup.document.write(
          `<!doctype html><html><head><title>Gamblock-AI</title><style>body{font:14px system-ui;margin:40px;color:#17264d}pre{white-space:pre-wrap}</style></head><body><h1>${escapeHtml(p('title'))}</h1><pre>${escapeHtml(payload)}</pre><script>window.print()<\/script></body></html>`
        );
        popup.document.close();
      }
    }
    setConfirmExport(null);
    toastSuccess(p('exportReady'));
  };

  return (
    <DashboardPage>
      <DashboardPageHeader
        icon={Footprints}
        eyebrow={p('eyebrow')}
        title={p('title')}
        description={p('description')}
        aside={<DashboardStatus tone="navy">{p('private')}</DashboardStatus>}
      />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div
          className="border-border bg-card inline-flex w-fit rounded-2xl border p-1 shadow-sm"
          aria-label={p('rangeLabel')}
        >
          {([7, 30, 90] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setRange(value);
                setSelectedDate(null);
              }}
              className={`focus-visible:ring-navy/30 min-h-11 cursor-pointer rounded-xl px-5 text-sm font-bold outline-none focus-visible:ring-2 ${range === value ? 'bg-navy text-white shadow-sm' : 'text-muted-foreground hover:text-navy'}`}
              aria-pressed={range === value}
            >
              {p('days', { count: value })}
            </button>
          ))}
        </div>
        <Button onClick={() => setReviewOpen(true)}>
          <CalendarDays className="size-4" aria-hidden="true" />
          {p('startReview')}
        </Button>
      </div>

      {snapshot.loading ? (
        <p className="text-muted-foreground py-16 text-center text-sm">
          {p('loading')}
        </p>
      ) : null}
      {snapshot.error ? (
        <DashboardNotice
          icon={CircleHelp}
          title={p('unavailable')}
          tone="amber"
        />
      ) : null}

      {snapshot.data ? (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(19rem,0.5fr)]">
          <section
            className="border-border bg-card overflow-hidden rounded-[2rem] border shadow-sm"
            aria-labelledby="calendar-title"
          >
            <div className="border-border flex flex-col gap-3 border-b p-5 sm:flex-row sm:items-end sm:justify-between sm:p-6">
              <div>
                <h2 id="calendar-title" className="text-navy text-xl font-bold">
                  {p('calendarTitle')}
                </h2>
                <p className="text-muted-foreground mt-1 text-sm leading-6">
                  {p('calendarBody')}
                </p>
              </div>
              <ActivityLegend />
            </div>
            <div className="border-border/70 grid grid-cols-7 border-l">
              {days.map((date, index) => {
                const key = isoDate(date);
                const activity = activityMap.get(key);
                const total = activityTotal(activity);
                const Keepsake =
                  KEEPSAKES[(date.getDate() + total) % KEEPSAKES.length];
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedDate(key)}
                    className={`focus-visible:ring-cyan border-border/70 relative min-h-24 cursor-pointer border-r border-b p-2 text-left outline-none focus-visible:z-10 focus-visible:ring-2 sm:min-h-28 sm:p-3 ${selectedDate === key ? 'bg-cyan/10 shadow-[inset_0_0_0_2px_#17264d]' : 'hover:bg-muted/35'}`}
                    aria-label={p('dayLabel', {
                      date: date.toLocaleDateString(),
                      count: total,
                    })}
                  >
                    <span className="text-muted-foreground text-xs font-semibold">
                      {date.getDate()}
                    </span>
                    {total > 0 ? (
                      <>
                        <Keepsake
                          className="text-sage mx-auto mt-2 size-7 sm:size-9"
                          strokeWidth={1.6}
                          aria-hidden="true"
                        />
                        <span
                          className="mt-2 flex justify-center gap-1"
                          aria-hidden="true"
                        >
                          {activityCategories(activity)
                            .slice(0, 5)
                            .map((item) => (
                              <span
                                key={item}
                                className={`size-1.5 rounded-full ${categoryTone(item)}`}
                              />
                            ))}
                        </span>
                      </>
                    ) : null}
                    {index === days.length - 1 ? (
                      <span className="sr-only">{p('today')}</span>
                    ) : null}
                  </button>
                );
              })}
            </div>
            {snapshot.data.check_in_count < 3 ? (
              <div className="bg-sage/[0.07] flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <div className="flex items-start gap-3">
                  <Sprout
                    className="text-sage mt-0.5 size-6 shrink-0"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-navy font-bold">
                      {p('insufficientTitle')}
                    </p>
                    <p className="text-muted-foreground mt-1 text-sm leading-6">
                      {p('insufficientBody', {
                        count: snapshot.data.check_in_count,
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2" aria-label={p('checkInProgress')}>
                  {[1, 2, 3].map((value) => (
                    <span
                      key={value}
                      className={`flex size-10 items-center justify-center rounded-full border text-sm font-bold ${snapshot.data!.check_in_count >= value ? 'border-sage bg-sage text-white' : 'border-border bg-card text-muted-foreground'}`}
                    >
                      {value}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </section>

          <aside className="space-y-5">
            <section className="border-border rounded-[2rem] border bg-[linear-gradient(150deg,rgba(37,196,232,0.12),rgba(114,184,154,0.08))] p-5 sm:p-6">
              <p className="text-cyan-dark text-xs font-bold tracking-[0.14em] uppercase">
                {p('collectionEyebrow')}
              </p>
              <h2 className="text-navy mt-2 text-xl font-bold">
                {p('collectionTitle')}
              </h2>
              <p className="text-muted-foreground mt-2 text-sm leading-6">
                {p('collectionBody')}
              </p>
              <div className="mt-6 grid grid-cols-3 gap-3">
                {KEEPSAKES.map((Icon, index) => (
                  <div
                    key={index}
                    className={`flex aspect-square items-center justify-center rounded-2xl border ${index < Math.min(snapshot.data!.active_days, KEEPSAKES.length) ? 'border-sage/30 bg-card text-sage shadow-sm' : 'border-border text-muted-foreground/25 border-dashed'}`}
                  >
                    <Icon
                      className="size-7"
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                  </div>
                ))}
              </div>
              <p className="text-navy mt-5 text-sm font-semibold">
                {p('activeDays', { count: snapshot.data.active_days })}
              </p>
            </section>

            <section className="border-border bg-card rounded-[2rem] border p-5 sm:p-6">
              <CalendarDays
                className="text-cyan-dark size-7"
                aria-hidden="true"
              />
              <h2 className="text-navy mt-4 text-xl font-bold">
                {p('reviewTitle')}
              </h2>
              <p className="text-muted-foreground mt-2 text-sm leading-6">
                {p('reviewBody')}
              </p>
              <div className="text-muted-foreground mt-5 flex items-center gap-2 text-xs">
                <span>{p('reviewStepReflect')}</span>
                <ArrowRight className="size-3" aria-hidden="true" />
                <span>{p('reviewStepLearn')}</span>
                <ArrowRight className="size-3" aria-hidden="true" />
                <span>{p('reviewStepPlan')}</span>
              </div>
              <Button
                className="mt-5 w-full"
                onClick={() => setReviewOpen(true)}
              >
                {p('startReview')}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Button>
            </section>
          </aside>
        </div>
      ) : null}

      {selectedDate ? (
        <DayDetail
          date={selectedDate}
          activity={selected}
          onClose={() => setSelectedDate(null)}
        />
      ) : null}
      {reviewOpen ? (
        <WeeklyReviewSheet onClose={() => setReviewOpen(false)} />
      ) : null}

      <section className="border-border flex flex-col gap-4 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-navy text-sm font-bold">{p('exportTitle')}</p>
          <p className="text-muted-foreground mt-1 text-xs leading-5">
            {p('exportBody')}
          </p>
        </div>
        {confirmExport ? (
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setConfirmExport(null)}>
              {p('cancel')}
            </Button>
            <Button onClick={exportData}>{p('confirmExport')}</Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setConfirmExport('csv')}>
              <FileSpreadsheet className="size-4" aria-hidden="true" />
              CSV
            </Button>
            <Button variant="outline" onClick={() => setConfirmExport('pdf')}>
              <Download className="size-4" aria-hidden="true" />
              PDF
            </Button>
          </div>
        )}
      </section>
    </DashboardPage>
  );
}

function ActivityLegend() {
  const p = useTranslations('progressExperience');
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-2">
      {(Object.keys(CATEGORY_ICONS) as Array<keyof typeof CATEGORY_ICONS>).map(
        (key) => {
          const Icon = CATEGORY_ICONS[key];
          return (
            <span
              key={key}
              className="text-muted-foreground flex items-center gap-1.5 text-[11px]"
            >
              <Icon className="size-3.5" aria-hidden="true" />
              {p(`categories.${key}`)}
            </span>
          );
        }
      )}
    </div>
  );
}

function DayDetail({
  date,
  activity,
  onClose,
}: {
  date: string;
  activity?: ActivityDay;
  onClose: () => void;
}) {
  const p = useTranslations('progressExperience');
  return (
    <section
      className="border-cyan/30 bg-card rounded-2xl border p-5 shadow-sm"
      aria-live="polite"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-cyan-dark text-xs font-bold tracking-[0.14em] uppercase">
            {p('dayDetail')}
          </p>
          <h2 className="text-navy mt-1 text-lg font-bold">
            {new Date(`${date}T12:00:00`).toLocaleDateString(undefined, {
              dateStyle: 'full',
            })}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="border-border flex size-11 items-center justify-center rounded-full border"
          aria-label={p('close')}
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>
      {activity ? (
        <div className="mt-4 grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {(
            Object.keys(CATEGORY_ICONS) as Array<keyof typeof CATEGORY_ICONS>
          ).map((key) => {
            const Icon = CATEGORY_ICONS[key];
            return (
              <div key={key} className="bg-muted/40 rounded-xl p-3">
                <Icon className="text-sage size-4" aria-hidden="true" />
                <p className="text-navy mt-2 text-sm font-bold">
                  {activity[key]}
                </p>
                <p className="text-muted-foreground text-xs">
                  {p(`categories.${key}`)}
                </p>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-muted-foreground mt-4 text-sm">{p('quietDay')}</p>
      )}
    </section>
  );
}

function WeeklyReviewSheet({ onClose }: { onClose: () => void }) {
  const p = useTranslations('progressExperience');
  const experience = useRecoveryExperience();
  const reflections = useReflections();
  const current = experience.weeklyReview.data;
  const [step, setStep] = useState(0);
  const [helped, setHelped] = useState<string[]>(current?.what_helped ?? []);
  const [hard, setHard] = useState<string[]>(current?.what_was_hard ?? []);
  const [adjustment, setAdjustment] = useState(current?.adjustment ?? '');
  const [mission, setMission] = useState(current?.next_mission ?? '');
  const [skill, setSkill] = useState(current?.recommended_skill ?? '');
  const [journalFocus, setJournalFocus] = useState(false);

  const options = ['pause', 'grounding', 'contact', 'learning'];
  const difficulties = ['time', 'alone', 'strongUrge', 'unsure'];
  const toggle = (
    value: string,
    values: string[],
    setValues: (items: string[]) => void
  ) =>
    setValues(
      values.includes(value)
        ? values.filter((item) => item !== value)
        : [...values, value]
    );

  const save = async (event: FormEvent) => {
    event.preventDefault();
    const review: WeeklyReview = {
      id: current?.id,
      week_start: current?.week_start ?? '',
      what_helped: helped,
      what_was_hard: hard,
      adjustment,
      next_mission: mission,
      recommended_skill: skill,
    };
    try {
      await experience.saveWeeklyReview(review);
      if (journalFocus && adjustment.trim()) {
        await reflections.createReflection({
          text: p('reviewJournalText'),
          next_step: adjustment.trim(),
          is_focus: true,
        });
      }
      toastSuccess(p('reviewSaved'));
      onClose();
    } catch (error) {
      toastError(error, p('reviewError'));
    }
  };

  return (
    <div className="bg-navy/55 fixed inset-0 z-[80] flex items-end justify-center backdrop-blur-sm sm:items-center sm:p-6">
      <form
        onSubmit={(event) => void save(event)}
        className="bg-card max-h-[92dvh] w-full max-w-2xl overflow-y-auto rounded-t-[2rem] p-5 shadow-2xl sm:rounded-[2rem] sm:p-7"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-cyan-dark text-xs font-bold tracking-[0.14em] uppercase">
              {p('reviewEyebrow')}
            </p>
            <h2 className="text-navy mt-2 text-2xl font-bold">
              {p('reviewTitle')}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="border-border flex size-11 items-center justify-center rounded-full border"
            aria-label={p('close')}
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>
        <div className="mt-5 flex gap-2" aria-label={p('reviewProgress')}>
          {[0, 1, 2].map((value) => (
            <span
              key={value}
              className={`h-2 flex-1 rounded-full ${value <= step ? 'bg-cyan' : 'bg-border'}`}
            />
          ))}
        </div>

        {step === 0 ? (
          <div className="mt-6">
            <h3 className="text-navy text-lg font-bold">{p('whatHelped')}</h3>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {options.map((item) => (
                <Choice
                  key={item}
                  selected={helped.includes(item)}
                  onClick={() => toggle(item, helped, setHelped)}
                >
                  {p(`reviewOptions.${item}`)}
                </Choice>
              ))}
            </div>
            <h3 className="text-navy mt-6 text-lg font-bold">
              {p('whatHard')}
            </h3>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {difficulties.map((item) => (
                <Choice
                  key={item}
                  selected={hard.includes(item)}
                  onClick={() => toggle(item, hard, setHard)}
                >
                  {p(`difficultyOptions.${item}`)}
                </Choice>
              ))}
            </div>
          </div>
        ) : null}
        {step === 1 ? (
          <div className="mt-6 space-y-5">
            <div>
              <label
                htmlFor="adjustment"
                className="text-navy text-sm font-bold"
              >
                {p('adjustment')}
              </label>
              <textarea
                id="adjustment"
                value={adjustment}
                onChange={(event) => setAdjustment(event.target.value)}
                className="border-input mt-2 min-h-28 w-full rounded-2xl border p-4 text-base"
                placeholder={p('adjustmentPlaceholder')}
              />
            </div>
            <div>
              <label htmlFor="mission" className="text-navy text-sm font-bold">
                {p('nextMission')}
              </label>
              <input
                id="mission"
                value={mission}
                onChange={(event) => setMission(event.target.value)}
                className="border-input mt-2 h-12 w-full rounded-xl border px-4 text-base"
                placeholder={p('nextMissionPlaceholder')}
              />
            </div>
          </div>
        ) : null}
        {step === 2 ? (
          <div className="mt-6 space-y-5">
            <div>
              <label htmlFor="skill" className="text-navy text-sm font-bold">
                {p('skill')}
              </label>
              <input
                id="skill"
                value={skill}
                onChange={(event) => setSkill(event.target.value)}
                className="border-input mt-2 h-12 w-full rounded-xl border px-4 text-base"
                placeholder={p('skillPlaceholder')}
              />
            </div>
            <label className="bg-sage/8 border-sage/25 text-navy flex min-h-16 cursor-pointer items-center gap-3 rounded-2xl border p-4 text-sm">
              <input
                type="checkbox"
                checked={journalFocus}
                onChange={(event) => setJournalFocus(event.target.checked)}
                className="accent-navy size-4"
              />
              {p('saveAsFocus')}
            </label>
          </div>
        ) : null}

        <div className="mt-7 flex justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={step === 0}
            onClick={() => setStep((value) => value - 1)}
          >
            {p('back')}
          </Button>
          {step < 2 ? (
            <Button type="button" onClick={() => setStep((value) => value + 1)}>
              {p('continue')}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
          ) : (
            <Button type="submit" disabled={experience.saving}>
              {experience.saving ? p('saving') : p('saveReview')}
              <Check className="size-4" aria-hidden="true" />
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

function Choice({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`focus-visible:ring-navy/30 min-h-12 rounded-xl border px-4 text-left text-sm font-semibold outline-none focus-visible:ring-2 ${selected ? 'border-cyan bg-cyan/10 text-navy' : 'border-border text-muted-foreground'}`}
      aria-pressed={selected}
    >
      {children}
    </button>
  );
}

function PartnerProgress() {
  const p = useTranslations('progressExperience');
  const locale = useLocale();
  const accountability = useAccountability();
  const education = useEducationModules(locale);
  const simulator = education.modules.find(
    (module) => module.experience_type === 'partner_response_simulator'
  );

  return (
    <DashboardPage>
      <DashboardPageHeader
        icon={UsersRound}
        eyebrow={p('partnerEyebrow')}
        title={p('partnerTitle')}
        description={p('partnerBody')}
        aside={
          <DashboardStatus tone="sage">{p('aggregateOnly')}</DashboardStatus>
        }
      />
      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <section className="border-border bg-card rounded-[2rem] border p-5 sm:p-7">
          <MessageCircleHeart
            className="text-cyan-dark size-8"
            aria-hidden="true"
          />
          <h2 className="text-navy mt-4 text-xl font-bold">
            {p('learningPath')}
          </h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            {p('learningPathBody')}
          </p>
          <div className="mt-6 space-y-3">
            {(simulator?.sections ?? []).map((section, index) => {
              const checkID = section.knowledge_check?.id ?? '';
              const done =
                simulator?.progress.correct_check_ids.includes(checkID);
              return (
                <div
                  key={section.id}
                  className={`flex min-h-16 items-center gap-3 rounded-2xl border p-3 ${done ? 'border-sage/30 bg-sage/8' : 'border-border'}`}
                >
                  <span
                    className={`flex size-10 shrink-0 items-center justify-center rounded-full font-bold ${done ? 'bg-sage text-white' : 'bg-muted text-navy'}`}
                  >
                    {done ? (
                      <Check className="size-4" aria-hidden="true" />
                    ) : (
                      index + 1
                    )}
                  </span>
                  <p className="text-navy text-sm font-semibold">
                    {section.title}
                  </p>
                </div>
              );
            })}
            {!simulator ? (
              <p className="text-muted-foreground text-sm">
                {p('learningEmpty')}
              </p>
            ) : null}
          </div>
          <Link
            href={ROUTES.RECOVERY}
            className="bg-navy focus-visible:ring-navy/30 mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-sm font-bold text-white outline-none focus-visible:ring-2"
          >
            {p('openLearning')}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </section>

        <section className="border-border bg-card rounded-[2rem] border p-5 sm:p-7">
          <div>
            <p className="text-cyan-dark text-xs font-bold tracking-[0.14em] uppercase">
              {p('sharedEyebrow')}
            </p>
            <h2 className="text-navy mt-2 text-xl font-bold">
              {p('sharedTitle')}
            </h2>
            <p className="text-muted-foreground mt-2 text-sm leading-6">
              {p('sharedBody')}
            </p>
          </div>
          <div className="mt-6 space-y-4">
            {accountability.workspace.members.map((member) => (
              <article
                key={member.id}
                className="border-border rounded-2xl border p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-navy font-bold">{member.student_name}</p>
                  <DashboardStatus
                    tone={member.status === 'active' ? 'sage' : 'amber'}
                  >
                    {member.status}
                  </DashboardStatus>
                </div>
                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                  <Aggregate
                    label={p('protection')}
                    value={member.aggregate.protection_status}
                  />
                  <Aggregate
                    label={p('education')}
                    value={member.aggregate.education_progress_band}
                  />
                  <Aggregate
                    label={p('participation')}
                    value={member.aggregate.check_in_days}
                  />
                </div>
              </article>
            ))}
            {accountability.workspace.members.length === 0 ? (
              <p className="text-muted-foreground text-sm">{p('noMembers')}</p>
            ) : null}
          </div>
        </section>
      </div>
      <div className="border-navy/20 bg-navy/[0.04] flex flex-col gap-4 rounded-2xl border p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <LockKeyhole
            className="text-navy mt-0.5 size-5 shrink-0"
            aria-hidden="true"
          />
          <div>
            <p className="text-navy font-bold">{p('privacyBoundary')}</p>
            <p className="text-muted-foreground mt-1 max-w-3xl text-sm leading-6">
              {p('privacyBoundaryBody')}
            </p>
          </div>
        </div>
        <Link
          href={ROUTES.PARTNERS}
          className="border-navy/25 focus-visible:ring-navy/30 text-navy inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-bold outline-none focus-visible:ring-2"
        >
          {p('managePartner')}
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </DashboardPage>
  );
}

function Aggregate({
  label,
  value,
}: {
  label: string;
  value?: string | number;
}) {
  const p = useTranslations('progressExperience');
  const shared = value !== undefined && value !== null && value !== '';
  return (
    <div className={`rounded-xl p-3 ${shared ? 'bg-sage/8' : 'bg-muted/45'}`}>
      {shared ? (
        <ShieldCheck className="text-sage size-4" aria-hidden="true" />
      ) : (
        <EyeOff className="text-muted-foreground size-4" aria-hidden="true" />
      )}
      <p className="text-muted-foreground mt-2 text-xs">{label}</p>
      <p className="text-navy mt-1 text-sm font-bold">
        {shared ? String(value) : p('notShared')}
      </p>
    </div>
  );
}

function buildCalendarDays(range: RangeDays) {
  const end = new Date();
  end.setHours(12, 0, 0, 0);
  return Array.from({ length: range }, (_, index) => {
    const date = new Date(end);
    date.setDate(end.getDate() - (range - 1 - index));
    return date;
  });
}

function isoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function activityCategories(activity?: ActivityDay) {
  if (!activity) return [];
  return (
    Object.keys(CATEGORY_ICONS) as Array<keyof typeof CATEGORY_ICONS>
  ).filter((key) => activity[key] > 0);
}

function activityTotal(activity?: ActivityDay) {
  return activityCategories(activity).reduce(
    (total, key) => total + (activity?.[key] ?? 0),
    0
  );
}

function categoryTone(key: keyof typeof CATEGORY_ICONS) {
  return {
    check_ins: 'bg-sage',
    practices: 'bg-cyan',
    journals: 'bg-amber',
    missions: 'bg-navy',
    education: 'bg-[#7757c8]',
    reviews: 'bg-[#dc7b63]',
  }[key];
}

function progressCsv(snapshot: ProgressSnapshot | null) {
  const rows = [
    [
      'date',
      'check_ins',
      'practices',
      'journals',
      'missions',
      'education',
      'reviews',
    ],
  ];
  for (const day of snapshot?.activity_days ?? [])
    rows.push(
      [
        day.date,
        day.check_ins,
        day.practices,
        day.journals,
        day.missions,
        day.education,
        day.reviews,
      ].map(String)
    );
  return rows
    .map((row) =>
      row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(',')
    )
    .join('\n');
}

function downloadText(filename: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
      })[character] ?? character
  );
}
