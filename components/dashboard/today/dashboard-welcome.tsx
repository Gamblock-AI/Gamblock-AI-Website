import { LockKeyhole, ShieldCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

interface DashboardWelcomeProps {
  name: string;
  protectionActive: boolean;
}

export function DashboardWelcome({
  name,
  protectionActive,
}: DashboardWelcomeProps) {
  const t = useTranslations('recoveryDashboard');
  const displayName = name || t('defaultName');

  return (
    <header className="border-navy/20 bg-card/95 shadow-soft relative overflow-hidden rounded-3xl border px-5 py-5 sm:px-6">
      <div className="relative z-[1] flex items-center justify-between gap-5">
        <div>
          <p className="text-sage text-xs font-bold tracking-[0.12em] uppercase">
            {t('eyebrow')}
          </p>
          <h1 className="text-navy mt-2 text-[1.75rem] leading-tight font-extrabold tracking-tight sm:text-[2rem]">
            {t('greetingHello', { name: displayName })}
          </h1>
          <p className="text-muted-foreground mt-2 text-sm leading-6 sm:text-base">
            {t('supportiveLine')}
          </p>
          <div className="border-sage/40 bg-sage/[0.11] text-sage mt-4 inline-flex min-h-10 max-w-full items-center gap-2 rounded-xl border px-3 py-2 text-xs leading-5 font-bold">
            {protectionActive ? (
              <ShieldCheck className="size-4 shrink-0" aria-hidden="true" />
            ) : (
              <LockKeyhole className="size-4 shrink-0" aria-hidden="true" />
            )}
            {protectionActive ? t('privacyStatus') : t('privacyStatusUnknown')}
          </div>
        </div>
        <div className="hidden shrink-0 sm:block" aria-hidden="true">
          <Image
            src="/images/mascot/gami-hero.png"
            alt=""
            width={108}
            height={108}
            className="size-24 object-contain transition-transform duration-300 hover:scale-105 hover:-rotate-2 motion-reduce:transform-none motion-reduce:transition-none"
          />
        </div>
      </div>
    </header>
  );
}
