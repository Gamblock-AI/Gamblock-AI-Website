'use client';

import { useState } from 'react';
import {
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  HeartHandshake,
  LockKeyhole,
  MessageCircle,
  RefreshCcw,
  ShieldCheck,
  X,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useEducationModule } from '@/hooks/use-education';
import { toastError } from '@/lib/feedback';

type PartnerResponsePracticeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  moduleSlug: string;
};

export function PartnerResponsePracticeDialog({
  open,
  onOpenChange,
  moduleSlug,
}: PartnerResponsePracticeDialogProps) {
  const locale = useLocale();
  const t = useTranslations('partnerSimulator');
  const common = useTranslations('commonUi');
  const detail = useEducationModule(moduleSlug, locale);
  const [sectionIndex, setSectionIndex] = useState(0);
  const [choice, setChoice] = useState('');
  const [result, setResult] = useState<{
    correct: boolean;
    explanation: string;
  } | null>(null);
  const educationModule = detail.module;
  const section = educationModule?.sections[sectionIndex];
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

  const advance = () => {
    setSectionIndex((value) => value + 1);
    setChoice('');
    setResult(null);
  };

  const completed =
    check && educationModule
      ? educationModule.progress.correct_check_ids.includes(check.id)
      : false;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[calc(100dvh-2rem)] gap-0 overflow-y-auto rounded-[2rem] p-0 sm:max-w-4xl"
        showCloseButton={false}
      >
        <DialogHeader className="border-border bg-card sticky top-0 z-10 border-b px-5 py-5 pr-14 text-left sm:px-7 sm:pr-16">
          <p className="text-cyan-dark text-xs font-bold tracking-[0.14em] uppercase">
            {t('eyebrow')}
          </p>
          <DialogTitle className="text-navy text-xl leading-tight font-bold sm:text-2xl">
            {educationModule?.title ?? t('title')}
          </DialogTitle>
          <DialogDescription className="max-w-2xl leading-6">
            {t('description')}
          </DialogDescription>
          <DialogClose
            className="absolute top-4 right-4 sm:top-5 sm:right-5"
            aria-label={common('close')}
            render={<Button type="button" variant="ghost" size="icon" />}
          >
            <X className="size-5" aria-hidden="true" />
            <span className="sr-only">{common('close')}</span>
          </DialogClose>
        </DialogHeader>

        <div className="p-5 sm:p-7">
          {detail.loading ? (
            <p className="text-muted-foreground py-12 text-center text-sm">
              {t('loading')}
            </p>
          ) : !educationModule ||
            !section ||
            !check ||
            educationModule.sections.length === 0 ? (
            <div className="py-8 text-center sm:py-12">
              <BookOpenCheck
                className="text-cyan-dark mx-auto size-10"
                aria-hidden="true"
              />
              <h2 className="text-navy mt-4 text-xl font-bold">
                {t('emptyTitle')}
              </h2>
              <p className="text-muted-foreground mx-auto mt-2 max-w-xl text-sm leading-6">
                {t('emptyBody')}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
              <div className="flex h-full flex-col">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-navy text-sm font-bold">
                    {t('scenario', {
                      current: sectionIndex + 1,
                      total: educationModule.sections.length,
                    })}
                  </p>
                  <div className="flex gap-1.5" aria-label={t('progress')}>
                    {educationModule.sections.map((item, index) => (
                      <span
                        key={item.id}
                        className={`h-2.5 w-7 rounded-full transition-colors ${
                          index < sectionIndex ||
                          educationModule.progress.correct_check_ids.includes(
                            item.knowledge_check?.id ?? ''
                          )
                            ? 'bg-sage'
                            : index === sectionIndex
                              ? 'bg-navy'
                              : 'bg-border'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="border-navy/15 bg-azure/35 mt-3 rounded-2xl border p-3.5 sm:p-4">
                  <div className="flex items-center gap-3">
                    <span className="bg-navy flex size-10 shrink-0 items-center justify-center rounded-xl text-white">
                      <MessageCircle className="size-5" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-navy text-sm font-bold">
                        {t('student')}
                      </p>
                      <p className="text-sage text-xs font-semibold">
                        {t('available')}
                      </p>
                    </div>
                  </div>
                  <p className="border-border bg-card text-navy mt-3 rounded-2xl rounded-tl-xs border p-3.5 text-sm leading-6 font-medium">
                    {section.title}
                  </p>
                  <p className="text-muted-foreground mt-4 text-xs leading-5">
                    {t('fictional')}
                  </p>
                </div>

                <div className="border-navy/20 bg-navy/[0.04] mt-4 flex items-start gap-3 rounded-2xl border p-3.5">
                  <LockKeyhole
                    className="text-navy mt-0.5 size-5 shrink-0"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-navy text-sm font-bold">
                      {t('privacyTitle')}
                    </p>
                    <p className="text-muted-foreground mt-1 text-xs leading-5">
                      {t('privacyBody')}
                    </p>
                  </div>
                </div>

                <div className="border-border mt-4 flex items-start gap-3 border-t pt-4">
                  <ShieldCheck
                    className="text-navy mt-0.5 size-5 shrink-0"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-navy text-sm font-bold">
                      {t('reviewed')}
                    </p>
                    <p className="text-muted-foreground mt-1 text-xs leading-5">
                      {educationModule.reviewer_name} ·{' '}
                      {educationModule.reviewer_role}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex h-full flex-col">
                <h2 className="text-navy text-lg leading-7 font-bold">
                  {check.question}
                </h2>
                <p className="text-muted-foreground mt-1 text-sm">
                  {t('choose')}
                </p>
                <div className="mt-3 space-y-2.5">
                  {check.choices.map((item) => {
                    const selected = choice === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setChoice(item.id);
                          setResult(null);
                        }}
                        className={`focus-visible:ring-navy/30 flex min-h-12 w-full cursor-pointer items-center gap-3 rounded-2xl border px-3.5 py-2.5 text-left text-sm leading-6 transition-colors outline-none focus-visible:ring-2 ${
                          selected
                            ? 'border-navy bg-azure/50 text-navy ring-navy/20 font-bold ring-2'
                            : 'border-border bg-card text-foreground hover:border-navy/40 hover:bg-muted/40'
                        }`}
                        aria-pressed={selected}
                      >
                        <span
                          className={`size-4 shrink-0 rounded-full border-2 ${
                            selected
                              ? 'border-navy bg-navy shadow-[inset_0_0_0_3px_white]'
                              : 'border-muted-foreground/40'
                          }`}
                        />
                        {item.text}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    onClick={() => void submit()}
                    disabled={!choice}
                  >
                    {t('check')}
                  </Button>
                  {result && !result.correct ? (
                    <Button
                      type="button"
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

                <div className="bg-muted/45 mt-4 rounded-2xl p-3.5">
                  <div className="bg-sage/15 text-sage flex size-10 items-center justify-center rounded-xl">
                    {result?.correct || completed ? (
                      <CheckCircle2 className="size-5" aria-hidden="true" />
                    ) : (
                      <HeartHandshake className="size-5" aria-hidden="true" />
                    )}
                  </div>
                  <h3 className="text-navy mt-3 text-base font-bold">
                    {result
                      ? result.correct
                        ? t('whyTitle')
                        : t('learnTitle')
                      : t('coachingTitle')}
                  </h3>
                  <p className="text-muted-foreground mt-1 text-sm leading-6">
                    {result?.explanation || t('coachingBody')}
                  </p>
                  {result?.correct &&
                  sectionIndex < educationModule.sections.length - 1 ? (
                    <Button
                      type="button"
                      className="mt-4 w-full"
                      onClick={advance}
                    >
                      {t('next')}
                      <ArrowRight className="size-4" aria-hidden="true" />
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
