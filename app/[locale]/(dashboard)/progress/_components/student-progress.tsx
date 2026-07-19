'use client';

import { useMemo, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CircleHelp,
  Download,
  FileSpreadsheet,
  Footprints,
  LampDesk,
  Leaf,
  NotebookPen,
  ShieldCheck,
  Sprout,
  Target,
  Waves,
  X,
  type LucideIcon,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import {
  DashboardNotice,
  DashboardPage,
  DashboardPageHeader,
  DashboardStatus,
} from '@/components/dashboard/dashboard-page';
import { Button } from '@/components/ui/button';
import { useProgressSnapshot } from '@/hooks/use-progress-snapshot';
import { toastError, toastSuccess } from '@/lib/feedback';
import { printProgressSnapshot } from './progress-export';
import {
  activityCategories,
  activityTotal,
  buildCalendarDays,
  categoryTone,
  downloadText,
  isoDate,
  progressCategories,
  progressCsv,
  type ActivityDay,
  type ProgressCategory,
  type RangeDays,
} from './progress-utils';
import { WeeklyReviewSheet } from './weekly-review-sheet';

const CATEGORY_ICONS: Record<ProgressCategory, LucideIcon> = {
  check_ins: ShieldCheck,
  practices: Waves,
  journals: NotebookPen,
  missions: Target,
  education: BookOpen,
  reviews: CalendarDays,
};

const KEEPSAKES = [Sprout, LampDesk, NotebookPen, BookOpen, Leaf] as const;

export function StudentProgress() {
  const p = useTranslations('progressExperience');
  const locale = useLocale();
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
  const closeReview = () => setReviewOpen(false);
  const completeReview = () => {
    setReviewOpen(false);
    void snapshot.refetch();
  };

  const exportData = async () => {
    const format = confirmExport;
    if (!format) return;
    if (!snapshot.data) {
      toastError(
        new Error('Progress snapshot is unavailable'),
        p('exportError')
      );
      return;
    }

    setConfirmExport(null);
    try {
      if (format === 'csv') {
        downloadText(
          `gamblock-progress-${range}d.csv`,
          progressCsv(snapshot.data),
          'text/csv;charset=utf-8'
        );
        toastSuccess(p('csvReady'));
        return;
      }

      await printProgressSnapshot(snapshot.data, {
        locale,
        title: p('pdfTitle'),
        instruction: p('pdfInstruction'),
        privacy: p('exportBody'),
        generatedAt: p('pdfGeneratedAt'),
        range: p('pdfRange'),
        rangeValue: p('days', { count: range }),
        summary: p('pdfSummary'),
        checkIns: p('pdfCheckIns'),
        activeDays: p('pdfActiveDays'),
        reflections: p('pdfReflections'),
        activity: p('pdfActivity'),
        date: p('pdfDate'),
        noActivity: p('pdfNoActivity'),
        frameTitle: p('pdfFrameTitle'),
        categories: Object.fromEntries(
          progressCategories.map((category) => [
            category,
            p(`categories.${category}`),
          ])
        ) as Record<ProgressCategory, string>,
      });
      toastSuccess(p('pdfReady'));
    } catch (error) {
      toastError(error, p('exportError'));
    }
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
                      className={`flex size-10 items-center justify-center rounded-full border text-sm font-bold ${snapshot.data.check_in_count >= value ? 'border-sage bg-sage text-white' : 'border-border bg-card text-muted-foreground'}`}
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
                    className={`flex aspect-square items-center justify-center rounded-2xl border ${index < Math.min(snapshot.data.active_days, KEEPSAKES.length) ? 'border-sage/30 bg-card text-sage shadow-sm' : 'border-border text-muted-foreground/25 border-dashed'}`}
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
        <WeeklyReviewSheet onClose={closeReview} onSaved={completeReview} />
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
            <Button disabled={!snapshot.data} onClick={() => void exportData()}>
              {p('confirmExport')}
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={!snapshot.data}
              onClick={() => setConfirmExport('csv')}
            >
              <FileSpreadsheet className="size-4" aria-hidden="true" />
              CSV
            </Button>
            <Button
              variant="outline"
              disabled={!snapshot.data}
              onClick={() => setConfirmExport('pdf')}
            >
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
      {progressCategories.map((key) => {
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
      })}
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
          {progressCategories.map((key) => {
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
