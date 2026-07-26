'use client';

import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ComponentProps } from 'react';

interface LoadingButtonProps extends ComponentProps<typeof Button> {
  loading?: boolean;
}

/**
 * LoadingButton — Button with a built-in pending state. The spinner is
 * stacked over the (hidden) label so the button never changes width, and the
 * control is disabled + announced busy while the request runs.
 */
export function LoadingButton({
  loading = false,
  disabled,
  className,
  children,
  ...props
}: LoadingButtonProps) {
  return (
    <Button
      disabled={disabled || loading}
      aria-busy={loading}
      className={cn('grid [grid-template-areas:"stack"]', className)}
      {...props}
    >
      <span
        className={cn(
          'inline-flex items-center justify-center gap-2 [grid-area:stack]',
          loading && 'invisible'
        )}
      >
        {children}
      </span>
      {loading ? (
        <span className="flex items-center justify-center [grid-area:stack]">
          <Loader2
            className="size-4 animate-spin motion-reduce:animate-none"
            aria-hidden="true"
          />
        </span>
      ) : null}
    </Button>
  );
}
