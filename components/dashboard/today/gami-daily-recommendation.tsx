'use client';

import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  Clock,
  Info,
  Lightbulb,
  RefreshCw,
  Settings2,
  ShieldCheck,
  Sparkles,
  Target,
  X,
} from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { useSpkRecommendation } from '@/hooks/use-spk-recommendation';
import { Link } from '@/i18n/routing';
import {
  getLastSeenGamiRecommendationID,
  setLastSeenGamiRecommendationID,
} from '@/lib/recovery/gami-recommendation-storage';
import { ROUTES } from '@/routes';

const FEATURE_LABEL_KEY: Record<string, string> = {
  education: 'spkFeatureEducation',
  recovery_practice: 'spkFeatureRecoveryPractice',
  grounding: 'spkFeatureGrounding',
  reflection: 'spkFeatureReflection',
  alternative_activity: 'spkFeatureAlternativeActivity',
  accountability: 'spkFeatureAccountability',
  none: 'spkFeatureMaintain',
};


const REASON_CODE_KEY: Record<string, string> = {
  spk_baseline_rule: 'spkReasonBaseline',
  spk_no_intervention_needed: 'spkReasonNoIntervention',
  spk_history_effective: 'spkReasonHistoryEffective',
  spk_history_less_effective: 'spkReasonHistoryLessEffective',
  spk_readiness_low_modifier: 'spkReasonReadinessLow',
  spk_readiness_high_modifier: 'spkReasonReadinessHigh',
  spk_fallback_intervention: 'spkReasonFallback',
};

const FACTOR_LABEL_KEY: Record<string, string> = {
  blocked_attempts_today: 'spkFactorBlockedToday',
  blocked_active_days_7d: 'spkFactorBlockedDays',
  recovery_streak_days: 'spkFactorStreak',
  daily_missions_completed: 'spkFactorMissions',
  learning_activities_7d: 'spkFactorLearning',
  change_readiness: 'spkFactorReadiness',
};

const DATA_GAP_LABEL_KEY: Record<string, string> = {
  learn: 'spkGapLearn',
  check_in: 'spkGapCheckIn',
  set_intention: 'spkGapIntention',
};

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
const subscribeNever = () => () => undefined;

type ConversationStep = 'greeting' | 'recommendation';

interface GamiDailyRecommendationProps {
  studentName: string;
}

/**
 * Responsive Gami conversation for the daily SPK recommendation. Automatic
 * greetings happen once per backend recommendation ID; the launcher remains
 * available so the student can revisit the recommendation without being
 * interrupted again.
 */
export function GamiDailyRecommendation({
  studentName,
}: GamiDailyRecommendationProps) {
  const t = useTranslations('recoveryDashboard');
  const reduceMotion = useReducedMotion();
  const clientReady = useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false
  );
  const { recommendation, loading, error, refetch } = useSpkRecommendation();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<ConversationStep>('greeting');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const autoOpenedIDRef = useRef<string | null>(null);

  const recommendationID = recommendation?.recommendation_id ?? '';
  const recommendationEnabled = Boolean(
    recommendation?.recommendation_enabled
  );

  const closeDialog = useCallback(() => {
    setOpen(false);
    setDetailsOpen(false);
  }, []);

  useEffect(() => {
    if (
      !clientReady ||
      loading ||
      error ||
      !recommendationEnabled ||
      !recommendationID ||
      autoOpenedIDRef.current === recommendationID ||
      getLastSeenGamiRecommendationID() === recommendationID
    ) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      autoOpenedIDRef.current = recommendationID;
      setLastSeenGamiRecommendationID(recommendationID);
      setStep('greeting');
      setDetailsOpen(false);
      setOpen(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [
    clientReady,
    error,
    loading,
    recommendationEnabled,
    recommendationID,
  ]);

  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement as HTMLElement;
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = 'hidden';
    const focusFrame = window.requestAnimationFrame(() => {
      dialogRef.current?.focus();
    });

    return () => {
      window.cancelAnimationFrame(focusFrame);
      root.style.overflow = previousOverflow;
      window.requestAnimationFrame(() => {
        const returnTarget =
          document.querySelector<HTMLElement>(
            '[data-gami-recommendation-launcher]'
          ) ?? previouslyFocused;
        returnTarget?.focus();
      });
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      closeDialog();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, closeDialog]);

  const trapFocus = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.key !== 'Tab' || !dialogRef.current) return;
    const focusable = Array.from(
      dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
    ).filter((element) => !element.hasAttribute('disabled'));
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const openFromLauncher = () => {
    setStep('recommendation');
    setDetailsOpen(false);
    setOpen(true);
  };

  if (!clientReady || (!recommendation && (loading || error))) return null;
  if (!recommendation) return null;

  const featureName = t(
    FEATURE_LABEL_KEY[recommendation.feature.feature_id] ??
      'spkFeatureMaintain'
  );
  const reasonCodeKey =
    REASON_CODE_KEY[
      recommendation.reason?.code ?? recommendation.reason_code
    ] ?? 'spkReasonBaseline';
  const riskFactors = (recommendation.reason?.factors ?? [])
    .filter((factor) => factor.score >= 1)
    .slice(0, 4);
  const llmMessage = recommendation.personalized_message?.trim();
  const llmExplanation = recommendation.personalized_explanation?.trim();
  const dataNote =
    recommendation.data_state === 'partial'
      ? t('spkDataPartial')
      : recommendation.data_state === 'insufficient'
        ? t('spkDataInsufficient')
        : null;
  const displayName = studentName.trim() || t('defaultName');

  const launcher = !open ? (
    <motion.button
      ref={launcherRef}
      type="button"
      data-gami-recommendation-launcher
      onClick={openFromLauncher}
      aria-label={t('gamiRecommendationLauncher')}
      initial={reduceMotion ? false : { opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={reduceMotion ? undefined : { x: -5, scale: 1.02 }}
      whileTap={reduceMotion ? undefined : { scale: 0.97 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="border-navy/15 bg-card/95 shadow-float focus-visible:ring-sky fixed right-0 bottom-[9rem] z-30 flex h-24 w-[5.5rem] cursor-pointer items-end justify-center overflow-hidden rounded-l-[2rem] border px-1 pb-1.5 outline-none backdrop-blur-md focus-visible:ring-2 focus-visible:ring-offset-2 sm:bottom-[7.5rem] sm:h-28 sm:w-24"
    >
      <span
        className="bg-sky/15 absolute inset-2 rounded-full blur-xl"
        aria-hidden="true"
      />
      <Image
        src="/images/mascot/gami-daily-greeting.webp"
        alt=""
        width={1254}
        height={1254}
        sizes="96px"
        className="absolute -right-4 -top-1 h-24 w-24 object-contain drop-shadow-sm sm:h-28 sm:w-28"
      />
      <span className="bg-navy/90 relative rounded-full px-2.5 py-0.5 text-[0.625rem] font-bold text-white shadow-sm">
        {t('gamiLauncherShort')}
      </span>
    </motion.button>
  ) : null;

  const overlay = createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          key="gami-recommendation-overlay"
          className="fixed inset-0 z-[45] overflow-x-hidden overflow-y-auto overscroll-contain"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.2 }}
        >
          <div
            className="bg-navy/60 fixed inset-0 backdrop-blur-sm transition-opacity"
            aria-hidden="true"
            onClick={closeDialog}
          />

          <div className="relative flex min-h-full items-center justify-center p-3 sm:items-end sm:justify-end sm:overflow-hidden sm:px-6 sm:pt-6 sm:pb-0 md:px-8 lg:pr-0 lg:pl-12">
            <div className="relative flex w-full max-w-[100rem] flex-col items-center justify-center gap-0 sm:flex-row sm:items-end sm:justify-end sm:gap-2 md:gap-3 lg:gap-4">
              <motion.section
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="gami-recommendation-title"
                aria-describedby="gami-recommendation-description"
                tabIndex={-1}
                onKeyDown={trapFocus}
                initial={reduceMotion ? false : { opacity: 0, scale: 0.95, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 12 }}
                transition={{ duration: reduceMotion ? 0 : 0.25, ease: 'easeOut' }}
                className="border-navy/15 bg-card/95 shadow-float relative z-20 w-full max-w-[28rem] shrink-0 rounded-[2rem] border outline-none backdrop-blur-xl sm:-mr-16 sm:max-w-[33rem] sm:self-center md:-mr-24 lg:-mr-36 lg:max-w-[36rem] xl:-mr-44"
              >
                {/* Desktop Speech Tail (Pointing Right toward Gami) */}
                <span
                  className="border-navy/15 bg-card pointer-events-none absolute -right-2 top-1/2 hidden size-4 -translate-y-1/2 rotate-45 border-t border-r sm:block"
                  aria-hidden="true"
                />
                {/* Mobile Speech Tail (Pointing Down toward Gami) */}
                <span
                  className="border-navy/15 bg-card pointer-events-none absolute -bottom-2 left-1/2 size-4 -translate-x-1/2 rotate-45 border-b border-r sm:hidden"
                  aria-hidden="true"
                />

                <button
                  type="button"
                  onClick={closeDialog}
                  aria-label={t('gamiClose')}
                  className="text-muted-foreground hover:bg-muted hover:text-navy focus-visible:ring-navy/30 absolute top-4 right-4 z-10 flex size-9 cursor-pointer items-center justify-center rounded-full outline-none transition-colors focus-visible:ring-2"
                >
                  <X className="size-4" aria-hidden="true" />
                </button>

                <div className="max-h-[min(55dvh,32rem)] overflow-y-auto p-5 sm:max-h-[min(72dvh,38rem)] sm:p-7 sm:pr-8">
                  <AnimatePresence mode="wait" initial={false}>
                    {step === 'greeting' ? (
                      <motion.div
                        key="greeting"
                        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: reduceMotion ? 0 : 0.18 }}
                      >
                        <h2
                          id="gami-recommendation-title"
                          className="text-navy text-2xl leading-tight font-extrabold tracking-[-0.025em] sm:text-[1.75rem]"
                        >
                          {t('gamiGreetingTitle', { name: displayName })}
                        </h2>
                        <p
                          id="gami-recommendation-description"
                          className="text-muted-foreground mt-3 text-sm leading-relaxed"
                        >
                          {t('gamiGreetingBody')}
                        </p>
                        <div className="bg-azure/50 border-sky/20 text-navy mt-4 flex items-start gap-2.5 rounded-2xl border p-3 text-xs leading-5">
                          <ShieldCheck
                            className="text-sky mt-0.5 size-4 shrink-0"
                            aria-hidden="true"
                          />
                          <span className="font-semibold">{t('gamiPrivacyNote')}</span>
                        </div>
                        <Button
                          type="button"
                          size="lg"
                          onClick={() => setStep('recommendation')}
                          className="mt-6 w-full gap-2 rounded-xl py-3 font-bold shadow-soft transition-all"
                        >
                          {t('gamiGreetingAction')}
                          <ArrowRight className="size-4" aria-hidden="true" />
                        </Button>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="recommendation"
                        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        transition={{ duration: reduceMotion ? 0 : 0.18 }}
                      >
                        {recommendationEnabled ? (
                          <button
                            type="button"
                            onClick={() => setStep('greeting')}
                            className="text-muted-foreground hover:text-navy focus-visible:ring-navy/30 -ml-1 inline-flex min-h-9 cursor-pointer items-center gap-1 rounded-lg px-2 text-xs font-semibold outline-none transition-colors focus-visible:ring-2"
                          >
                            <ArrowLeft
                              className="size-3.5"
                              aria-hidden="true"
                            />
                            {t('gamiBack')}
                          </button>
                        ) : null}

                        {!recommendationEnabled ? (
                          <div className="mt-2">
                            <div className="bg-muted text-muted-foreground flex size-11 items-center justify-center rounded-xl">
                              <Target className="size-5" aria-hidden="true" />
                            </div>
                            <h2
                              id="gami-recommendation-title"
                              className="text-navy mt-4 text-xl font-bold"
                            >
                              {t('spkDisabledTitle')}
                            </h2>
                            <p
                              id="gami-recommendation-description"
                              className="text-muted-foreground mt-2 text-sm leading-6"
                            >
                              {t('spkDisabledBody')}
                            </p>
                            <Link
                              href={ROUTES.SETTINGS}
                              className="bg-navy hover:bg-navy-light focus-visible:ring-navy/35 mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold text-white outline-none transition-colors focus-visible:ring-2"
                            >
                              <Settings2 className="size-4" aria-hidden="true" />
                              {t('spkDisabledAction')}
                            </Link>
                          </div>
                        ) : (
                          <div className="mt-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-navy-light text-xs font-black tracking-[0.12em] uppercase">
                                {t('spkEyebrow')}
                              </p>
                              {recommendation.llm_used ? (
                                <span
                                  className="border-navy/15 bg-azure/70 text-navy inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[0.625rem] font-bold"
                                  title={t('spkLLMPersonalized')}
                                >
                                  <Sparkles
                                    className="size-3"
                                    aria-hidden="true"
                                  />
                                  {t('spkLLMPersonalizedShort')}
                                </span>
                              ) : null}
                            </div>
                            <h2
                              id="gami-recommendation-title"
                              className="text-navy mt-2 text-xl leading-tight font-extrabold tracking-[-0.02em] sm:text-2xl"
                            >
                              {featureName}
                            </h2>
                            <p
                              id="gami-recommendation-description"
                              className="text-muted-foreground mt-2 text-sm leading-6"
                            >
                              {llmMessage ||
                                t('gamiRecommendationIntro', {
                                  feature: featureName,
                                })}
                            </p>

                            {recommendation.feature.route ? (
                              <Link
                                href={recommendation.feature.route}
                                className="bg-navy hover:bg-navy-light focus-visible:ring-navy/35 mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold text-white shadow-sm outline-none transition-colors focus-visible:ring-2"
                              >
                                {t(`${recommendation.feature.action}Action`)}
                                <ArrowRight
                                  className="size-4"
                                  aria-hidden="true"
                                />
                              </Link>
                            ) : (
                              <p className="bg-muted/55 text-muted-foreground mt-5 rounded-xl px-4 py-3 text-sm font-semibold">
                                {t('spkMaintainBody')}
                              </p>
                            )}

                            <div className="border-border/80 bg-muted/20 mt-4 overflow-hidden rounded-2xl border">
                              <button
                                type="button"
                                onClick={() =>
                                  setDetailsOpen((current) => !current)
                                }
                                aria-expanded={detailsOpen}
                                aria-controls="gami-recommendation-details"
                                className="text-navy hover:bg-muted/40 focus-visible:ring-navy/30 flex min-h-11 w-full cursor-pointer items-center justify-between gap-3 px-4 py-3 text-left text-sm font-bold outline-none transition-colors focus-visible:ring-2"
                              >
                                <span className="flex items-center gap-2">
                                  <Lightbulb
                                    className="text-amber size-4"
                                    aria-hidden="true"
                                  />
                                  <span>
                                    {detailsOpen
                                      ? t('gamiDetailsHide')
                                      : t('gamiDetailsShow')}
                                  </span>
                                </span>
                                <ChevronDown
                                  className={`size-4 transition-transform motion-reduce:transition-none ${
                                    detailsOpen ? 'rotate-180' : ''
                                  }`}
                                  aria-hidden="true"
                                />
                              </button>

                              <AnimatePresence initial={false}>
                                {detailsOpen ? (
                                  <motion.div
                                    id="gami-recommendation-details"
                                    initial={
                                      reduceMotion
                                        ? false
                                        : { opacity: 0, height: 0 }
                                    }
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{
                                      duration: reduceMotion ? 0 : 0.2,
                                    }}
                                    className="overflow-hidden"
                                  >
                                    <div className="border-border/60 space-y-3 border-t p-4 pt-3.5">
                                      <div>
                                        <p className="text-navy text-xs font-bold tracking-wider uppercase">
                                          {t('spkReasonLabel')}
                                        </p>
                                        <p className="text-foreground/85 mt-1.5 text-sm leading-6">
                                          {llmExplanation ||
                                            t(reasonCodeKey, {
                                              feature: featureName,
                                            })}
                                        </p>

                                        {!llmExplanation &&
                                        riskFactors.length > 0 ? (
                                          <ul className="mt-3 space-y-1.5">
                                            {riskFactors.map((factor) => (
                                              <li
                                                key={factor.key}
                                                className="text-muted-foreground flex items-start gap-2 text-xs leading-5"
                                              >
                                                <span
                                                  className="bg-amber mt-2 size-1.5 shrink-0 rounded-full"
                                                  aria-hidden="true"
                                                />
                                                {t(
                                                  FACTOR_LABEL_KEY[factor.key] ??
                                                    factor.key
                                                )}
                                              </li>
                                            ))}
                                          </ul>
                                        ) : null}

                                        {recommendation.time_trigger
                                          ?.has_time_pattern ? (
                                          <p className="text-muted-foreground mt-2.5 flex items-start gap-2 text-xs leading-5">
                                            <Clock
                                              className="text-amber mt-0.5 size-3.5 shrink-0"
                                              aria-hidden="true"
                                            />
                                            {t('spkReasonTimePattern')}
                                          </p>
                                        ) : null}
                                      </div>

                                      {dataNote ? (
                                        <div
                                          className="border-amber/30 bg-amber/10 rounded-xl border p-3.5"
                                          role="status"
                                        >
                                          <div className="flex items-start justify-between gap-2">
                                            <p className="text-foreground flex items-start gap-2 text-xs leading-5 font-semibold">
                                              <Info
                                                className="text-amber mt-0.5 size-4 shrink-0"
                                                aria-hidden="true"
                                              />
                                              {dataNote}
                                            </p>
                                            <button
                                              type="button"
                                              onClick={() => void refetch()}
                                              disabled={loading}
                                              className="border-amber/30 text-foreground hover:bg-card focus-visible:ring-amber/40 inline-flex min-h-8 shrink-0 cursor-pointer items-center gap-1 rounded-lg border px-2 text-[0.6875rem] font-bold outline-none focus-visible:ring-2 disabled:cursor-wait disabled:opacity-50"
                                            >
                                              <RefreshCw
                                                className={`size-3 ${
                                                  loading
                                                    ? 'animate-spin motion-reduce:animate-none'
                                                    : ''
                                                }`}
                                                aria-hidden="true"
                                              />
                                              {t('spkRefresh')}
                                            </button>
                                          </div>
                                          <p className="text-foreground/80 mt-2 text-[0.6875rem] font-semibold">
                                            {t('spkDataGapsTitle')}
                                          </p>
                                          <div className="mt-1.5 flex flex-wrap gap-1.5">
                                            {(recommendation.data_gaps ?? [])
                                              .length > 0 ? (
                                              (recommendation.data_gaps ?? []).map(
                                                (gap) => {
                                                  const label = t(
                                                    DATA_GAP_LABEL_KEY[
                                                      gap.action
                                                    ] ?? 'spkGapLearn'
                                                  );
                                                  return gap.route ? (
                                                    <Link
                                                      key={gap.key}
                                                      href={gap.route}
                                                      className="border-amber/25 bg-card hover:bg-background text-foreground inline-flex min-h-8 items-center gap-1 rounded-lg border px-2.5 text-xs font-bold"
                                                    >
                                                      {label}
                                                      <ArrowRight
                                                        className="size-3"
                                                        aria-hidden="true"
                                                      />
                                                    </Link>
                                                  ) : (
                                                    <span
                                                      key={gap.key}
                                                      className="border-amber/20 bg-card/70 text-foreground inline-flex min-h-8 items-center rounded-lg border px-2.5 text-xs"
                                                    >
                                                      {label}
                                                    </span>
                                                  );
                                                }
                                              )
                                            ) : (
                                              <Link
                                                href={ROUTES.SETTINGS}
                                                className="border-amber/25 bg-card hover:bg-background text-foreground inline-flex min-h-8 items-center gap-1 rounded-lg border px-2.5 text-xs font-bold"
                                              >
                                                {t('spkGapPrivacy')}
                                                <ArrowRight
                                                  className="size-3"
                                                  aria-hidden="true"
                                                />
                                              </Link>
                                            )}
                                          </div>
                                        </div>
                                      ) : null}

                                      {error ? (
                                        <p
                                          className="text-crimson text-xs leading-5"
                                          role="status"
                                        >
                                          {t('gamiRefreshError')}
                                        </p>
                                      ) : null}
                                    </div>
                                  </motion.div>
                                ) : null}
                              </AnimatePresence>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.section>

              {/* Gami Mascot Stage */}
              <motion.div
                initial={reduceMotion ? false : { opacity: 0, scale: 0.95, x: 40 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95, x: 40 }}
                transition={{
                  duration: reduceMotion ? 0 : 0.3,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="pointer-events-none relative z-10 -mt-6 flex shrink-0 flex-col items-center justify-end self-center sm:mt-0 sm:items-end sm:self-end sm:-mr-8 md:-mr-10 lg:-mr-12"
                aria-hidden="true"
              >
                {/* Ambient radiant lighting */}
                <div className="bg-gradient-to-l from-sky/45 via-azure/35 to-transparent pointer-events-none absolute -right-16 inset-y-0 w-[42rem] rounded-full blur-3xl" />

                {/* Mascot Character */}
                <div className="relative flex items-center justify-center sm:items-end sm:justify-end">
                  <Image
                    src="/images/mascot/gami-daily-greeting.webp"
                    alt=""
                    width={1254}
                    height={1254}
                    priority
                    className="h-auto w-[24rem] max-w-[94vw] object-contain object-bottom drop-shadow-[0_25px_50px_rgba(15,23,42,0.3)] sm:w-[32rem] sm:max-h-[90vh] md:w-[40rem] md:max-h-[95vh] lg:w-[48rem] lg:max-h-screen xl:w-[56rem]"
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body
  );

  return (
    <>
      {launcher}
      {overlay}
    </>
  );
}
