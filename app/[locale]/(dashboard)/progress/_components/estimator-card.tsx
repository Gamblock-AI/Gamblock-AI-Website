'use client';

import { useState, useSyncExternalStore, type FormEvent } from 'react';
import { Coins, LockKeyhole, Minus, PiggyBank, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  clearEstimatorBaseline,
  computeSaved,
  formatRupiah,
  readEstimatorBaseline,
  writeEstimatorBaseline,
  type EstimatorBaseline,
} from '@/lib/recovery/estimator';

// Baseline read once per session on the client; SSR renders the empty state.
const subscribeNever = () => () => {};
let cachedBaseline: EstimatorBaseline | null | undefined;
const getBaselineSnapshot = (): EstimatorBaseline | null => {
  if (cachedBaseline === undefined) cachedBaseline = readEstimatorBaseline();
  return cachedBaseline;
};
const getBaselineServerSnapshot = (): null => null;

const MIN_HOURS_PER_WEEK = 1;
const MAX_HOURS_PER_WEEK = 168;
const rupiahInputFormatter = new Intl.NumberFormat('id-ID', {
  maximumFractionDigits: 0,
});

function parseRupiahInput(value: string): number {
  return Number(value.replace(/\D/g, ''));
}

function formatRupiahInput(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';

  const numericValue = Number(digits);
  return Number.isFinite(numericValue)
    ? rupiahInputFormatter.format(numericValue)
    : '';
}

/**
 * "Yang kamu jaga" — the private what-you-kept estimator. The baseline stays
 * on this device only (never sent), the math is an honest approximation from
 * active days, and the copy is empowering — direction over precision, never
 * shame.
 */
export function EstimatorCard({
  activeDays,
  rangeDays,
}: {
  activeDays: number;
  rangeDays: number;
}) {
  const t = useTranslations('estimator');
  const stored = useSyncExternalStore(
    subscribeNever,
    getBaselineSnapshot,
    getBaselineServerSnapshot
  );
  const [baseline, setBaseline] = useState<EstimatorBaseline | null>(stored);
  const [editing, setEditing] = useState(false);
  const [hours, setHours] = useState('');
  const [rupiah, setRupiah] = useState('');

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const hoursValue = Number(hours);
    const rupiahValue = parseRupiahInput(rupiah);
    if (!Number.isFinite(hoursValue) || hoursValue <= 0) return;
    if (!Number.isFinite(rupiahValue) || rupiahValue < 0) return;
    writeEstimatorBaseline({
      hoursPerWeek: hoursValue,
      rupiahPerWeek: rupiahValue,
    });
    cachedBaseline = undefined;
    setBaseline(readEstimatorBaseline());
    setEditing(false);
  };

  const clear = () => {
    clearEstimatorBaseline();
    cachedBaseline = undefined;
    setBaseline(null);
    setEditing(false);
  };

  const saved = baseline ? computeSaved(baseline, activeDays) : null;
  const hoursValue = Number(hours);
  const canDecreaseHours =
    Number.isFinite(hoursValue) && hoursValue > MIN_HOURS_PER_WEEK;
  const canIncreaseHours =
    !Number.isFinite(hoursValue) || hoursValue < MAX_HOURS_PER_WEEK;

  const adjustHours = (amount: -1 | 1) => {
    const currentHours = Number.isFinite(hoursValue)
      ? hoursValue
      : MIN_HOURS_PER_WEEK - amount;
    const nextHours = Math.round(Math.min(
      MAX_HOURS_PER_WEEK,
      Math.max(MIN_HOURS_PER_WEEK, currentHours + amount)
    ));
    setHours(String(nextHours));
  };

  return (
    <section className="border-navy/15 bg-azure/35 rounded-2xl border p-3 sm:p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span
            className="bg-navy text-sky flex size-7 shrink-0 items-center justify-center rounded-lg"
            aria-hidden="true"
          >
            <PiggyBank className="size-3.5" />
          </span>
          <h2 className="text-navy text-sm font-bold">{t('title')}</h2>
        </div>
        <span className="text-muted-foreground flex items-center gap-1 text-[11px] font-semibold">
          <LockKeyhole className="size-3" aria-hidden="true" />
          {t('privacyNote')}
        </span>
      </div>

      {baseline && saved && !editing ? (
        <div className="mt-2.5">
          <p className="text-muted-foreground text-xs leading-5">
            {t('savedIntro', { days: activeDays, range: rangeDays })}
          </p>
          <p className="text-navy mt-1.5 flex items-center gap-2 text-sm font-bold">
            <Coins className="text-navy-light size-4 shrink-0" aria-hidden="true" />
            {t('savedMoney', { amount: formatRupiah(saved.rupiah) })}
          </p>
          <p className="text-navy mt-1 text-sm font-bold">
            {t('savedHours', { hours: saved.hours })}
          </p>
          <p className="text-muted-foreground mt-1.5 text-xs leading-5">
            {t('approxNote')}
          </p>
          <p className="text-navy-light mt-1 text-xs font-semibold">
            {t('empowerLine')}
          </p>
          <div className="mt-2.5 flex gap-3">
            <button
              type="button"
              onClick={() => {
                setHours(String(baseline.hoursPerWeek));
                setRupiah(formatRupiahInput(String(baseline.rupiahPerWeek)));
                setEditing(true);
              }}
              className="text-navy hover:text-navy-light focus-visible:ring-navy/30 min-h-9 cursor-pointer rounded-lg text-xs font-bold outline-none focus-visible:ring-2"
            >
              {t('editAction')}
            </button>
            <button
              type="button"
              onClick={clear}
              className="text-muted-foreground hover:text-navy focus-visible:ring-navy/30 min-h-9 cursor-pointer rounded-lg text-xs font-semibold outline-none focus-visible:ring-2"
            >
              {t('clearAction')}
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-2.5">
          <p className="text-muted-foreground text-xs leading-5">
            {t('setupBody')}
          </p>
          <div className="mt-2">
            <label
              htmlFor="estimator-hours"
              className="text-navy text-xs font-bold"
            >
              {t('hoursLabel')}
            </label>
            <div className="border-input bg-card focus-within:ring-navy/30 mt-1 grid h-10 grid-cols-[2.5rem_minmax(0,1fr)_2.5rem] overflow-hidden rounded-xl border focus-within:ring-2">
              <button
                type="button"
                onClick={() => adjustHours(-1)}
                disabled={!canDecreaseHours}
                aria-label={t('decreaseHours')}
                className="border-input text-navy hover:bg-azure/45 focus-visible:ring-navy/30 flex cursor-pointer items-center justify-center border-r outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Minus className="size-4" aria-hidden="true" />
              </button>
              <input
                id="estimator-hours"
                type="number"
                inputMode="numeric"
                min={MIN_HOURS_PER_WEEK}
                max={MAX_HOURS_PER_WEEK}
                step={1}
                required
                placeholder={t('hoursPlaceholder')}
                value={hours}
                onChange={(event) => setHours(event.target.value)}
                className="text-navy placeholder:text-muted-foreground h-full min-w-0 appearance-none bg-transparent px-2 text-center text-sm font-semibold outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
              <button
                type="button"
                onClick={() => adjustHours(1)}
                disabled={!canIncreaseHours}
                aria-label={t('increaseHours')}
                className="border-input text-navy hover:bg-azure/45 focus-visible:ring-navy/30 flex cursor-pointer items-center justify-center border-l outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Plus className="size-4" aria-hidden="true" />
              </button>
            </div>
          </div>
          <div className="mt-1.5">
            <label
              htmlFor="estimator-rupiah"
              className="text-navy text-xs font-bold"
            >
              {t('moneyLabel')}
            </label>
            <div className="border-input bg-card focus-within:ring-navy/30 mt-1 grid h-10 grid-cols-[2.5rem_minmax(0,1fr)] overflow-hidden rounded-xl border focus-within:ring-2">
              <span className="border-input text-navy flex items-center justify-center border-r text-sm font-semibold">
                Rp
              </span>
              <input
                id="estimator-rupiah"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                required
                placeholder={t('moneyPlaceholder')}
                value={rupiah}
                onChange={(event) => setRupiah(formatRupiahInput(event.target.value))}
                className="text-navy placeholder:text-muted-foreground h-full min-w-0 bg-transparent px-3 text-center text-sm font-semibold outline-none"
              />
            </div>
          </div>
          <div className="mt-2.5 space-y-2">
            <Button type="submit" size="sm" className="w-full">
              {t('saveAction')}
            </Button>
            {baseline ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setEditing(false)}
                className="w-full"
              >
                {t('cancelAction')}
              </Button>
            ) : null}
          </div>
        </form>
      )}
    </section>
  );
}
