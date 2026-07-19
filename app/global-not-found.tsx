import type { Metadata } from 'next';
import { cookies, headers } from 'next/headers';
import { ErrorStatusPage } from '@/components/error/error-status-page';
import './globals.css';

export const metadata: Metadata = {
  title: '404 | Gamblock-AI',
  description: 'Halaman tidak ditemukan. Page not found.',
};

const COPY = {
  id: {
    title: 'Halaman ini tidak ditemukan',
    description:
      'Alamat ini tidak tersedia. Kamu tetap aman dan bisa kembali ke halaman utama.',
    imageAlt: 'Gami mencari arah di samping peta.',
    home: 'Kembali ke beranda',
    back: 'Kembali sebelumnya',
  },
  en: {
    title: 'This page could not be found',
    description:
      'This address is unavailable. You are still safe and can return to the home page.',
    imageAlt: 'Gami looks for directions beside a map.',
    home: 'Back to home',
    back: 'Go back',
  },
} as const;

export default async function GlobalNotFound() {
  const [cookieStore, requestHeaders] = await Promise.all([
    cookies(),
    headers(),
  ]);
  const savedLocale = cookieStore.get('NEXT_LOCALE')?.value;
  const acceptsEnglish = requestHeaders
    .get('accept-language')
    ?.toLowerCase()
    .startsWith('en');
  const locale =
    savedLocale === 'en' || (!savedLocale && acceptsEnglish) ? 'en' : 'id';
  const copy = COPY[locale];

  return (
    <html lang={locale}>
      <body>
        <ErrorStatusPage
          code="404"
          title={copy.title}
          description={copy.description}
          imageSrc="/images/errors/gami-lost.webp"
          imageAlt={copy.imageAlt}
          homeHref={`/${locale}`}
          homeLabel={copy.home}
          backLabel={copy.back}
        />
      </body>
    </html>
  );
}
