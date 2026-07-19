'use client';

import { useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { ErrorStatusPage } from '@/components/error/error-status-page';
import { reportDevelopmentError } from '@/lib/diagnostics';

export default function ErrorPage({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  const locale = useLocale();
  const t = useTranslations('ErrorPages');

  useEffect(() => {
    reportDevelopmentError('locale-error-boundary', error);
  }, [error]);

  return (
    <ErrorStatusPage
      code="500"
      title={t('unexpected.title')}
      description={t('unexpected.description')}
      imageSrc="/images/errors/gami-repair.webp"
      imageAlt={t('unexpected.imageAlt')}
      homeHref={`/${locale}`}
      homeLabel={t('backHome')}
      retryLabel={t('tryAgain')}
      onRetry={unstable_retry}
    />
  );
}
