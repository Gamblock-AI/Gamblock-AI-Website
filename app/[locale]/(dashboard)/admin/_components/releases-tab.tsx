'use client';

import { type FormEvent, useState } from 'react';
import { Download, Plus, Save, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { AdminDownloadApp } from '@/hooks/use-admin-operations';
import type {
  DownloadAsset,
  DownloadPlatform,
  LocalizedText,
} from '@/hooks/use-public-download-apps';
import { toastError, toastSuccess } from '@/lib/feedback';
import { AdminFormField, adminFieldClassName } from './admin-shared';

function cloneApp(app: AdminDownloadApp): AdminDownloadApp {
  return JSON.parse(JSON.stringify(app)) as AdminDownloadApp;
}

function LocalizedFields({
  value,
  onChange,
  label,
  multiline = false,
}: {
  value: LocalizedText;
  onChange: (value: LocalizedText) => void;
  label: string;
  multiline?: boolean;
}) {
  const t = useTranslations('adminPage');
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <AdminFormField label={`${label} — ${t('languageIndonesian')}`} required>
        {multiline ? (
          <textarea
            className={adminFieldClassName}
            value={value.id}
            onChange={(event) => onChange({ ...value, id: event.target.value })}
            rows={3}
          />
        ) : (
          <input
            className={adminFieldClassName}
            value={value.id}
            onChange={(event) => onChange({ ...value, id: event.target.value })}
          />
        )}
      </AdminFormField>
      <AdminFormField label={`${label} — ${t('languageEnglish')}`} required>
        {multiline ? (
          <textarea
            className={adminFieldClassName}
            value={value.en}
            onChange={(event) => onChange({ ...value, en: event.target.value })}
            rows={3}
          />
        ) : (
          <input
            className={adminFieldClassName}
            value={value.en}
            onChange={(event) => onChange({ ...value, en: event.target.value })}
          />
        )}
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

  const setAsset = (index: number, next: DownloadAsset) => {
    setDraft((current) => ({
      ...current,
      assets: current.assets.map((asset, itemIndex) =>
        itemIndex === index ? next : asset
      ),
    }));
  };
  const setFeature = (index: number, next: LocalizedText) => {
    setDraft((current) => ({
      ...current,
      features: current.features.map((feature, itemIndex) =>
        itemIndex === index ? next : feature
      ),
    }));
  };
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!reason.trim()) return;
    setBusy(true);
    try {
      await save(draft.platform, draft, reason.trim());
      setReason('');
      toastSuccess(t('releaseSaved'));
    } catch (error) {
      toastError(error, t('releaseSaveError'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="border-border bg-card shadow-soft overflow-hidden rounded-2xl">
      <form onSubmit={submit} className="space-y-6 p-5 sm:p-6">
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
                setDraft((current) => ({
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
              className={adminFieldClassName}
              value={draft.version}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  version: event.target.value,
                }))
              }
            />
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
          value={draft.eyebrow}
          onChange={(eyebrow) =>
            setDraft((current) => ({ ...current, eyebrow }))
          }
        />
        <LocalizedFields
          label={t('releaseTitle')}
          value={draft.title}
          onChange={(title) => setDraft((current) => ({ ...current, title }))}
        />
        <LocalizedFields
          label={t('releaseDescription')}
          value={draft.description}
          onChange={(description) =>
            setDraft((current) => ({ ...current, description }))
          }
          multiline
        />
        <div className="grid gap-4 lg:grid-cols-2">
          <LocalizedFields
            label={t('releaseRequirements')}
            value={draft.requirements}
            onChange={(requirements) =>
              setDraft((current) => ({ ...current, requirements }))
            }
          />
          <LocalizedFields
            label={t('releaseArchitecture')}
            value={draft.architecture}
            onChange={(architecture) =>
              setDraft((current) => ({ ...current, architecture }))
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
                setDraft((current) => ({
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
                  value={feature}
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
                  setDraft((current) => ({
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
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-navy text-sm font-bold">
              {t('releaseAssets')}
            </h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={draft.assets.length >= 4}
              onClick={() =>
                setDraft((current) => ({
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
                        setDraft((current) => ({
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
                      setDraft((current) => ({
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
                    className={adminFieldClassName}
                    value={asset.id}
                    onChange={(event) =>
                      setAsset(index, { ...asset, id: event.target.value })
                    }
                  />
                </AdminFormField>
                <AdminFormField label={t('releaseFileName')} required>
                  <input
                    className={adminFieldClassName}
                    value={asset.file_name}
                    onChange={(event) =>
                      setAsset(index, {
                        ...asset,
                        file_name: event.target.value,
                      })
                    }
                  />
                </AdminFormField>
              </div>
              <LocalizedFields
                label={t('releaseAssetLabel')}
                value={asset.label}
                onChange={(label) => setAsset(index, { ...asset, label })}
              />
              <AdminFormField label={t('releaseUrl')} required>
                <input
                  type="url"
                  className={adminFieldClassName}
                  value={asset.url}
                  onChange={(event) =>
                    setAsset(index, { ...asset, url: event.target.value })
                  }
                />
              </AdminFormField>
              <div className="grid gap-3 sm:grid-cols-2">
                <AdminFormField label={t('releaseSizeBytes')} required>
                  <input
                    type="number"
                    min="1"
                    className={adminFieldClassName}
                    value={asset.size_bytes || ''}
                    onChange={(event) =>
                      setAsset(index, {
                        ...asset,
                        size_bytes: Number(event.target.value),
                      })
                    }
                  />
                </AdminFormField>
                <AdminFormField label={t('releaseChecksum')} required>
                  <input
                    className={adminFieldClassName}
                    value={asset.sha256}
                    onChange={(event) =>
                      setAsset(index, { ...asset, sha256: event.target.value })
                    }
                  />
                </AdminFormField>
              </div>
            </div>
          ))}
        </section>
        <AdminFormField label={t('changeReason')} required>
          <textarea
            className={adminFieldClassName}
            rows={3}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder={t('releaseReasonPlaceholder')}
            required
          />
        </AdminFormField>
        <div className="flex justify-end">
          <Button type="submit" disabled={busy || !reason.trim()}>
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
