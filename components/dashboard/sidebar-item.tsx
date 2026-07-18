'use client';

import { Link } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface SidebarItemProps {
  href: string;
  label: string;
  icon: LucideIcon;
  isActive: boolean;
}

export function SidebarItem({ href, label, icon: Icon, isActive }: SidebarItemProps) {
  return (
    <Link
      href={href}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'group relative flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold outline-none transition-[background-color,color,box-shadow,transform] duration-200 focus-visible:ring-2 focus-visible:ring-navy/35 focus-visible:ring-offset-2 focus-visible:ring-offset-card active:scale-[0.985] motion-reduce:transform-none motion-reduce:transition-none',
        isActive
          ? 'bg-azure/90 text-navy shadow-none before:absolute before:top-2 before:bottom-2 before:-left-3 before:w-1 before:rounded-r-full before:bg-navy'
          : 'text-muted-foreground hover:bg-azure/55 hover:text-navy'
      )}
    >
      <Icon
        className={cn(
          'size-5 shrink-0 transition-colors',
          isActive ? 'text-navy' : 'text-muted-foreground group-hover:text-navy',
        )}
        aria-hidden="true"
      />
      <span>{label}</span>
    </Link>
  );
}
