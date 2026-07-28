'use client';

import { CalendarHeart, LockKeyhole, ShieldCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useSyncExternalStore } from 'react';
import { FadeSwap } from '@/components/common/fade-swap';

type GreetingKey =
  | 'greetingHello'
  | 'greetingMorning'
  | 'greetingNoon'
  | 'greetingAfternoon'
  | 'greetingEvening';

function greetingForHour(hour: number): GreetingKey {
  if (hour >= 4 && hour <= 9) return 'greetingMorning';
  if (hour >= 10 && hour <= 14) return 'greetingNoon';
  if (hour >= 15 && hour <= 17) return 'greetingAfternoon';
  return 'greetingEvening';
}

// SSR renders the neutral greeting; the client swaps in the time-of-day
// variant (student's local clock) right after hydration. Cached so the
// snapshot stays referentially stable for the session.
const subscribeNever = () => () => {};
let clientGreeting: GreetingKey | null = null;
const getGreetingSnapshot = (): GreetingKey => {
  clientGreeting ??= greetingForHour(new Date().getHours());
  return clientGreeting;
};
const getGreetingServerSnapshot = (): GreetingKey => 'greetingHello';

interface DashboardWelcomeProps {
  name: string;
  protectionActive: boolean;
  /** Non-punitive presence rhythm: consecutive days when >= 2, else null. */
  currentStreak?: number | null;
  activeDays?: number | null;
}

export function DashboardWelcome({
  name,
  protectionActive,
  currentStreak,
  activeDays,
}: DashboardWelcomeProps) {
  const t = useTranslations('recoveryDashboard');
  const displayName = name || t('defaultName');
  const greetingKey = useSyncExternalStore(
    subscribeNever,
    getGreetingSnapshot,
    getGreetingServerSnapshot
  );

  return (
    <header className="border-navy/15 bg-azure/45 shadow-soft relative isolate overflow-hidden rounded-[1.75rem] border">
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
      <div className="flex min-h-[12rem] items-center px-5 py-5 sm:min-h-[13rem] sm:px-8 lg:px-10">
        <div className="max-w-xl">
          <p className="text-navy-light text-xs font-bold tracking-[0.1em] uppercase">
            {t('eyebrow')}
          </p>
          <FadeSwap swapKey={greetingKey}>
            <h1 className="text-navy mt-2 text-[1.625rem] leading-tight font-extrabold tracking-[-0.03em] sm:text-[1.875rem]">
              {t(greetingKey, { name: displayName })}
            </h1>
          </FadeSwap>
          <p className="text-muted-foreground mt-2 text-sm leading-6 sm:text-base">
            {t('supportiveLine')}
          </p>
          <div className="border-navy/15 bg-card text-navy shadow-soft mt-3 inline-flex min-h-10 max-w-full items-center gap-2 rounded-xl border px-3 py-2 text-xs leading-5 font-bold">
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
          {(currentStreak ?? 0) >= 2 || (activeDays ?? 0) >= 1 ? (
            <p className="text-navy-light mt-2 flex items-center gap-1.5 text-xs font-semibold">
              <CalendarHeart className="size-3.5 shrink-0" aria-hidden="true" />
              {(currentStreak ?? 0) >= 2
                ? `${t('streakDays', { days: currentStreak })} · ${t('streakDesc')}`
                : t('streakStart', { days: activeDays })}
            </p>
          ) : null}
        </div>
      </div>
    </header>
  );
}
