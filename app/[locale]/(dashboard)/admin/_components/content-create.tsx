'use client';

import { type FormEvent, useState } from 'react';
import { ArrowLeft, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { DashboardPage } from '@/components/dashboard/dashboard-page';
import { AdminVerificationCard } from '@/components/dashboard/admin-verification-card';
import { Button } from '@/components/ui/button';
import { useAdminOperations } from '@/hooks/use-admin-operations';
import { useLocalUser } from '@/hooks/use-local-user';
import { Link, useRouter } from '@/i18n/routing';
import { toastError, toastSuccess } from '@/lib/feedback';
import { ROUTES } from '@/routes';
import { AdminHeader } from './admin-header';
import { adminFieldClassName } from './admin-shared';
import { makeDocument, slugify } from './content-tab';

/**
 * Dedicated create-module page. The module list's "Buat Modul" button lands
 * here so the title (id/en) and slug are filled on their own page before the
 * editor opens.
 */
export function AdminContentCreate() {
  const t = useTranslations('adminPage');
  const router = useRouter();
  const user = useLocalUser();
  const verifiedRole = user.phone_verified_at ? user.role : undefined;
  const operations = useAdminOperations(verifiedRole, 'content');
  const [idTitle, setIDTitle] = useState('');
  const [enTitle, setENTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [isSlugCustom, setIsSlugCustom] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleIDTitleChange = (val: string) => {
    setIDTitle(val);
    if (!isSlugCustom) setSlug(slugify(val || enTitle));
  };

  const handleENTitleChange = (val: string) => {
    setENTitle(val);
    if (!isSlugCustom && !idTitle) setSlug(slugify(val));
  };

  const handleSlugChange = (val: string) => {
    setSlug(val);
    setIsSlugCustom(true);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    try {
      const educationModule = await operations.createModule({
        slug,
        document: makeDocument(idTitle, enTitle),
      });
      toastSuccess(t('moduleCreated'));
      router.push(`/admin/content/${educationModule.id}`);
    } catch (error) {
      toastError(error, t('moduleCreateError'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <DashboardPage density="compact" className="max-w-none">
      <AdminHeader
        title={t('tabContent')}
        description={t('contentDescription')}
        role={user.role}
      />

      {!user.phone_verified_at ? (
        <AdminVerificationCard />
      ) : (
        <form
          onSubmit={(event) => void submit(event)}
          className="border-border bg-card grid gap-4 rounded-2xl border p-5 sm:grid-cols-2"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 sm:col-span-2">
            <h3 className="text-navy text-base font-bold">{t('newModule')}</h3>
            <Link
              href={ROUTES.ADMIN_CONTENT}
              className="text-muted-foreground hover:text-navy inline-flex items-center gap-1.5 text-xs font-semibold transition-colors"
            >
              <ArrowLeft className="size-3.5" aria-hidden="true" />
              {t('cancel')}
            </Link>
          </div>

          <label className="space-y-2">
            <span className="text-navy text-xs font-bold">
              {t('titleIndonesian')}
            </span>
            <input
              className={adminFieldClassName}
              placeholder="Contoh: Memahami Siklus Dorongan"
              value={idTitle}
              onChange={(event) => handleIDTitleChange(event.target.value)}
              required
            />
          </label>

          <label className="space-y-2">
            <span className="text-navy text-xs font-bold">
              {t('titleEnglish')}
            </span>
            <input
              className={adminFieldClassName}
              placeholder="Contoh: Understanding the Impulse Cycle"
              value={enTitle}
              onChange={(event) => handleENTitleChange(event.target.value)}
              required
            />
          </label>

          <label className="space-y-2 sm:col-span-2">
            <div className="flex items-center justify-between">
              <span className="text-navy text-xs font-bold">{t('thSlug')}</span>
              {isSlugCustom ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsSlugCustom(false);
                    setSlug(slugify(idTitle || enTitle));
                  }}
                  className="text-navy text-[0.7rem] hover:underline"
                >
                  {t('autoSlug')}
                </button>
              ) : null}
            </div>
            <input
              className={adminFieldClassName}
              placeholder="contoh-memahami-siklus-dorongan"
              pattern="[a-z0-9-]+"
              value={slug}
              onChange={(event) => handleSlugChange(event.target.value)}
              required
            />
          </label>

          <div className="flex gap-2 sm:col-span-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(ROUTES.ADMIN_CONTENT)}
            >
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={busy || !slug.trim()}>
              {busy ? t('saving') : t('saveDraft')}
              {!busy ? <Plus className="size-4" aria-hidden="true" /> : null}
            </Button>
          </div>
        </form>
      )}
    </DashboardPage>
  );
}
