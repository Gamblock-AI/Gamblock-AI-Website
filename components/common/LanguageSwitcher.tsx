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
        'inline-grid grid-cols-2 items-center rounded-[0.75rem] border p-0.5',
        tone === 'light'
          ? 'border-border bg-card'
          : 'border-white/20 bg-white/10',
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
              'flex size-8 cursor-pointer items-center justify-center rounded-[0.625rem] text-[0.625rem] font-bold transition-[background-color,color,box-shadow] duration-200 outline-none focus-visible:ring-2 focus-visible:ring-sky/70 focus-visible:ring-offset-1 disabled:cursor-wait disabled:opacity-50 motion-reduce:transition-none',
              active
                ? tone === 'light'
                  ? 'bg-navy text-white shadow-sm'
                  : 'bg-white text-navy shadow-sm'
                : tone === 'light'
                  ? 'text-muted-foreground hover:bg-muted hover:text-navy'
                  : 'text-white/70 hover:bg-white/10 hover:text-white',
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
