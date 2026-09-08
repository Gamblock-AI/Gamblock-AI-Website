import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';
import { config } from '@/lib/config';
import { ROUTES } from '@/routes';

const INDEXABLE_PATHS = [
  { path: ROUTES.HOME, changeFrequency: 'weekly' as const, priority: 1 },
  { path: ROUTES.DAMPAK, changeFrequency: 'monthly' as const, priority: 0.8 },
  { path: ROUTES.TECHNOLOGY, changeFrequency: 'monthly' as const, priority: 0.8 },
  { path: ROUTES.PKM, changeFrequency: 'monthly' as const, priority: 0.7 },
  { path: ROUTES.DOWNLOAD, changeFrequency: 'monthly' as const, priority: 0.7 },
  { path: ROUTES.HELP, changeFrequency: 'monthly' as const, priority: 0.6 },
  { path: ROUTES.CONTACT, changeFrequency: 'monthly' as const, priority: 0.5 },
  { path: ROUTES.TERMS, changeFrequency: 'yearly' as const, priority: 0.3 },
  { path: ROUTES.PRIVACY, changeFrequency: 'yearly' as const, priority: 0.4 },
] as const;

const baseUrl = () => config.appUrl.replace(/\/$/, '');

function localizedUrl(locale: string, path: string) {
  return `${baseUrl()}/${locale}${path === ROUTES.HOME ? '' : path}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return INDEXABLE_PATHS.flatMap(({ path, changeFrequency, priority }) => {
    const alternateLanguages = Object.fromEntries(
      routing.locales.map((locale) => [locale, localizedUrl(locale, path)])
    );

    return routing.locales.map((locale) => ({
      url: localizedUrl(locale, path),
      lastModified,
      changeFrequency,
      priority,
      alternates: { languages: alternateLanguages },
      ...(path === ROUTES.HOME
        ? { images: [`${baseUrl()}/images/landing/generated-v2/og-home-v2.webp`] }
        : {}),
    }));
  });
}
