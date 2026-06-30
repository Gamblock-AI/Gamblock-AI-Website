import { Toaster } from 'sonner';
import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Inter, Geist_Mono } from 'next/font/google';
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

export const metadata: Metadata = {
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
        url: '/images/og-image.png',
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
    images: ['/images/og-image.png'],
  },
};

import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

export default async function RootLayout({
  children,
  params
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
      className={`${plusJakarta.variable} ${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
