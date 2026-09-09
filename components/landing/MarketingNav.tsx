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
 * MarketingNav — floating white navigation for public marketing pages.
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
      <nav className="pointer-events-auto flex w-full max-w-[82rem] items-center justify-between gap-3 rounded-[1.35rem] border border-navy/10 bg-white/95 px-3 py-2.5 shadow-[0_14px_38px_rgba(20,52,100,0.16)] backdrop-blur-xl">
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
          <span className="text-base font-extrabold tracking-tight text-navy">
            Gamblock<span className="text-[#c8102e]">-AI</span>
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
                  className="rounded-full px-3.5 py-2 text-sm font-semibold text-navy/70 transition-colors outline-none hover:bg-navy/5 hover:text-navy focus-visible:ring-2 focus-visible:ring-navy/35"
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
                className="hidden rounded-full bg-[#c8102e] px-6 text-white hover:bg-[#da1c3a] focus-visible:ring-white md:inline-flex"
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
                <span className="flex size-9 items-center justify-center rounded-full bg-navy/8 text-navy transition-colors hover:bg-navy/12">
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
          className="animate-in pointer-events-auto absolute inset-x-4 top-20 rounded-3xl border border-navy/10 bg-white p-4 text-navy shadow-card fade-in slide-in-from-top-2 duration-200 motion-reduce:animate-none lg:hidden"
        >
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.key}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-2xl px-4 py-3 text-sm font-semibold text-navy/75 transition-colors outline-none hover:bg-navy/5 focus-visible:ring-2 focus-visible:ring-navy/35"
              >
                {t(link.key)}
              </Link>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-navy/10 pt-3">
            <LanguageSwitcher />
            <Button
              render={<Link href={primaryHref} onClick={() => setOpen(false)} />}
              variant="primary"
              size="sm"
              className="rounded-full bg-[#c8102e] text-white hover:bg-[#da1c3a]"
            >
              {primaryLabel}
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
