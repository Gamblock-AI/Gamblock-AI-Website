import { Toaster } from 'sonner';
import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Inter, Geist_Mono } from 'next/font/google';
import './globals.css';

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
  title: 'Gamblock AI - Sistem Pemblokiran Judi Online Berbasis AI',
  description:
    'Lindungi diri dari judi online dengan On-Device AI. Deteksi cerdas, intervensi psikologis otomatis, dan rehabilitasi mandiri untuk mahasiswa Indonesia.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${plusJakarta.variable} ${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
