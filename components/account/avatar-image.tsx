'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useAvatar } from '@/hooks/use-avatar';

export function AvatarImage({
  avatarUrl,
  alt,
  fallback,
  className,
}: {
  avatarUrl?: string;
  alt: string;
  fallback: ReactNode;
  className?: string;
}) {
  const source = useAvatar(avatarUrl);

  if (source) {
    // Object URLs are created from an authenticated API response, so the Next
    // image optimizer cannot load them.
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={source} alt={alt} className={cn('object-cover', className)} />
    );
  }

  return <span className={className}>{fallback}</span>;
}
