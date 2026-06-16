'use client';

import Link from 'next/link';
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
      className={cn(
        'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition-colors',
        isActive
          ? 'bg-navy/8 text-navy'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
      )}
    >
      {/* Active indicator bar */}
      {isActive && (
        <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-navy" />
      )}
      <Icon
        className={cn(
          'h-4.5 w-4.5 shrink-0 transition-colors',
          isActive ? 'text-navy' : 'text-muted-foreground/60 group-hover:text-foreground',
        )}
      />
      {label}
    </Link>
  );
}
