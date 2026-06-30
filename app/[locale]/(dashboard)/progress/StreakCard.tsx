'use client';

import { Flame } from 'lucide-react';
import { ProgressSnapshot } from '@/hooks/use-progress-data';
import { useTranslations } from "next-intl";

interface StreakCardProps {
  progress: ProgressSnapshot | null;
}

export function StreakCard({ progress }: StreakCardProps) {
    const t = useTranslations('StreakCard');
  return (
    <div className="relative overflow-hidden rounded-2xl border border-amber/20 bg-amber/5 p-5 shadow-soft">
      <div className="relative z-10 space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber/15">
            <Flame className="h-6 w-6 text-amber" />
          </div>
          <div>
            <h4 className="text-xs font-extrabold tracking-wider uppercase text-navy">{t('text_178')}</h4>
            <span className="mt-0.5 inline-block rounded-full bg-amber/15 px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase text-amber">
              {t('text_179')}</span>
          </div>
        </div>
        <div className="space-y-1">
          <p className="flex items-baseline text-3xl font-black tracking-tight text-navy">
            {progress?.active_days || 12}{' '}
            <span className="ml-1.5 text-base font-bold text-muted-foreground">Hari</span>
          </p>
          <p className="pt-2 text-xs leading-relaxed text-muted-foreground">
            {t('text_180')}</p>
        </div>
      </div>
    </div>
  );
}
