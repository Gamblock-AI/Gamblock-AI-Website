import { Toaster } from 'sonner';
import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, Inter, Geist_Mono } from 'next/font/google';
import { config } from '@/lib/config';
import '../globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  variable: '--font-plus-jakarta',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const defaultBaseUrl = config.appUrl;

export const metadata: Metadata = {
  metadataBase: new URL(defaultBaseUrl),
  title: {
    default: 'Gamblock-AI · Pemblokiran Judi Online Berbasis On-Device AI',
    template: '%s · Gamblock-AI',
  },
  description:
    'Gamblock-AI memadukan deteksi On-Device AI, intervensi psikologis Pattern Interrupt, dan accountability partner untuk membantu mahasiswa Indonesia lepas dari judi online, tanpa mengorbankan privasi.',
  keywords: [
    'judi online',
    'on-device AI',
    'pattern interrupt',
    'accountability partner',
    'psikoedukasi',
    'PKM-KC',
  ],
  openGraph: {
    title: 'Gamblock-AI · Pertahanan Digital Berbasis On-Device AI',
    description:
      'Deteksi cerdas, intervensi psikologis otomatis, dan rehabilitasi mandiri untuk melawan darurat judi online.',
    type: 'website',
    images: [
      {
        url: '/images/landing/generated/og-home.webp',
        width: 1200,
        height: 630,
        alt: 'Gamblock-AI, pertahanan digital berbasis On-Device AI',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gamblock-AI · Pertahanan Digital Berbasis On-Device AI',
    description:
      'Deteksi cerdas, intervensi psikologis otomatis, dan rehabilitasi mandiri untuk melawan darurat judi online.',
    images: ['/images/landing/generated/og-home.webp'],
  },
  manifest: '/manifest.webmanifest',
  themeColor: '#16294C',
  appleWebApp: {
    capable: true,
    title: 'Gamblock-AI',
    statusBarStyle: 'black-translucent',
  },
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180' }],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#16294C',
};

import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

import { ServiceWorkerRegister } from '@/components/pwa/service-worker-register';

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const resolvedParams = await params;
  const locale = resolvedParams.locale;
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      data-scroll-behavior="smooth"
      className={`${plusJakarta.variable} ${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <NextIntlClientProvider messages={messages}>
          <ServiceWorkerRegister />
          {children}
        </NextIntlClientProvider>
        <Toaster
          richColors
          expand
          position="top-right"
          closeButton
          containerAriaLabel={locale === 'id' ? 'Notifikasi' : 'Notifications'}
          toastOptions={{
            closeButtonAriaLabel:
              locale === 'id' ? 'Tutup notifikasi' : 'Close notification',
          }}
        />
      </body>
    </html>
  );
}
