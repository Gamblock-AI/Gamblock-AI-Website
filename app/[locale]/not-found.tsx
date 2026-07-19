import { getLocale, getTranslations } from 'next-intl/server';
import { ErrorStatusPage } from '@/components/error/error-status-page';

export default async function NotFound() {
  const [locale, t] = await Promise.all([
    getLocale(),
    getTranslations('ErrorPages'),
  ]);

  return (
    <ErrorStatusPage
      code="404"
      title={t('notFound.title')}
      description={t('notFound.description')}
      imageSrc="/images/errors/gami-lost.webp"
      imageAlt={t('notFound.imageAlt')}
      homeHref={`/${locale}`}
      homeLabel={t('backHome')}
      backLabel={t('goBack')}
    />
  );
}
