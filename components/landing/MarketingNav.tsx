'use client';

import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { useEffect, useRef, useState } from 'react';
import { Menu, X, ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import { BackButton } from '@/components/common/BackButton';
import { ROUTES } from '@/routes';
import { useLocalUser } from '@/hooks/use-local-user';

const NAV_LINKS = [
  { href: `${ROUTES.HOME}#dampak`, key: 'impact' },
  { href: `${ROUTES.HOME}#fitur`, key: 'features' },
  { href: `${ROUTES.HOME}#cara-kerja`, key: 'howItWorks' },
  { href: `${ROUTES.HOME}#teknologi`, key: 'technology' },
  { href: `${ROUTES.HOME}#tim`, key: 'team' },
] as const;

/**
 * MarketingNav — light, floating pill navigation (tina.io-style).
 * Becomes opaque + shadowed once the user scrolls past the hero fold.
 * Pass `minimal` for legal/standalone pages: hides the menu + auth CTA and
 * shows a single "back to home" action instead.
 */
export function MarketingNav({ minimal = false }: { minimal?: boolean }) {
  const t = useTranslations('Nav');
  const user = useLocalUser();
  const [open, setOpen] = useState(false);
  const drawerAreaRef = useRef<HTMLDivElement>(null);
  const drawerTriggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const closeOnOutsidePress = (event: PointerEvent) => {
      if (
        drawerAreaRef.current &&
        !drawerAreaRef.current.contains(event.target as Node) &&
        !drawerTriggerRef.current?.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        drawerTriggerRef.current?.focus();
      }
    };

    document.addEventListener('pointerdown', closeOnOutsidePress);
    document.addEventListener('keydown', closeOnEscape);

    return () => {
      document.removeEventListener('pointerdown', closeOnOutsidePress);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [open]);

  const isSignedIn = Boolean(user.id || user.email);
  const primaryHref = isSignedIn ? ROUTES.DASHBOARD : ROUTES.LOGIN;
  const primaryLabel = isSignedIn ? t('dashboard') : t('login');

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4">
      <nav className="pointer-events-auto flex w-full max-w-6xl items-center justify-between gap-3 rounded-full border border-white/70 bg-white/88 px-3 py-2.5 shadow-[0_12px_40px_rgba(22,41,76,0.10)] backdrop-blur-xl">
        {/* Brand */}
        <Link href={ROUTES.HOME} className="flex items-center gap-2 pl-2">
          <Image
            src="/images/gamblock-1.png"
            alt="Logo Gamblock-AI"
            width={44}
            height={44}
            className="size-10 object-contain"
            preload
          />
          <span className="text-navy text-base font-extrabold tracking-tight">
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
                  className="text-navy/70 hover:bg-navy/5 hover:text-navy focus-visible:ring-navy/40 rounded-full px-3.5 py-2 text-sm font-semibold transition-colors outline-none focus-visible:ring-2"
                >
                  {t(link.key)}
                </Link>
              ))}
            </div>

            {/* Right cluster */}
            <div className="flex items-center gap-2">
              <LanguageSwitcher className="hidden sm:inline-flex" />
              <Button
                render={<Link href={primaryHref} />}
                variant="primary"
                size="default"
                className="hidden rounded-full px-6 md:inline-flex"
              >
                {primaryLabel}
                <ArrowRight className="size-3.5" />
              </Button>
              <button
                ref={drawerTriggerRef}
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-label={open ? t('closeMenu') : t('openMenu')}
                aria-expanded={open}
                className="focus-visible:ring-navy/40 -m-1 flex size-11 cursor-pointer items-center justify-center rounded-full outline-none focus-visible:ring-2 lg:hidden"
              >
                <span className="bg-navy/5 text-navy hover:bg-navy/10 flex size-9 items-center justify-center rounded-full transition-colors">
                  {open ? (
                    <X className="size-5" />
                  ) : (
                    <Menu className="size-5" />
                  )}
                </span>
              </button>
            </div>
          </>
        )}
      </nav>

      {/* Mobile drawer */}
      {!minimal && open && (
        <div
          ref={drawerAreaRef}
          className="border-border bg-card shadow-card animate-in fade-in slide-in-from-top-2 pointer-events-auto absolute inset-x-4 top-20 rounded-3xl border p-4 duration-200 motion-reduce:animate-none lg:hidden"
        >
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.key}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-navy/80 hover:bg-navy/5 focus-visible:ring-navy/40 rounded-2xl px-4 py-3 text-sm font-semibold transition-colors outline-none focus-visible:ring-2"
              >
                {t(link.key)}
              </Link>
            ))}
          </div>
          <div className="border-border mt-3 flex items-center justify-between border-t pt-3">
            <LanguageSwitcher />
            <Button
              render={<Link href={primaryHref} onClick={() => setOpen(false)} />}
              variant="primary"
              size="sm"
              className="rounded-full"
            >
              {primaryLabel}
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
