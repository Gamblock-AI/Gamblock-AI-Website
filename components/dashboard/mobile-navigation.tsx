'use client';

import { Link, usePathname } from '@/i18n/routing';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Ellipsis, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import {
  canShowNavigationItem,
  dashboardNavigationGroups,
  getMobilePrimaryNavigation,
  isNavigationItemActive,
} from './navigation-config';
import { useLocalUser } from '@/hooks/use-local-user';

export function MobileNavigation() {
  const t = useTranslations('dashboardNav');
  const pathname = usePathname();
  const user = useLocalUser();
  const [moreOpen, setMoreOpen] = useState(false);
  const primaryItems = getMobilePrimaryNavigation(user?.role).filter((item) =>
    canShowNavigationItem(item, user?.role)
  );
  const primaryHrefs = new Set(primaryItems.map((item) => item.href));
  const moreGroups = dashboardNavigationGroups
    .map((section) => ({
      ...section,
      items: section.items.filter(
        (item) =>
          !primaryHrefs.has(item.href) &&
          canShowNavigationItem(item, user?.role)
      ),
    }))
    .filter((section) => section.items.length > 0);
  const moreIsActive = moreGroups.some((section) =>
    section.items.some((item) => isNavigationItemActive(pathname, item.href))
  );

  return (
    <Dialog open={moreOpen} onOpenChange={setMoreOpen}>
      <nav
        aria-label={t('dashboard')}
        className="border-border bg-card/98 fixed inset-x-0 bottom-0 z-40 grid border-t px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-8px_30px_-20px_rgba(22,41,76,0.35)] backdrop-blur-md lg:hidden"
        style={{
          gridTemplateColumns: `repeat(${primaryItems.length + 1}, minmax(0, 1fr))`,
        }}
      >
        {primaryItems.map(({ href, labelKey, icon: Icon }) => {
          const isActive = isNavigationItemActive(pathname, href);

          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'focus-visible:ring-navy/30 flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[0.6875rem] font-semibold transition-colors outline-none focus-visible:ring-2',
                isActive
                  ? 'bg-navy shadow-soft text-white'
                  : 'text-muted-foreground hover:bg-azure/75 hover:text-navy'
              )}
            >
              <Icon className="size-5" aria-hidden="true" />
              <span className="max-w-full truncate">{t(labelKey)}</span>
            </Link>
          );
        })}

        <button
          type="button"
          aria-current={moreIsActive ? 'page' : undefined}
          aria-label={t('more')}
          onClick={() => setMoreOpen(true)}
          className={cn(
            'focus-visible:ring-navy/30 flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[0.6875rem] font-semibold transition-colors outline-none focus-visible:ring-2',
            moreIsActive || moreOpen
              ? 'bg-navy shadow-soft text-white'
              : 'text-muted-foreground hover:bg-azure/75 hover:text-navy'
          )}
        >
          <Ellipsis className="size-5" aria-hidden="true" />
          <span>{t('more')}</span>
        </button>
      </nav>

      <DialogContent
        showCloseButton={false}
        className="shadow-float max-h-[min(78dvh,42rem)] overflow-y-auto rounded-t-[28px] rounded-b-none border-x-0 border-b-0 p-0 lg:hidden"
        style={{
          top: 'auto',
          right: 0,
          bottom: 0,
          left: 0,
          width: '100%',
          maxWidth: 'none',
          transform: 'none',
        }}
      >
        <DialogHeader className="border-border bg-card sticky top-0 z-10 border-b px-5 py-5 pr-16">
          <DialogTitle className="text-navy text-lg font-bold">
            {t('moreTitle')}
          </DialogTitle>
          <DialogDescription>{t('moreDescription')}</DialogDescription>
          <DialogClose
            aria-label={t('closeMore')}
            className="text-muted-foreground hover:bg-muted hover:text-navy focus-visible:ring-navy/30 absolute top-4 right-4 flex size-11 items-center justify-center rounded-xl transition-colors outline-none focus-visible:ring-2"
          >
            <X className="size-5" aria-hidden="true" />
          </DialogClose>
        </DialogHeader>

        <div className="space-y-6 px-4 py-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
          {moreGroups.map((section) => (
            <div key={section.titleKey} className="space-y-1">
              <p className="text-muted-foreground mb-2 px-3 text-xs font-semibold">
                {t(section.titleKey)}
              </p>
              {section.items.map(({ href, labelKey, icon: Icon }) => {
                const isActive = isNavigationItemActive(pathname, href);

                return (
                  <Link
                    key={href}
                    href={href}
                    aria-current={isActive ? 'page' : undefined}
                    onClick={() => setMoreOpen(false)}
                    className={cn(
                      'focus-visible:ring-navy/30 flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors outline-none focus-visible:ring-2',
                      isActive
                        ? 'bg-navy shadow-soft text-white'
                        : 'text-foreground hover:bg-azure/75'
                    )}
                  >
                    <Icon className="size-5" aria-hidden="true" />
                    {t(labelKey)}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
