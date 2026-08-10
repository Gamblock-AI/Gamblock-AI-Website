'use client';

import {
  ArrowRight,
  Clock,
  Info,
  Lightbulb,
  RefreshCw,
  Settings2,
  Sparkles,
  Target,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from '@/i18n/routing';
import { useSpkRecommendation } from '@/hooks/use-spk-recommendation';
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

const SUPPORT_LEVEL_KEY: Record<string, string> = {
  LOW: 'spkSupportLow',
  MEDIUM: 'spkSupportMedium',
  HIGH: 'spkSupportHigh',
};

const ENGAGEMENT_LEVEL_KEY: Record<string, string> = {
  HIGH: 'spkEngagementHigh',
  MEDIUM: 'spkEngagementMedium',
  LOW: 'spkEngagementLow',
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

export function SpkRecommendationCard() {
  const t = useTranslations('recoveryDashboard');
  const { recommendation, loading, error, refetch } = useSpkRecommendation();

  // Keep the dashboard clean on failure; the recommendation is an enhancement.
  if (error) return null;

  if (loading || !recommendation) {
    return (
      <section
        className="border-border/80 bg-card shadow-soft h-full rounded-2xl border p-5 sm:p-6"
        aria-busy="true"
      >
        <div className="space-y-3" role="status">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <span className="sr-only">{t('spkLoading')}</span>
        </div>
      </section>
    );
  }

  // Privacy master switch off: show a subtle notice instead of a recommendation.
  if (!recommendation.recommendation_enabled) {
    return (
      <section
        className="border-border/80 bg-card shadow-soft flex h-full flex-col justify-between rounded-2xl border p-5 sm:p-6"
        aria-labelledby="spk-recommendation-disabled"
      >
        <div className="flex items-start gap-3.5">
          <div className="bg-muted text-muted-foreground flex size-11 shrink-0 items-center justify-center rounded-xl">
            <Target className="size-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-navy-light text-xs font-bold tracking-wider uppercase">
              {t('spkEyebrow')}
            </p>
            <h2
              id="spk-recommendation-disabled"
              className="text-navy mt-1 text-base font-bold"
            >
              {t('spkDisabledTitle')}
            </h2>
            <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
              {t('spkDisabledBody')}
            </p>
          </div>
        </div>
        <Link
          href={ROUTES.SETTINGS}
          className="border-navy/20 hover:bg-navy/5 focus-visible:ring-navy/35 mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold text-navy transition-colors outline-none focus-visible:ring-2"
        >
          <Settings2 className="size-4" aria-hidden="true" />
          {t('spkDisabledAction')}
        </Link>
      </section>
    );
  }

  const { feature, data_state, llm_used, personalized_message } = recommendation;
  const labelKey =
    FEATURE_LABEL_KEY[feature.feature_id] ?? 'spkFeatureMaintain';
  const featureName = t(labelKey);
  const llmMessage = personalized_message?.trim();
  const dataNote =
    data_state === 'partial'
      ? t('spkDataPartial')
      : data_state === 'insufficient'
        ? t('spkDataInsufficient')
        : null;

  const dataGaps = recommendation.data_gaps ?? [];
  const dataGapLabelKey: Record<string, string> = {
    learn: 'spkGapLearn',
    check_in: 'spkGapCheckIn',
    set_intention: 'spkGapIntention',
  };

  const reason = recommendation.reason;
  const reasonCodeKey =
    REASON_CODE_KEY[reason?.code ?? recommendation.reason_code] ??
    'spkReasonBaseline';
  const supportLevelKey =
    SUPPORT_LEVEL_KEY[reason?.support_level ?? recommendation.support_level] ??
    'spkSupportMedium';
  const engagementLevelKey =
    ENGAGEMENT_LEVEL_KEY[
      reason?.engagement_level ?? recommendation.engagement_level
    ] ?? 'spkEngagementMedium';
  const riskFactors = (reason?.factors ?? [])
    .filter((factor) => factor.score >= 1)
    .slice(0, 4);
  const llmExplanation = recommendation.personalized_explanation?.trim();

  return (
    <section
      className="border-border/80 bg-gradient-to-br from-card via-card to-azure/20 shadow-soft hover:shadow-card relative overflow-hidden rounded-2xl border p-5 sm:p-6 transition-all duration-200"
      aria-labelledby="spk-recommendation-title"
    >
      {/* Subtle ambient lighting accent */}
      <div
        className="pointer-events-none absolute -top-16 -right-16 size-48 rounded-full bg-emerald-500/10 blur-2xl"
        aria-hidden="true"
      />

      <div className="relative space-y-4">
        {/* Header Unit: Icon + Titles + Action button */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3.5 min-w-0 flex-1">
            <div className="bg-emerald-600 dark:bg-emerald-500 text-white flex size-11 sm:size-12 shrink-0 items-center justify-center rounded-2xl shadow-sm ring-4 ring-emerald-500/10">
              <Target className="size-5 sm:size-6" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-emerald-700 dark:text-emerald-400 text-xs font-black tracking-wider uppercase">
                  {t('spkEyebrow')}
                </p>
                {llm_used ? (
                  <span
                    className="inline-flex shrink-0 items-center gap-1 rounded-full border border-navy/15 bg-azure/80 px-2 py-0.5 text-[0.625rem] font-bold text-navy shadow-2xs"
                    title={t('spkLLMPersonalized')}
                  >
                    <Sparkles className="size-3 text-navy" aria-hidden="true" />
                    {t('spkLLMPersonalizedShort')}
                  </span>
                ) : null}
              </div>
              <h2
                id="spk-recommendation-title"
                className="text-navy mt-1 text-lg sm:text-xl font-bold tracking-tight"
              >
                {featureName}
              </h2>
              {llmMessage ? (
                <p className="text-navy/80 mt-1 text-sm leading-relaxed italic border-l-2 border-emerald-500/70 pl-2.5 my-1">
                  &ldquo;{llmMessage}&rdquo;
                </p>
              ) : null}

              {/* Status Level Chips */}
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                <span
                  className="inline-flex items-center gap-1.5 rounded-md border border-emerald-500/25 bg-emerald-500/[0.08] px-2.5 py-1 text-[0.6875rem] font-bold text-emerald-800 dark:text-emerald-300"
                  title={t('spkSupportChipTitle')}
                >
                  <span className="size-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
                  {t('spkSupportChip', { level: t(supportLevelKey) })}
                </span>
                <span
                  className="inline-flex items-center gap-1.5 rounded-md border border-sky-500/25 bg-sky-500/[0.08] px-2.5 py-1 text-[0.6875rem] font-bold text-sky-800 dark:text-sky-300"
                  title={t('spkEngagementChipTitle')}
                >
                  <span className="size-1.5 rounded-full bg-sky-600 dark:bg-sky-400" />
                  {t('spkEngagementChip', { level: t(engagementLevelKey) })}
                </span>
              </div>
            </div>
          </div>

          {/* Primary CTA Button */}
          <div className="shrink-0">
            {feature.route ? (
              <Link
                href={feature.route}
                className="group bg-navy hover:bg-navy-light focus-visible:ring-navy/35 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold text-white shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 outline-none focus-visible:ring-2 w-full sm:w-auto"
              >
                <span>{t(`${feature.action}Action`)}</span>
                <ArrowRight
                  className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
            ) : (
              <p className="bg-muted/40 text-muted-foreground flex min-h-11 items-center rounded-xl px-4 text-sm font-semibold">
                {t('spkMaintainBody')}
              </p>
            )}
          </div>
        </div>

        {/* Reason Block: Polished and structured */}
        <div className="border-border/70 bg-card/60 dark:bg-card/40 rounded-2xl border p-4 shadow-2xs sm:p-4.5">
          <p className="text-navy flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase">
            <Lightbulb
              className="size-4 shrink-0 text-amber-500"
              aria-hidden="true"
            />
            {t('spkReasonLabel')}
          </p>

          <p className="text-foreground/85 mt-2 text-sm leading-relaxed font-medium">
            {llmExplanation || t(reasonCodeKey, { feature: featureName })}
          </p>

          {/* Risk Factors Grid */}
          {!llmExplanation && riskFactors.length > 0 ? (
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {riskFactors.map((factor) => (
                <div
                  key={factor.key}
                  className="flex items-center gap-2.5 rounded-xl border border-border/60 bg-background/80 px-3 py-2 text-xs font-medium text-muted-foreground shadow-2xs"
                >
                  <span
                    className="size-1.5 shrink-0 rounded-full bg-amber-500"
                    aria-hidden="true"
                  />
                  <span className="truncate">
                    {t(FACTOR_LABEL_KEY[factor.key] ?? factor.key)}
                  </span>
                </div>
              ))}
            </div>
          ) : null}

          {recommendation.time_trigger?.has_time_pattern ? (
            <div className="mt-2.5 flex items-center gap-2 text-xs text-muted-foreground font-medium">
              <Clock className="size-3.5 text-amber-500/80" aria-hidden="true" />
              <span>{t('spkReasonTimePattern')}</span>
            </div>
          ) : null}
        </div>

        {/* Data Quality & Recommendations Helper Banner */}
        {dataNote ? (
          <div
            className="border-amber-500/25 bg-gradient-to-r from-amber-500/[0.08] to-amber-500/[0.03] rounded-2xl border p-3.5 sm:p-4"
            role="status"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-200">
                <Info
                  className="size-4 shrink-0 text-amber-600 dark:text-amber-400"
                  aria-hidden="true"
                />
                <span>{dataNote}</span>
              </p>
              <button
                type="button"
                onClick={() => void refetch()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-background/80 hover:bg-background px-2.5 py-1 text-[11px] font-bold text-amber-900 shadow-2xs outline-none transition-all focus-visible:ring-2 focus-visible:ring-amber-500/40 dark:text-amber-200 cursor-pointer"
              >
                <RefreshCw className="size-3" aria-hidden="true" />
                {t('spkRefresh')}
              </button>
            </div>

            {/* Gap Action Links */}
            <div className="mt-2.5">
              <p className="text-amber-900/80 dark:text-amber-200/80 text-[11px] font-semibold">
                {t('spkDataGapsTitle')}
              </p>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                {dataGaps.length > 0 ? (
                  dataGaps.map((gap) => {
                    const label = t(
                      dataGapLabelKey[gap.action] ?? 'spkGapLearn'
                    );
                    return gap.route ? (
                      <Link
                        key={gap.key}
                        href={gap.route}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/20 bg-background/90 hover:bg-background px-2.5 py-1 text-xs font-bold text-amber-900 shadow-2xs transition-colors dark:text-amber-200"
                      >
                        <span>{label}</span>
                        <ArrowRight className="size-3 text-amber-700 dark:text-amber-300" aria-hidden="true" />
                      </Link>
                    ) : (
                      <span
                        key={gap.key}
                        className="rounded-lg border border-amber-500/15 bg-background/60 px-2.5 py-1 text-xs text-amber-900/90 dark:text-amber-200/90"
                      >
                        {label}
                      </span>
                    );
                  })
                ) : (
                  <Link
                    href={ROUTES.SETTINGS}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/20 bg-background/90 hover:bg-background px-2.5 py-1 text-xs font-bold text-amber-900 shadow-2xs transition-colors dark:text-amber-200"
                  >
                    <span>{t('spkGapPrivacy')}</span>
                    <ArrowRight className="size-3 text-amber-700 dark:text-amber-300" aria-hidden="true" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
