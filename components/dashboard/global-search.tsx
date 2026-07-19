'use client';

import { useState, useEffect, useMemo } from 'react';
import { BookOpen, Search } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useLocalUser } from '@/hooks/use-local-user';
import { useEducationModules } from '@/hooks/use-education';
import { ROUTES } from '@/routes';
import {
  dashboardNavigationGroups,
  canShowNavigationItem,
  type DashboardNavGroup,
} from './navigation-config';
import type { LucideIcon } from 'lucide-react';

interface GlobalSearchProps {
  variant?: 'field' | 'icon';
}

interface SearchItem {
  id: string;
  label: string;
  description?: string;
  href: string;
  icon: LucideIcon;
  section: string;
}

export function GlobalSearch({ variant = 'field' }: GlobalSearchProps) {
  const t = useTranslations('dashboardNav');
  const router = useRouter();
  const locale = useLocale();
  const user = useLocalUser();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const { modules: educationModules } = useEducationModules(locale, open);

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
    const allItems: SearchItem[] = [];
    dashboardNavigationGroups.forEach((group: DashboardNavGroup) => {
      group.items.forEach((item) => {
        if (canShowNavigationItem(item, user?.role)) {
          allItems.push({
            id: item.href,
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

  const educationItems = useMemo<SearchItem[]>(
    () =>
      educationModules.map((module) => ({
        id: `education-${module.id}`,
        label: module.title,
        description: module.summary,
        href: `${ROUTES.EDUCATION}/${module.slug}`,
        icon: BookOpen,
        section: t('education'),
      })),
    [educationModules, t]
  );

  const normalizedQuery = query.trim().toLocaleLowerCase();
  const searchableItems = normalizedQuery
    ? [...items, ...educationItems]
    : items;
  const filteredItems = normalizedQuery
    ? searchableItems.filter((item) =>
        [item.label, item.description, item.section]
          .filter(Boolean)
          .some((value) => value!.toLocaleLowerCase().includes(normalizedQuery))
      )
    : items;

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
            ? 'border-navy/15 bg-card text-navy shadow-soft hover:border-navy/30 hover:bg-azure/75 focus-visible:ring-navy/35 flex size-11 items-center justify-center rounded-xl border transition-[background-color,border-color,transform] duration-200 outline-none focus-visible:ring-2 active:scale-[0.97] motion-reduce:transform-none motion-reduce:transition-none'
            : 'group border-border bg-muted/45 text-muted-foreground hover:border-navy/25 hover:bg-card focus-visible:ring-navy/35 flex h-11 w-72 items-center gap-2.5 rounded-xl border px-3 text-sm transition-[background-color,border-color,transform] duration-200 outline-none focus-visible:ring-2 active:scale-[0.99] motion-reduce:transform-none motion-reduce:transition-none xl:w-80'
        }
      >
        {variant === 'icon' ? (
          <Search className="size-5" aria-hidden="true" />
        ) : (
          <>
            <Search
              className="text-navy/75 size-4 shrink-0"
              aria-hidden="true"
            />
            <span className="flex-1 truncate text-left font-medium">
              {t('searchPlaceholder')}
            </span>
            <kbd className="border-navy/10 bg-muted text-navy/70 pointer-events-none hidden h-6 items-center rounded-md border px-2 font-mono text-[10px] font-semibold xl:flex">
              Ctrl K
            </kbd>
          </>
        )}
      </button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          className="overflow-hidden p-0 shadow-lg sm:max-w-[500px]"
          showCloseButton={false}
        >
          <div className="sr-only">
            <DialogTitle>{t('searchPlaceholder')}</DialogTitle>
          </div>
          <div className="border-border flex items-center border-b px-3">
            <Search className="mr-2 size-4 shrink-0 opacity-50" />
            <input
              autoFocus
              type="search"
              aria-label={t('searchPlaceholder')}
              className="placeholder:text-muted-foreground flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-50"
              placeholder={t('searchPlaceholder')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="max-h-[300px] overflow-y-auto p-2">
            {filteredItems.length === 0 ? (
              <p className="text-muted-foreground p-4 text-center text-sm">
                {t('searchEmpty')}
              </p>
            ) : (
              <div className="space-y-1">
                {filteredItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.href)}
                    className="hover:bg-muted hover:text-navy focus:bg-muted focus:text-navy flex min-h-11 w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors outline-none"
                  >
                    <item.icon className="size-4 opacity-70" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate">{item.label}</span>
                      {item.description ? (
                        <span className="text-muted-foreground mt-0.5 block truncate text-xs font-normal">
                          {item.description}
                        </span>
                      ) : null}
                    </span>
                    <span className="text-muted-foreground ml-auto text-xs">
                      {item.section}
                    </span>
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
