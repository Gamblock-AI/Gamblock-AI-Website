'use client';

import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';
import { Ellipsis, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from '@/components/ui/dialog';
import { useLocalUser } from '@/hooks/use-local-user';
import { Link, usePathname } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import {
  canShowNavigationItem,
  dashboardNavigationGroups,
  getMobilePrimaryNavigation,
  isNavigationItemActive,
} from './navigation-config';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';

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
        data-tour="tour-mobile-primary"
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
          data-tour="tour-mobile-more"
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

      <DialogPortal>
        <DialogOverlay className="bg-navy/60 z-50 backdrop-blur-xs lg:hidden" />
        <DialogPrimitive.Viewport className="fixed inset-0 z-50 flex items-end justify-center lg:hidden">
          <DialogPrimitive.Popup className="bg-card text-card-foreground data-open:animate-in data-open:fade-in-0 data-open:slide-in-from-bottom-6 data-closed:animate-out data-closed:fade-out-0 data-closed:slide-out-to-bottom-6 relative flex max-h-[82dvh] w-full flex-col overflow-hidden rounded-t-[28px] border-t border-border shadow-float outline-none duration-200 motion-reduce:animate-none">
            {/* Grab Handle */}
            <div className="flex justify-center pt-3 pb-1" aria-hidden="true">
              <span className="bg-muted-foreground/30 h-1.25 w-10 rounded-full" />
            </div>

            <DialogHeader className="border-border/80 bg-card sticky top-0 z-10 shrink-0 border-b px-5 pt-1.5 pb-4 pr-14 text-left">
              <DialogTitle className="text-navy text-lg font-extrabold">
                {t('moreTitle')}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground mt-0.5 text-xs">{t('moreDescription')}</DialogDescription>
              <DialogClose
                aria-label={t('closeMore')}
                className="text-muted-foreground hover:bg-muted hover:text-navy focus-visible:ring-navy/30 absolute top-2 right-4 flex size-10 items-center justify-center rounded-xl transition-colors outline-none focus-visible:ring-2"
              >
                <X className="size-5" aria-hidden="true" />
              </DialogClose>
            </DialogHeader>

            <div className="space-y-5 flex-1 overflow-y-auto overscroll-contain px-4 pt-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
              {moreGroups.map((section) => (
                <div key={section.titleKey} className="space-y-1">
                  <p className="text-muted-foreground/85 mb-2 px-3 text-[0.6875rem] font-bold tracking-wider uppercase">
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
                          'focus-visible:ring-navy/30 flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors outline-none focus-visible:ring-2',
                          isActive
                            ? 'bg-navy shadow-soft text-white'
                            : 'text-foreground hover:bg-azure/75'
                        )}
                      >
                        <Icon className="size-4.5" aria-hidden="true" />
                        {t(labelKey)}
                      </Link>
                    );
                  })}
                </div>
              ))}

              <div className="border-border border-t pt-4">
                <div className="flex items-center justify-between px-3">
                  <span className="text-muted-foreground text-xs font-semibold">
                    {t('languageToggle')}
                  </span>
                  <LanguageSwitcher />
                </div>
              </div>
            </div>
          </DialogPrimitive.Popup>
        </DialogPrimitive.Viewport>
      </DialogPortal>
    </Dialog>
  );
}
