'use client';

import { CalendarCheck2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function StreakCard({ streakDays }: { streakDays: number }) {
  const t = useTranslations('recoveryDashboard');

  if (streakDays <= 0) return null;

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <div className="flex size-10 items-center justify-center rounded-xl bg-navy text-white shadow-sm">
        <CalendarCheck2 className="size-5" aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-[0.9375rem] leading-6 font-bold text-navy">
        {t('streakTitle')}
      </h3>
      <p className="mt-1 text-2xl font-extrabold text-sage tabular-nums">
        {t('streakDays', { days: streakDays })}
      </p>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {t('streakDesc')}
      </p>
    </section>
  );
}
