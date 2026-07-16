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
        'group flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold outline-none transition-[background-color,color,box-shadow,transform] duration-200 focus-visible:ring-2 focus-visible:ring-navy/35 focus-visible:ring-offset-2 focus-visible:ring-offset-card active:scale-[0.985] motion-reduce:transform-none motion-reduce:transition-none',
        isActive
          ? 'bg-navy text-white shadow-soft'
          : 'text-muted-foreground hover:bg-azure/80 hover:text-navy'
      )}
    >
      <Icon
        className={cn(
          'size-5 shrink-0 transition-colors',
          isActive ? 'text-white' : 'text-muted-foreground group-hover:text-navy',
        )}
        aria-hidden="true"
      />
      <span>{label}</span>
    </Link>
  );
}
