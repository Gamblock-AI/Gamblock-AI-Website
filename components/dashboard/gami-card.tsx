'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface GamiCardProps {
  title?: string;
  message: string;
  /** Mascot illustration path; decorative only. */
  image?: string;
  action?: ReactNode;
  className?: string;
}

/**
 * GamiCard — small supportive mascot card for encouragement moments
 * (check-in reinforcement, progress celebration). Follows the mascot rule:
 * a guide/supporter voice, never used to soften consent or critical actions.
 */
export function GamiCard({
  title,
  message,
  image = '/images/mascot/gami-thumbsup.webp',
  action,
  className,
}: GamiCardProps) {
  return (
    <div
      className={cn(
        'border-navy/15 bg-azure/35 relative overflow-hidden rounded-2xl border p-4',
        className
      )}
    >
      <div
        className="bg-sky-light/45 absolute -right-4 -bottom-6 size-24 rounded-full"
        aria-hidden="true"
      />
      <div className="relative flex items-start gap-3">
        <div className="relative size-14 shrink-0" aria-hidden="true">
          <div className="bg-sky-light/45 absolute inset-1 rounded-full" />
          <Image
            src={image}
            alt=""
            width={56}
            height={56}
            className="relative size-14 object-contain"
          />
        </div>
        <div className="min-w-0 flex-1">
          {title ? <p className="text-navy text-sm font-bold">{title}</p> : null}
          <p className={cn('text-navy text-sm leading-6', title && 'mt-0.5')}>
            {message}
          </p>
          {action ? <div className="mt-3">{action}</div> : null}
        </div>
      </div>
    </div>
  );
}
