import { useState } from 'react';
import { Check, Clock3, Play, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';

interface SkillPracticeProps {
  title: string;
  summary: string;
  practice: string;
  minutes: number;
}

export function SkillPractice({
  title,
  summary,
  practice,
  minutes,
}: SkillPracticeProps) {
  const t = useTranslations('recoveryDashboard');
  const hubT = useTranslations('recoveryHub');
  const [open, setOpen] = useState(false);

  return (
    <article className="border-border bg-card shadow-soft hover:border-navy/35 hover:shadow-card flex h-full flex-col rounded-2xl border p-5 transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-px motion-reduce:transform-none motion-reduce:transition-none">
      <div className="flex items-start justify-between gap-3">
        <span className="bg-navy flex size-10 items-center justify-center rounded-xl text-white shadow-sm">
          <Sparkles className="size-5" aria-hidden="true" />
        </span>
        <span className="bg-muted text-muted-foreground inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold">
          <Clock3 className="size-3.5" aria-hidden="true" />
          {t('minutes', { count: minutes })}
        </span>
      </div>
      <h3 className="text-navy mt-4 text-lg font-bold">{title}</h3>
      <p className="text-muted-foreground mt-2 flex-1 text-sm leading-6">
        {summary}
      </p>
      {open ? (
        <div
          className="border-border bg-muted/35 text-foreground mt-4 rounded-xl border p-4 text-sm leading-7"
          role="region"
          aria-live="polite"
        >
          {practice}
        </div>
      ) : null}
      <Button
        type="button"
        variant={open ? 'outline' : 'primary'}
        className="mt-5 h-11 w-full"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        {open ? (
          <Check className="size-4" aria-hidden="true" />
        ) : (
          <Play className="size-4" aria-hidden="true" />
        )}
        {open ? t('skillClose') : hubT('learnMore')}
      </Button>
    </article>
  );
}
