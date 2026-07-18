'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { useLocalUser } from '@/hooks/use-local-user';
import { dashboardNavigationGroups, canShowNavigationItem, type DashboardNavGroup } from './navigation-config';
import type { LucideIcon } from 'lucide-react';

interface GlobalSearchProps {
  variant?: 'field' | 'icon';
}

export function GlobalSearch({ variant = 'field' }: GlobalSearchProps) {
  const t = useTranslations('dashboardNav');
  const router = useRouter();
  const user = useLocalUser();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const items = useMemo(() => {
    const allItems: { label: string; href: string; icon: LucideIcon; section: string }[] = [];
    dashboardNavigationGroups.forEach((group: DashboardNavGroup) => {
      group.items.forEach((item) => {
        if (canShowNavigationItem(item, user?.role)) {
          allItems.push({
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            label: t(item.labelKey as any),
            href: item.href,
            icon: item.icon,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            section: t(group.titleKey as any),
          });
        }
      });
    });
    return allItems;
  }, [t, user?.role]);

  const filteredItems = query === '' 
    ? items 
    : items.filter((item) => item.label.toLowerCase().includes(query.toLowerCase()));

  const handleSelect = (href: string) => {
    setOpen(false);
    setQuery('');
    router.push(href);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) setQuery('');
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={t('searchPlaceholder')}
        className={
          variant === 'icon'
            ? 'flex size-11 items-center justify-center rounded-xl border border-navy/15 bg-card text-navy shadow-soft outline-none transition-[background-color,border-color,transform] duration-200 hover:border-navy/30 hover:bg-azure/75 focus-visible:ring-2 focus-visible:ring-navy/35 active:scale-[0.97] motion-reduce:transform-none motion-reduce:transition-none'
            : 'group flex h-11 w-72 items-center gap-2.5 rounded-xl border border-border bg-muted/45 px-3 text-sm text-muted-foreground outline-none transition-[background-color,border-color,transform] duration-200 hover:border-navy/25 hover:bg-card focus-visible:ring-2 focus-visible:ring-navy/35 active:scale-[0.99] motion-reduce:transform-none motion-reduce:transition-none xl:w-80'
        }
      >
        {variant === 'icon' ? (
          <Search className="size-5" aria-hidden="true" />
        ) : (
          <>
            <Search className="size-4 shrink-0 text-navy/75" aria-hidden="true" />
            <span className="flex-1 truncate text-left font-medium">
              {t('searchPlaceholder')}
            </span>
            <kbd className="pointer-events-none hidden h-6 items-center rounded-md border border-navy/10 bg-muted px-2 font-mono text-[10px] font-semibold text-navy/70 xl:flex">
              Ctrl K
            </kbd>
          </>
        )}
      </button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="overflow-hidden p-0 shadow-lg sm:max-w-[500px]" showCloseButton={false}>
          <div className="sr-only">
             <DialogTitle>{t('searchPlaceholder')}</DialogTitle>
          </div>
          <div className="flex items-center border-b border-border px-3">
            <Search className="mr-2 size-4 shrink-0 opacity-50" />
            <input
              autoFocus
              type="search"
              aria-label={t('searchPlaceholder')}
              className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              placeholder={t('searchPlaceholder')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="max-h-[300px] overflow-y-auto p-2">
            {filteredItems.length === 0 ? (
              <p className="p-4 text-center text-sm text-muted-foreground">
                {t('searchEmpty')}
              </p>
            ) : (
              <div className="space-y-1">
                {filteredItems.map((item) => (
                  <button
                    key={item.href}
                    onClick={() => handleSelect(item.href)}
                    className="flex min-h-11 w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm outline-none transition-colors hover:bg-muted hover:text-navy focus:bg-muted focus:text-navy"
                  >
                    <item.icon className="size-4 opacity-70" />
                    <span>{item.label}</span>
                    <span className="ml-auto text-xs text-muted-foreground">{item.section}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
