import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { todaySteps } from './dashboard-copy';

export function TodaySteps({ activeStep }: { activeStep: number }) {
  const t = useTranslations('recoveryDashboard');

  return (
    <ol className="mt-5 grid grid-cols-4 gap-1" aria-label={t('todayTitle')}>
      {todaySteps.map((step, index) => {
        const current = activeStep === step.number;
        const complete = activeStep > step.number;
        return (
          <li
            key={step.number}
            className="relative flex min-w-0 flex-col items-center gap-2 text-center"
          >
            {index > 0 ? (
              <span
                className="bg-navy/20 absolute top-4 right-1/2 h-px w-full"
                aria-hidden="true"
              />
            ) : null}
            <span
              className={cn(
                'relative z-[1] flex size-8 items-center justify-center rounded-full border text-xs font-bold',
                current
                  ? 'border-navy bg-navy scale-105 text-white'
                  : complete
                    ? 'border-sage bg-sage text-white'
                    : 'border-navy/30 bg-card text-muted-foreground'
              )}
              aria-current={current ? 'step' : undefined}
            >
              {step.number}
            </span>
            <span
              className={cn(
                'truncate text-[11px] font-semibold sm:text-xs',
                current ? 'text-navy' : 'text-muted-foreground'
              )}
            >
              {t(step.key)}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
