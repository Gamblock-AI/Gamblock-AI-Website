import { fireEvent, render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { describe, expect, it, vi } from 'vitest';
import marketingMessages from '@/messages/id/marketing.json';
import type {
  DownloadAsset,
  PublicDownloadApp,
} from '@/hooks/use-public-download-apps';
import { DownloadSection } from './DownloadSection';

const mocks = vi.hoisted(() => ({
  usePublicDownloadApps: vi.fn(),
}));

vi.mock('@/hooks/use-public-download-apps', () => ({
  usePublicDownloadApps: () => mocks.usePublicDownloadApps(),
}));

vi.mock('@/components/common/Reveal', () => ({
  Reveal: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/components/landing/SectionDecoration', () => ({
  SectionDecoration: () => null,
}));

vi.mock('@/components/landing/SectionTransition', () => ({
  SectionTransition: () => null,
}));

vi.mock('@/components/landing/QrDownloadCode', () => ({
  QrDownloadCode: ({ value, title }: { value: string; title: string }) => (
    <div data-testid="qr-download" data-qr-value={value} aria-label={title} />
  ),
}));

function asset(
  id: string,
  fileName: string,
  url: string,
  label: string
): DownloadAsset {
  return {
    id,
    label: { id: label, en: label },
    file_name: fileName,
    url,
    size_bytes: 28_400_000,
    sha256: 'a'.repeat(64),
    primary: true,
  };
}

function app(
  platform: PublicDownloadApp['platform'],
  title: string,
  releaseAsset: DownloadAsset
): PublicDownloadApp {
  return {
    id: `${platform}-release`,
    platform,
    eyebrow: { id: title, en: title },
    title: { id: title, en: title },
    description: { id: 'Description', en: 'Description' },
    requirements: { id: 'Requirements', en: 'Requirements' },
    architecture: { id: 'Architecture', en: 'Architecture' },
    features: [
      { id: 'Feature one', en: 'Feature one' },
      { id: 'Feature two', en: 'Feature two' },
    ],
    version: 'v1.0.0',
    assets: [releaseAsset],
    published: true,
  };
}

describe('DownloadSection QR downloads', () => {
  it('encodes the primary Android and Windows asset URLs and excludes the extension card', async () => {
    const androidURL =
      'https://github.com/Gamblock-AI/releases/download/v1/app.apk';
    const windowsURL =
      'https://github.com/Gamblock-AI/releases/download/v1/app.msi';
    const extensionURL =
      'https://github.com/Gamblock-AI/releases/download/v1/app.zip';

    mocks.usePublicDownloadApps.mockReturnValue({
      data: [
        app(
          'android',
          'Gamblock-AI for Android',
          asset('android', 'app.apk', androidURL, 'Unduh APK')
        ),
        app(
          'windows',
          'Gamblock-AI for Windows',
          asset('windows', 'app.msi', windowsURL, 'Unduh MSI')
        ),
        app(
          'browser_extension',
          'Gamblock-AI Browser Extension',
          asset('extension', 'app.zip', extensionURL, 'Unduh ZIP')
        ),
      ],
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(
      <NextIntlClientProvider locale="id" messages={marketingMessages}>
        <DownloadSection />
      </NextIntlClientProvider>
    );

    const qrButtons = screen.getAllByRole('button', { name: 'Pindai QR Code' });
    expect(qrButtons).toHaveLength(2);

    fireEvent.click(qrButtons[0]);
    expect(await screen.findByTestId('qr-download')).toHaveAttribute(
      'data-qr-value',
      androidURL
    );
    expect(
      screen.getByRole('link', { name: 'Buka tautan unduhan langsung' })
    ).toHaveAttribute('href', androidURL);

    fireEvent.click(screen.getByRole('button', { name: 'Tutup' }));
    fireEvent.click(
      screen.getAllByRole('button', { name: 'Pindai QR Code' })[1]
    );
    expect(await screen.findByTestId('qr-download')).toHaveAttribute(
      'data-qr-value',
      windowsURL
    );
  });
});
