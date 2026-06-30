'use client';

import { ROUTES } from '@/routes';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from '@/i18n/routing';
import {
  Home,
  BarChart2,
  Users,
  Handshake,
  GraduationCap,
  Heart,
  Settings,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { SidebarItem } from './sidebar-item';
import { useTranslations } from 'next-intl';

const sections = [
  {
    titleKey: 'secMonitoring',
    items: [
      { href: ROUTES.DASHBOARD, labelKey: 'navHome', icon: Home },
      { href: ROUTES.PROGRESS, labelKey: 'navAnalytics', icon: BarChart2 },
    ],
  },
  {
    titleKey: 'secAccountability',
    items: [
      { href: ROUTES.ACCOUNTABILITY, labelKey: 'navSocial', icon: Users },
      { href: ROUTES.SETTINGS, labelKey: 'navSettings', icon: Settings },
      { href: ROUTES.PARTNERS, labelKey: 'navPartners', icon: Handshake },
    ],
  },
  {
    titleKey: 'secResources',
    items: [
      { href: ROUTES.EDUCATION, labelKey: 'navEducation', icon: GraduationCap },
      { href: ROUTES.RECOVERY, labelKey: 'navRecovery', icon: Heart },
    ],
  },
];

export function Sidebar() {
  const t = useTranslations('sidebar');
  const pathname = usePathname();

  return (
    <aside className="bg-card/70 sticky top-0 hidden h-screen w-[268px] shrink-0 flex-col border-r border-border p-4 backdrop-blur-sm lg:flex">
      {/* Branding */}
      <Link
        href={ROUTES.DASHBOARD}
        className="flex items-center gap-2.5 rounded-2xl px-2.5 py-2"
      >
        <Image
          src="/images/gamblock-1.png"
          alt="Logo Gamblock-AI"
          width={36}
          height={36}
          className="h-9 w-9 object-contain"
        />
        <span className="text-base font-extrabold tracking-tight text-navy">
          Gamblock<span className="text-crimson">-AI</span>
        </span>
      </Link>

      {/* Navigation */}
      <nav className="mt-6 flex-1 space-y-6 overflow-y-auto">
        {sections.map((sec) => (
          <div key={sec.titleKey} className="space-y-1">
            <span className="text-label mb-1.5 block px-3 text-muted-foreground/60">{t(sec.titleKey)}</span>
            {sec.items.map(({ href, labelKey, icon: Icon }) => {
              const isActive =
                pathname === href ||
                (href !== '/dashboard' && pathname.startsWith(href + '/'));
              return (
                <SidebarItem
                  key={href}
                  href={href}
                  label={t(labelKey)}
                  icon={Icon}
                  isActive={isActive}
                />
              );
            })}
          </div>
        ))}
      </nav>

      {/* Recovery CTA */}
      <Link
        href={ROUTES.RECOVERY}
        className="group mt-4 block overflow-hidden rounded-2xl border border-border bg-pastel p-4 transition-shadow hover:shadow-soft"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-crimson/10 text-crimson">
          <Sparkles className="h-4.5 w-4.5" />
        </div>
        <p className="mt-3 text-sm font-bold text-navy">{t('ctaTitle')}</p>
        <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
          {t('ctaDesc')}
        </p>
        <span className="mt-2.5 inline-flex items-center gap-1 text-xs font-semibold text-crimson">
          {t('ctaOpen')} <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </Link>

      {/* Status */}
      <div className="mt-3 flex items-center gap-2.5 rounded-2xl border border-sage/20 bg-sage/5 px-3.5 py-2.5">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sage opacity-70" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-sage" />
        </span>
        <span className="text-xs font-semibold text-sage">{t('text_316')}</span>
      </div>
    </aside>
  );
}
