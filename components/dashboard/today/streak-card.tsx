'use client';

import { Flame } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function StreakCard({ streakDays }: { streakDays: number }) {
  const t = useTranslations('recoveryDashboard');
  
  if (streakDays <= 0) return null;

  return (
    <section className="flex flex-col items-center justify-center rounded-[1.5rem] border border-amber/20 bg-gradient-to-br from-amber/10 to-amber/5 p-5 text-center shadow-soft">
      <div className="flex size-12 items-center justify-center rounded-full bg-amber/20 text-amber">
        <Flame className="size-6" aria-hidden="true" />
      </div>
      <h3 className="mt-3 text-sm font-bold text-navy">{t('streakTitle')}</h3>
      <p className="mt-1 text-2xl font-black tabular-nums text-amber">
        {t('streakDays', { days: streakDays })}
      </p>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">{t('streakDesc')}</p>
    </section>
  );
}
