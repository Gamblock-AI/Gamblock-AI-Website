import { type FormEvent, useState } from 'react';
import { BookOpen, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type {
  AdminModuleDraft,
  AdminEducationModule,
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

const EMPTY_MODULE: AdminModuleDraft = {
  title: '',
  slug: '',
  summary: '',
  body_markdown: '',
  estimated_minutes: 5,
};

interface ContentTabProps {
  modules: AdminEducationModule[];
  createModule: (module: AdminModuleDraft) => Promise<void>;
}

export function ContentTab({ modules, createModule }: ContentTabProps) {
  const t = useTranslations('adminPage');
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_MODULE);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await createModule(form);
      setForm(EMPTY_MODULE);
      setFormOpen(false);
      toastSuccess(t('moduleCreated'));
    } catch (error) {
      toastError(error, t('moduleCreateError'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <AdminSectionHeader
        title={t('contentTitle')}
        description={t('contentDescription')}
        action={
          <Button size="sm" onClick={() => setFormOpen((open) => !open)}>
            <Plus className="mr-1.5 size-4" />
            {t('newModule')}
          </Button>
        }
      />
      {formOpen ? (
        <form
          onSubmit={(event) => void submit(event)}
          className="border-border bg-card grid gap-4 rounded-2xl border p-5 sm:grid-cols-2"
        >
          <AdminFormField label={t('moduleTitle')}>
            <input
              className={adminFieldClassName}
              value={form.title}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
              required
            />
          </AdminFormField>
          <AdminFormField label={t('thSlug')}>
            <input
              className={adminFieldClassName}
              value={form.slug}
              onChange={(event) =>
                setForm((current) => ({ ...current, slug: event.target.value }))
              }
              pattern="[a-z0-9-]+"
              placeholder="pause-before-impulse"
              required
            />
          </AdminFormField>
          <AdminFormField label={t('moduleSummary')} className="sm:col-span-2">
            <input
              className={adminFieldClassName}
              value={form.summary}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  summary: event.target.value,
                }))
              }
              required
            />
          </AdminFormField>
          <AdminFormField label={t('moduleBody')} className="sm:col-span-2">
            <textarea
              className={`${adminFieldClassName} min-h-32 py-3`}
              value={form.body_markdown}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  body_markdown: event.target.value,
                }))
              }
              required
            />
          </AdminFormField>
          <AdminFormField label={t('thDuration')}>
            <input
              className={adminFieldClassName}
              type="number"
              min={1}
              max={120}
              value={form.estimated_minutes}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  estimated_minutes: Number(event.target.value),
                }))
              }
              required
            />
          </AdminFormField>
          <div className="flex items-end gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setFormOpen(false)}
            >
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? t('saving') : t('saveDraft')}
            </Button>
          </div>
        </form>
      ) : null}
      <AdminTableShell>
        <Table className="[&_td]:px-4 [&_td]:py-3.5 sm:[&_td]:px-5 [&_th]:h-12 [&_th]:px-4 sm:[&_th]:px-5">
          <TableHeader>
            <TableRow>
              <TableHead>{t('thTitle')}</TableHead>
              <TableHead>{t('thSlug')}</TableHead>
              <TableHead>{t('thDuration')}</TableHead>
              <TableHead>{t('thStatus')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {modules.length === 0 ? (
              <AdminEmptyTable colSpan={4} text={t('noModules')} />
            ) : (
              modules.map((module) => (
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
                    <AdminStatusBadge status={module.status} />
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
