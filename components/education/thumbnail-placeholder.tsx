'use client';

import type { LucideIcon } from 'lucide-react';
import { BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ThumbnailPlaceholderProps {
  /** Optional title for accessibility or decorative hint */
  title?: string;
  /** Optional category or badge label displayed under the central icon */
  badgeLabel?: string;
  /** Optional Lucide icon to replace default BookOpen */
  icon?: LucideIcon;
  /** Additional classes applied to root container */
  className?: string;
  /** Whether to render subtle background grid watermark (default true) */
  showWatermark?: boolean;
}

export function ThumbnailPlaceholder({
  badgeLabel,
  icon: Icon = BookOpen,
  className,
  showWatermark = true,
}: ThumbnailPlaceholderProps) {
  return (
    <div
      className={cn(
        'relative aspect-video w-full overflow-hidden border-b border-border/60 bg-gradient-to-br from-azure/80 via-sky-light/35 to-azure/50 flex items-center justify-center select-none transition-colors duration-300',
        className
      )}
    >
      {/* Ambient background glows */}
      <div
        className="bg-sky/25 absolute -bottom-6 -left-6 size-32 rounded-full blur-2xl pointer-events-none transition-transform duration-500 group-hover:scale-125 motion-reduce:transition-none"
        aria-hidden="true"
      />
      <div
        className="bg-azure/60 absolute -top-8 -right-8 size-32 rounded-full blur-xl pointer-events-none transition-transform duration-500 group-hover:scale-110 motion-reduce:transition-none"
        aria-hidden="true"
      />

      {/* Geometric SVG pattern watermark */}
      {showWatermark ? (
        <svg
          className="stroke-navy/[0.08] pointer-events-none absolute inset-0 size-full opacity-60 [mask-image:radial-gradient(ellipse_at_center,white_30%,transparent_75%)]"
          aria-hidden="true"
        >
          <defs>
            <pattern
              id="thumbnail-grid"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <path d="M.5 20V.5H20" fill="none" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#thumbnail-grid)" />
        </svg>
      ) : null}

      {/* Central Glassmorphic Badge */}
      <div className="relative z-1 flex flex-col items-center gap-1.5 px-3 text-center">
        <div className="bg-card/85 border-navy/12 text-navy shadow-soft flex size-12 items-center justify-center rounded-2xl border backdrop-blur-md transition-all duration-300 group-hover:scale-110 group-hover:shadow-md group-hover:border-navy/25 group-hover:bg-card motion-reduce:transform-none">
          <Icon
            className="size-5 text-navy/80 transition-colors group-hover:text-navy"
            aria-hidden="true"
          />
        </div>
        {badgeLabel ? (
          <span className="bg-card/80 border-navy/10 text-navy/80 rounded-full border px-2.5 py-0.5 text-[0.625rem] font-bold tracking-wider uppercase backdrop-blur-xs transition-opacity duration-200">
            {badgeLabel}
          </span>
        ) : null}
      </div>
    </div>
  );
}
