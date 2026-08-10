'use client';

import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';
import { type FormEvent, type ReactNode, useState } from 'react';
import { ArrowRight, Check, CircleHelp, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { DashboardNotice } from '@/components/dashboard/dashboard-page';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useRecoveryExperience,
  type WeeklyReview,
} from '@/hooks/use-recovery-experience';
import { useReflections } from '@/hooks/use-reflections';
import { toastError, toastSuccess } from '@/lib/feedback';

export function WeeklyReviewSheet({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: () => void;
}) {
  const p = useTranslations('progressExperience');
  const experience = useRecoveryExperience();
  const reflections = useReflections();
  const current = experience.weeklyReview.data;
  const busy = experience.saving || reflections.submitting;

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !busy) onClose();
      }}
    >
      <DialogPortal>
        <DialogOverlay className="bg-navy/55 z-[80] backdrop-blur-sm" />
        <DialogPrimitive.Viewport className="fixed inset-0 z-[80] flex items-end justify-center overflow-y-auto overscroll-contain pt-[max(0.75rem,env(safe-area-inset-top))] sm:items-center sm:p-6">
          <DialogPrimitive.Popup className="ring-foreground/10 bg-card text-popover-foreground data-open:animate-in data-open:fade-in-0 data-open:slide-in-from-bottom-4 data-closed:animate-out data-closed:fade-out-0 relative flex max-h-[calc(100dvh-env(safe-area-inset-top)-0.75rem)] w-full max-w-2xl flex-col overflow-hidden rounded-t-[2rem] shadow-2xl ring-1 duration-200 outline-none motion-reduce:animate-none sm:max-h-[calc(100dvh-3rem)] sm:rounded-[2rem]">
            <DialogHeader className="border-border bg-card relative shrink-0 gap-1 border-b p-5 pr-16 text-left sm:p-7 sm:pr-20">
              <p className="text-cyan-dark text-xs font-bold tracking-[0.14em] uppercase">
                {p('reviewEyebrow')}
              </p>
              <DialogTitle className="text-navy text-2xl leading-tight font-bold">
                {p('reviewTitle')}
              </DialogTitle>
              <DialogDescription className="max-w-xl leading-6">
                {p('reviewBody')}
              </DialogDescription>
              <DialogClose
                disabled={busy}
                className="border-border text-muted-foreground hover:bg-muted hover:text-navy focus-visible:ring-navy/30 absolute top-5 right-5 flex size-11 cursor-pointer items-center justify-center rounded-full border transition-colors outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 sm:top-7 sm:right-7"
                aria-label={p('close')}
              >
                <X className="size-5" aria-hidden="true" />
              </DialogClose>
            </DialogHeader>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:p-7">
              {experience.weeklyReview.loading ? (
                <div className="space-y-4" role="status">
                  <Skeleton className="h-2 w-full rounded-full" />
                  <Skeleton className="h-24 w-full rounded-2xl" />
                  <Skeleton className="h-24 w-full rounded-2xl" />
                  <span className="sr-only">{p('reviewLoading')}</span>
                </div>
              ) : experience.weeklyReview.error || !current ? (
                <DashboardNotice
                  icon={CircleHelp}
                  title={p('reviewLoadError')}
                  tone="amber"
                  role="alert"
                  action={
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => void experience.weeklyReview.refetch()}
                    >
                      {p('retryReview')}
                    </Button>
                  }
                >
                  {p('reviewLoadErrorBody')}
                </DashboardNotice>
              ) : (
                <WeeklyReviewSteps
                  key={current.id ?? current.week_start}
                  current={current}
                  busy={busy}
                  saveWeeklyReview={experience.saveWeeklyReview}
                  createReflection={reflections.createReflection}
                  onSaved={onSaved}
                />
              )}
            </div>
          </DialogPrimitive.Popup>
        </DialogPrimitive.Viewport>
      </DialogPortal>
    </Dialog>
  );
}

type ReviewField = 'selection' | 'adjustment' | 'mission' | 'skill' | 'submit';

function WeeklyReviewSteps({
  current,
  busy,
  saveWeeklyReview,
  createReflection,
  onSaved,
}: {
  current: WeeklyReview;
  busy: boolean;
  saveWeeklyReview: ReturnType<
    typeof useRecoveryExperience
  >['saveWeeklyReview'];
  createReflection: ReturnType<typeof useReflections>['createReflection'];
  onSaved: () => void;
}) {
  const p = useTranslations('progressExperience');
  const [step, setStep] = useState(0);
  const [helped, setHelped] = useState<string[]>(current.what_helped ?? []);
  const [hard, setHard] = useState<string[]>(current.what_was_hard ?? []);
  const [adjustment, setAdjustment] = useState(current.adjustment ?? '');
  const [mission, setMission] = useState(current.next_mission ?? '');
  const [skill, setSkill] = useState(current.recommended_skill ?? '');
  const [journalFocus, setJournalFocus] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<ReviewField, string>>>(
    {}
  );

  const toggle = (
    value: string,
    values: string[],
    setValues: (items: string[]) => void
  ) => {
    setErrors((currentErrors) => ({ ...currentErrors, selection: undefined }));
    setValues(
      values.includes(value)
        ? values.filter((item) => item !== value)
        : [...values, value]
    );
  };

  const continueReview = () => {
    if (step === 0 && helped.length === 0 && hard.length === 0) {
      setErrors((currentErrors) => ({
        ...currentErrors,
        selection: p('reviewSelectionRequired'),
      }));
      return;
    }
    if (step === 1) {
      const nextErrors: Partial<Record<ReviewField, string>> = {};
      if (!adjustment.trim()) nextErrors.adjustment = p('adjustmentRequired');
      if (!mission.trim()) nextErrors.mission = p('nextMissionRequired');
      if (Object.keys(nextErrors).length > 0) {
        setErrors((currentErrors) => ({ ...currentErrors, ...nextErrors }));
        return;
      }
    }
    setStep((value) => Math.min(2, value + 1));
  };

  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (!skill.trim()) {
      setErrors((currentErrors) => ({
        ...currentErrors,
        skill: p('skillRequired'),
      }));
      return;
    }

    setErrors((currentErrors) => ({ ...currentErrors, submit: undefined }));
    const review: WeeklyReview = {
      id: current.id,
      week_start: current.week_start,
      what_helped: helped,
      what_was_hard: hard,
      adjustment: adjustment.trim(),
      next_mission: mission.trim(),
      recommended_skill: skill.trim(),
    };
    try {
      await saveWeeklyReview(review);
      let focusError: unknown = null;
      if (journalFocus && adjustment.trim()) {
        try {
          await createReflection({
            text: p('reviewJournalText'),
            next_step: adjustment.trim(),
            is_focus: true,
          });
        } catch (error) {
          focusError = error;
        }
      }
      toastSuccess(p('reviewSaved'));
      if (focusError) toastError(focusError, p('reviewFocusError'));
      onSaved();
    } catch (error) {
      setErrors((currentErrors) => ({
        ...currentErrors,
        submit: p('reviewError'),
      }));
      toastError(error, p('reviewError'));
    }
  };

  return (
    <form onSubmit={(event) => void save(event)} noValidate>
      <div
        className="flex gap-2"
        role="progressbar"
        aria-label={p('reviewProgress')}
        aria-valuemin={1}
        aria-valuemax={3}
        aria-valuenow={step + 1}
      >
        {[0, 1, 2].map((value) => (
          <span
            key={value}
            className={`h-2 flex-1 rounded-full transition-colors duration-200 motion-reduce:transition-none ${value < step ? 'bg-sage' : value === step ? 'bg-navy shadow-sm' : 'bg-border'}`}
            aria-hidden="true"
          />
        ))}
      </div>

      {errors.submit ? (
        <p
          className="border-crimson/20 bg-crimson/5 text-crimson mt-5 rounded-xl border px-4 py-3 text-sm font-semibold"
          role="alert"
        >
          {errors.submit}
        </p>
      ) : null}

      {step === 0 ? (
        <div className="mt-6">
          <fieldset>
            <legend className="text-navy text-lg font-bold">
              {p('whatHelped')}
            </legend>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {['pause', 'grounding', 'contact', 'learning'].map((item) => (
                <Choice
                  key={item}
                  selected={helped.includes(item)}
                  onClick={() => toggle(item, helped, setHelped)}
                >
                  {p(`reviewOptions.${item}`)}
                </Choice>
              ))}
            </div>
          </fieldset>
          <fieldset className="mt-6">
            <legend className="text-navy text-lg font-bold">
              {p('whatHard')}
            </legend>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {['time', 'alone', 'strongUrge', 'unsure'].map((item) => (
                <Choice
                  key={item}
                  selected={hard.includes(item)}
                  onClick={() => toggle(item, hard, setHard)}
                >
                  {p(`difficultyOptions.${item}`)}
                </Choice>
              ))}
            </div>
          </fieldset>
          {errors.selection ? (
            <p className="text-crimson mt-3 text-sm font-semibold" role="alert">
              {errors.selection}
            </p>
          ) : null}
        </div>
      ) : null}
      {step === 1 ? (
        <div className="mt-6 space-y-5">
          <TextAreaField
            id="adjustment"
            label={p('adjustment')}
            value={adjustment}
            placeholder={p('adjustmentPlaceholder')}
            error={errors.adjustment}
            onChange={(value) => {
              setAdjustment(value);
              setErrors((currentErrors) => ({
                ...currentErrors,
                adjustment: undefined,
              }));
            }}
          />
          <TextField
            id="mission"
            label={p('nextMission')}
            value={mission}
            placeholder={p('nextMissionPlaceholder')}
            error={errors.mission}
            onChange={(value) => {
              setMission(value);
              setErrors((currentErrors) => ({
                ...currentErrors,
                mission: undefined,
              }));
            }}
          />
        </div>
      ) : null}
      {step === 2 ? (
        <div className="mt-6 space-y-5">
          <TextField
            id="skill"
            label={p('skill')}
            value={skill}
            placeholder={p('skillPlaceholder')}
            error={errors.skill}
            onChange={(value) => {
              setSkill(value);
              setErrors((currentErrors) => ({
                ...currentErrors,
                skill: undefined,
              }));
            }}
          />
          <label className="bg-sage/8 border-sage/25 text-navy flex min-h-16 cursor-pointer items-center gap-3 rounded-2xl border p-4 text-sm">
            <input
              type="checkbox"
              checked={journalFocus}
              onChange={(event) => setJournalFocus(event.target.checked)}
              className="accent-navy size-4"
            />
            {p('saveAsFocus')}
          </label>
        </div>
      ) : null}

      <div className="border-border bg-card sticky bottom-0 mt-7 flex justify-between gap-3 border-t pt-5">
        <Button
          type="button"
          variant="outline"
          disabled={step === 0 || busy}
          onClick={() => setStep((value) => Math.max(0, value - 1))}
        >
          {p('back')}
        </Button>
        {step < 2 ? (
          <Button type="button" disabled={busy} onClick={continueReview}>
            {p('continue')}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Button>
        ) : (
          <Button type="submit" disabled={busy}>
            {busy ? p('saving') : p('saveReview')}
            <Check className="size-4" aria-hidden="true" />
          </Button>
        )}
      </div>
    </form>
  );
}

function TextAreaField({
  id,
  label,
  value,
  placeholder,
  error,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  const errorId = `${id}-error`;
  return (
    <div>
      <label htmlFor={id} className="text-navy text-sm font-bold">
        {label}
      </label>
      <textarea
        id={id}
        value={value}
        maxLength={500}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        onChange={(event) => onChange(event.target.value)}
        className="border-input focus-visible:border-navy focus-visible:ring-navy/20 mt-2 min-h-28 w-full rounded-2xl border p-4 text-base outline-none focus-visible:ring-2"
        placeholder={placeholder}
      />
      <FieldError id={errorId} error={error} />
    </div>
  );
}

function TextField({
  id,
  label,
  value,
  placeholder,
  error,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  const errorId = `${id}-error`;
  return (
    <div>
      <label htmlFor={id} className="text-navy text-sm font-bold">
        {label}
      </label>
      <input
        id={id}
        value={value}
        maxLength={id === 'mission' ? 300 : 200}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        onChange={(event) => onChange(event.target.value)}
        className="border-input focus-visible:border-navy focus-visible:ring-navy/20 mt-2 h-12 w-full rounded-xl border px-4 text-base outline-none focus-visible:ring-2"
        placeholder={placeholder}
      />
      <FieldError id={errorId} error={error} />
    </div>
  );
}

function FieldError({ id, error }: { id: string; error?: string }) {
  return error ? (
    <p id={id} className="text-crimson mt-2 text-sm font-semibold" role="alert">
      {error}
    </p>
  ) : null;
}

function Choice({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`focus-visible:ring-navy/30 flex min-h-12 cursor-pointer items-center justify-between gap-3 rounded-xl border px-4 text-left text-sm font-semibold transition-colors duration-200 outline-none focus-visible:ring-2 motion-reduce:transition-none ${selected ? 'border-navy bg-navy text-white shadow-sm' : 'border-border bg-card text-navy hover:border-navy/35 hover:bg-muted/40'}`}
      aria-pressed={selected}
    >
      <span>{children}</span>
      {selected ? (
        <span
          className="flex size-5 shrink-0 items-center justify-center rounded-full bg-white/20"
          aria-hidden="true"
        >
          <Check className="size-3.5" strokeWidth={2.5} />
        </span>
      ) : null}
    </button>
  );
}
