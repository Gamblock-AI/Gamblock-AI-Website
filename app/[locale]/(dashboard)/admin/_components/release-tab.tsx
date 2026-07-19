import { type FormEvent, useState } from 'react';
import { FileCheck2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type {
  AdminModelReleaseDraft,
  AdminRelease,
  AdminReleaseRollout,
} from '@/hooks/use-admin-operations';
import { toastError, toastSuccess } from '@/lib/feedback';
import {
  dynamicLabelFallback,
  dynamicLabelKey,
} from '@/lib/i18n/dynamic-labels';
import {
  AdminEmptyTable,
  AdminFormField,
  AdminSectionHeader,
  AdminStatusBadge,
  adminFieldClassName,
} from './admin-shared';

const EMPTY_RELEASE: AdminModelReleaseDraft = {
  kind: 'model',
  version: '',
  platform: 'all',
  artifact_path: '',
  sha256: '',
  contract_version: 'v1',
  threshold: '0.5',
};

const platforms = ['all', 'android', 'windows', 'linux', 'macos', 'web'];

interface ReleaseTabProps {
  allReleases: Record<'model' | 'ruleset' | 'network', AdminRelease[]>;
  rollouts: AdminReleaseRollout[];
  createModelRelease: (release: AdminModelReleaseDraft) => Promise<void>;
  uploadReleaseArtifact: (
    file: File
  ) => Promise<{ artifact_path: string; sha256: string }>;
  createRollout: (input: {
    kind: string;
    release_id: string;
    platform: string;
    percentage: number;
    app_version_constraint?: string;
    reason: string;
  }) => Promise<unknown>;
  transitionRollout: (
    id: string,
    action: string,
    reason: string
  ) => Promise<unknown>;
}

export function ReleaseTab({
  allReleases,
  rollouts,
  createModelRelease,
  uploadReleaseArtifact,
  createRollout,
  transitionRollout,
}: ReleaseTabProps) {
  const t = useTranslations('adminPage');
  const tDynamic = useTranslations('dynamicLabels');
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_RELEASE);
  const [submitting, setSubmitting] = useState(false);
  const releaseRows = (['model', 'ruleset', 'network'] as const).flatMap(
    (kind) => allReleases[kind].map((release) => ({ kind, release }))
  );
  const [rolloutKind, setRolloutKind] = useState<
    'model' | 'ruleset' | 'network'
  >('model');
  const [rolloutReleaseID, setRolloutReleaseID] = useState('');
  const [rolloutPlatform, setRolloutPlatform] = useState('all');
  const [rolloutPercentage, setRolloutPercentage] = useState(10);
  const [rolloutConstraint, setRolloutConstraint] = useState('');
  const [rolloutReason, setRolloutReason] = useState('');

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await createModelRelease(form);
      setForm(EMPTY_RELEASE);
      setFormOpen(false);
      toastSuccess(t('releaseValidated'));
    } catch (error) {
      toastError(error, t('releaseCreateError'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-1">
        <div>
          <h3 className="text-navy text-base font-bold">Validasi Artefak & Rollout</h3>
          <p className="text-muted-foreground mt-0.5 text-xs">
            {t('releaseDescription')}
          </p>
        </div>
        <Button size="sm" onClick={() => setFormOpen((open) => !open)}>
          <FileCheck2 className="mr-1.5 size-4" />
          {t('validateArtifact')}
        </Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {[t('gateArtifact'), t('gateChecksum'), t('gateContract')].map(
          (gate, index) => (
            <Card key={gate} className="flex items-start gap-3 p-4">
              <span className="bg-sage/10 text-sage flex size-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold">
                {index + 1}
              </span>
              <p className="text-navy text-sm leading-5 font-semibold">
                {gate}
              </p>
            </Card>
          )
        )}
      </div>
      {formOpen ? (
        <form
          onSubmit={(event) => void submit(event)}
          className="border-border bg-card grid gap-4 rounded-2xl border p-5 sm:grid-cols-2"
        >
          <AdminFormField label={t('thVersion')}>
            <input
              className={adminFieldClassName}
              value={form.version}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  version: event.target.value,
                }))
              }
              placeholder="artifact-v0.4.0-rc1"
              required
            />
          </AdminFormField>
          <AdminFormField label={t('releaseKind')}>
            <select
              className={adminFieldClassName}
              value={form.kind}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  kind: event.target.value as AdminModelReleaseDraft['kind'],
                }))
              }
            >
              <option value="model">Model</option>
              <option value="ruleset">Ruleset</option>
              <option value="network">Network ruleset</option>
            </select>
          </AdminFormField>
          <AdminFormField label={t('platform')}>
            <select
              className={adminFieldClassName}
              value={form.platform}
              disabled={form.kind !== 'model'}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  platform: event.target.value,
                }))
              }
            >
              {platforms.map((platform) => (
                <option key={platform} value={platform}>
                  {tDynamic(dynamicLabelKey('platform', platform), {
                    value: dynamicLabelFallback(platform),
                  })}
                </option>
              ))}
            </select>
          </AdminFormField>
          <AdminFormField label={t('artifactPath')} className="sm:col-span-2">
            <input
              className={adminFieldClassName}
              value={form.artifact_path}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  artifact_path: event.target.value,
                }))
              }
              placeholder="uploads/YYYY/MM/artifact.onnx"
              required
            />
          </AdminFormField>
          <AdminFormField label={t('artifactFile')} className="sm:col-span-2">
            <input
              className={`${adminFieldClassName} py-2`}
              type="file"
              accept=".onnx,.tflite,.json,.bin,.zip,.gz"
              disabled={submitting}
              onChange={async (event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                setSubmitting(true);
                try {
                  const stored = await uploadReleaseArtifact(file);
                  setForm((current) => ({
                    ...current,
                    artifact_path: stored.artifact_path,
                    sha256: stored.sha256,
                  }));
                  toastSuccess(t('artifactUploaded'));
                } catch (error) {
                  toastError(error, t('artifactUploadError'));
                } finally {
                  setSubmitting(false);
                }
              }}
            />
          </AdminFormField>
          <AdminFormField label="SHA-256" className="sm:col-span-2">
            <input
              className={`${adminFieldClassName} font-mono text-xs`}
              value={form.sha256}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  sha256: event.target.value,
                }))
              }
              minLength={64}
              maxLength={64}
              pattern="[a-fA-F0-9]{64}"
              required
            />
          </AdminFormField>
          <AdminFormField label={t('contractVersion')}>
            <input
              className={adminFieldClassName}
              value={form.contract_version}
              disabled={form.kind !== 'model'}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  contract_version: event.target.value,
                }))
              }
              required
            />
          </AdminFormField>
          <AdminFormField label={t('threshold')}>
            <input
              className={adminFieldClassName}
              type="number"
              min="0.01"
              max="1"
              step="0.01"
              value={form.threshold}
              disabled={form.kind !== 'model'}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  threshold: event.target.value,
                }))
              }
              required
            />
          </AdminFormField>
          <div className="flex gap-2 sm:col-span-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setFormOpen(false)}
            >
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? t('validating') : t('validateRelease')}
            </Button>
          </div>
        </form>
      ) : null}
      {/* Registered Artifacts Catalog Card */}
      <section className="border-border bg-card shadow-soft overflow-hidden rounded-2xl border">
        <div className="border-border border-b p-4 sm:p-5">
          <h3 className="text-navy text-base font-bold">Katalog Artefak Terdaftar</h3>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Daftar seluruh versi model AI, ruleset, dan konfigurasi jaringan yang divalidasi.
          </p>
        </div>
        <Table className="[&_td]:px-4 [&_td]:py-3.5 sm:[&_td]:px-5 [&_th]:h-11 [&_th]:px-4 sm:[&_th]:px-5">
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="font-bold text-xs">{t('releaseKind')}</TableHead>
              <TableHead className="font-bold text-xs">{t('thVersion')}</TableHead>
              <TableHead className="font-bold text-xs">{t('platform')}</TableHead>
              <TableHead className="font-bold text-xs">{t('contractVersion')}</TableHead>
              <TableHead className="font-bold text-xs">{t('thStatus')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {releaseRows.length === 0 ? (
              <AdminEmptyTable colSpan={5} text={t('noReleases')} />
            ) : (
              releaseRows.map(({ kind, release }) => (
                <TableRow key={release.id}>
                  <TableCell className="capitalize text-xs font-medium">{kind}</TableCell>
                  <TableCell className="text-navy text-sm font-semibold">
                    {release.version}
                  </TableCell>
                  <TableCell className="text-xs">
                    {tDynamic(dynamicLabelKey('platform', release.platform), {
                      value: dynamicLabelFallback(release.platform),
                    })}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{release.contract_version || '—'}</TableCell>
                  <TableCell>
                    <AdminStatusBadge status={release.status} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </section>

      <div className="space-y-3 pt-2">
        <AdminSectionHeader
          title={t('rolloutTitle')}
          description={t('rolloutDescription')}
        />
        <form
          className="border-border bg-card grid gap-4 rounded-2xl border p-5 sm:grid-cols-2 lg:grid-cols-3"
          onSubmit={async (event) => {
            event.preventDefault();
            setSubmitting(true);
            try {
              await createRollout({
                kind: rolloutKind,
                release_id: rolloutReleaseID,
                platform: rolloutPlatform,
                percentage: rolloutPercentage,
                app_version_constraint: rolloutConstraint,
                reason: rolloutReason,
              });
              setRolloutReleaseID('');
              setRolloutReason('');
              toastSuccess(t('rolloutCreated'));
            } catch (error) {
              toastError(error, t('rolloutError'));
            } finally {
              setSubmitting(false);
            }
          }}
        >
          <AdminFormField label={t('releaseKind')}>
            <select
              className={adminFieldClassName}
              value={rolloutKind}
              onChange={(event) => {
                const kind = event.target.value as typeof rolloutKind;
                setRolloutKind(kind);
                setRolloutReleaseID('');
              }}
            >
              <option value="model">Model</option>
              <option value="ruleset">Ruleset</option>
              <option value="network">Network ruleset</option>
            </select>
          </AdminFormField>
          <AdminFormField label={t('releaseCandidate')}>
            <select
              className={adminFieldClassName}
              value={rolloutReleaseID}
              onChange={(event) => setRolloutReleaseID(event.target.value)}
              required
            >
              <option value="">{t('chooseRelease')}</option>
              {allReleases[rolloutKind]
                .filter((release) => release.status === 'validated')
                .map((release) => (
                  <option key={release.id} value={release.id}>
                    {release.version}
                  </option>
                ))}
            </select>
          </AdminFormField>
          <AdminFormField label={t('platform')}>
            <select
              className={adminFieldClassName}
              value={rolloutPlatform}
              onChange={(event) => setRolloutPlatform(event.target.value)}
            >
              {platforms.map((platform) => (
                <option key={platform} value={platform}>
                  {platform}
                </option>
              ))}
            </select>
          </AdminFormField>
          <AdminFormField label={t('cohortPercentage')}>
            <input
              className={adminFieldClassName}
              type="number"
              min={1}
              max={100}
              value={rolloutPercentage}
              onChange={(event) =>
                setRolloutPercentage(Number(event.target.value))
              }
              required
            />
          </AdminFormField>
          <AdminFormField label={t('appVersionConstraint')}>
            <input
              className={adminFieldClassName}
              value={rolloutConstraint}
              onChange={(event) => setRolloutConstraint(event.target.value)}
              placeholder=">=1.0.0"
            />
          </AdminFormField>
          <AdminFormField label={t('changeReason')}>
            <input
              className={adminFieldClassName}
              value={rolloutReason}
              onChange={(event) => setRolloutReason(event.target.value)}
              placeholder={t('changeReasonPlaceholder')}
              required
            />
          </AdminFormField>
          <div className="lg:col-span-3 lg:text-right">
            <Button type="submit" disabled={submitting}>
              {t('stageRollout')}
            </Button>
          </div>
        </form>
        <section className="border-border bg-card shadow-soft overflow-hidden rounded-2xl border">
          <div className="border-border border-b p-4 sm:p-5">
            <h3 className="text-navy text-base font-bold">Status Cohort Rollout</h3>
            <p className="text-muted-foreground mt-0.5 text-xs">
              Pemantauan status distribusi bertahap dan tindakan penghentian darurat.
            </p>
          </div>
          <Table className="[&_td]:px-4 [&_td]:py-3.5 sm:[&_td]:px-5 [&_th]:h-11 [&_th]:px-4 sm:[&_th]:px-5">
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="font-bold text-xs">{t('releaseKind')}</TableHead>
                <TableHead className="font-bold text-xs">{t('thVersion')}</TableHead>
                <TableHead className="font-bold text-xs">{t('platform')}</TableHead>
                <TableHead className="font-bold text-xs">{t('cohortPercentage')}</TableHead>
                <TableHead className="font-bold text-xs">{t('thStatus')}</TableHead>
                <TableHead className="text-right font-bold text-xs">{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rollouts.length === 0 ? (
                <AdminEmptyTable colSpan={6} text={t('noRollouts')} />
              ) : (
                rollouts.map((rollout) => (
                  <TableRow key={rollout.id}>
                    <TableCell className="capitalize text-xs font-medium">{rollout.kind}</TableCell>
                    <TableCell className="text-navy text-sm font-semibold">
                      {rollout.release_version}
                    </TableCell>
                    <TableCell className="text-xs">{rollout.platform}</TableCell>
                    <TableCell className="font-mono text-xs font-bold text-navy">{rollout.percentage}%</TableCell>
                    <TableCell>
                      <AdminStatusBadge status={rollout.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-wrap justify-end gap-2">
                        {rollout.status === 'staged' ||
                        rollout.status === 'paused' ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              void transitionRollout(rollout.id, 'active', '')
                                .then(() => toastSuccess(t('rolloutUpdated')))
                                .catch((error) =>
                                  toastError(error, t('rolloutError'))
                                )
                            }
                          >
                            {t('activate')}
                          </Button>
                        ) : null}
                        {rollout.status === 'active' ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const reason = window.prompt(t('reasonPrompt'));
                              if (reason)
                                void transitionRollout(
                                  rollout.id,
                                  'paused',
                                  reason
                                )
                                  .then(() => toastSuccess(t('rolloutUpdated')))
                                  .catch((error) =>
                                    toastError(error, t('rolloutError'))
                                  );
                            }}
                          >
                            {t('pause')}
                          </Button>
                        ) : null}
                        {['staged', 'active', 'paused'].includes(
                          rollout.status
                        ) ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const reason = window.prompt(t('reasonPrompt'));
                              if (reason)
                                void transitionRollout(
                                  rollout.id,
                                  'rolled_back',
                                  reason
                                )
                                  .then(() => toastSuccess(t('rolloutUpdated')))
                                  .catch((error) =>
                                    toastError(error, t('rolloutError'))
                                  );
                            }}
                          >
                            {t('rollback')}
                          </Button>
                        ) : null}
                        {rollout.status === 'active' ? (
                          <Button
                            size="sm"
                            onClick={() =>
                              void transitionRollout(
                                rollout.id,
                                'completed',
                                ''
                              )
                                .then(() => toastSuccess(t('rolloutUpdated')))
                                .catch((error) =>
                                  toastError(error, t('rolloutError'))
                                )
                            }
                          >
                            {t('complete')}
                          </Button>
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </section>
      </div>
    </div>
  );
}
