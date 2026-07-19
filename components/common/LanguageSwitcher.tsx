'use client';

import { useLocale, useTranslations } from 'next-intl';
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
 * LanguageSwitcher toggles between ID and EN locales while preserving the
 * current path, query, and hash. A document navigation guarantees that the
 * requested locale catalog is reloaded through the locale-aware proxy.
 */
export function LanguageSwitcher({
  tone = 'light',
  className,
}: LanguageSwitcherProps) {
  const locale = useLocale();
  const t = useTranslations('dashboardNav');

  const switchTo = (code: (typeof LOCALES)[number]['code']) => {
    if (code === locale) return;

    const { pathname, search, hash } = window.location;
    const localePrefix = /^\/(id|en)(?=\/|$)/;
    const localizedPath = localePrefix.test(pathname)
      ? pathname.replace(localePrefix, `/${code}`)
      : `/${code}${pathname === '/' ? '' : pathname}`;

    window.location.replace(`${localizedPath}${search}${hash}`);
  };

  return (
    <div
      className={cn(
        'inline-grid grid-cols-2 items-center rounded-[0.75rem] border p-0.5',
        tone === 'light'
          ? 'border-border bg-card'
          : 'border-white/20 bg-white/10',
        className
      )}
      role="group"
      aria-label={t('languageToggle')}
    >
      {LOCALES.map(({ code, label }) => {
        const active = code === locale;
        return (
          <button
            key={code}
            type="button"
            onClick={() => switchTo(code)}
            aria-pressed={active}
            className={cn(
              'focus-visible:ring-sky/70 flex size-8 cursor-pointer items-center justify-center rounded-[0.625rem] text-[0.625rem] font-bold transition-[background-color,color,box-shadow] duration-200 outline-none focus-visible:ring-2 focus-visible:ring-offset-1 motion-reduce:transition-none',
              active
                ? tone === 'light'
                  ? 'bg-navy text-white shadow-sm'
                  : 'text-navy bg-white shadow-sm'
                : tone === 'light'
                  ? 'text-muted-foreground hover:bg-muted hover:text-navy'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
