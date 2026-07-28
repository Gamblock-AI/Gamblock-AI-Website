'use client';

import { useMemo, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Check,
  CircleHelp,
  Download,
  FileSpreadsheet,
  Footprints,
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
import { GamiCard } from '@/components/dashboard/gami-card';
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
import { EstimatorCard } from './estimator-card';
import { JourneyBadges } from './journey-badges';
import { WeeklyRecap } from './weekly-recap';
import { WeeklyReviewSheet } from './weekly-review-sheet';

const CATEGORY_ICONS: Record<ProgressCategory, LucideIcon> = {
  check_ins: ShieldCheck,
  practices: Waves,
  journals: NotebookPen,
  missions: Target,
  education: BookOpen,
  reviews: CalendarDays,
};

export function StudentProgress() {
  const p = useTranslations('progressExperience');
  const locale = useLocale();
  const [range, setRange] = useState<RangeDays>(30);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [recapOpen, setRecapOpen] = useState(false);
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
  const [reviewVersion, setReviewVersion] = useState(0);
  const completeReview = () => {
    setReviewVersion((version) => version + 1);
    setReviewOpen(false);
    setRecapOpen(true);
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
    <DashboardPage density="compact">
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
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(19rem,0.5fr)]">
          <section
            className="border-border bg-card overflow-hidden rounded-[2rem] border shadow-sm"
            aria-labelledby="calendar-title"
          >
            <div className="border-border flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-end sm:justify-between sm:p-5">
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
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedDate(key)}
                    className={`focus-visible:ring-ring border-border/70 relative min-h-16 cursor-pointer border-r border-b p-1.5 text-left outline-none focus-visible:z-10 focus-visible:ring-2 sm:min-h-20 sm:p-2 ${selectedDate === key ? 'bg-cyan/10 shadow-[inset_0_0_0_2px_var(--color-navy)]' : 'hover:bg-muted/35'}`}
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
                        <Check
                          className="text-navy-light mx-auto mt-1.5 size-5 sm:size-6"
                          strokeWidth={2}
                          aria-hidden="true"
                        />
                        <span
                          className="mt-1.5 flex justify-center gap-1"
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
              <div className="bg-azure/40 flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                <div className="flex items-start gap-3">
                  <Sprout
                    className="text-navy-light mt-0.5 size-6 shrink-0"
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
                      className={`flex size-10 items-center justify-center rounded-full border text-sm font-bold ${snapshot.data!.check_in_count >= value ? 'border-navy bg-navy text-white' : 'border-border bg-card text-muted-foreground'}`}
                    >
                      {value}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-4 sm:p-5">
                <GamiCard
                  title={p('encouragementTitle')}
                  message={p('encouragementBody', {
                    count: snapshot.data.check_in_count,
                    days: snapshot.data.active_days,
                  })}
                />
              </div>
            )}
          </section>

          <aside className="space-y-4">
            <EstimatorCard
              activeDays={snapshot.data.active_days}
              rangeDays={range}
            />
            <JourneyBadges key={reviewVersion} />

            <section className="border-border bg-card rounded-[2rem] border p-4 sm:p-5">
              <CalendarDays
                className="text-navy-light size-7"
                aria-hidden="true"
              />
              <h2 className="text-navy mt-3 text-xl font-bold">
                {p('reviewTitle')}
              </h2>
              <p className="text-muted-foreground mt-2 text-sm leading-6">
                {p('reviewBody')}
              </p>
              <div className="text-muted-foreground mt-4 flex items-center gap-2 text-xs">
                <span>{p('reviewStepReflect')}</span>
                <ArrowRight className="size-3" aria-hidden="true" />
                <span>{p('reviewStepLearn')}</span>
                <ArrowRight className="size-3" aria-hidden="true" />
                <span>{p('reviewStepPlan')}</span>
              </div>
              <Button
                className="mt-4 w-full"
                onClick={() => setReviewOpen(true)}
              >
                {p('startReview')}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Button>
              <Button
                className="mt-2 w-full"
                variant="outline"
                onClick={() => setRecapOpen(true)}
              >
                {p('openRecap')}
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
      {recapOpen ? <WeeklyRecap onClose={() => setRecapOpen(false)} /> : null}

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
          <p className="text-navy-light text-xs font-bold tracking-[0.14em] uppercase">
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
                <Icon
                  className={
                    activity[key] > 0
                      ? 'text-navy-light size-4'
                      : 'text-muted-foreground/50 size-4'
                  }
                  aria-hidden="true"
                />
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
