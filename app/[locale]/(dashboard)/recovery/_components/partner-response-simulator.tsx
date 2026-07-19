'use client';

import { useMemo, useState } from 'react';
import {
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  HeartHandshake,
  LockKeyhole,
  MessageCircle,
  RefreshCcw,
  ShieldCheck,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { useEducationModule, useEducationModules } from '@/hooks/use-education';
import { toastError } from '@/lib/feedback';

export function PartnerResponseSimulator() {
  const locale = useLocale();
  const t = useTranslations('partnerSimulator');
  const library = useEducationModules(locale);
  const simulator = useMemo(
    () =>
      library.modules.find(
        (module) => module.experience_type === 'partner_response_simulator'
      ),
    [library.modules]
  );
  const detail = useEducationModule(simulator?.slug ?? '', locale);
  const [sectionIndex, setSectionIndex] = useState(0);
  const [choice, setChoice] = useState('');
  const [result, setResult] = useState<{
    correct: boolean;
    explanation: string;
  } | null>(null);
  const section = detail.module?.sections[sectionIndex];
  const check = section?.knowledge_check;

  const submit = async () => {
    if (!check || !choice) return;
    try {
      const answer = await detail.answerCheck(check.id, choice);
      setResult(answer);
    } catch (error) {
      toastError(error, t('answerError'));
    }
  };

  if (library.loading || (simulator && detail.loading)) {
    return (
      <p className="text-muted-foreground py-12 text-center text-sm">
        {t('loading')}
      </p>
    );
  }

  if (!simulator || !detail.module || !section || !check) {
    return (
      <div className="border-border bg-card rounded-3xl border p-5 text-center shadow-sm sm:p-8">
        <BookOpenCheck
          className="text-cyan-dark mx-auto size-10"
          aria-hidden="true"
        />
        <h2 className="text-navy mt-4 text-xl font-bold">{t('emptyTitle')}</h2>
        <p className="text-muted-foreground mx-auto mt-2 max-w-xl text-sm leading-6">
          {t('emptyBody')}
        </p>
      </div>
    );
  }

  const choices = check.choices;
  const completed = detail.module.progress.correct_check_ids.includes(check.id);

  return (
    <div className="space-y-5">
      <section className="border-border bg-card grid overflow-hidden rounded-3xl border shadow-[0_24px_70px_-48px_rgba(23,38,77,0.7)] sm:rounded-[2rem] xl:grid-cols-[1.35fr_0.65fr]">
        <div className="p-4 sm:p-7">
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-cyan-dark text-xs font-bold tracking-[0.14em] uppercase">
                {t('eyebrow')}
              </p>
              <h2 className="text-navy mt-2 text-xl leading-tight font-bold break-words sm:text-2xl">
                {detail.module.title}
              </h2>
            </div>
            <span className="bg-navy rounded-full px-3 py-2 text-xs font-semibold text-white">
              {t('scenario', {
                current: sectionIndex + 1,
                total: detail.module.sections.length,
              })}
            </span>
          </div>

          <div className="mt-5 grid gap-5 sm:mt-6 lg:grid-cols-[0.75fr_1.25fr]">
            <div className="flex min-h-64 flex-col overflow-hidden rounded-2xl border border-[#ded6c6] bg-[#f5f1e8] p-4 sm:min-h-80 sm:rounded-[2rem] sm:p-5">
              <div className="flex items-center gap-3 border-b border-[#ded6c6] pb-4">
                <span className="bg-cyan/20 text-navy flex size-11 items-center justify-center rounded-full">
                  <MessageCircle className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-navy font-bold">{t('student')}</p>
                  <p className="text-sage text-xs">{t('available')}</p>
                </div>
              </div>
              <div className="mt-5 rounded-2xl rounded-tl-sm bg-white p-4 shadow-sm">
                <p className="text-navy text-sm leading-6">{section.title}</p>
              </div>
              <p className="text-muted-foreground mt-auto pt-5 text-xs leading-5">
                {t('fictional')}
              </p>
            </div>

            <div>
              <h3 className="text-navy text-lg font-bold">{check.question}</h3>
              <p className="text-muted-foreground mt-1 text-sm">
                {t('choose')}
              </p>
              <div className="mt-4 space-y-3">
                {choices.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setChoice(item.id);
                      setResult(null);
                    }}
                    className={`focus-visible:ring-navy/30 flex min-h-16 w-full cursor-pointer items-start gap-3 rounded-2xl border p-3 text-left text-sm leading-6 transition-colors outline-none focus-visible:ring-2 sm:p-4 ${choice === item.id ? 'border-cyan bg-cyan/8 text-navy' : 'border-border hover:border-navy/25'}`}
                    aria-pressed={choice === item.id}
                  >
                    <span
                      className={`mt-1 size-4 shrink-0 rounded-full border-2 ${choice === item.id ? 'border-cyan bg-cyan shadow-[inset_0_0_0_3px_white]' : 'border-muted-foreground/45'}`}
                    />
                    {item.text}
                  </button>
                ))}
              </div>
              <div className="mt-4 grid gap-2 sm:flex sm:flex-wrap">
                <Button
                  className="w-full sm:w-auto"
                  onClick={() => void submit()}
                  disabled={!choice}
                >
                  {t('check')}
                </Button>
                {result && !result.correct ? (
                  <Button
                    className="w-full sm:w-auto"
                    variant="outline"
                    onClick={() => {
                      setChoice('');
                      setResult(null);
                    }}
                  >
                    <RefreshCcw className="size-4" aria-hidden="true" />
                    {t('retry')}
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <aside className="border-border bg-muted/30 border-t p-4 sm:p-7 xl:border-t-0 xl:border-l">
          <div className="flex gap-2" aria-label={t('progress')}>
            {detail.module.sections.map((item, index) => (
              <span
                key={item.id}
                className={`h-2 flex-1 rounded-full ${index < sectionIndex || detail.module?.progress.correct_check_ids.includes(item.knowledge_check?.id ?? '') ? 'bg-sage' : index === sectionIndex ? 'bg-cyan' : 'bg-border'}`}
              />
            ))}
          </div>
          <div className="bg-sage/15 text-sage mt-6 flex size-12 items-center justify-center rounded-2xl">
            {result?.correct || completed ? (
              <CheckCircle2 className="size-6" aria-hidden="true" />
            ) : (
              <HeartHandshake className="size-6" aria-hidden="true" />
            )}
          </div>
          <h3 className="text-navy mt-4 text-lg font-bold">
            {result
              ? result.correct
                ? t('whyTitle')
                : t('learnTitle')
              : t('coachingTitle')}
          </h3>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            {result?.explanation || t('coachingBody')}
          </p>
          {result?.correct &&
          sectionIndex < detail.module.sections.length - 1 ? (
            <Button
              className="mt-5 w-full"
              onClick={() => {
                setSectionIndex((value) => value + 1);
                setChoice('');
                setResult(null);
              }}
            >
              {t('next')}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
          ) : null}
          <div className="border-border mt-7 border-t pt-5">
            <div className="flex items-start gap-3">
              <ShieldCheck
                className="text-navy mt-0.5 size-5 shrink-0"
                aria-hidden="true"
              />
              <div>
                <p className="text-navy text-sm font-bold">{t('reviewed')}</p>
                <p className="text-muted-foreground mt-1 text-xs leading-5">
                  {detail.module.reviewer_name} · {detail.module.reviewer_role}
                </p>
              </div>
            </div>
          </div>
        </aside>
      </section>

      <div className="border-navy/20 bg-navy/[0.04] flex items-start gap-3 rounded-2xl border p-4">
        <LockKeyhole
          className="text-navy mt-0.5 size-5 shrink-0"
          aria-hidden="true"
        />
        <div>
          <p className="text-navy text-sm font-bold">{t('privacyTitle')}</p>
          <p className="text-muted-foreground mt-1 text-sm leading-6">
            {t('privacyBody')}
          </p>
        </div>
      </div>
    </div>
  );
}
