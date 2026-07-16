'use client';

import { FormEvent, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  Clock3,
  Copy,
  FileCheck2,
  KeyRound,
  LifeBuoy,
  Plus,
  RefreshCw,
  ShieldCheck,
  Terminal,
  UserRoundCheck,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAdminOperations } from '@/hooks/use-admin-operations';
import { useLocalUser } from '@/hooks/use-local-user';
import { apiClient } from '@/lib/api-client';
import { toastError, toastSuccess } from '@/lib/feedback';
import { DashboardPage } from '@/components/dashboard/dashboard-page';

const fieldClassName =
  'min-h-11 w-full rounded-xl border border-input bg-card px-3 text-base outline-none transition-[border-color,box-shadow] duration-200 focus:border-navy/40 focus:ring-2 focus:ring-navy/30 motion-reduce:transition-none sm:text-sm';

const EMPTY_MODULE = {
  title: '',
  slug: '',
  summary: '',
  body_markdown: '',
  estimated_minutes: 5,
};

const EMPTY_RELEASE = {
  version: '',
  platform: 'all',
  artifact_path: '',
  sha256: '',
  contract_version: 'v1',
  threshold: '0.5',
};

export default function AdminPage() {
  const t = useTranslations('adminPage');
  const locale = useLocale();
  const user = useLocalUser();
  const operations = useAdminOperations(user.role);
  const [moduleFormOpen, setModuleFormOpen] = useState(false);
  const [releaseFormOpen, setReleaseFormOpen] = useState(false);
  const [moduleForm, setModuleForm] = useState(EMPTY_MODULE);
  const [releaseForm, setReleaseForm] = useState(EMPTY_RELEASE);
  const [submitting, setSubmitting] = useState(false);
  const [keyCopied, setKeyCopied] = useState(false);

  const defaultTab = operations.capabilities.content
    ? 'content'
    : operations.capabilities.releases
      ? 'releases'
      : operations.capabilities.support
        ? 'support'
        : 'emergency';

  const hasAccess = Object.values(operations.capabilities).some(Boolean);

  const createModule = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await apiClient('/admin/content/modules', {
        method: 'POST',
        body: JSON.stringify(moduleForm),
      });
      setModuleForm(EMPTY_MODULE);
      setModuleFormOpen(false);
      toastSuccess(t('moduleCreated'));
      await operations.refetch();
    } catch (error) {
      toastError(error, t('moduleCreateError'));
    } finally {
      setSubmitting(false);
    }
  };

  const createRelease = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await apiClient('/releases/model', {
        method: 'POST',
        body: JSON.stringify({
          ...releaseForm,
          threshold: Number(releaseForm.threshold),
          metrics: {},
        }),
      });
      setReleaseForm(EMPTY_RELEASE);
      setReleaseFormOpen(false);
      toastSuccess(t('releaseValidated'));
      await operations.refetch();
    } catch (error) {
      toastError(error, t('releaseCreateError'));
    } finally {
      setSubmitting(false);
    }
  };

  const requestEmergencyKey = async () => {
    try {
      await operations.requestEmergencyKey();
      toastSuccess(t('requestCreated'));
    } catch (error) {
      toastError(error, t('keyError'));
    }
  };

  const approveEmergencyKey = async (requestID: string) => {
    try {
      await operations.approveEmergencyKey(requestID);
      setKeyCopied(false);
      toastSuccess(t('requestApproved'));
    } catch (error) {
      toastError(error, t('keyError'));
    }
  };

  const copyKey = async () => {
    if (!operations.emergencyKey) return;
    await navigator.clipboard.writeText(operations.emergencyKey);
    setKeyCopied(true);
    window.setTimeout(() => setKeyCopied(false), 2400);
  };

  return (
    <DashboardPage density="compact" className="max-w-none">
      <header className="flex flex-col gap-3 rounded-3xl border border-border bg-card p-5 shadow-soft sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-navy flex size-11 items-center justify-center rounded-xl text-white">
            <ShieldCheck className="size-6" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-navy text-xl font-bold tracking-tight">
              {t('title')}
            </h1>
            <p className="text-muted-foreground mt-1 max-w-2xl text-sm leading-6">
              {t('description')}
            </p>
          </div>
        </div>
        {user.role && (
          <Badge variant="secondary" className="w-fit px-3 py-1.5">
            {user.role.replaceAll('_', ' ')}
          </Badge>
        )}
      </header>

      {!hasAccess && user.role ? (
        <Card className="border-amber/30 flex items-start gap-3 p-5">
          <AlertCircle
            className="text-amber mt-0.5 size-5"
            aria-hidden="true"
          />
          <div>
            <h2 className="text-navy font-bold">{t('noAccessTitle')}</h2>
            <p className="text-muted-foreground mt-1 text-sm leading-6">
              {t('noAccessBody')}
            </p>
          </div>
        </Card>
      ) : (
        <Tabs
          key={user.role ?? 'loading'}
          defaultValue={defaultTab}
          className="w-full"
        >
          <TabsList className="group-data-horizontal/tabs:h-auto border-border bg-muted/60 mb-3 flex w-full max-w-full justify-start gap-1 overflow-x-auto overflow-y-hidden rounded-xl border p-1 sm:w-fit">
            {operations.capabilities.content && (
              <TabsTrigger value="content" className="min-h-10 gap-2 px-4">
                <BookOpen className="size-4" aria-hidden="true" />
                {t('tabContent')}
              </TabsTrigger>
            )}
            {operations.capabilities.releases && (
              <TabsTrigger value="releases" className="min-h-10 gap-2 px-4">
                <Terminal className="size-4" aria-hidden="true" />
                {t('tabReleases')}
              </TabsTrigger>
            )}
            {operations.capabilities.support && (
              <TabsTrigger value="support" className="min-h-10 gap-2 px-4">
                <LifeBuoy className="size-4" aria-hidden="true" />
                {t('tabTickets')}
              </TabsTrigger>
            )}
            {operations.capabilities.emergency && (
              <TabsTrigger value="emergency" className="min-h-10 gap-2 px-4">
                <KeyRound className="size-4" aria-hidden="true" />
                {t('tabEmergency')}
              </TabsTrigger>
            )}
          </TabsList>

          {operations.loading ? (
            <Card className="text-muted-foreground flex min-h-56 items-center justify-center gap-2 p-6 text-sm font-semibold">
              <RefreshCw className="size-4 animate-spin motion-reduce:animate-none" />
              {t('loading')}
            </Card>
          ) : operations.error ? (
            <Card className="flex min-h-56 flex-col items-center justify-center gap-3 p-6 text-center">
              <AlertCircle className="text-crimson size-7" aria-hidden="true" />
              <p className="text-muted-foreground text-sm">{t('fetchError')}</p>
              <Button
                variant="outline"
                onClick={() => void operations.refetch()}
              >
                <RefreshCw className="mr-2 size-4" />
                {t('retry')}
              </Button>
            </Card>
          ) : (
            <>
              {operations.capabilities.content && (
                <TabsContent value="content" className="space-y-4">
                  <SectionHeader
                    title={t('contentTitle')}
                    description={t('contentDescription')}
                    action={
                      <Button
                        size="sm"
                        onClick={() => setModuleFormOpen((open) => !open)}
                      >
                        <Plus className="mr-1.5 size-4" />
                        {t('newModule')}
                      </Button>
                    }
                  />

                  {moduleFormOpen && (
                    <form
                      onSubmit={(event) => void createModule(event)}
                      className="border-border bg-card grid gap-4 rounded-2xl border p-5 sm:grid-cols-2"
                    >
                      <FormField label={t('moduleTitle')}>
                        <input
                          className={fieldClassName}
                          value={moduleForm.title}
                          onChange={(event) =>
                            setModuleForm((current) => ({
                              ...current,
                              title: event.target.value,
                            }))
                          }
                          required
                        />
                      </FormField>
                      <FormField label={t('thSlug')}>
                        <input
                          className={fieldClassName}
                          value={moduleForm.slug}
                          onChange={(event) =>
                            setModuleForm((current) => ({
                              ...current,
                              slug: event.target.value,
                            }))
                          }
                          pattern="[a-z0-9-]+"
                          placeholder="pause-before-impulse"
                          required
                        />
                      </FormField>
                      <FormField
                        label={t('moduleSummary')}
                        className="sm:col-span-2"
                      >
                        <input
                          className={fieldClassName}
                          value={moduleForm.summary}
                          onChange={(event) =>
                            setModuleForm((current) => ({
                              ...current,
                              summary: event.target.value,
                            }))
                          }
                          required
                        />
                      </FormField>
                      <FormField
                        label={t('moduleBody')}
                        className="sm:col-span-2"
                      >
                        <textarea
                          className={`${fieldClassName} min-h-32 py-3`}
                          value={moduleForm.body_markdown}
                          onChange={(event) =>
                            setModuleForm((current) => ({
                              ...current,
                              body_markdown: event.target.value,
                            }))
                          }
                          required
                        />
                      </FormField>
                      <FormField label={t('thDuration')}>
                        <input
                          className={fieldClassName}
                          type="number"
                          min={1}
                          max={120}
                          value={moduleForm.estimated_minutes}
                          onChange={(event) =>
                            setModuleForm((current) => ({
                              ...current,
                              estimated_minutes: Number(event.target.value),
                            }))
                          }
                          required
                        />
                      </FormField>
                      <div className="flex items-end gap-2 sm:justify-end">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setModuleFormOpen(false)}
                        >
                          {t('cancel')}
                        </Button>
                        <Button type="submit" disabled={submitting}>
                          {submitting ? t('saving') : t('saveDraft')}
                        </Button>
                      </div>
                    </form>
                  )}

                  <DataTableShell>
                    <Table className="[&_th]:h-12 [&_th]:px-4 [&_td]:px-4 [&_td]:py-3.5 sm:[&_th]:px-5 sm:[&_td]:px-5">
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t('thTitle')}</TableHead>
                          <TableHead>{t('thSlug')}</TableHead>
                          <TableHead>{t('thDuration')}</TableHead>
                          <TableHead>{t('thStatus')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {operations.modules.length === 0 ? (
                          <EmptyTable colSpan={4} text={t('noModules')} />
                        ) : (
                          operations.modules.map((module) => (
                            <TableRow key={module.id}>
                              <TableCell className="text-navy font-semibold">
                                {module.title}
                              </TableCell>
                              <TableCell className="text-muted-foreground font-mono text-xs">
                                {module.slug}
                              </TableCell>
                              <TableCell>
                                {module.estimated_minutes} {t('minutesSuffix')}
                              </TableCell>
                              <TableCell>
                                <StatusBadge status={module.status} />
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </DataTableShell>
                </TabsContent>
              )}

              {operations.capabilities.releases && (
                <TabsContent value="releases" className="space-y-4">
                  <SectionHeader
                    title={t('releaseTitle')}
                    description={t('releaseDescription')}
                    action={
                      <Button
                        size="sm"
                        onClick={() => setReleaseFormOpen((open) => !open)}
                      >
                        <FileCheck2 className="mr-1.5 size-4" />
                        {t('validateArtifact')}
                      </Button>
                    }
                  />
                  <div className="grid gap-3 sm:grid-cols-3">
                    {[
                      t('gateArtifact'),
                      t('gateChecksum'),
                      t('gateContract'),
                    ].map((gate, index) => (
                      <Card key={gate} className="flex items-start gap-3 p-4">
                        <span className="bg-sage/10 text-sage flex size-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold">
                          {index + 1}
                        </span>
                        <p className="text-navy text-sm leading-5 font-semibold">
                          {gate}
                        </p>
                      </Card>
                    ))}
                  </div>

                  {releaseFormOpen && (
                    <form
                      onSubmit={(event) => void createRelease(event)}
                      className="border-border bg-card grid gap-4 rounded-2xl border p-5 sm:grid-cols-2"
                    >
                      <FormField label={t('thVersion')}>
                        <input
                          className={fieldClassName}
                          value={releaseForm.version}
                          onChange={(event) =>
                            setReleaseForm((current) => ({
                              ...current,
                              version: event.target.value,
                            }))
                          }
                          placeholder="artifact-v0.4.0-rc1"
                          required
                        />
                      </FormField>
                      <FormField label={t('platform')}>
                        <select
                          className={fieldClassName}
                          value={releaseForm.platform}
                          onChange={(event) =>
                            setReleaseForm((current) => ({
                              ...current,
                              platform: event.target.value,
                            }))
                          }
                        >
                          {[
                            'all',
                            'android',
                            'windows',
                            'linux',
                            'macos',
                            'web',
                          ].map((platform) => (
                            <option key={platform}>{platform}</option>
                          ))}
                        </select>
                      </FormField>
                      <FormField
                        label={t('artifactPath')}
                        className="sm:col-span-2"
                      >
                        <input
                          className={fieldClassName}
                          value={releaseForm.artifact_path}
                          onChange={(event) =>
                            setReleaseForm((current) => ({
                              ...current,
                              artifact_path: event.target.value,
                            }))
                          }
                          placeholder="model/artifact-v0.4.0-rc1.onnx"
                          required
                        />
                      </FormField>
                      <FormField label="SHA-256" className="sm:col-span-2">
                        <input
                          className={`${fieldClassName} font-mono text-xs`}
                          value={releaseForm.sha256}
                          onChange={(event) =>
                            setReleaseForm((current) => ({
                              ...current,
                              sha256: event.target.value,
                            }))
                          }
                          minLength={64}
                          maxLength={64}
                          pattern="[a-fA-F0-9]{64}"
                          required
                        />
                      </FormField>
                      <FormField label={t('contractVersion')}>
                        <input
                          className={fieldClassName}
                          value={releaseForm.contract_version}
                          onChange={(event) =>
                            setReleaseForm((current) => ({
                              ...current,
                              contract_version: event.target.value,
                            }))
                          }
                          required
                        />
                      </FormField>
                      <FormField label={t('threshold')}>
                        <input
                          className={fieldClassName}
                          type="number"
                          min="0.01"
                          max="1"
                          step="0.01"
                          value={releaseForm.threshold}
                          onChange={(event) =>
                            setReleaseForm((current) => ({
                              ...current,
                              threshold: event.target.value,
                            }))
                          }
                          required
                        />
                      </FormField>
                      <div className="flex gap-2 sm:col-span-2 sm:justify-end">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setReleaseFormOpen(false)}
                        >
                          {t('cancel')}
                        </Button>
                        <Button type="submit" disabled={submitting}>
                          {submitting ? t('validating') : t('validateRelease')}
                        </Button>
                      </div>
                    </form>
                  )}

                  <DataTableShell>
                    <Table className="[&_th]:h-12 [&_th]:px-4 [&_td]:px-4 [&_td]:py-3.5 sm:[&_th]:px-5 sm:[&_td]:px-5">
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t('thVersion')}</TableHead>
                          <TableHead>{t('platform')}</TableHead>
                          <TableHead>{t('contractVersion')}</TableHead>
                          <TableHead>{t('thStatus')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {operations.releases.length === 0 ? (
                          <EmptyTable colSpan={4} text={t('noReleases')} />
                        ) : (
                          operations.releases.map((release) => (
                            <TableRow key={release.id}>
                              <TableCell className="text-navy font-semibold">
                                {release.version}
                              </TableCell>
                              <TableCell>{release.platform}</TableCell>
                              <TableCell>
                                {release.contract_version || '—'}
                              </TableCell>
                              <TableCell>
                                <StatusBadge status={release.status} />
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </DataTableShell>
                </TabsContent>
              )}

              {operations.capabilities.support && (
                <TabsContent value="support" className="space-y-4">
                  <SectionHeader
                    title={t('supportTitle')}
                    description={t('supportDescription')}
                  />
                  <DataTableShell>
                    <Table className="[&_th]:h-12 [&_th]:px-4 [&_td]:px-4 [&_td]:py-3.5 sm:[&_th]:px-5 sm:[&_td]:px-5">
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>{t('thSubject')}</TableHead>
                          <TableHead>{t('thType')}</TableHead>
                          <TableHead>{t('thPriority')}</TableHead>
                          <TableHead>{t('thStatus')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {operations.cases.length === 0 ? (
                          <EmptyTable colSpan={5} text={t('noTickets')} />
                        ) : (
                          operations.cases.map((supportCase) => (
                            <TableRow key={supportCase.id}>
                              <TableCell className="font-mono text-xs">
                                {supportCase.id}
                              </TableCell>
                              <TableCell className="text-navy font-semibold">
                                {supportCase.title}
                              </TableCell>
                              <TableCell>
                                {supportCase.type.replaceAll('_', ' ')}
                              </TableCell>
                              <TableCell>{supportCase.priority}</TableCell>
                              <TableCell>
                                <StatusBadge status={supportCase.status} />
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </DataTableShell>
                </TabsContent>
              )}

              {operations.capabilities.emergency && (
                <TabsContent value="emergency" className="space-y-4">
                  <SectionHeader
                    title={t('emergencyTitle')}
                    description={t('emergencyDescription')}
                    action={
                      <Button
                        size="sm"
                        onClick={() => void requestEmergencyKey()}
                        disabled={operations.keyLoading}
                      >
                        <Plus className="mr-1.5 size-4" />
                        {t('requestKey')}
                      </Button>
                    }
                  />

                  {operations.emergencyKey && (
                    <Card className="border-sage/30 bg-sage/[0.04] p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="text-sage size-5" />
                          <div>
                            <h3 className="text-navy font-bold">
                              {t('keyReady')}
                            </h3>
                            <p className="text-muted-foreground mt-1 text-xs">
                              {t('keyReadyBody')}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={operations.clearEmergencyKey}
                        >
                          {t('close')}
                        </Button>
                      </div>
                      <div className="border-border bg-background mt-4 flex flex-col gap-3 rounded-xl border p-3 sm:flex-row sm:items-center">
                        <code className="text-navy flex-1 text-center font-mono text-lg font-bold tracking-[0.18em] select-all sm:text-left">
                          {operations.emergencyKey}
                        </code>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => void copyKey()}
                        >
                          {keyCopied ? (
                            <CheckCircle2 className="text-sage mr-2 size-4" />
                          ) : (
                            <Copy className="mr-2 size-4" />
                          )}
                          {keyCopied ? t('copied') : t('copy')}
                        </Button>
                      </div>
                    </Card>
                  )}

                  <div className="space-y-3">
                    {operations.emergencyRequests.length === 0 ? (
                      <Card className="text-muted-foreground p-6 text-center text-sm">
                        {t('noEmergencyRequests')}
                      </Card>
                    ) : (
                      operations.emergencyRequests.map((request) => {
                        const isOwnRequest = request.requested_by === user.id;
                        return (
                          <Card
                            key={request.id}
                            className="flex flex-col gap-4 p-5 transition-transform duration-200 hover:-translate-y-0.5 motion-reduce:transform-none motion-reduce:transition-none sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div className="flex items-start gap-3">
                              <div className="bg-amber/10 text-amber flex size-9 shrink-0 items-center justify-center rounded-xl">
                                <UserRoundCheck className="size-5" />
                              </div>
                              <div>
                                <p className="text-navy font-semibold">
                                  {t('requestLabel', { id: request.id })}
                                </p>
                                <p className="text-muted-foreground mt-1 text-xs leading-5">
                                  {isOwnRequest
                                    ? t('waitingSecondAdmin')
                                    : t('requestedBy', {
                                        user: request.requested_by,
                                      })}
                                </p>
                                <p className="text-muted-foreground mt-1 flex items-center gap-1.5 text-xs">
                                  <Clock3 className="size-3.5" />
                                  {t('approvalExpires', {
                                    time: new Intl.DateTimeFormat(locale, {
                                      dateStyle: 'medium',
                                      timeStyle: 'short',
                                    }).format(
                                      new Date(request.request_expires_at)
                                    ),
                                  })}
                                </p>
                              </div>
                            </div>
                            <Button
                              variant={isOwnRequest ? 'outline' : 'primary'}
                              disabled={isOwnRequest || operations.keyLoading}
                              onClick={() =>
                                void approveEmergencyKey(request.id)
                              }
                            >
                              {isOwnRequest
                                ? t('needsOtherAdmin')
                                : t('approveAndIssue')}
                            </Button>
                          </Card>
                        );
                      })
                    )}
                  </div>
                </TabsContent>
              )}
            </>
          )}
        </Tabs>
      )}
    </DashboardPage>
  );
}

function SectionHeader({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft sm:flex-row sm:items-center sm:justify-between sm:p-5">
      <div>
        <h2 className="text-navy text-base font-bold">{title}</h2>
        <p className="text-muted-foreground mt-1 max-w-2xl text-sm leading-6">
          {description}
        </p>
      </div>
      {action}
    </div>
  );
}

function FormField({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`space-y-2 ${className ?? ''}`}>
      <span className="text-navy text-xs font-bold">{label}</span>
      {children}
    </label>
  );
}

function DataTableShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-border bg-card overflow-hidden rounded-2xl border">
      {children}
    </div>
  );
}

function EmptyTable({ colSpan, text }: { colSpan: number; text: string }) {
  return (
    <TableRow>
      <TableCell
        colSpan={colSpan}
        className="text-muted-foreground h-28 text-center"
      >
        {text}
      </TableCell>
    </TableRow>
  );
}

function StatusBadge({ status }: { status: string }) {
  const active = status === 'published' || status === 'resolved';
  return (
    <Badge variant={active ? 'default' : 'secondary'}>
      {status.replaceAll('_', ' ')}
    </Badge>
  );
}
