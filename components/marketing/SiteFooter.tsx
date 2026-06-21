'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Shield, Lock, Brain } from 'lucide-react';
import { ROUTES } from '@/routes';
import { useTranslations } from "next-intl";

const FOOTER_LINKS = [
  {
    title: 'Produk',
    links: [
      { label: 'Proteksi AI', href: ROUTES.DASHBOARD },
      { label: 'Psikoedukasi', href: ROUTES.EDUCATION },
      { label: 'Pemulihan', href: ROUTES.RECOVERY },
      { label: 'Akuntabilitas', href: ROUTES.ACCOUNTABILITY },
    ],
  },
  {
    title: 'Bantuan',
    links: [
      { label: 'Pusat Dukungan', href: ROUTES.SUPPORT },
      { label: 'Mitra Komunitas', href: ROUTES.PARTNERS },
      { label: 'Pengaturan', href: ROUTES.SETTINGS },
    ],
  },
  {
    title: 'Tentang',
    links: [
      { label: 'Teknologi', href: '/technology' },
      { label: 'Dampak', href: '/dampak' },
      { label: 'PKM Karsa Cipta 2026', href: '#' },
      { label: 'Privasi & UU PDP', href: '#' },
      { label: 'Kontak Tim', href: ROUTES.SUPPORT },
    ],
  },
];

export function SiteFooter() {
    const t = useTranslations('SiteFooter');
  return (
    <footer className="relative z-20 border-t border-white/10 bg-neutral-950 py-14">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-12 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <Image src="/images/logo.png" alt={t('text_330')} width={32} height={32} className="rounded-md" />
              <span className="text-base font-bold tracking-tight text-white">{t('text_323')}</span>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-white/40">
              {t('text_324')}</p>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-bold tracking-wider text-white/60 uppercase">
                <Shield className="h-3 w-3" /> {t('text_325')}</span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-bold tracking-wider text-white/60 uppercase">
                <Lock className="h-3 w-3" /> {t('text_326')}</span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-bold tracking-wider text-white/60 uppercase">
                <Brain className="h-3 w-3" /> {t('text_327')}</span>
            </div>
          </div>

          {/* Link columns */}
          {FOOTER_LINKS.map((col) => (
            <div key={col.title}>
              <h4 className="text-label mb-4 text-white/50">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm font-medium text-white/70 transition-colors hover:text-white"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-6 md:flex-row md:items-center">
          <p className="text-xs text-white/30">
            {t('text_328')}</p>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-crimson/20 bg-crimson/10 px-3 py-1 text-[10px] font-bold tracking-wider text-crimson uppercase">
              {t('text_329')}</span>
            <span className="rounded-full border border-navy/20 bg-navy/20 px-3 py-1 text-[10px] font-bold tracking-wider text-navy-light uppercase">
              on-device
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
