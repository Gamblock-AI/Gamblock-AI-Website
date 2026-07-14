'use client';

import { ROUTES } from '@/routes';
import { Link, usePathname } from '@/i18n/routing';
import Image from 'next/image';
import {
  Home,
  BarChart2,
  Users,
  Handshake,
  GraduationCap,
  Heart,
  Settings,
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
    <aside className="bg-navy sticky top-0 hidden h-screen w-[268px] shrink-0 flex-col py-6 pl-4 lg:flex">
      {/* Branding */}
      <Link
        href={ROUTES.DASHBOARD}
        className="flex items-center gap-2.5 rounded-2xl px-2.5 py-2 mr-4"
      >
        <Image
          src="/images/gamblock-1.png"
          alt="Logo Gamblock-AI"
          width={36}
          height={36}
          className="h-9 w-9 object-contain"
        />
        <span className="text-base font-extrabold tracking-tight text-white">
          Gamblock<span className="text-sky-light">-AI</span>
        </span>
      </Link>

      {/* Navigation */}
      <nav className="mt-6 flex-1 space-y-6 overflow-y-auto">
        {sections.map((sec) => (
          <div key={sec.titleKey} className="space-y-1">
            <span className="text-label mb-1.5 block px-3 text-white/50 uppercase tracking-wider text-xs">{t(sec.titleKey)}</span>
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


    </aside>
  );
}
