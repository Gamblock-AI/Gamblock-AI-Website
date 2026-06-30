import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { LegalPage } from '@/components/landing/LegalPage';

export const metadata: Metadata = {
  title: 'Pusat Bantuan',
};

export default async function HelpPage() {
  const t = await getTranslations('HelpPage');

  const sections = Array.from({ length: 5 }).map((_, i) => ({
    heading: t(`s${i + 1}Title`),
    body: t(`s${i + 1}Body`).split('\n'),
  }));

  return (
    <LegalPage
      title={t('title')}
      updatedLabel={t('updated')}
      intro={t('intro')}
      sections={sections}
    />
  );
}
