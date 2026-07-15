'use client';

import { Phone, MessageCircleWarning, ShieldAlert } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ROUTES } from '@/routes';

export function EmergencyHelp() {
  const t = useTranslations('recoveryDashboard');
  
  return (
    <section className="rounded-[1.5rem] border border-crimson/20 bg-crimson/[0.045] p-5 shadow-soft">
      <div className="flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-crimson/10 text-crimson">
          <ShieldAlert className="size-5" aria-hidden="true" />
        </span>
        <div className="flex-1">
          <h3 className="text-sm font-bold text-navy">{t('emergencyHelpTitle')}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {t('emergencyHelpDesc')}
          </p>
        </div>
      </div>
      
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
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-crimson/30 bg-white px-4 py-2.5 text-xs font-bold text-crimson transition-colors hover:bg-crimson/5"
        >
          <Phone className="size-4" />
          {t('emergencyHelpCall')}
        </Link>
      </div>
    </section>
  );
}
