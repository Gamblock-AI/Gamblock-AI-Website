'use client';

import { AvatarImage } from '@/components/account/avatar-image';
import { cn } from '@/lib/utils';

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return '?';
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Student profile photo with an initials-circle fallback. Used wherever a
 * partner-facing surface shows a student identity; `avatarUrl` is the
 * authenticated `/v1/users/:id/avatar` route returned by the backend.
 */
export function StudentAvatar({
  name,
  avatarUrl,
  className,
}: {
  name: string;
  avatarUrl?: string | null;
  className?: string;
}) {
  return (
    <AvatarImage
      avatarUrl={avatarUrl ?? undefined}
      alt={name}
      fallback={
        <span className="bg-azure border-navy/15 text-navy flex size-full items-center justify-center rounded-full border text-xs font-bold">
          {getInitials(name)}
        </span>
      }
      className={cn('shrink-0 rounded-full object-cover', className)}
    />
  );
}
