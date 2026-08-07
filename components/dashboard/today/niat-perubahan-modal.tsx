'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  LockKeyhole,
  Quote,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { apiClient } from '@/lib/api-client';

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

export function NiatPerubahanModal({ onCompleted }: NiatPerubahanModalProps) {
  const t = useTranslations('recoveryDashboard');
  const [step, setStep] = useState<Step>(1);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    const originalBodyOverflow = document.body.style.overflow;
    const originalBodyOverscroll = document.body.style.overscrollBehavior;
    const originalDocOverscroll = document.documentElement.style.overscrollBehavior;

    document.body.style.overflow = 'hidden';
    document.body.style.overscrollBehavior = 'none';
    document.documentElement.style.overscrollBehavior = 'none';

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.body.style.overscrollBehavior = originalBodyOverscroll;
      document.documentElement.style.overscrollBehavior = originalDocOverscroll;
    };
  }, []);

  const [quiz, setQuiz] = useState<QuizAnswers>({
    school_impact: '',
    money_spent: '',
    screen_time: '',
    quit_attempts: '',
    quit_motivation: '',
  });
  const [intentionText, setIntentionText] = useState('');

  const answeredCount = Object.values(quiz).filter((v) => v !== '').length;
  const quizCompleted = answeredCount === 5;
  const step2Completed = intentionText.trim().length > 0;

  const updateQuiz = (field: keyof QuizAnswers, value: string) => {
    setQuiz((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError(false);
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
    } catch {
      setSaveError(true);
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
    'Saya ingin fokus menyelesaikan kuliah dan tugas dengan tenang.',
    'Saya ingin menata ulang keuangan dan mulai menabung untuk masa depan.',
    'Saya ingin pikiran lebih damai, bebas dari rasa cemas dan gelisah.',
    'Saya ingin menjaga kepercayaan keluarga dan orang-orang terdekat.',
  ];

  return (
    <Dialog
      open
      disablePointerDismissal
      onOpenChange={(nextOpen, eventDetails) => {
        if (!nextOpen) eventDetails.cancel();
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="shadow-float border-border/80 bg-card/98 relative flex max-h-[min(92dvh,680px)] w-full flex-col gap-0 overflow-hidden rounded-3xl p-0 backdrop-blur-xl sm:max-w-[38rem]"
      >
        {/* Header with Gamblock logo */}
        <DialogHeader className="border-border/70 bg-gradient-to-r from-azure/40 via-sky-light/20 to-card shrink-0 border-b px-5 py-3.5 sm:px-6">
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
              <DialogTitle className="text-navy text-base leading-tight font-bold sm:text-lg">
                {t('niatPerubahanTitle')}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground mt-0.5 text-xs leading-relaxed">
                {t('niatPerubahanDescription')}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

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
                      ? 'Refleksi'
                      : s === 2
                        ? 'Niat'
                        : 'Konfirmasi'}
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

        {/* Modal Scrollable Body - rigid min-h-0 and overscroll-contain */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 py-4 sm:px-6">
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
                  {answeredCount}/5 Terjawab
                </span>
              </div>

              <div className="space-y-3">
                {questions.map(({ key, label, index }) => (
                  <fieldset
                    key={key}
                    className="border-border/70 bg-card/60 hover:border-navy/30 space-y-2 rounded-2xl border p-3.5 transition-colors shadow-xs"
                  >
                    <legend className="text-foreground flex items-center gap-2 text-xs font-semibold sm:text-sm">
                      <span
                        className={`flex size-5 shrink-0 items-center justify-center rounded-md text-[0.625rem] font-bold transition-colors ${
                          quiz[key] !== ''
                            ? 'bg-navy text-white'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {quiz[key] !== '' ? <Check className="size-3" /> : index}
                      </span>
                      <span>{label}</span>
                    </legend>

                    <div
                      role="radiogroup"
                      aria-label={label}
                      className="flex flex-wrap gap-2 pt-0.5"
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
                  </fieldset>
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
                  <Sparkles className="text-navy size-3.5" />
                  Inspirasi Cepat (Klik untuk memilih contoh):
                </p>
                <div className="flex flex-col gap-1.5">
                  {quickStarters.map((starter, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setIntentionText(starter)}
                      className="border-border/60 bg-white/90 dark:bg-card hover:border-navy/40 hover:bg-navy/5 hover:text-navy group flex items-start gap-2 rounded-xl border p-2 text-left text-xs transition-all duration-200"
                    >
                      <span className="text-muted-foreground group-hover:text-navy mt-0.5 shrink-0 text-[0.6875rem]">
                        ✦
                      </span>
                      <span className="text-foreground/90 group-hover:text-navy leading-snug">
                        {starter}
                      </span>
                    </button>
                  ))}
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
                    {intentionText.length}/240 karakter
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
                    Tips: Niat yang tulus dan spesifik akan menjadi pegangan
                    terkuatmu saat menghadapi dorongan impulsif.
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
                    Niat Pemulihanmu
                  </p>
                  <span className="bg-sage/15 text-sage-dark border-sage/30 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[0.625rem] font-semibold">
                    <CheckCircle2 className="size-3" />
                    Siap Disimpan
                  </span>
                </div>
                <blockquote className="text-navy border-navy/30 mt-1 border-l-2 pl-3 text-sm leading-relaxed font-semibold italic">
                  &ldquo;{intentionText}&rdquo;
                </blockquote>
              </div>

              {/* Answers Summary Grid */}
              <div className="border-border/70 bg-card space-y-2.5 rounded-2xl border p-3.5 shadow-xs">
                <p className="text-muted-foreground text-[0.6875rem] font-bold tracking-wider uppercase">
                  Ringkasan Refleksi Awal
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

              {saveError && (
                <div className="border-crimson/30 bg-crimson/10 text-crimson rounded-xl border p-3 text-xs leading-relaxed">
                  {t('niatSaveError')}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Action Footer - pinned and always visible */}
        <div className="border-border/70 bg-card/98 shrink-0 z-10 flex items-center justify-between border-t px-5 py-3 sm:px-6">
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
            ) : (
              <div />
            )}
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

        {/* Security & Privacy Banner */}
        <p className="border-border/60 bg-muted/40 text-muted-foreground shrink-0 flex items-center justify-center gap-1.5 border-t px-4 py-2 text-center text-[0.6875rem] leading-none sm:px-6">
          <LockKeyhole
            className="text-navy/70 size-3 shrink-0"
            aria-hidden="true"
          />
          <span>{t('niatPerubahanStorage')}</span>
        </p>
      </DialogContent>
    </Dialog>
  );
}
