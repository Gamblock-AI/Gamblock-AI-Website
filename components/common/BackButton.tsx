'use client';

import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBackNavigation } from '@/hooks/use-back-navigation';
import { ROUTES } from '@/routes';

interface BackButtonProps {
  label: string;
  /** Fallback path when there is no usable history (defaults to home '/'). */
  fallbackHref?: string;
}

/**
 * BackButton — returns to the browser's previous entry whenever one exists;
 * otherwise it navigates to a route-specific fallback. Used by standalone
 * marketing and authentication pages.
 */
export function BackButton({
  label,
  fallbackHref = ROUTES.HOME,
}: BackButtonProps) {
  const { goBack } = useBackNavigation();

  return (
    <Button
      variant="outline"
      size="default"
      className="rounded-full px-5"
      onClick={() => goBack(fallbackHref)}
    >
      <ArrowLeft className="size-3.5" />
      {label}
    </Button>
  );
}
