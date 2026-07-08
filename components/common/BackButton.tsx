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
 * BackButton — goes to the previous page when the user arrived from within the
 * app (same-origin referrer + existing history), otherwise navigates to a safe
 * fallback (the landing page by default). Used by the minimal marketing nav on
 * legal/standalone pages.
 */
export function BackButton({ label, fallbackHref = '/' }: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    if (typeof window === 'undefined') {
      router.push(fallbackHref);
      return;
    }
    const sameOrigin =
      document.referrer && new URL(document.referrer).origin === window.location.origin;
    // history.length > 1 means there is a previous entry to return to.
    if (sameOrigin && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  };

  return (
    <Button variant="outline" size="default" className="rounded-full px-5" onClick={handleBack}>
      <ArrowLeft className="h-3.5 w-3.5" />
      {label}
    </Button>
  );
}
