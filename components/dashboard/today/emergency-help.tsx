'use client';

import {
  MessageCircleWarning,
  Phone,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { DASHBOARD_QUERY_KEYS, ROUTES } from '@/routes';

export function EmergencyHelp() {
  const t = useTranslations('recoveryDashboard');

  return (
    <section
      className="border-border bg-card shadow-soft flex h-full flex-col justify-between rounded-2xl border p-4 sm:p-5"
      aria-labelledby="emergency-help-title"
    >
      <div>
        <div className="flex items-start gap-3">
          <span className="bg-crimson flex size-11 shrink-0 items-center justify-center rounded-xl text-white shadow-sm">
            <ShieldAlert className="size-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-crimson text-xs font-bold tracking-[0.1em] uppercase">
              {t('emergencyHelpEyebrow')}
            </p>
            <h2
              id="emergency-help-title"
              className="text-navy mt-1 text-lg font-bold"
            >
              {t('emergencyHelpTitle')}
            </h2>
          </div>
        </div>
        <p className="text-muted-foreground mt-3 text-sm leading-6">
          {t('emergencyHelpDesc')}
        </p>
        <div className="border-border mt-4 flex items-start gap-3 border-t pt-4">
          <ShieldCheck
            className="text-crimson mt-0.5 size-5 shrink-0"
            aria-hidden="true"
          />
          <div>
            <p className="text-navy text-sm font-bold">
              {t('emergencyHelpPrivacyTitle')}
            </p>
            <p className="text-muted-foreground mt-0.5 text-xs leading-5">
              {t('emergencyHelpPrivacyBody')}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Link
          href={`${ROUTES.SUPPORT}?${DASHBOARD_QUERY_KEYS.supportTab}=partner`}
          className="bg-crimson hover:bg-crimson-light focus-visible:ring-crimson/30 flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-white transition-colors outline-none focus-visible:ring-2 motion-reduce:transition-none"
        >
          <MessageCircleWarning className="size-4" />
          {t('emergencyHelpAction')}
        </Link>
        <Link
          href={`${ROUTES.SUPPORT}?${DASHBOARD_QUERY_KEYS.supportTab}=hotline`}
          className="border-crimson/35 bg-card text-crimson hover:bg-crimson/[0.08] focus-visible:ring-crimson/30 flex min-h-11 items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-bold transition-colors duration-200 outline-none focus-visible:ring-2 motion-reduce:transition-none"
        >
          <Phone className="size-4" />
          {t('emergencyHelpCall')}
        </Link>
      </div>
    </section>
  );
}
