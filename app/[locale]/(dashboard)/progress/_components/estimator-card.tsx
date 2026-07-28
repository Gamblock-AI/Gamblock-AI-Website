'use client';

import { useState, useSyncExternalStore, type FormEvent } from 'react';
import { Coins, LockKeyhole, PiggyBank } from 'lucide-react';
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
    const rupiahValue = Number(rupiah);
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

  return (
    <section className="border-navy/15 bg-azure/35 rounded-2xl border p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span
            className="bg-navy text-sky flex size-8 shrink-0 items-center justify-center rounded-lg"
            aria-hidden="true"
          >
            <PiggyBank className="size-4" />
          </span>
          <h2 className="text-navy text-sm font-bold">{t('title')}</h2>
        </div>
        <span className="text-muted-foreground flex items-center gap-1 text-[11px] font-semibold">
          <LockKeyhole className="size-3" aria-hidden="true" />
          {t('privacyNote')}
        </span>
      </div>

      {baseline && saved && !editing ? (
        <div className="mt-3">
          <p className="text-muted-foreground text-xs leading-5">
            {t('savedIntro', { days: activeDays, range: rangeDays })}
          </p>
          <p className="text-navy mt-2 flex items-center gap-2 text-sm font-bold">
            <Coins className="text-navy-light size-4 shrink-0" aria-hidden="true" />
            {t('savedMoney', { amount: formatRupiah(saved.rupiah) })}
          </p>
          <p className="text-navy mt-1 text-sm font-bold">
            {t('savedHours', { hours: saved.hours })}
          </p>
          <p className="text-muted-foreground mt-2 text-xs leading-5">
            {t('approxNote')}
          </p>
          <p className="text-navy-light mt-1 text-xs font-semibold">
            {t('empowerLine')}
          </p>
          <div className="mt-3 flex gap-3">
            <button
              type="button"
              onClick={() => {
                setHours(String(baseline.hoursPerWeek));
                setRupiah(String(baseline.rupiahPerWeek));
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
        <form onSubmit={submit} className="mt-3">
          <p className="text-muted-foreground text-xs leading-5">
            {t('setupBody')}
          </p>
          <label className="mt-3 block">
            <span className="text-navy text-xs font-bold">{t('hoursLabel')}</span>
            <input
              type="number"
              inputMode="numeric"
              min={1}
              max={168}
              required
              value={hours}
              onChange={(event) => setHours(event.target.value)}
              className="border-input bg-card focus-visible:ring-navy/30 mt-1 h-11 w-full rounded-xl border px-3 text-sm outline-none focus-visible:ring-2"
            />
          </label>
          <label className="mt-2 block">
            <span className="text-navy text-xs font-bold">{t('moneyLabel')}</span>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              required
              value={rupiah}
              onChange={(event) => setRupiah(event.target.value)}
              className="border-input bg-card focus-visible:ring-navy/30 mt-1 h-11 w-full rounded-xl border px-3 text-sm outline-none focus-visible:ring-2"
            />
          </label>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button type="submit" size="sm">
              {t('saveAction')}
            </Button>
            {baseline ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setEditing(false)}
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
