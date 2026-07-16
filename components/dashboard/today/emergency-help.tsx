'use client';

import { Phone, MessageCircleWarning, ShieldAlert } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ROUTES } from '@/routes';

export function EmergencyHelp() {
  const t = useTranslations('recoveryDashboard');

  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-soft">
      <div className="flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-crimson text-white shadow-sm">
          <ShieldAlert className="size-[1.125rem]" aria-hidden="true" />
        </span>
        <h3 className="min-w-0 text-[0.9375rem] leading-6 font-bold text-navy">
          {t('emergencyHelpTitle')}
        </h3>
      </div>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        {t('emergencyHelpDesc')}
      </p>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <Link
          href={ROUTES.ACCOUNTABILITY}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-crimson px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-crimson-light"
        >
          <MessageCircleWarning className="size-4" />
          {t('emergencyHelpAction')}
        </Link>
        <Link
          href={ROUTES.SUPPORT}
          className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-crimson/35 bg-card px-4 py-2.5 text-xs font-bold text-crimson outline-none transition-colors duration-200 hover:bg-crimson/[0.08] focus-visible:ring-2 focus-visible:ring-crimson/30 motion-reduce:transition-none"
        >
          <Phone className="size-4" />
          {t('emergencyHelpCall')}
        </Link>
      </div>
    </section>
  );
}
