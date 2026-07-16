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
  AdminModelRelease,
  AdminModelReleaseDraft,
} from '@/hooks/use-admin-operations';
import { toastError, toastSuccess } from '@/lib/feedback';
import {
  AdminEmptyTable,
  AdminFormField,
  AdminSectionHeader,
  AdminStatusBadge,
  AdminTableShell,
  adminFieldClassName,
} from './admin-shared';

const EMPTY_RELEASE: AdminModelReleaseDraft = {
  version: '',
  platform: 'all',
  artifact_path: '',
  sha256: '',
  contract_version: 'v1',
  threshold: '0.5',
};

const platforms = ['all', 'android', 'windows', 'linux', 'macos', 'web'];

interface ReleaseTabProps {
  releases: AdminModelRelease[];
  createModelRelease: (release: AdminModelReleaseDraft) => Promise<void>;
}

export function ReleaseTab({ releases, createModelRelease }: ReleaseTabProps) {
  const t = useTranslations('adminPage');
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_RELEASE);
  const [submitting, setSubmitting] = useState(false);

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
      <AdminSectionHeader
        title={t('releaseTitle')}
        description={t('releaseDescription')}
        action={
          <Button size="sm" onClick={() => setFormOpen((open) => !open)}>
            <FileCheck2 className="mr-1.5 size-4" />
            {t('validateArtifact')}
          </Button>
        }
      />
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
          <AdminFormField label={t('platform')}>
            <select
              className={adminFieldClassName}
              value={form.platform}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  platform: event.target.value,
                }))
              }
            >
              {platforms.map((platform) => (
                <option key={platform}>{platform}</option>
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
              placeholder="model/artifact-v0.4.0-rc1.onnx"
              required
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
      <AdminTableShell>
        <Table className="[&_td]:px-4 [&_td]:py-3.5 sm:[&_td]:px-5 [&_th]:h-12 [&_th]:px-4 sm:[&_th]:px-5">
          <TableHeader>
            <TableRow>
              <TableHead>{t('thVersion')}</TableHead>
              <TableHead>{t('platform')}</TableHead>
              <TableHead>{t('contractVersion')}</TableHead>
              <TableHead>{t('thStatus')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {releases.length === 0 ? (
              <AdminEmptyTable colSpan={4} text={t('noReleases')} />
            ) : (
              releases.map((release) => (
                <TableRow key={release.id}>
                  <TableCell className="text-navy font-semibold">
                    {release.version}
                  </TableCell>
                  <TableCell>{release.platform}</TableCell>
                  <TableCell>{release.contract_version || '—'}</TableCell>
                  <TableCell>
                    <AdminStatusBadge status={release.status} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </AdminTableShell>
    </div>
  );
}
