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
    <header className="border-navy/15 bg-azure/45 shadow-soft relative isolate min-h-[18rem] overflow-hidden rounded-[1.75rem] border sm:min-h-[20rem]">
      <Image
        src="/images/mascot/gami-dashboard-companion.webp"
        alt=""
        fill
        sizes="(max-width: 1024px) 100vw, 80vw"
        className="-z-20 object-cover object-[68%_center] opacity-35 sm:object-center sm:opacity-55 lg:opacity-100"
        preload
      />
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-r from-white via-white/95 to-white/35 sm:via-white/90 sm:to-white/15 lg:via-white/85 lg:to-transparent"
        aria-hidden="true"
      />
      <div className="flex min-h-[18rem] items-center px-5 py-7 sm:min-h-[20rem] sm:px-8 lg:px-10">
        <div className="max-w-xl">
          <p className="text-navy-light text-xs font-bold tracking-[0.1em] uppercase">
            {t('eyebrow')}
          </p>
          <h1 className="text-navy mt-2 text-[1.875rem] leading-tight font-extrabold tracking-[-0.03em] sm:text-[2.25rem]">
            {t('greetingHello', { name: displayName })}
          </h1>
          <p className="text-muted-foreground mt-2 text-sm leading-6 sm:text-base">
            {t('supportiveLine')}
          </p>
          <div className="border-navy/15 bg-card text-navy shadow-soft mt-4 inline-flex min-h-10 max-w-full items-center gap-2 rounded-xl border px-3 py-2 text-xs leading-5 font-bold">
            {protectionActive ? (
              <ShieldCheck
                className="text-sky size-4 shrink-0"
                aria-hidden="true"
              />
            ) : (
              <LockKeyhole
                className="text-navy-light size-4 shrink-0"
                aria-hidden="true"
              />
            )}
            {protectionActive ? t('privacyStatus') : t('privacyStatusUnknown')}
          </div>
        </div>
      </div>
    </header>
  );
}
