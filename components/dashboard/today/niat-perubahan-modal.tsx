'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  GraduationCap,
  Lightbulb,
  LockKeyhole,
  Plus,
  Quote,
  ShieldCheck,
  Smile,
  Users,
  Wallet,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { apiClient } from '@/lib/api-client';
import { toastError } from '@/lib/feedback';

interface QuizAnswers {
  school_impact: string;
  money_spent: string;
  screen_time: string;
  quit_attempts: string;
  quit_motivation: string;
}

interface NiatPerubahanModalProps {
  onCompleted: () => void;
}

type Step = 1 | 2 | 3;

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export function NiatPerubahanModal({ onCompleted }: NiatPerubahanModalProps) {
  const t = useTranslations('recoveryDashboard');
  const containerRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const [step, setStep] = useState<Step>(1);
  const [saving, setSaving] = useState(false);

  const [quiz, setQuiz] = useState<QuizAnswers>({
    school_impact: '',
    money_spent: '',
    screen_time: '',
    quit_attempts: '',
    quit_motivation: '',
  });
  const [intentionText, setIntentionText] = useState('');

  useEffect(() => {
    document.documentElement.style.overflow = 'hidden';
    previouslyFocusedRef.current = document.activeElement as HTMLElement;
    containerRef.current?.focus();

    return () => {
      document.documentElement.style.removeProperty('overflow');
      previouslyFocusedRef.current?.focus();
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      return;
    }
    if (e.key !== 'Tab') return;

    const container = containerRef.current;
    if (!container) return;

    const focusable = container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  const answeredCount = Object.values(quiz).filter((v) => v !== '').length;
  const quizCompleted = answeredCount === 5;
  const step2Completed = intentionText.trim().length > 0;

  const updateQuiz = (field: keyof QuizAnswers, value: string) => {
    setQuiz((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiClient('/intentions', {
        method: 'POST',
        body: JSON.stringify({
          intention_text: intentionText.trim(),
          status: 'active',
          school_impact: quiz.school_impact,
          money_spent: quiz.money_spent,
          screen_time: quiz.screen_time,
          quit_attempts: quiz.quit_attempts,
          quit_motivation: quiz.quit_motivation,
        }),
      });
      onCompleted();
    } catch (err) {
      toastError(err, t('niatSaveError'));
    } finally {
      setSaving(false);
    }
  };

  const quizOptions: Record<
    keyof QuizAnswers,
    { value: string; label: string }[]
  > = {
    school_impact: [
      { value: 'never', label: t('niatQuiz1OptionNever') },
      { value: 'almost', label: t('niatQuiz1OptionAlmost') },
      { value: 'happened', label: t('niatQuiz1OptionHappened') },
    ],
    money_spent: [
      { value: 'under_500k', label: t('niatQuiz2OptionUnder500k') },
      { value: '500k_5m', label: t('niatQuiz2Option500k5m') },
      { value: '5m_20m', label: t('niatQuiz2Option5m20m') },
      { value: 'over_20m', label: t('niatQuiz2OptionOver20m') },
      { value: 'unknown', label: t('niatQuiz2OptionUnknown') },
    ],
    screen_time: [
      { value: 'under_1h', label: t('niatQuiz3OptionUnder1h') },
      { value: '1h_3h', label: t('niatQuiz3Option1h3h') },
      { value: '3h_6h', label: t('niatQuiz3Option3h6h') },
      { value: 'over_6h', label: t('niatQuiz3OptionOver6h') },
    ],
    quit_attempts: [
      { value: 'never', label: t('niatQuiz4OptionNever') },
      { value: 'once', label: t('niatQuiz4OptionOnce') },
      { value: 'multiple', label: t('niatQuiz4OptionMultiple') },
    ],
    quit_motivation: [
      { value: 'uncertain', label: t('niatQuiz5OptionUncertain') },
      { value: 'somewhat', label: t('niatQuiz5OptionSomewhat') },
      { value: 'very', label: t('niatQuiz5OptionVery') },
      { value: 'determined', label: t('niatQuiz5OptionDetermined') },
    ],
  };

  const questions: { key: keyof QuizAnswers; label: string; index: number }[] = [
    { key: 'school_impact', label: t('niatQuiz1Question'), index: 1 },
    { key: 'money_spent', label: t('niatQuiz2Question'), index: 2 },
    { key: 'screen_time', label: t('niatQuiz3Question'), index: 3 },
    { key: 'quit_attempts', label: t('niatQuiz4Question'), index: 4 },
    { key: 'quit_motivation', label: t('niatQuiz5Question'), index: 5 },
  ];

  const quickStarters = [
    {
      icon: GraduationCap,
      text: t('niatInspirasi1'),
    },
    {
      icon: Wallet,
      text: t('niatInspirasi2'),
    },
    {
      icon: Smile,
      text: t('niatInspirasi3'),
    },
    {
      icon: Users,
      text: t('niatInspirasi4'),
    },
  ];

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="animate-in fade-in-0 motion-reduce:animate-none absolute inset-0 bg-black/10 duration-200 supports-backdrop-filter:backdrop-blur-xs"
        aria-hidden="true"
      />

      {/* Modal container */}
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="niat-perubahan-title"
        aria-describedby="niat-perubahan-desc"
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className="ring-foreground/10 shadow-float border-border/80 bg-card/98 animate-in fade-in-0 zoom-in-95 motion-reduce:animate-none relative flex h-[min(92dvh,640px)] w-full max-h-[min(92dvh,640px)] flex-col gap-0 overflow-hidden rounded-3xl border p-0 text-sm backdrop-blur-xl ring-1 duration-200 outline-none focus:outline-none sm:max-w-[38rem]"
      >
        {/* Header with Gamblock logo */}
        <div className="border-border/70 bg-gradient-to-r from-azure/40 via-sky-light/20 to-card shrink-0 border-b px-5 py-3.5 sm:px-6">
          <div className="flex items-center gap-3.5">
            <span
              className="border-border/80 bg-white/95 dark:bg-card flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl shadow-xs ring-1 ring-navy/10"
              aria-hidden="true"
            >
              <Image
                src="/images/gamblock-1.png"
                alt="Gamblock-AI"
                width={36}
                height={36}
                className="size-7.5 object-contain"
              />
            </span>
            <div className="min-w-0">
              <h2
                id="niat-perubahan-title"
                className="text-navy text-base leading-tight font-bold sm:text-lg"
              >
                {t('niatPerubahanTitle')}
              </h2>
              <p
                id="niat-perubahan-desc"
                className="text-muted-foreground mt-0.5 text-xs leading-relaxed"
              >
                {t('niatPerubahanDescription')}
              </p>
            </div>
          </div>
        </div>

        {/* Stepper with progress bar - horizontally centered */}
        <div className="border-border/60 bg-muted/20 shrink-0 border-b px-5 py-2.5 sm:px-6">
          <div className="mx-auto flex max-w-xs sm:max-w-sm items-center justify-center gap-2 sm:gap-3">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex flex-1 items-center gap-2">
                <div
                  className={`flex size-6 shrink-0 items-center justify-center rounded-full text-[0.6875rem] font-bold transition-all duration-300 ${
                    s < step
                      ? 'bg-sage text-white shadow-xs'
                      : s === step
                        ? 'bg-navy text-white ring-4 ring-navy/15 shadow-xs scale-105'
                        : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {s < step ? <Check className="size-3.5 stroke-[2.5]" /> : s}
                </div>
                <div className="hidden sm:block min-w-0">
                  <p
                    className={`truncate text-[0.6875rem] font-semibold transition-colors ${
                      s === step
                        ? 'text-navy'
                        : s < step
                          ? 'text-sage-dark'
                          : 'text-muted-foreground'
                    }`}
                  >
                    {s === 1
                      ? t('niatStep1Short')
                      : s === 2
                        ? t('niatStep2Short')
                        : t('niatStep3Short')}
                  </p>
                </div>
                {s < 3 && (
                  <div
                    className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                      s < step ? 'bg-sage' : 'bg-muted/80'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 min-h-0 relative">
          <div className="absolute inset-0 overflow-y-auto overscroll-contain px-5 py-4 sm:px-6">
          {/* STEP 1: Assessment Quiz */}
          {step === 1 && (
            <div className="space-y-3.5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-navy flex items-center gap-2 text-sm font-bold sm:text-base">
                    {t('niatStep1Title')}
                  </h3>
                  <p className="text-muted-foreground mt-0.5 text-xs leading-relaxed">
                    {t('niatStep1Description')}
                  </p>
                </div>
                <span
                  className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[0.6875rem] font-semibold transition-colors ${
                    quizCompleted
                      ? 'bg-sage/15 text-sage-dark border border-sage/30'
                      : 'bg-azure text-navy/80'
                  }`}
                >
                  {quizCompleted && <Check className="size-3" />}
                  {answeredCount}
                  {t('niatAnsweredCountSuffix')}
                </span>
              </div>

              <div className="space-y-3">
                {questions.map(({ key, label, index }) => (
                  <div
                    key={key}
                    role="group"
                    aria-labelledby={`question-label-${key}`}
                    className="border-border/70 bg-card/70 hover:border-navy/30 space-y-2.5 rounded-2xl border p-3.5 sm:p-4 transition-colors shadow-xs"
                  >
                    <div className="flex items-start gap-2.5">
                      <span
                        className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-all duration-200 ${
                          quiz[key] !== ''
                            ? 'bg-navy text-white shadow-xs'
                            : 'bg-muted/80 text-muted-foreground border border-border/60'
                        }`}
                      >
                        {quiz[key] !== '' ? (
                          <Check className="size-3.5 stroke-[2.5]" />
                        ) : (
                          index
                        )}
                      </span>
                      <p
                        id={`question-label-${key}`}
                        className="text-foreground text-xs font-semibold sm:text-sm leading-snug pt-0.5"
                      >
                        {label}
                      </p>
                    </div>

                    <div
                      role="radiogroup"
                      aria-label={label}
                      className="flex flex-wrap gap-2 pl-0 sm:pl-8.5 pt-0.5"
                    >
                      {quizOptions[key].map((option) => {
                        const isSelected = quiz[key] === option.value;
                        return (
                          <label
                            key={option.value}
                            className={`group inline-flex min-h-[36px] cursor-pointer items-center justify-center rounded-xl border px-3.5 py-1.5 text-xs font-medium transition-all duration-200 ${
                              isSelected
                                ? 'border-navy bg-gradient-to-r from-navy/10 via-azure/40 to-navy/5 text-navy font-semibold ring-1.5 ring-navy/30 shadow-xs scale-[1.01]'
                                : 'border-border/80 bg-white/80 dark:bg-card text-foreground/85 hover:border-navy/40 hover:bg-navy/5 hover:text-navy'
                            }`}
                          >
                            <input
                              type="radio"
                              name={key}
                              value={option.value}
                              checked={isSelected}
                              onChange={() => updateQuiz(key, option.value)}
                              className="sr-only"
                            />
                            <span className="flex items-center gap-1.5">
                              {isSelected && (
                                <span className="bg-navy size-1.5 rounded-full" />
                              )}
                              {option.label}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: Write Intention */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-navy text-sm font-bold sm:text-base">
                  {t('niatStep2Title')}
                </h3>
                <p className="text-muted-foreground mt-0.5 text-xs leading-relaxed">
                  {t('niatStep2Description')}
                </p>
              </div>

              {/* Quick Inspiration Starters */}
              <div className="border-border/70 bg-gradient-to-br from-azure/40 via-sky-light/20 to-card space-y-2 rounded-2xl border p-3.5">
                <p className="text-navy flex items-center gap-1.5 text-xs font-semibold">
                  <Lightbulb className="text-navy size-4 shrink-0" />
                  {t('niatInspirasiTitle')}
                </p>
                <div className="flex flex-col gap-1.5">
                  {quickStarters.map((starter, idx) => {
                    const StarterIcon = starter.icon;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setIntentionText(starter.text)}
                        className="border-border/60 bg-white/90 dark:bg-card hover:border-navy/40 hover:bg-navy/5 hover:text-navy group flex items-start gap-2.5 rounded-xl border p-2.5 text-left text-xs transition-all duration-200 shadow-2xs"
                      >
                        <StarterIcon className="text-navy/70 group-hover:text-navy mt-0.5 size-3.5 shrink-0 transition-colors" />
                        <span className="text-foreground/90 group-hover:text-navy leading-snug flex-1">
                          {starter.text}
                        </span>
                        <Plus className="text-muted-foreground/60 group-hover:text-navy size-3.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Textarea Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="niat-perubahan-text"
                    className="text-foreground text-xs font-semibold"
                  >
                    {t('niatInputLabel')}
                  </label>
                  <span
                    className={`text-[0.6875rem] font-medium transition-colors ${
                      intentionText.length > 200
                        ? 'text-amber font-bold'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {intentionText.length}
                    {t('niatCharCountSuffix')}
                  </span>
                </div>

                <Textarea
                  id="niat-perubahan-text"
                  value={intentionText}
                  onChange={(e) => setIntentionText(e.target.value)}
                  placeholder={t('niatInputPlaceholder')}
                  maxLength={240}
                  rows={4}
                  className="focus:border-navy focus:ring-navy/20 border-border/80 min-h-24 rounded-2xl bg-white/90 px-3.5 py-3 text-sm leading-relaxed dark:bg-card"
                />

                <div className="bg-muted/40 border-border/50 text-muted-foreground flex items-center gap-2 rounded-xl border px-3 py-2 text-xs leading-snug">
                  <ShieldCheck className="text-navy size-4 shrink-0" />
                  <span>
                    {t('niatInputTip')}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Review & Confirm */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-navy text-sm font-bold sm:text-base">
                  {t('niatStep3Title')}
                </h3>
                <p className="text-muted-foreground mt-0.5 text-xs leading-relaxed">
                  {t('niatStep3Description')}
                </p>
              </div>

              {/* Keepsake Intention Highlight Card */}
              <div className="border-navy/20 bg-gradient-to-br from-azure/50 via-sky-light/20 to-card relative space-y-2 overflow-hidden rounded-2xl border p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-navy/80 flex items-center gap-1.5 text-[0.6875rem] font-bold tracking-wider uppercase">
                    <Quote className="text-navy size-3.5" />
                    {t('niatReviewIntentionLabel')}
                  </p>
                  <span className="bg-sage/15 text-sage-dark border-sage/30 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[0.625rem] font-semibold">
                    <CheckCircle2 className="size-3" />
                    {t('niatReviewReadyBadge')}
                  </span>
                </div>
                <blockquote className="text-navy border-navy/30 mt-1 border-l-2 pl-3 text-sm leading-relaxed font-semibold italic">
                  &ldquo;{intentionText}&rdquo;
                </blockquote>
              </div>

              {/* Answers Summary Grid */}
              <div className="border-border/70 bg-card space-y-2.5 rounded-2xl border p-3.5 shadow-xs">
                <p className="text-muted-foreground text-[0.6875rem] font-bold tracking-wider uppercase">
                  {t('niatReviewAnswersTitle')}
                </p>
                <div className="divide-border/60 divide-y text-xs">
                  {questions.map(({ key, label }) => {
                    const selected = quizOptions[key].find(
                      (o) => o.value === quiz[key]
                    );
                    return (
                      <div
                        key={key}
                        className="flex items-center justify-between gap-3 py-2 first:pt-0 last:pb-0"
                      >
                        <span className="text-muted-foreground min-w-0 truncate text-xs">
                          {label}
                        </span>
                        <span className="border-navy/15 bg-azure/50 text-navy shrink-0 rounded-lg border px-2.5 py-1 text-xs font-semibold">
                          {selected?.label ?? '—'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
          </div>
        </div>

        {/* Combined Footer — single shrink-0 unit */}
        <div className="shrink-0">
          {/* Action row */}
          <div className="border-border/70 bg-card/98 z-10 flex min-h-[3.25rem] items-center justify-between border-t px-5 py-3 sm:px-6">
            <div>
              {step > 1 ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep((s) => (s - 1) as Step)}
                  className="text-muted-foreground hover:text-foreground gap-1.5 rounded-xl text-xs"
                >
                  <ArrowLeft className="size-3.5" />
                  {t('niatBack')}
                </Button>
              ) : null}
            </div>

            <div className="flex items-center gap-2">
              {step === 1 && (
                <Button
                  type="button"
                  size="sm"
                  disabled={!quizCompleted}
                  onClick={() => setStep(2)}
                  className="bg-navy hover:bg-navy-light text-primary-foreground shadow-xs gap-1.5 rounded-xl px-5 py-2.5 text-xs font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40"
                >
                  {t('niatNext')}
                  <ArrowRight className="size-3.5" />
                </Button>
              )}

              {step === 2 && (
                <Button
                  type="button"
                  size="sm"
                  disabled={!step2Completed}
                  onClick={() => setStep(3)}
                  className="bg-navy hover:bg-navy-light text-primary-foreground shadow-xs gap-1.5 rounded-xl px-5 py-2.5 text-xs font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40"
                >
                  {t('niatNext')}
                  <ArrowRight className="size-3.5" />
                </Button>
              )}

              {step === 3 && (
                <Button
                  type="button"
                  size="sm"
                  disabled={saving}
                  onClick={handleSave}
                  className="bg-navy hover:bg-navy-light text-primary-foreground shadow-xs gap-1.5 rounded-xl px-6 py-2.5 text-xs font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <span className="size-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      {t('niatSaving')}
                    </>
                  ) : (
                    <>
                      <Check className="size-3.5" />
                      {t('niatSave')}
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Privacy row */}
          <p className="border-border/60 bg-muted/40 text-muted-foreground flex items-center justify-center gap-1.5 border-t px-4 py-2 text-center text-[0.6875rem] leading-tight sm:px-6">
            <LockKeyhole
              className="text-navy/70 size-3 shrink-0"
              aria-hidden="true"
            />
            <span>{t('niatPerubahanStorage')}</span>
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
}