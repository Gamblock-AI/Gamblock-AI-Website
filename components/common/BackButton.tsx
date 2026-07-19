'use client';

import { useRouter } from '@/i18n/routing';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
export function BackButton({ label, fallbackHref = '/' }: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    if (typeof window === 'undefined') {
      router.push(fallbackHref);
      return;
    }
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  };

  return (
    <Button
      variant="outline"
      size="default"
      className="rounded-full px-5"
      onClick={handleBack}
    >
      <ArrowLeft className="h-3.5 w-3.5" />
      {label}
    </Button>
  );
}
