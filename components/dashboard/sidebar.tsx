'use client';

import { ROUTES } from '@/routes';
import { Link, usePathname } from '@/i18n/routing';
import Image from 'next/image';
import { SidebarItem } from './sidebar-item';
import { useTranslations } from 'next-intl';
import {
  canShowNavigationItem,
  dashboardNavigationGroups,
  isNavigationItemActive,
} from './navigation-config';
import { useLocalUser } from '@/hooks/use-local-user';

export function Sidebar() {
  const t = useTranslations('dashboardNav');
  const pathname = usePathname();
  const user = useLocalUser();

  return (
    <aside className="sticky top-0 hidden h-dvh w-[248px] shrink-0 flex-col border-r border-sidebar-border bg-card/95 shadow-[12px_0_40px_-34px_rgba(22,41,76,0.55)] lg:flex">
      <div className="flex h-16 shrink-0 items-center border-b border-sidebar-border px-5">
        <Link
          href={ROUTES.DASHBOARD}
          className="flex min-h-11 items-center gap-3 rounded-xl px-1 outline-none focus-visible:ring-2 focus-visible:ring-navy/30 focus-visible:ring-offset-2"
        >
          <Image
            src="/images/gamblock-1.png"
            alt=""
            width={34}
            height={34}
            className="size-[34px] object-contain"
            priority
          />
          <span className="text-base font-extrabold tracking-tight text-navy">
            Gamblock<span className="text-navy-light">-AI</span>
          </span>
        </Link>
      </div>

      <nav
        className="flex-1 space-y-5 overflow-y-auto px-3 py-4"
        aria-label={t('dashboard')}
      >
        {dashboardNavigationGroups.map((section) => {
          const visibleItems = section.items.filter((item) =>
            canShowNavigationItem(item, user?.role),
          );

          if (visibleItems.length === 0) return null;

          return (
            <div key={section.titleKey} className="space-y-1">
              <p className="mb-2 px-3 text-[0.6875rem] font-bold tracking-wide text-muted-foreground">
                {t(section.titleKey)}
              </p>
              {visibleItems.map(({ href, labelKey, icon }) => (
                <SidebarItem
                  key={href}
                  href={href}
                  label={t(labelKey)}
                  icon={icon}
                  isActive={isNavigationItemActive(pathname, href)}
                />
              ))}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
