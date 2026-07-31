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
import { CompactTabNav } from '@/components/common/compact-tab-nav';
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
  const desktopPanelHeight =
    range === 90
      ? 'xl:h-[56rem]'
      : range === 7
        ? 'xl:h-[32rem]'
        : 'xl:h-[40rem]';

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

      <CompactTabNav<RangeDays>
        ariaLabel={p('rangeLabel')}
        value={range}
        items={([7, 30, 90] as const).map((value) => ({
          value,
          label: p('days', { count: value }),
        }))}
        onValueChange={(value) => {
          setRange(value);
          setSelectedDate(null);
        }}
      />

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
        <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(20rem,0.75fr)] xl:items-stretch xl:gap-5">
          <section
            className={`border-border bg-card flex h-full flex-col justify-between overflow-hidden rounded-[1.5rem] border shadow-sm ${desktopPanelHeight}`}
            aria-labelledby="calendar-title"
          >
            <div className="shrink-0 border-border flex flex-col gap-2.5 border-b px-4 py-3.5 sm:flex-row sm:items-end sm:justify-between sm:px-5 sm:py-4">
              <div>
                <h2 id="calendar-title" className="text-navy text-lg font-bold sm:text-xl">
                  {p('calendarTitle')}
                </h2>
                <p className="text-muted-foreground mt-0.5 text-sm leading-5">
                  {p('calendarBody')}
                </p>
              </div>
              <ActivityLegend />
            </div>
            <div className="border-border/70 grid min-h-0 flex-1 grid-cols-7 border-l">
              {days.map((date, index) => {
                const key = isoDate(date);
                const activity = activityMap.get(key);
                const total = activityTotal(activity);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedDate(key)}
                    className={`focus-visible:ring-ring border-border/70 relative min-h-14 cursor-pointer border-r border-b p-1 text-left outline-none focus-visible:z-10 focus-visible:ring-2 sm:p-1.5 ${selectedDate === key ? 'bg-cyan/10 shadow-[inset_0_0_0_2px_var(--color-navy)]' : 'hover:bg-muted/35'}`}
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
                          className="text-navy-light mx-auto mt-1 size-4 sm:size-5"
                          strokeWidth={2}
                          aria-hidden="true"
                        />
                        <span
                          className="mt-1 flex justify-center gap-1"
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
              <div className="bg-azure/40 mt-auto border-t border-border flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
                <div className="flex items-start gap-3">
                  <Sprout
                    className="text-navy-light mt-0.5 size-5 shrink-0"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-navy font-bold">
                      {p('insufficientTitle')}
                    </p>
                    <p className="text-muted-foreground mt-0.5 text-sm leading-5">
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
                      className={`flex size-8 items-center justify-center rounded-full border text-xs font-bold ${snapshot.data!.check_in_count >= value ? 'border-navy bg-navy text-white' : 'border-border bg-card text-muted-foreground'}`}
                    >
                      {value}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-auto border-t border-border px-4 py-3.5 sm:px-5 sm:py-4">
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

          <aside
            className={`grid gap-3.5 xl:grid-rows-[auto_minmax(0,1fr)] xl:gap-4 ${desktopPanelHeight}`}
          >
            <EstimatorCard
              activeDays={snapshot.data.active_days}
              rangeDays={range}
            />
            <section className="border-border bg-card flex flex-col justify-between rounded-[1.5rem] border p-4 sm:p-5">
              <div>
                <CalendarDays
                  className="text-navy-light size-6"
                  aria-hidden="true"
                />
                <h2 className="text-navy mt-2.5 text-lg font-bold">
                  {p('reviewTitle')}
                </h2>
                <p className="text-muted-foreground mt-1.5 text-sm leading-5">
                  {p('reviewBody')}
                </p>
                <div className="text-muted-foreground mt-3 flex items-center gap-2 text-xs">
                  <span>{p('reviewStepReflect')}</span>
                  <ArrowRight className="size-3" aria-hidden="true" />
                  <span>{p('reviewStepLearn')}</span>
                  <ArrowRight className="size-3" aria-hidden="true" />
                  <span>{p('reviewStepPlan')}</span>
                </div>
              </div>
              <div className="mt-3 pt-1.5 space-y-2">
                <Button
                  className="w-full"
                  onClick={() => setReviewOpen(true)}
                >
                  {p('startReview')}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Button>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => setRecapOpen(true)}
                >
                  {p('openRecap')}
                </Button>
              </div>
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
