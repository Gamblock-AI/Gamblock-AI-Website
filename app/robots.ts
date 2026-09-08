import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';
import { config } from '@/lib/config';
import { GUEST_ROUTES, PROTECTED_ROUTES, ROUTES } from '@/routes';

const NON_INDEXABLE_PATHS = [
  ...PROTECTED_ROUTES,
  ...GUEST_ROUTES,
  ROUTES.APPROVE,
  ROUTES.POST_INTERVENTION,
] as const;

export default function robots(): MetadataRoute.Robots {
  const localePaths = routing.locales.flatMap((locale) =>
    NON_INDEXABLE_PATHS.map((path) => `/${locale}${path}`)
  );

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [...NON_INDEXABLE_PATHS, ...localePaths],
    },
    sitemap: `${config.appUrl.replace(/\/$/, '')}/sitemap.xml`,
  };
}
