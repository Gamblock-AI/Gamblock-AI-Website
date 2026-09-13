'use client';

import { type FormEvent, useState } from 'react';
import { Download, Plus, Save, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FieldError } from '@/components/common/form-field';
import type { AdminDownloadApp } from '@/hooks/use-admin-operations';
import type {
  DownloadAsset,
  DownloadPlatform,
  LocalizedText,
} from '@/hooks/use-public-download-apps';
import { errorCode } from '@/lib/messages';
import { reportDevelopmentError } from '@/lib/diagnostics';
import { toastError, toastSuccess, toastValidationError } from '@/lib/feedback';
import { cn } from '@/lib/utils';
import { AdminFormField, adminFieldClassName } from './admin-shared';

function cloneApp(app: AdminDownloadApp): AdminDownloadApp {
  return JSON.parse(JSON.stringify(app)) as AdminDownloadApp;
}

type ReleaseValidationErrors = Record<string, string>;
type ReleaseTranslator = ReturnType<typeof useTranslations>;

const stableVersionPattern = /^v?\d+\.\d+\.\d+(?:\+[0-9A-Za-z.-]+)?$/;
const assetIDPattern = /^[a-z0-9][a-z0-9_-]{0,63}$/;
const sha256Pattern = /^[a-f0-9]{64}$/;

function releaseFieldClass(error?: string) {
  return cn(
    adminFieldClassName,
    error &&
      'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/30'
  );
}

function addLocalizedValidationErrors(
  errors: ReleaseValidationErrors,
  key: string,
  value: LocalizedText,
  label: string,
  limit: number,
  t: ReleaseTranslator
) {
  const fields = [
    { locale: 'id', label: t('languageIndonesian'), value: value.id },
    { locale: 'en', label: t('languageEnglish'), value: value.en },
  ] as const;
  for (const field of fields) {
    const fieldKey = `${key}.${field.locale}`;
    const fieldLabel = `${label} — ${field.label}`;
    if (!field.value.trim()) {
      errors[fieldKey] = t('releaseValidationRequired', { field: fieldLabel });
    } else if (field.value.length > limit) {
      errors[fieldKey] = t('releaseValidationMaxLength', {
        field: fieldLabel,
        limit,
      });
    }
  }
}

function validateReleaseDraft(
  app: AdminDownloadApp,
  reason: string,
  t: ReleaseTranslator
): ReleaseValidationErrors {
  const errors: ReleaseValidationErrors = {};
  const version = app.version.trim();
  if (!version || version.length > 40 || !stableVersionPattern.test(version)) {
    errors.version = t('releaseValidationVersion');
  }

  addLocalizedValidationErrors(
    errors,
    'eyebrow',
    app.eyebrow,
    t('releaseEyebrow'),
    600,
    t
  );
  addLocalizedValidationErrors(
    errors,
    'title',
    app.title,
    t('releaseTitle'),
    600,
    t
  );
  addLocalizedValidationErrors(
    errors,
    'description',
    app.description,
    t('releaseDescription'),
    600,
    t
  );
  addLocalizedValidationErrors(
    errors,
    'requirements',
    app.requirements,
    t('releaseRequirements'),
    600,
    t
  );
  addLocalizedValidationErrors(
    errors,
    'architecture',
    app.architecture,
    t('releaseArchitecture'),
    600,
    t
  );

  if (app.features.length < 1 || app.features.length > 4) {
    errors.features = t('releaseValidationFeatureCount');
  }
  app.features.forEach((feature, index) => {
    addLocalizedValidationErrors(
      errors,
      `feature-${index}`,
      feature,
      `${t('releaseFeature')} ${index + 1}`,
      180,
      t
    );
  });

  if (app.assets.length < 1 || app.assets.length > 4) {
    errors.assets = t('releaseValidationAssetCount');
  }
  const seenIDs = new Set<string>();
  let primaryCount = 0;
  app.assets.forEach((asset, index) => {
    const assetKey = `asset-${index}`;
    const assetNumber = index + 1;
    const assetID = asset.id.trim().toLowerCase();
    if (!assetIDPattern.test(assetID) || seenIDs.has(assetID)) {
      errors[`${assetKey}.id`] = t('releaseValidationAssetId', {
        index: assetNumber,
      });
    }
    seenIDs.add(assetID);

    const fileName = asset.file_name.trim();
    if (
      !fileName ||
      fileName.length > 180 ||
      fileName.includes('/') ||
      fileName.includes('\\')
    ) {
      errors[`${assetKey}.file_name`] = t('releaseValidationFileName', {
        index: assetNumber,
      });
    }

    addLocalizedValidationErrors(
      errors,
      `${assetKey}.label`,
      asset.label,
      `${t('releaseAssetLabel')} ${assetNumber}`,
      100,
      t
    );

    try {
      const parsed = new URL(asset.url.trim());
      if (parsed.protocol !== 'https:' || parsed.hostname !== 'github.com') {
        throw new Error('invalid release URL');
      }
    } catch {
      if (!errors[`${assetKey}.url`]) {
        errors[`${assetKey}.url`] = t('releaseValidationUrl');
      }
    }

    if (!Number.isSafeInteger(asset.size_bytes) || asset.size_bytes <= 0) {
      errors[`${assetKey}.size_bytes`] = t('releaseValidationSize', {
        index: assetNumber,
      });
    }
    if (!sha256Pattern.test(asset.sha256.trim().toLowerCase())) {
      errors[`${assetKey}.sha256`] = t('releaseValidationChecksum', {
        index: assetNumber,
      });
    }
    if (asset.primary) primaryCount += 1;
  });

  if (primaryCount !== 1) {
    errors.primary = t('releaseValidationPrimary');
  }
  if (
    (app.platform === 'android' || app.platform === 'windows') &&
    app.assets.length !== 1
  ) {
    errors.assets = t('releaseValidationSingleAsset');
  }
  if (!reason.trim()) {
    errors.reason = t('releaseValidationReason');
  }
  return errors;
}

function LocalizedFields({
  value,
  onChange,
  label,
  fieldKey,
  errors,
  multiline = false,
}: {
  value: LocalizedText;
  onChange: (value: LocalizedText) => void;
  label: string;
  fieldKey: string;
  errors?: { id?: string; en?: string };
  multiline?: boolean;
}) {
  const t = useTranslations('adminPage');
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <AdminFormField label={`${label} — ${t('languageIndonesian')}`} required>
        {multiline ? (
          <textarea
            className={releaseFieldClass(errors?.id)}
            value={value.id}
            aria-invalid={Boolean(errors?.id)}
            onChange={(event) => onChange({ ...value, id: event.target.value })}
            rows={3}
          />
        ) : (
          <input
            className={releaseFieldClass(errors?.id)}
            value={value.id}
            aria-invalid={Boolean(errors?.id)}
            onChange={(event) => onChange({ ...value, id: event.target.value })}
          />
        )}
        <FieldError id={`${fieldKey}-id-error`} message={errors?.id} />
      </AdminFormField>
      <AdminFormField label={`${label} — ${t('languageEnglish')}`} required>
        {multiline ? (
          <textarea
            className={releaseFieldClass(errors?.en)}
            value={value.en}
            aria-invalid={Boolean(errors?.en)}
            onChange={(event) => onChange({ ...value, en: event.target.value })}
            rows={3}
          />
        ) : (
          <input
            className={releaseFieldClass(errors?.en)}
            value={value.en}
            aria-invalid={Boolean(errors?.en)}
            onChange={(event) => onChange({ ...value, en: event.target.value })}
          />
        )}
        <FieldError id={`${fieldKey}-en-error`} message={errors?.en} />
      </AdminFormField>
    </div>
  );
}

function ReleaseEditor({
  app,
  save,
}: {
  app: AdminDownloadApp;
  save: (
    platform: DownloadPlatform,
    app: AdminDownloadApp,
    reason: string
  ) => Promise<unknown>;
}) {
  const t = useTranslations('adminPage');
  const [draft, setDraft] = useState(() => cloneApp(app));
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [validationErrors, setValidationErrors] =
    useState<ReleaseValidationErrors>({});

  const updateDraft = (
    updater: (current: AdminDownloadApp) => AdminDownloadApp
  ) => {
    setValidationErrors({});
    setDraft(updater);
  };
  const fieldError = (key: string) => validationErrors[key];

  const setAsset = (index: number, next: DownloadAsset) => {
    updateDraft((current) => ({
      ...current,
      assets: current.assets.map((asset, itemIndex) =>
        itemIndex === index ? next : asset
      ),
    }));
  };
  const setFeature = (index: number, next: LocalizedText) => {
    updateDraft((current) => ({
      ...current,
      features: current.features.map((feature, itemIndex) =>
        itemIndex === index ? next : feature
      ),
    }));
  };
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextValidationErrors = validateReleaseDraft(draft, reason, t);
    setValidationErrors(nextValidationErrors);
    if (Object.keys(nextValidationErrors).length > 0) {
      toastValidationError(t('releaseValidationSummary'));
      return;
    }
    setBusy(true);
    try {
      await save(draft.platform, draft, reason.trim());
      setReason('');
      setValidationErrors({});
      toastSuccess(t('releaseSaved'));
    } catch (error) {
      if (errorCode(error) === 'download_apps_failed') {
        reportDevelopmentError('Release validation failed', error);
        setValidationErrors({ _form: t('releaseServerValidation') });
        toastValidationError(t('releaseServerValidation'));
      } else {
        toastError(error, t('releaseSaveError'));
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="border-border bg-card shadow-soft overflow-hidden rounded-2xl">
      <form noValidate onSubmit={submit} className="space-y-6 p-5 sm:p-6">
        {Object.keys(validationErrors).length > 0 ? (
          <div
            role="alert"
            className="border-destructive/30 bg-destructive/5 text-destructive rounded-xl border p-4"
          >
            <p className="text-sm font-bold">{t('releaseValidationSummary')}</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-5">
              {Object.entries(validationErrors).map(([key, message]) => (
                <li key={key}>{message}</li>
              ))}
            </ul>
          </div>
        ) : null}
        <div className="border-border flex flex-wrap items-start justify-between gap-4 border-b pb-5">
          <div>
            <h2 className="text-navy flex items-center gap-2 text-lg font-bold">
              <Download className="text-sky size-5" />
              {draft.platform}
            </h2>
            <p className="text-muted-foreground mt-1 text-sm leading-6">
              {t('releaseEditorHelp')}
            </p>
          </div>
          <label className="text-navy flex items-center gap-2 text-sm font-semibold">
            <input
              type="checkbox"
              checked={draft.published}
              onChange={(event) =>
                updateDraft((current) => ({
                  ...current,
                  published: event.target.checked,
                }))
              }
              className="accent-sky size-4"
            />
            {t('releasePublished')}
          </label>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <AdminFormField label={t('releaseVersion')} required>
            <input
              className={releaseFieldClass(fieldError('version'))}
              value={draft.version}
              aria-invalid={Boolean(fieldError('version'))}
              onChange={(event) =>
                updateDraft((current) => ({
                  ...current,
                  version: event.target.value,
                }))
              }
            />
            <FieldError message={fieldError('version')} />
          </AdminFormField>
          <AdminFormField label={t('releasePlatform')}>
            <input
              className={`${adminFieldClassName} bg-muted`}
              value={draft.platform}
              readOnly
            />
          </AdminFormField>
        </div>
        <LocalizedFields
          label={t('releaseEyebrow')}
          fieldKey="eyebrow"
          value={draft.eyebrow}
          errors={{
            id: fieldError('eyebrow.id'),
            en: fieldError('eyebrow.en'),
          }}
          onChange={(eyebrow) =>
            updateDraft((current) => ({ ...current, eyebrow }))
          }
        />
        <LocalizedFields
          label={t('releaseTitle')}
          fieldKey="title"
          value={draft.title}
          errors={{
            id: fieldError('title.id'),
            en: fieldError('title.en'),
          }}
          onChange={(title) =>
            updateDraft((current) => ({ ...current, title }))
          }
        />
        <LocalizedFields
          label={t('releaseDescription')}
          fieldKey="description"
          value={draft.description}
          errors={{
            id: fieldError('description.id'),
            en: fieldError('description.en'),
          }}
          onChange={(description) =>
            updateDraft((current) => ({ ...current, description }))
          }
          multiline
        />
        <div className="grid gap-4 lg:grid-cols-2">
          <LocalizedFields
            label={t('releaseRequirements')}
            fieldKey="requirements"
            value={draft.requirements}
            errors={{
              id: fieldError('requirements.id'),
              en: fieldError('requirements.en'),
            }}
            onChange={(requirements) =>
              updateDraft((current) => ({ ...current, requirements }))
            }
          />
          <LocalizedFields
            label={t('releaseArchitecture')}
            fieldKey="architecture"
            value={draft.architecture}
            errors={{
              id: fieldError('architecture.id'),
              en: fieldError('architecture.en'),
            }}
            onChange={(architecture) =>
              updateDraft((current) => ({ ...current, architecture }))
            }
          />
        </div>

        <section className="border-border space-y-3 border-t pt-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-navy text-sm font-bold">
              {t('releaseFeatures')}
            </h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={draft.features.length >= 4}
              onClick={() =>
                updateDraft((current) => ({
                  ...current,
                  features: [...current.features, { id: '', en: '' }],
                }))
              }
            >
              <Plus className="size-4" />
              {t('addFeature')}
            </Button>
          </div>
          {draft.features.map((feature, index) => (
            <div key={index} className="flex items-start gap-2">
              <div className="min-w-0 flex-1">
                <LocalizedFields
                  label={`${t('releaseFeature')} ${index + 1}`}
                  fieldKey={`feature-${index}`}
                  value={feature}
                  errors={{
                    id: fieldError(`feature-${index}.id`),
                    en: fieldError(`feature-${index}.en`),
                  }}
                  onChange={(next) => setFeature(index, next)}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-destructive mt-7"
                disabled={draft.features.length <= 1}
                onClick={() =>
                  updateDraft((current) => ({
                    ...current,
                    features: current.features.filter(
                      (_, itemIndex) => itemIndex !== index
                    ),
                  }))
                }
                aria-label={t('remove')}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </section>

        <section className="border-border space-y-4 border-t pt-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-navy text-sm font-bold">
                {t('releaseAssets')}
              </h3>
              <FieldError
                message={fieldError('assets') || fieldError('primary')}
                className="mt-1"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={draft.assets.length >= 4}
              onClick={() =>
                updateDraft((current) => ({
                  ...current,
                  assets: [
                    ...current.assets,
                    {
                      id: `asset-${current.assets.length + 1}`,
                      label: { id: '', en: '' },
                      file_name: '',
                      url: '',
                      size_bytes: 0,
                      sha256: '',
                      primary: false,
                    },
                  ],
                }))
              }
            >
              <Plus className="size-4" />
              {t('addAsset')}
            </Button>
          </div>
          {draft.assets.map((asset, index) => (
            <div
              key={`${asset.id}-${index}`}
              className="border-border bg-muted/30 space-y-3 rounded-xl border p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <strong className="text-navy text-sm">
                  {t('releaseAsset')} {index + 1}
                </strong>
                <div className="flex items-center gap-2">
                  <label className="text-sm font-semibold">
                    <input
                      type="radio"
                      name={`${draft.platform}-primary`}
                      checked={asset.primary}
                      onChange={() =>
                        updateDraft((current) => ({
                          ...current,
                          assets: current.assets.map((item, itemIndex) => ({
                            ...item,
                            primary: itemIndex === index,
                          })),
                        }))
                      }
                      className="accent-sky mr-1"
                    />
                    {t('releasePrimary')}
                  </label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    disabled={draft.assets.length <= 1}
                    onClick={() =>
                      updateDraft((current) => ({
                        ...current,
                        assets: current.assets.filter(
                          (_, itemIndex) => itemIndex !== index
                        ),
                      }))
                    }
                    aria-label={t('remove')}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <AdminFormField label={t('releaseAssetId')} required>
                  <input
                    className={releaseFieldClass(
                      fieldError(`asset-${index}.id`)
                    )}
                    value={asset.id}
                    aria-invalid={Boolean(fieldError(`asset-${index}.id`))}
                    onChange={(event) =>
                      setAsset(index, { ...asset, id: event.target.value })
                    }
                  />
                  <FieldError message={fieldError(`asset-${index}.id`)} />
                </AdminFormField>
                <AdminFormField label={t('releaseFileName')} required>
                  <input
                    className={releaseFieldClass(
                      fieldError(`asset-${index}.file_name`)
                    )}
                    value={asset.file_name}
                    aria-invalid={Boolean(
                      fieldError(`asset-${index}.file_name`)
                    )}
                    onChange={(event) =>
                      setAsset(index, {
                        ...asset,
                        file_name: event.target.value,
                      })
                    }
                  />
                  <FieldError
                    message={fieldError(`asset-${index}.file_name`)}
                  />
                </AdminFormField>
              </div>
              <LocalizedFields
                label={t('releaseAssetLabel')}
                fieldKey={`asset-${index}-label`}
                value={asset.label}
                errors={{
                  id: fieldError(`asset-${index}.label.id`),
                  en: fieldError(`asset-${index}.label.en`),
                }}
                onChange={(label) => setAsset(index, { ...asset, label })}
              />
              <AdminFormField label={t('releaseUrl')} required>
                <input
                  type="url"
                  className={releaseFieldClass(
                    fieldError(`asset-${index}.url`)
                  )}
                  value={asset.url}
                  aria-invalid={Boolean(fieldError(`asset-${index}.url`))}
                  onChange={(event) =>
                    setAsset(index, { ...asset, url: event.target.value })
                  }
                />
                <FieldError message={fieldError(`asset-${index}.url`)} />
              </AdminFormField>
              <div className="grid gap-3 sm:grid-cols-2">
                <AdminFormField label={t('releaseSizeBytes')} required>
                  <input
                    type="number"
                    min="1"
                    className={releaseFieldClass(
                      fieldError(`asset-${index}.size_bytes`)
                    )}
                    value={asset.size_bytes || ''}
                    aria-invalid={Boolean(
                      fieldError(`asset-${index}.size_bytes`)
                    )}
                    onChange={(event) =>
                      setAsset(index, {
                        ...asset,
                        size_bytes: Number(event.target.value),
                      })
                    }
                  />
                  <FieldError
                    message={fieldError(`asset-${index}.size_bytes`)}
                  />
                </AdminFormField>
                <AdminFormField label={t('releaseChecksum')} required>
                  <input
                    className={releaseFieldClass(
                      fieldError(`asset-${index}.sha256`)
                    )}
                    value={asset.sha256}
                    aria-invalid={Boolean(fieldError(`asset-${index}.sha256`))}
                    onChange={(event) =>
                      setAsset(index, { ...asset, sha256: event.target.value })
                    }
                  />
                  <FieldError message={fieldError(`asset-${index}.sha256`)} />
                </AdminFormField>
              </div>
            </div>
          ))}
        </section>
        <AdminFormField label={t('changeReason')} required>
          <textarea
            className={releaseFieldClass(fieldError('reason'))}
            rows={3}
            value={reason}
            aria-invalid={Boolean(fieldError('reason'))}
            onChange={(event) => {
              setValidationErrors({});
              setReason(event.target.value);
            }}
            placeholder={t('releaseReasonPlaceholder')}
            required
          />
          <FieldError message={fieldError('reason')} />
        </AdminFormField>
        <div className="flex justify-end">
          <Button type="submit" disabled={busy} aria-busy={busy}>
            <Save className="size-4" />
            {busy ? t('submitting') : t('saveRelease')}
          </Button>
        </div>
      </form>
    </Card>
  );
}

export function ReleasesTab({
  apps,
  updateDownloadApp,
}: {
  apps: AdminDownloadApp[];
  updateDownloadApp: (
    platform: DownloadPlatform,
    app: AdminDownloadApp,
    reason: string
  ) => Promise<unknown>;
}) {
  const t = useTranslations('adminPage');
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-navy text-xl font-bold">{t('releasesTitle')}</h1>
        <p className="text-muted-foreground mt-1 text-sm leading-6">
          {t('releasesDescription')}
        </p>
      </div>
      {apps.map((app) => (
        <ReleaseEditor
          key={`${app.platform}-${app.updated_at}`}
          app={app}
          save={updateDownloadApp}
        />
      ))}
    </div>
  );
}
