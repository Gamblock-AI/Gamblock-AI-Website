'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';
import { useTransition } from 'react';
import { cn } from '@/lib/utils';

const LOCALES = [
  { code: 'id', label: 'ID' },
  { code: 'en', label: 'EN' },
] as const;

interface LanguageSwitcherProps {
  /** 'light' for navy text on light surfaces, 'dark' for white text on dark. */
  tone?: 'light' | 'dark';
  className?: string;
}

/**
 * LanguageSwitcher — toggles between ID and EN locales while preserving the
 * current path. Uses next-intl navigation so locale prefixes are handled.
 */
export function LanguageSwitcher({ tone = 'light', className }: LanguageSwitcherProps) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const switchTo = (code: string) => {
    if (code === locale) return;
    startTransition(() => {
      router.replace(pathname, { locale: code });
    });
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full p-0.5',
        tone === 'light' ? 'bg-navy/5' : 'bg-white/10',
        className,
      )}
      role="group"
      aria-label="Pilih bahasa / Select language"
    >
      {LOCALES.map(({ code, label }) => {
        const active = code === locale;
        return (
          <button
            key={code}
            type="button"
            onClick={() => switchTo(code)}
            disabled={isPending}
            aria-pressed={active}
            className={cn(
              'cursor-pointer rounded-full px-2.5 py-1 text-xs font-bold transition-colors disabled:opacity-50',
              active
                ? tone === 'light'
                  ? 'bg-navy text-white'
                  : 'bg-white text-navy'
                : tone === 'light'
                  ? 'text-navy/60 hover:text-navy'
                  : 'text-white/70 hover:text-white',
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
