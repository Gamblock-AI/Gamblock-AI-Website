'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/routes';
import { useTranslations } from "next-intl";

const NAV_LINKS = [
  { href: '/technology', label: 'Teknologi' },
  { href: '/dampak', label: 'Dampak' },
  { href: '#fitur', label: 'Fitur' },
  { href: ROUTES.EDUCATION, label: 'Psikoedukasi' },
  { href: ROUTES.SUPPORT, label: 'Bantuan' },
];

export function MarketingNav() {
    const t = useTranslations('MarketingNav');
  return (
    <nav className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between gap-4 px-6 pt-6 md:px-10">
      {/* Logo pill */}
      <Link
        href={ROUTES.HOME}
        className="flex items-center gap-2 rounded-full border border-white/10 bg-neutral-900/90 py-3 pr-5 pl-4 backdrop-blur transition-colors hover:border-navy/30"
      >
        <Image src="/images/logo.png" alt={t('text_319')} width={22} height={22} className="rounded-md" />
        <span className="text-sm font-semibold tracking-tight text-white">{t('text_317')}</span>
      </Link>

      {/* Center nav links - hidden on mobile */}
      <div className="hidden items-center gap-1 rounded-full border border-white/10 bg-neutral-900/70 px-2 py-1.5 backdrop-blur md:flex">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-full px-3 py-1.5 text-xs font-semibold text-white/60 transition-colors hover:bg-white/5 hover:text-white"
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* Auth CTAs */}
      <div className="flex items-center gap-2">
        <Link href={ROUTES.LOGIN} className="hidden md:block">
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full px-4 text-white/70 hover:bg-white/5 hover:text-white"
          >
            masuk
          </Button>
        </Link>
        <Link href={ROUTES.REGISTER}>
          <Button
            variant="accent"
            size="sm"
            className="rounded-full bg-crimson px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-crimson-light"
          >
            {t('text_318')}</Button>
        </Link>
      </div>
    </nav>
  );
}
