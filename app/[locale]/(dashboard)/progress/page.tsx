'use client';

import { useProgressData } from '@/hooks/use-progress-data';
import { MoodTracker } from './MoodTracker';
import { MissionsList } from './MissionsList';
import { StreakCard } from './StreakCard';
import { Award } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useTranslations } from "next-intl";

export default function ProgressPage() {
    const t = useTranslations('progressPage');
  const { selectedMood, setSelectedMood, checked, toggleCheck, progress, completedCount } = useProgressData();

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <Card className="border-navy/10 bg-navy/[0.02] p-5">
        <span className="inline-block rounded-full bg-navy/10 px-3 py-1 text-label text-navy">
          {t('text_181')}</span>
        <h1 className="mt-2 text-xl font-extrabold tracking-tight text-navy">
          {t('text_182')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('text_183')}</p>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <MoodTracker selectedMood={selectedMood} setSelectedMood={setSelectedMood} />
          <MissionsList checked={checked} toggleCheck={toggleCheck} completedCount={completedCount} />
        </div>
        <div className="space-y-4">
          <StreakCard progress={progress} />
          <Card className="p-5">
            <div className="flex items-center gap-3.5">
              <Award className="h-5 w-5 text-amber" />
              <h4 className="text-sm font-extrabold tracking-wider text-navy uppercase">
                {t('text_184')}</h4>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              {t('text_185')}{' '}
              <strong className="text-navy">{t('text_186')}</strong> {t('text_187')}</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
