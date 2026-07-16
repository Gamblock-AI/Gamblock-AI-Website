'use client';

import { FormEvent, useState } from 'react';
import {
  CircleHelp,
  FileWarning,
  LifeBuoy,
  LockKeyhole,
  RefreshCw,
  Send,
  ShieldCheck,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  DashboardNotice,
  DashboardPage,
  DashboardPageHeader,
  DashboardPanel,
  DashboardStatus,
} from '@/components/dashboard/dashboard-page';
import { Button } from '@/components/ui/button';
import { toastError, toastSuccess } from '@/lib/feedback';
import { useSupportRequest } from '@/hooks/use-support-request';
import { Skeleton } from '@/components/ui/skeleton';

export default function SupportPage() {
  const t = useTranslations('supportWorkspace');
  const [category, setCategory] = useState('technical_support');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('normal');
  const { submitting, createCase, cases, loading, error, refetch } =
    useSupportRequest();

  const submitCase = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanSubject = subject.trim();
    const cleanDescription = description.trim();
    if (!cleanSubject || !cleanDescription) return;

    try {
      await createCase({
        type: category,
        priority,
        summary: `${cleanSubject}: ${cleanDescription}`,
      });
      setSubject('');
      setDescription('');
      setPriority('normal');
      toastSuccess(t('success'));
    } catch (requestError) {
      toastError(requestError, t('error'));
    }
  };

  return (
    <DashboardPage>
      <DashboardPageHeader
        icon={LifeBuoy}
        eyebrow={t('eyebrow')}
        title={t('title')}
        description={t('description')}
        aside={
          <DashboardNotice
            icon={LockKeyhole}
            title={t('privacyTitle')}
          >
            {t('privacyBody')}
          </DashboardNotice>
        }
      />

      <div className="grid gap-5 xl:grid-cols-12 xl:items-start">
        <DashboardPanel
          icon={Send}
          title={t('formTitle')}
          description={t('formBody')}
          className="xl:col-span-8"
        >
          <form onSubmit={submitCase} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <label
                  htmlFor="support-category"
                  className="text-navy text-sm font-semibold"
                >
                  {t('categoryLabel')}
                </label>
                <select
                  id="support-category"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className="border-input bg-background text-foreground focus-visible:border-navy focus-visible:ring-navy/20 h-11 w-full appearance-none rounded-xl border pr-10 pl-3 text-sm outline-none focus-visible:ring-2"
                  style={{
                    backgroundImage:
                      'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2316294c%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E")',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0.75rem center',
                    backgroundSize: '1em 1em',
                  }}
                >
                  <option value="technical_support">
                    {t('categories.technical')}
                  </option>
                  <option value="device_recovery">
                    {t('categories.device')}
                  </option>
                  <option value="accountability_guidance">
                    {t('categories.accountability')}
                  </option>
                  <option value="privacy_request">
                    {t('categories.privacy')}
                  </option>
                </select>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="support-priority"
                  className="text-navy text-sm font-semibold"
                >
                  {t('priorityLabel')}
                </label>
                <select
                  id="support-priority"
                  value={priority}
                  onChange={(event) => setPriority(event.target.value)}
                  className="border-input bg-background text-foreground focus-visible:border-navy focus-visible:ring-navy/20 h-11 w-full appearance-none rounded-xl border pr-10 pl-3 text-sm outline-none focus-visible:ring-2"
                  style={{
                    backgroundImage:
                      'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2316294c%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E")',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0.75rem center',
                    backgroundSize: '1em 1em',
                  }}
                >
                  <option value="low">{t('priorities.low')}</option>
                  <option value="normal">{t('priorities.normal')}</option>
                  <option value="high">{t('priorities.high')}</option>
                  <option value="urgent">{t('priorities.urgent')}</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="support-subject"
                className="text-navy text-sm font-semibold"
              >
                {t('subjectLabel')}
              </label>
              <input
                id="support-subject"
                type="text"
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                placeholder={t('subjectPlaceholder')}
                className="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:border-navy focus-visible:ring-navy/20 h-11 w-full rounded-xl border px-3 text-sm outline-none focus-visible:ring-2"
                required
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="support-description"
                className="text-navy text-sm font-semibold"
              >
                {t('descriptionLabel')}
              </label>
              <textarea
                id="support-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder={t('descriptionPlaceholder')}
                rows={6}
                aria-describedby="support-privacy-help"
                className="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:border-navy focus-visible:ring-navy/20 w-full resize-y rounded-xl border p-3 text-sm leading-6 outline-none focus-visible:ring-2"
                required
              />
              <p
                id="support-privacy-help"
                className="text-muted-foreground text-xs leading-5"
              >
                {t('descriptionHelp')}
              </p>
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={submitting}
              className="w-full sm:w-auto"
            >
              <Send className="size-4" aria-hidden="true" />
              {submitting ? t('submitting') : t('submit')}
            </Button>
          </form>
        </DashboardPanel>

        <aside className="space-y-5 xl:col-span-4">
          <DashboardNotice
            icon={ShieldCheck}
            title={t('safeReportTitle')}
          >
            {t('safeReportBody')}
          </DashboardNotice>

          <DashboardPanel
            icon={FileWarning}
            title={t('historyTitle')}
            description={t('historyBody')}
            action={
              error ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => void refetch()}
                >
                  <RefreshCw className="size-4" aria-hidden="true" />
                  {t('historyRetry')}
                </Button>
              ) : undefined
            }
          >
            {loading ? (
              <div className="space-y-3" role="status">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <span className="sr-only">{t('historyLoading')}</span>
              </div>
            ) : error ? (
              <p className="text-muted-foreground text-sm leading-6">
                {t('historyError')}
              </p>
            ) : cases.length === 0 ? (
              <p className="text-muted-foreground text-sm leading-6">
                {t('historyBoundary')}
              </p>
            ) : (
              <div className="space-y-3">
                {cases.slice(0, 4).map((item) => (
                  <article
                    key={item.id}
                    className="rounded-2xl border border-border bg-muted/55 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-navy line-clamp-2 text-sm font-bold">
                        {item.title}
                      </p>
                      <DashboardStatus
                        tone={
                          item.status === 'resolved' || item.status === 'closed'
                            ? 'sage'
                            : 'amber'
                        }
                      >
                        {item.status.replaceAll('_', ' ')}
                      </DashboardStatus>
                    </div>
                    <p className="text-muted-foreground mt-2 font-mono text-[11px]">
                      {item.id}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </DashboardPanel>

          <DashboardPanel
            icon={CircleHelp}
            title={t('urgentTitle')}
            description={t('urgentBody')}
          />
        </aside>
      </div>
    </DashboardPage>
  );
}
