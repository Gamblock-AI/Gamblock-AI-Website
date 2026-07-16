import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import type { WeeklyPatternDay } from '../weekly-pattern-chart';
import { WeeklyPatternChart } from '../weekly-pattern-chart';

interface WeeklyPatternSectionProps {
  days: WeeklyPatternDay[];
  summary: string;
}

export function WeeklyPatternSection({
  days,
  summary,
}: WeeklyPatternSectionProps) {
  const t = useTranslations('weeklyReview');

  return (
    <section aria-labelledby="weekly-pattern-title">
      <Card className="rounded-3xl p-5 sm:p-7">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2
              id="weekly-pattern-title"
              className="text-navy text-lg font-bold tracking-tight sm:text-xl"
            >
              {t('patternTitle')}
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              {t('basedOnPrivate')}
            </p>
          </div>
          <p className="text-muted-foreground max-w-xl text-sm leading-6 sm:text-right">
            {summary}
          </p>
        </div>
        <WeeklyPatternChart
          days={days}
          moodLabel={t('moodLabel')}
          urgeLabel={t('urgeLabel')}
          ariaLabel={summary}
        />
      </Card>
    </section>
  );
}
