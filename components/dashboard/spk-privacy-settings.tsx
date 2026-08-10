'use client';

import { useState } from 'react';
import { LockKeyhole, RotateCcw, Save, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  DashboardPanel,
  DashboardStatus,
} from '@/components/dashboard/dashboard-page';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toastError, toastSuccess } from '@/lib/feedback';
import {
  useSpkPreference,
  type SpkPreference,
  type SpkPreferenceKey,
} from '@/hooks/use-spk-preference';

const CATEGORY_KEYS: { key: SpkPreferenceKey; labelKey: string; bodyKey: string }[] =
  [
    {
      key: 'spk_use_protection',
      labelKey: 'spkPrivacyProtection',
      bodyKey: 'spkPrivacyProtectionBody',
    },
    {
      key: 'spk_use_recovery',
      labelKey: 'spkPrivacyRecovery',
      bodyKey: 'spkPrivacyRecoveryBody',
    },
    {
      key: 'spk_use_personal',
      labelKey: 'spkPrivacyPersonal',
      bodyKey: 'spkPrivacyPersonalBody',
    },
    {
      key: 'llm_personalization_enabled',
      labelKey: 'spkPrivacyAI',
      bodyKey: 'spkPrivacyAIBody',
    },
  ];

const SPK_FLAG_KEYS: SpkPreferenceKey[] = [
  'spk_recommendation_enabled',
  'spk_use_protection',
  'spk_use_recovery',
  'spk_use_personal',
  'llm_personalization_enabled',
];

function preferenceEquals(a: SpkPreference | null, b: SpkPreference) {
  if (!a) return false;
  return (
    a.spk_recommendation_enabled === b.spk_recommendation_enabled &&
    a.spk_use_protection === b.spk_use_protection &&
    a.spk_use_recovery === b.spk_use_recovery &&
    a.spk_use_personal === b.spk_use_personal &&
    a.llm_personalization_enabled === b.llm_personalization_enabled
  );
}

// Privacy controls for the SPK daily recommendation and the DeepSeek AI
// personalization. Toggles govern which data the recommendation may use; data
// storage is unchanged.
export function SpkPrivacySettings() {
  const t = useTranslations('settingsWorkspace');
  const { preference, loading, updatePreference } = useSpkPreference();
  const [draft, setDraft] = useState<SpkPreference | null>(null);
  const [saving, setSaving] = useState(false);

  if (loading) {
    return <Skeleton className="h-72 w-full rounded-2xl" aria-label={t('spkPrivacyLoading')} />;
  }
  if (!preference) return null;

  const value = draft ?? preference;
  const dirty = !preferenceEquals(preference, value);
  const masterEnabled = value.spk_recommendation_enabled;
  const activeCount = SPK_FLAG_KEYS.filter((key) => value[key]).length;

  const toggle = (key: SpkPreferenceKey) => {
    setDraft((current) => {
      const base = current ?? preference;
      return { ...base, [key]: !base[key] };
    });
  };

  const save = async () => {
    setSaving(true);
    try {
      const ok = await updatePreference(value);
      if (ok) {
        setDraft(null);
        toastSuccess(t('spkPrivacySaved'));
      } else {
        toastError(new Error('spk-preference'), t('spkPrivacySaveError'));
      }
    } finally {
      setSaving(false);
    }
  };

  const rowClass = (dimmed: boolean) =>
    `border-border/80 bg-card hover:bg-muted/20 hover:border-navy/20 flex cursor-pointer items-center justify-between gap-3.5 rounded-xl border p-3 transition-all duration-200 sm:p-3.5 ${
      dimmed ? 'opacity-55' : ''
    }`;

  return (
    <DashboardPanel
      icon={Sparkles}
      title={t('spkPrivacyTitle')}
      description={t('spkPrivacyBody')}
      density="compact"
      className="p-3 sm:p-3"
      contentClassName="mt-3"
      action={
        <DashboardStatus tone={dirty ? 'amber' : !masterEnabled ? 'muted' : 'sage'}>
          {dirty
            ? t('spkPrivacyUnsaved')
            : !masterEnabled
              ? t('spkPrivacyMasterOff')
              : t('spkPrivacyCount', { count: activeCount })}
        </DashboardStatus>
      }
    >
      <div className="space-y-2">
        <label
          className={rowClass(false)}
          data-spk-master
        >
          <span className="min-w-0 flex-1">
            <span className="text-navy block text-sm font-bold tracking-tight">
              {t('spkPrivacyMaster')}
            </span>
            <span className="text-muted-foreground mt-1 block text-xs leading-relaxed">
              {t('spkPrivacyMasterBody')}
            </span>
          </span>
          <input
            type="checkbox"
            checked={value.spk_recommendation_enabled}
            disabled={saving}
            onChange={() => toggle('spk_recommendation_enabled')}
            className="accent-navy size-5 shrink-0 cursor-pointer rounded"
          />
        </label>

        {!masterEnabled ? (
          <p className="border-amber-500/25 bg-amber-500/[0.06] flex items-start gap-2 rounded-xl border px-3 py-2.5 text-xs leading-5 text-amber-900 dark:text-amber-200">
            <LockKeyhole
              className="mt-0.5 size-3.5 shrink-0 text-amber-600 dark:text-amber-400"
              aria-hidden="true"
            />
            {t('spkPrivacyMasterOffNote')}
          </p>
        ) : null}

        {CATEGORY_KEYS.map(({ key, labelKey, bodyKey }) => (
          <label
            key={key}
            className={rowClass(!masterEnabled)}
            title={!masterEnabled ? t('spkPrivacyLockedTooltip') : undefined}
          >
            <span className="min-w-0 flex-1">
              <span className="text-navy block text-sm font-bold tracking-tight">
                {t(labelKey)}
              </span>
              <span className="text-muted-foreground mt-1 block text-xs leading-relaxed">
                {t(bodyKey)}
              </span>
            </span>
            <input
              type="checkbox"
              checked={value[key]}
              disabled={!masterEnabled || saving}
              onChange={() => toggle(key)}
              className="accent-navy size-5 shrink-0 cursor-pointer rounded"
            />
          </label>
        ))}
      </div>

      <p className="text-muted-foreground mt-3 text-xs leading-5">
        {t('spkPrivacyNote')}
      </p>

      <div className="border-border mt-3 grid gap-2 border-t pt-3 sm:grid-cols-2">
        <Button
          variant="outline"
          size="lg"
          disabled={!dirty || saving}
          onClick={() => setDraft(null)}
        >
          <RotateCcw className="size-4" aria-hidden="true" />
          {t('spkPrivacyDiscard')}
        </Button>
        <Button size="lg" disabled={!dirty || saving} onClick={() => void save()}>
          <Save className="size-4" aria-hidden="true" />
          {saving ? t('spkPrivacySaving') : t('spkPrivacySave')}
        </Button>
      </div>
    </DashboardPanel>
  );
}
