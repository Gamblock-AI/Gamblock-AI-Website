'use client';

import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { useEffect, useState } from 'react';
import { Menu, X, ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import { BackButton } from '@/components/common/BackButton';
import { ROUTES } from '@/routes';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { href: '/#fitur', key: 'features' },
  { href: '/#teknologi', key: 'technology' },
  { href: '/#dampak', key: 'impact' },
  { href: '/#cara-kerja', key: 'howItWorks' },
  { href: '/#tim', key: 'team' },
] as const;

/**
 * MarketingNav — light, floating pill navigation (tina.io-style).
 * Becomes opaque + shadowed once the user scrolls past the hero fold.
 * Pass `minimal` for legal/standalone pages: hides the menu + auth CTA and
 * shows a single "back to home" action instead.
 */
export function MarketingNav({ minimal = false }: { minimal?: boolean }) {
  const t = useTranslations('Nav');
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4">
      <nav
        className={cn(
          'pointer-events-auto flex w-full max-w-6xl items-center justify-between gap-3 rounded-full border px-3 py-2.5 transition-all duration-300',
          scrolled
            ? 'border-border bg-card/90 shadow-soft backdrop-blur-xl'
            : 'border-transparent bg-card/40 backdrop-blur-md',
        )}
      >
        {/* Brand */}
        <Link href={ROUTES.HOME} className="flex items-center gap-2 pl-2">
          <Image
            src="/images/gamblock-1.png"
            alt="Logo Gamblock-AI"
            width={44}
            height={44}
            className="h-10 w-10 object-contain"
            priority
          />
          <span className="text-base font-extrabold tracking-tight text-navy">
            Gamblock<span className="text-crimson">-AI</span>
          </span>
        </Link>

        {minimal ? (
          /* Minimal: history-aware back action */
          <BackButton label={t('back')} />
        ) : (
          <>
            {/* Desktop links */}
            <div className="hidden items-center gap-1 lg:flex">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.key}
                  href={link.href}
                  className="rounded-full px-3.5 py-2 text-sm font-semibold text-navy/70 transition-colors hover:bg-navy/5 hover:text-navy"
                >
                  {t(link.key)}
                </Link>
              ))}
            </div>

            {/* Right cluster */}
            <div className="flex items-center gap-2">
              <LanguageSwitcher className="hidden sm:inline-flex" />
              <Link href={ROUTES.LOGIN} className="hidden md:block">
                <Button variant="accent" size="default" className="rounded-full px-6">
                  {t('login')}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-label={open ? t('closeMenu') : t('openMenu')}
                aria-expanded={open}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-navy/5 text-navy lg:hidden"
              >
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </>
        )}
      </nav>

      {/* Mobile drawer */}
      {!minimal && open && (
        <div className="pointer-events-auto absolute inset-x-4 top-20 rounded-3xl border border-border bg-card p-4 shadow-card lg:hidden">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.key}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-2xl px-4 py-3 text-sm font-semibold text-navy/80 transition-colors hover:bg-navy/5"
              >
                {t(link.key)}
              </Link>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
            <LanguageSwitcher />
            <Link href={ROUTES.LOGIN} onClick={() => setOpen(false)}>
              <Button variant="accent" size="sm" className="rounded-full">
                {t('login')}
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
