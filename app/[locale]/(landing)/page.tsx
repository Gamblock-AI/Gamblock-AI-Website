import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { MarketingNav } from '@/components/landing/MarketingNav';
import { SkipLink } from '@/components/landing/SkipLink';
import { FixedBackground } from '@/components/landing/FixedBackground';
import { SiteFooter } from '@/components/landing/SiteFooter';
import { HeroSection } from '@/components/landing/sections/HeroSection';
import { CrisisSection } from '@/components/landing/sections/CrisisSection';
import { FeaturesSection } from '@/components/landing/sections/FeaturesSection';
import { HowItWorksSection } from '@/components/landing/sections/HowItWorksSection';
import { TechnologySection } from '@/components/landing/sections/TechnologySection';
import { TeamSection } from '@/components/landing/sections/TeamSection';
import { FaqSection } from '@/components/landing/sections/FaqSection';
import { FinalCtaSection } from '@/components/landing/sections/FinalCtaSection';
import { config } from '@/lib/config';

const landingOgImage = '/images/landing/generated-v4/og-home-v4.webp';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'LandingPage' });
  const baseUrl = config.appUrl.replace(/\/$/, '');
  const canonical = `${baseUrl}/${locale}`;
  const title = `${t('titleLead')} ${t('titleAccent')}`;
  const description = t('subtitle');

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        id: `${baseUrl}/id`,
        en: `${baseUrl}/en`,
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'website',
      images: [
        {
          url: landingOgImage,
          width: 1200,
          height: 630,
          alt: t('ogImageAlt'),
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [landingOgImage],
    },
  };
}

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'LandingPage' });
  const baseUrl = config.appUrl.replace(/\/$/, '');
  const canonical = `${baseUrl}/${locale}`;
  const faqKeys = [
    ['faqQ1', 'faqA1'],
    ['faqQ2', 'faqA2'],
    ['faqQ3', 'faqA3'],
    ['faqQ4', 'faqA4'],
    ['faqQ5', 'faqA5'],
  ] as const;
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${baseUrl}/#organization`,
        name: 'Gamblock-AI',
        url: baseUrl,
        logo: `${baseUrl}/images/gamblock-1.png`,
        description: t('subtitle'),
      },
      {
        '@type': 'WebSite',
        '@id': `${canonical}#website`,
        url: canonical,
        name: 'Gamblock-AI',
        inLanguage: locale,
        publisher: { '@id': `${baseUrl}/#organization` },
      },
      {
        '@type': 'FAQPage',
        '@id': `${canonical}#faq`,
        url: `${canonical}#faq`,
        mainEntity: faqKeys.map(([questionKey, answerKey]) => ({
          '@type': 'Question',
          name: t(questionKey),
          acceptedAnswer: {
            '@type': 'Answer',
            text: t(answerKey),
          },
        })),
      },
    ],
  };

  return (
    <>
      <link
        rel="preload"
        href="/videos/landing/hero-background.v2.mp4"
        as="video"
        type="video/mp4"
        fetchPriority="high"
        media="(prefers-reduced-motion: no-preference)"
      />
      <div className="marketing-page relative text-foreground">
        <SkipLink />
        <FixedBackground />
        <MarketingNav />
        <main id="main-content">
          <HeroSection />
          <CrisisSection />
          <FeaturesSection />
          <HowItWorksSection />
          <TechnologySection />
          <TeamSection />
          <FaqSection />
          <FinalCtaSection />
        </main>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <SiteFooter homepage />
      </div>
    </>
  );
}
