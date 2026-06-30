'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/routes';

const COLUMNS = [
  {
    titleKey: 'colProduct',
    links: [
      { labelKey: 'linkFeatures', href: '/#fitur' },
      { labelKey: 'linkTechnology', href: '/technology' },
      { labelKey: 'linkHowItWorks', href: '/#cara-kerja' },
      { labelKey: 'linkImpact', href: '/dampak' },
    ],
  },
  {
    titleKey: 'colResources',
    links: [
      { labelKey: 'linkDownload', href: ROUTES.DOWNLOAD },
      { labelKey: 'linkFaq', href: '/#faq' },
      { labelKey: 'linkHelp', href: ROUTES.HELP },
      { labelKey: 'linkContact', href: ROUTES.CONTACT },
    ],
  },
  {
    titleKey: 'colAcademic',
    links: [
      { labelKey: 'linkTeam', href: '/#tim' },
      { labelKey: 'linkProposal', href: '/dampak' },
      { labelKey: 'linkTerms', href: ROUTES.TERMS },
      { labelKey: 'linkPrivacy', href: ROUTES.PRIVACY },
    ],
  },
] as const;

/**
 * SiteFooter — solid navy surface with crimson glow (tina.io footer energy).
 * Includes link columns, a recovery CTA, and the PKM-KC academic credit.
 */
export function SiteFooter() {
  const t = useTranslations('Footer');

  return (
    <footer className="bg-footer-navy relative overflow-hidden text-white">
      {/* faint mascot watermark */}
      <Image
        src="/images/mascot/gami-hero.png"
        alt=""
        aria-hidden
        width={360}
        height={360}
        className="pointer-events-none absolute -right-16 -bottom-10 w-72 opacity-[0.06] select-none"
      />

      <div className="relative mx-auto max-w-6xl px-6 py-16 md:px-10">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          {/* Brand + CTA */}
          <div className="space-y-5">
            <div className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-soft">
                <Image
                  src="/images/gamblock-1.png"
                  alt="Logo Gamblock-AI"
                  width={32}
                  height={32}
                  className="h-7 w-7 object-contain"
                />
              </span>
              <span className="text-lg font-extrabold tracking-tight text-white">
                Gamblock<span className="text-crimson-light">-AI</span>
              </span>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-white/60">{t('tagline')}</p>
            <div className="pt-2">
              <Link href={ROUTES.REGISTER}>
                <Button variant="accent" className="rounded-full">
                  {t('ctaStart')}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="flex items-center gap-3 pt-3">
              <SocialLink href="https://instagram.com/gamblock.ai" label="Instagram Gamblock-AI">
                <InstagramIcon />
              </SocialLink>
              <SocialLink href="https://facebook.com/gamblock.ai" label="Facebook Gamblock-AI">
                <FacebookIcon />
              </SocialLink>
            </div>
          </div>

          {/* Link columns */}
          {COLUMNS.map((col) => (
            <div key={col.titleKey}>
              <h4 className="text-label mb-4 text-white/45">{t(col.titleKey)}</h4>
              <ul className="space-y-3">
                {col.links.map((l) => (
                  <li key={l.labelKey}>
                    <Link
                      href={l.href}
                      className="text-sm font-medium text-white/70 transition-colors hover:text-white"
                    >
                      {t(l.labelKey)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-6 md:flex-row md:items-center">
          <p className="text-xs text-white/45">{t('copyright')}</p>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-crimson px-3 py-1 text-[10px] font-bold tracking-wider text-white uppercase">
              {t('badgePkm')}
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold tracking-wider text-white/80 uppercase">
              {t('badgeYear')}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
    >
      {children}
    </a>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
      <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12z" />
    </svg>
  );
}
