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
      className={cn(
        'group relative flex items-center gap-3 py-3 pl-4 pr-4 text-sm font-semibold transition-all duration-300',
        isActive
          ? 'bg-background text-crimson rounded-l-2xl ml-3'
          : 'text-white/70 hover:bg-white/10 hover:text-white rounded-l-2xl ml-3'
      )}
    >
      {/* Inverted Border Radius Pseudo-elements for Active State */}
      {isActive && (
        <>
          <span className="absolute -top-5 right-0 h-5 w-5 bg-transparent rounded-br-2xl shadow-[10px_10px_0_10px_var(--color-background)]" />
          <span className="absolute -bottom-5 right-0 h-5 w-5 bg-transparent rounded-tr-2xl shadow-[10px_-10px_0_10px_var(--color-background)]" />
        </>
      )}

      <Icon
        className={cn(
          'h-[20px] w-[20px] shrink-0 transition-colors',
          isActive ? 'text-crimson' : 'text-white/70 group-hover:text-white',
        )}
      />
      {label}
    </Link>
  );
}
