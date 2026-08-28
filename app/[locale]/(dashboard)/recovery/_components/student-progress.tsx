'use client';

import { useMemo, useState } from 'react';
import {
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  CircleHelp,
  Download,
  FileSpreadsheet,
  Footprints,
  GraduationCap,
  NotebookPen,
  ShieldAlert,
  ShieldCheck,
  Sprout,
  Target,
  type LucideIcon,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import {
  DashboardNotice,
  DashboardPage,
  DashboardPageHeader,
} from '@/components/dashboard/dashboard-page';
import { CompactTabNav } from '@/components/common/compact-tab-nav';
import { Button } from '@/components/ui/button';
import { GamiCard } from '@/components/dashboard/gami-card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useProgressSnapshot } from '@/hooks/use-progress-snapshot';
import { useQueryTab } from '@/hooks/use-query-tab';
import { toastError, toastSuccess } from '@/lib/feedback';
import { DASHBOARD_QUERY_KEYS } from '@/routes';
import { printProgressSnapshot } from './progress-export';
import {
  activityCategories,
  activityTotal,
  buildCalendarDays,
  categoryBgTone,
  downloadText,
  formatMonthShort,
  formatWeekday,
  isoDate,
  progressCategories,
  progressCsv,
  type ActivityDay,
  type ProgressCategory,
  type RangeDays,
} from './progress-utils';
import { WeeklyRecap } from './weekly-recap';
import { WeeklyReviewSheet } from './weekly-review-sheet';

const CATEGORY_ICONS: Record<ProgressCategory, LucideIcon> = {
  check_ins: ShieldCheck,
  journals: NotebookPen,
  missions: Target,
  education: BookOpen,
  reviews: CalendarDays,
  learning_hub: GraduationCap,
  protection: ShieldAlert,
};

export function StudentProgress({ range: initialRange }: { range: RangeDays }) {
  const p = useTranslations('progressExperience');
  const locale = useLocale();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [recapOpen, setRecapOpen] = useState(false);
  const [confirmExport, setConfirmExport] = useState<'csv' | 'pdf' | null>(
    null
  );
  const { value: selectedRange, setValue: setRange } = useQueryTab<RangeDays>({
    queryKey: DASHBOARD_QUERY_KEYS.recoveryTab,
    values: [7, 30, 90],
    defaultValue: initialRange,
    resetKeys: [DASHBOARD_QUERY_KEYS.pages.recovery],
    removeKeys: ['range'],
  });
  const range = selectedRange;
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
        aside={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setReviewOpen(true)}
            >
              <CalendarDays className="size-4" aria-hidden="true" />
              {p('startReview')}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setRecapOpen(true)}
            >
              <Sprout className="size-4" aria-hidden="true" />
              {p('openRecap')}
            </Button>
          </div>
        }
      />

      <CompactTabNav<RangeDays>
        ariaLabel={p('rangeLabel')}
        value={range}
        onValueChange={setRange}
        items={([7, 30, 90] as const).map((value) => ({
          value,
          label: p('days', { count: value }),
        }))}
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
        <section
          className="border-border bg-card flex flex-col justify-between overflow-hidden rounded-[1.5rem] border shadow-sm"
          aria-labelledby="calendar-title"
        >
          <div className="shrink-0 border-border flex flex-col gap-3 border-b px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 id="calendar-title" className="text-navy text-lg font-bold sm:text-xl">
                  {p('calendarTitle')}
                </h2>
                <span className="rounded-full bg-azure/70 px-2.5 py-0.5 text-xs font-bold text-navy">
                  {p('days', { count: range })}
                </span>
              </div>
              <p className="text-muted-foreground mt-0.5 text-sm leading-5">
                {p('calendarBody')}
              </p>
            </div>
            <ActivityLegend />
          </div>

          {range === 7 ? (
            /* 7-Day Dedicated Rich Cards Layout */
            <div className="p-3.5 sm:p-5">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
                {days.map((date, index) => {
                  const key = isoDate(date);
                  const activity = activityMap.get(key);
                  const total = activityTotal(activity);
                  const categories = activityCategories(activity);
                  const isToday = index === days.length - 1;
                  const isSelected = selectedDate === key;
                  const weekdayName = formatWeekday(date, locale, 'short');

                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedDate(key)}
                      className={`group relative flex min-h-[210px] flex-col justify-between rounded-2xl border p-4 text-left transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:z-10 ${
                        isSelected
                          ? 'bg-azure/30 border-navy shadow-md ring-2 ring-navy/80'
                          : isToday
                            ? 'bg-gradient-to-b from-azure/35 via-card to-card border-navy/40 shadow-xs hover:border-navy hover:shadow-md hover:-translate-y-0.5'
                            : 'bg-card border-border/80 hover:border-navy/30 hover:bg-muted/20 hover:shadow-md hover:-translate-y-0.5'
                      }`}
                      aria-label={p('dayLabel', {
                        date: date.toLocaleDateString(locale),
                        count: total,
                      })}
                    >
                      {/* Card Header */}
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-black uppercase tracking-wider text-muted-foreground group-hover:text-navy transition-colors">
                            {weekdayName}
                          </span>
                          {isToday ? (
                            <span className="inline-flex items-center rounded-full bg-navy px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-xs">
                              {p('today')}
                            </span>
                          ) : null}
                        </div>

                        <div className="flex items-baseline gap-1.5">
                          <span className="text-2xl sm:text-3xl font-black text-navy leading-none tracking-tight">
                            {date.getDate()}
                          </span>
                          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
                            {formatMonthShort(date, locale)}
                          </span>
                        </div>
                      </div>

                      <div className="border-t border-border/60 my-2.5" />

                      {/* Card Body */}
                      <div className="flex-1 flex flex-col justify-center">
                        {total > 0 ? (
                          <div className="flex flex-col gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-azure/80 border border-navy/10 px-2.5 py-0.5 text-[11px] font-bold text-navy w-fit">
                              <span className="size-1.5 rounded-full bg-navy animate-pulse" />
                              {p('activityCount', { count: total })}
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {categories.map((item) => {
                                const Icon = CATEGORY_ICONS[item];
                                const count = activity?.[item] ?? 0;
                                return (
                                  <span
                                    key={item}
                                    className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-xs font-bold transition-transform group-hover:scale-105 shadow-2xs ${categoryBgTone(item)}`}
                                    title={`${p(`categories.${item}`)}${count > 1 ? ` (×${count})` : ''}`}
                                    aria-label={`${p(`categories.${item}`)}${count > 1 ? ` (${count})` : ''}`}
                                  >
                                    <Icon className="size-4 shrink-0" strokeWidth={2.2} aria-hidden="true" />
                                    {count > 1 ? (
                                      <span className="text-[10px] font-black leading-none">
                                        ×{count}
                                      </span>
                                    ) : null}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-4 text-center">
                            <div className="size-8 rounded-full bg-sage/10 text-sage flex items-center justify-center mb-1.5">
                              <Sprout className="size-4" />
                            </div>
                            <span className="text-xs font-medium italic text-muted-foreground">
                              {p('quietDayShort')}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Card Footer */}
                      <div className="mt-auto pt-3 border-t border-border/40 flex items-center justify-between text-[11px] font-semibold text-muted-foreground group-hover:text-navy transition-colors">
                        <span>{p('viewDetail')}</span>
                        <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Multi-Week Grid for 30 / 90 Days */
            <div className="p-3.5 sm:p-5">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-7 sm:gap-2.5">
                {days.map((date, index) => {
                  const key = isoDate(date);
                  const activity = activityMap.get(key);
                  const total = activityTotal(activity);
                  const categories = activityCategories(activity);
                  const isToday = index === days.length - 1;
                  const isSelected = selectedDate === key;
                  const weekdayName = formatWeekday(date, locale, 'short');
                  const isFirstOfMonth = date.getDate() === 1 || index === 0;

                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedDate(key)}
                      className={`group relative flex min-h-[5.5rem] sm:min-h-[6.25rem] flex-col justify-between rounded-xl border p-2.5 text-left transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:z-10 ${
                        isSelected
                          ? 'bg-azure/30 border-navy shadow-md ring-2 ring-navy/80'
                          : isToday
                            ? 'bg-gradient-to-b from-azure/35 via-card to-card border-navy/40 shadow-xs hover:border-navy hover:shadow-md hover:-translate-y-0.5'
                            : 'bg-card border-border/75 hover:border-navy/30 hover:bg-muted/20 hover:shadow-sm hover:-translate-y-0.5'
                      }`}
                      aria-label={p('dayLabel', {
                        date: date.toLocaleDateString(locale),
                        count: total,
                      })}
                    >
                      {/* Card Top / Header */}
                      <div className="flex items-start justify-between gap-1">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground group-hover:text-navy transition-colors">
                            {weekdayName}
                          </span>
                          <div className="flex items-baseline gap-1">
                            <span className={`text-base sm:text-lg font-black leading-tight tracking-tight ${isToday ? 'text-navy' : 'text-foreground'}`}>
                              {date.getDate()}
                            </span>
                            {isFirstOfMonth ? (
                              <span className="text-[10px] font-black uppercase text-navy-light">
                                {formatMonthShort(date, locale)}
                              </span>
                            ) : null}
                          </div>
                        </div>

                        {isToday ? (
                          <span className="inline-flex items-center rounded-full bg-navy px-1.5 py-0.5 text-[9px] font-black uppercase tracking-tight text-white shadow-xs">
                            {p('today')}
                          </span>
                        ) : total > 0 ? (
                          <span className="inline-flex items-center rounded-full bg-cyan/15 px-1.5 py-0.5 text-[9px] font-extrabold text-navy-dark">
                            {total}
                          </span>
                        ) : null}
                      </div>

                      {/* Card Body / Activity Icons */}
                      <div className="my-1 flex-1 flex items-center">
                        {total > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {categories.slice(0, 4).map((item) => {
                              const Icon = CATEGORY_ICONS[item];
                              const count = activity?.[item] ?? 0;
                              return (
                                <span
                                  key={item}
                                  className={`inline-flex items-center gap-0.5 rounded-md border p-1 text-[10px] font-bold transition-transform group-hover:scale-105 ${categoryBgTone(item)}`}
                                  title={`${p(`categories.${item}`)}${count > 1 ? ` (×${count})` : ''}`}
                                >
                                  <Icon className="size-3 shrink-0" strokeWidth={2.2} />
                                  {count > 1 ? (
                                    <span className="text-[9px] font-black leading-none opacity-90">
                                      {count}
                                    </span>
                                  ) : null}
                                </span>
                              );
                            })}
                            {categories.length > 4 ? (
                              <span className="text-[9px] font-extrabold text-muted-foreground self-center px-0.5">
                                +{categories.length - 4}
                              </span>
                            ) : null}
                          </div>
                        ) : (
                          <span className="text-[10px] font-medium text-muted-foreground/30 italic">
                            ·
                          </span>
                        )}
                      </div>

                      {/* Card Bottom / Subtle Hint */}
                      <div className="flex items-center justify-end text-[10px] font-medium text-muted-foreground/50 group-hover:text-navy transition-colors">
                        <ArrowUpRight className="size-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

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
      ) : null}

      {selectedDate ? (
        <DayDetail
          date={selectedDate}
          activity={selected}
          locale={locale}
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
    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
      {progressCategories.map((key) => {
        const Icon = CATEGORY_ICONS[key];
        return (
          <span
            key={key}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-xs font-semibold ${categoryBgTone(key)}`}
          >
            <Icon className="size-3.5 shrink-0" strokeWidth={2.2} aria-hidden="true" />
            <span>{p(`categories.${key}`)}</span>
          </span>
        );
      })}
    </div>
  );
}

function DayDetail({
  date,
  activity,
  locale,
  onClose,
}: {
  date: string;
  activity?: ActivityDay;
  locale: string;
  onClose: () => void;
}) {
  const p = useTranslations('progressExperience');
  return (
    <Dialog open onOpenChange={(open) => (!open ? onClose() : undefined)}>
      <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <p className="text-navy-light text-xs font-bold tracking-[0.14em] uppercase">
            {p('dayDetail')}
          </p>
          <DialogTitle className="text-navy text-lg font-bold">
            {new Date(`${date}T12:00:00`).toLocaleDateString(locale, {
              dateStyle: 'full',
            })}
          </DialogTitle>
        </DialogHeader>
        {activity && activityTotal(activity) > 0 ? (
          <div className="grid gap-2.5 sm:grid-cols-2">
            {progressCategories.map((key) => {
              const Icon = CATEGORY_ICONS[key];
              const count = activity[key] ?? 0;
              return (
                <div
                  key={key}
                  className={`rounded-xl border p-3 transition-colors ${
                    count > 0
                      ? categoryBgTone(key)
                      : 'bg-muted/30 border-border/50 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon
                        className="size-4 shrink-0"
                        strokeWidth={2.2}
                        aria-hidden="true"
                      />
                      <span className="text-sm font-bold">
                        {p(`categories.${key}`)}
                      </span>
                    </div>
                    <span className="text-sm font-extrabold">
                      {count}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="size-10 rounded-full bg-sage/10 text-sage flex items-center justify-center mb-2">
              <Sprout className="size-5" />
            </div>
            <p className="text-muted-foreground text-sm max-w-xs">{p('quietDay')}</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
