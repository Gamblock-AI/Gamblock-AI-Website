'use client';

import { Phone, MessageCircleWarning, ShieldAlert } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ROUTES } from '@/routes';

export function EmergencyHelp() {
  const t = useTranslations('recoveryDashboard');

  return (
    <section className="border-border bg-card shadow-soft rounded-2xl border p-5">
      <div className="flex items-center gap-3">
        <span className="bg-crimson flex size-10 shrink-0 items-center justify-center rounded-xl text-white shadow-sm">
          <ShieldAlert className="size-[1.125rem]" aria-hidden="true" />
        </span>
        <h3 className="text-navy min-w-0 text-[0.9375rem] leading-6 font-bold">
          {t('emergencyHelpTitle')}
        </h3>
      </div>
      <p className="text-muted-foreground mt-4 text-sm leading-6">
        {t('emergencyHelpDesc')}
      </p>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <Link
          href={ROUTES.ACCOUNTABILITY}
          className="bg-crimson hover:bg-crimson-light flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-white transition-colors"
        >
          <MessageCircleWarning className="size-4" />
          {t('emergencyHelpAction')}
        </Link>
        <Link
          href={ROUTES.SUPPORT}
          className="border-crimson/35 bg-card text-crimson hover:bg-crimson/[0.08] focus-visible:ring-crimson/30 flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-bold transition-colors duration-200 outline-none focus-visible:ring-2 motion-reduce:transition-none"
        >
          <Phone className="size-4" />
          {t('emergencyHelpCall')}
        </Link>
      </div>
    </section>
  );
}
