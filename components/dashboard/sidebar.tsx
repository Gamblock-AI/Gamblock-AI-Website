'use client';

import { ROUTES } from '@/routes';
import { Link, usePathname } from '@/i18n/routing';
import Image from 'next/image';
import { MessageCircleMore } from 'lucide-react';
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
    <aside className="sticky top-0 hidden h-dvh w-[252px] shrink-0 flex-col border-r border-sidebar-border bg-card/96 lg:flex">
      <div className="flex h-[4.5rem] shrink-0 items-center px-5">
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
        className="flex-1 space-y-5 overflow-y-auto px-3 py-3"
        aria-label={t('dashboard')}
      >
        {dashboardNavigationGroups.map((section) => {
          const visibleItems = section.items.filter((item) =>
            canShowNavigationItem(item, user?.role),
          );

          if (visibleItems.length === 0) return null;

          return (
            <div key={section.titleKey} className="space-y-1">
              <p className="mb-2 px-3 text-[0.6875rem] font-bold tracking-[0.08em] text-muted-foreground uppercase">
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

      <div className="p-3 pt-0">
        <div className="relative overflow-hidden rounded-2xl border border-navy/15 bg-azure/55 p-4">
          <div className="absolute -right-4 -bottom-6 size-28 rounded-full bg-sky-light/45" aria-hidden="true" />
          <Image
            src="/images/mascot/gami-sidebar-support.png"
            alt=""
            width={72}
            height={72}
            className="relative mx-auto block h-16 w-auto object-contain"
          />
          <p className="relative mt-1.5 text-center text-sm font-bold text-navy">
            {t('gamiSupportTitle')}
          </p>
          <p className="relative mt-1 text-center text-xs leading-5 text-muted-foreground">
            {t('gamiSupportBody')}
          </p>
          <Link
            href={ROUTES.SUPPORT}
            className="relative mt-3 flex min-h-11 items-center justify-center gap-2 rounded-xl bg-navy px-3 text-xs font-bold text-white outline-none transition-[background-color,transform] duration-200 hover:bg-navy-light focus-visible:ring-2 focus-visible:ring-navy/35 focus-visible:ring-offset-2 active:scale-[0.98] motion-reduce:transform-none motion-reduce:transition-none"
          >
            <MessageCircleMore className="size-4" aria-hidden="true" />
            {t('gamiSupportAction')}
          </Link>
        </div>
      </div>
    </aside>
  );
}
