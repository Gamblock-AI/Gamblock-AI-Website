'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { ErrorStatusPage } from '@/components/error/error-status-page';
import { reportDevelopmentError } from '@/lib/diagnostics';
import './globals.css';

const COPY = {
  id: {
    title: 'Ada kendala sementara',
    description:
      'Halaman ini belum dapat dimuat. Coba lagi, atau kembali ke halaman utama.',
    imageAlt: 'Gami memperbaiki modul dengan tenang.',
    home: 'Kembali ke beranda',
    retry: 'Coba lagi',
    documentTitle: 'Terjadi kendala | Gamblock-AI',
  },
  en: {
    title: 'Something needs a moment',
    description:
      'This page could not load yet. Try again, or return to the home page.',
    imageAlt: 'Gami calmly repairs a small module.',
    home: 'Back to home',
    retry: 'Try again',
    documentTitle: 'Something went wrong | Gamblock-AI',
  },
} as const;

function subscribeToLocale() {
  return () => undefined;
}

function getBrowserLocale(): keyof typeof COPY {
  return /^\/en(?:\/|$)/.test(window.location.pathname) ? 'en' : 'id';
}

function getServerLocale(): keyof typeof COPY {
  return 'id';
}

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  const locale = useSyncExternalStore(
    subscribeToLocale,
    getBrowserLocale,
    getServerLocale
  );
  const copy = COPY[locale];

  useEffect(() => {
    reportDevelopmentError('global-error-boundary', error);
  }, [error]);

  return (
    <html lang={locale}>
      <head>
        <title>{copy.documentTitle}</title>
      </head>
      <body>
        <ErrorStatusPage
          code="500"
          title={copy.title}
          description={copy.description}
          imageSrc="/images/errors/gami-repair.webp"
          imageAlt={copy.imageAlt}
          homeHref={`/${locale}`}
          homeLabel={copy.home}
          retryLabel={copy.retry}
          onRetry={unstable_retry}
        />
      </body>
    </html>
  );
}
