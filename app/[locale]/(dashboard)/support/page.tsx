'use client';

import { FormEvent, useState } from 'react';
import {
  CircleHelp,
  FileWarning,
  LifeBuoy,
  LockKeyhole,
  Send,
  ShieldCheck,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  DashboardNotice,
  DashboardPage,
  DashboardPageHeader,
  DashboardPanel,
} from '@/components/dashboard/dashboard-page';
import { Button } from '@/components/ui/button';
import { toastError, toastSuccess } from '@/lib/feedback';
import { useSupportRequest } from '@/hooks/use-support-request';

export default function SupportPage() {
  const t = useTranslations('supportWorkspace');
  const [category, setCategory] = useState('technical_support');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('normal');
  const { submitting, createCase } = useSupportRequest();

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
            tone="sage"
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
                <label htmlFor="support-category" className="text-sm font-semibold text-navy">
                  {t('categoryLabel')}
                </label>
                <select
                  id="support-category"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className="h-11 w-full appearance-none rounded-xl border border-input bg-background pl-3 pr-10 text-sm text-foreground outline-none focus-visible:border-navy focus-visible:ring-2 focus-visible:ring-navy/20"
                  style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2316294c%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1em 1em' }}
                >
                  <option value="technical_support">{t('categories.technical')}</option>
                  <option value="device_recovery">{t('categories.device')}</option>
                  <option value="accountability">{t('categories.accountability')}</option>
                  <option value="privacy_request">{t('categories.privacy')}</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="support-priority" className="text-sm font-semibold text-navy">
                  {t('priorityLabel')}
                </label>
                <select
                  id="support-priority"
                  value={priority}
                  onChange={(event) => setPriority(event.target.value)}
                  className="h-11 w-full appearance-none rounded-xl border border-input bg-background pl-3 pr-10 text-sm text-foreground outline-none focus-visible:border-navy focus-visible:ring-2 focus-visible:ring-navy/20"
                  style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2316294c%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1em 1em' }}
                >
                  <option value="low">{t('priorities.low')}</option>
                  <option value="normal">{t('priorities.normal')}</option>
                  <option value="high">{t('priorities.high')}</option>
                  <option value="urgent">{t('priorities.urgent')}</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="support-subject" className="text-sm font-semibold text-navy">
                {t('subjectLabel')}
              </label>
              <input
                id="support-subject"
                type="text"
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                placeholder={t('subjectPlaceholder')}
                className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-navy focus-visible:ring-2 focus-visible:ring-navy/20"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="support-description" className="text-sm font-semibold text-navy">
                {t('descriptionLabel')}
              </label>
              <textarea
                id="support-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder={t('descriptionPlaceholder')}
                rows={6}
                aria-describedby="support-privacy-help"
                className="w-full resize-y rounded-xl border border-input bg-background p-3 text-sm leading-6 text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-navy focus-visible:ring-2 focus-visible:ring-navy/20"
                required
              />
              <p id="support-privacy-help" className="text-xs leading-5 text-muted-foreground">
                {t('descriptionHelp')}
              </p>
            </div>

            <Button type="submit" size="lg" disabled={submitting} className="w-full sm:w-auto">
              <Send className="size-4" aria-hidden="true" />
              {submitting ? t('submitting') : t('submit')}
            </Button>
          </form>
        </DashboardPanel>

        <aside className="space-y-5 xl:col-span-4">
          <DashboardNotice
            icon={ShieldCheck}
            title={t('safeReportTitle')}
            tone="sage"
          >
            {t('safeReportBody')}
          </DashboardNotice>

          <DashboardPanel
            icon={FileWarning}
            title={t('historyTitle')}
            description={t('historyBody')}
            accent="amber"
          >
            <p className="text-sm leading-6 text-muted-foreground">
              {t('historyBoundary')}
            </p>
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
