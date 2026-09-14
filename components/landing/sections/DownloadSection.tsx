'use client';

import { useId, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  Check,
  CheckCheck,
  Copy,
  Download,
  FileCheck2,
  GraduationCap,
  Lock,
  Monitor,
  Puzzle,
  QrCode,
  ShieldCheck,
  Smartphone,
  X,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Reveal } from '@/components/common/Reveal';
import { SectionDecoration } from '@/components/landing/SectionDecoration';
import { SectionTransition } from '@/components/landing/SectionTransition';
import { Button } from '@/components/ui/button';
import {
  type DownloadAsset,
  type DownloadPlatform,
  type LocalizedText,
  type PublicDownloadApp,
  usePublicDownloadApps,
} from '@/hooks/use-public-download-apps';

type QrSelection = { app: PublicDownloadApp; asset: DownloadAsset };

const QrDownloadCode = dynamic(
  () =>
    import('@/components/landing/QrDownloadCode').then(
      (module) => module.QrDownloadCode
    ),
  {
    ssr: false,
    loading: () => (
      <div
        className="inline-flex size-[248px] animate-pulse rounded-2xl bg-[#f4faff]"
        aria-hidden="true"
      />
    ),
  }
);

const platformOrder: DownloadPlatform[] = [
  'android',
  'windows',
  'browser_extension',
];

const themes = {
  android: {
    card: 'border-white bg-white text-navy shadow-[0_24px_60px_-24px_rgba(20,52,100,0.18)]',
    glow: 'bg-sky/15',
    icon: 'bg-sky text-navy',
    eyebrow: 'text-[#1685a6]',
    detail: 'text-navy/60',
    badge: 'bg-[#f2f7fb] text-navy',
    title: 'text-navy',
    description: 'text-navy/75',
    feature: 'text-navy/85',
    tick: 'bg-sky/20 text-[#1685a6]',
    border: 'border-navy/10',
    primary:
      'bg-[#c8102e] text-white shadow-[0_12px_24px_-10px_rgba(200,16,46,0.65)] hover:bg-[#da1c3a] focus-visible:ring-[#f5a9b5]',
    secondary:
      'border-navy/20 bg-white text-navy hover:bg-[#eaf7ff] hover:text-navy focus-visible:ring-sky',
    checksum: 'bg-[#f2f7fb] text-navy/70',
    checksumLabel: 'text-navy/80',
    copy: 'text-[#1685a6] hover:bg-sky/20 focus-visible:outline-sky',
  },
  windows: {
    card: 'border-white/20 bg-[#081a39] text-white shadow-[0_24px_60px_-24px_rgba(4,14,35,0.45)]',
    glow: 'bg-sky/20',
    icon: 'bg-white/10 text-sky',
    eyebrow: 'text-sky',
    detail: 'text-white/60',
    badge: 'bg-white/10 text-white',
    title: 'text-white',
    description: 'text-white/75',
    feature: 'text-white/90',
    tick: 'bg-sky/20 text-sky',
    border: 'border-white/10',
    primary:
      'bg-sky text-navy shadow-[0_12px_24px_-10px_rgba(56,189,248,0.5)] hover:bg-[#6bd6ff] focus-visible:ring-white',
    secondary:
      'border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white focus-visible:ring-sky',
    checksum: 'bg-white/[0.07] text-white/70',
    checksumLabel: 'text-white/80',
    copy: 'text-sky hover:bg-white/10 focus-visible:outline-sky',
  },
  browser_extension: {
    card: 'border-[#c5eaf2] bg-[#eefbff] text-navy shadow-[0_24px_60px_-24px_rgba(20,90,120,0.2)]',
    glow: 'bg-[#1685a6]/15',
    icon: 'bg-[#1685a6] text-white',
    eyebrow: 'text-[#1685a6]',
    detail: 'text-navy/60',
    badge: 'bg-white text-navy shadow-sm',
    title: 'text-navy',
    description: 'text-navy/75',
    feature: 'text-navy/85',
    tick: 'bg-[#1685a6]/15 text-[#1685a6]',
    border: 'border-[#1685a6]/15',
    primary:
      'bg-[#1685a6] text-white shadow-[0_12px_24px_-10px_rgba(22,133,166,0.5)] hover:bg-[#11748f] focus-visible:ring-[#1685a6]',
    secondary:
      'border-[#1685a6]/30 bg-white text-[#1685a6] hover:bg-[#e1f7fb] hover:text-[#11748f] focus-visible:ring-[#1685a6]',
    checksum: 'bg-white/75 text-navy/70',
    checksumLabel: 'text-navy/80',
    copy: 'text-[#1685a6] hover:bg-[#d7f3f7] focus-visible:outline-[#1685a6]',
  },
} as const;

function localized(value: LocalizedText, locale: string) {
  return locale === 'en' ? value.en : value.id;
}

function formatFileSize(bytes: number, locale: string) {
  const value = bytes >= 1024 * 1024 ? bytes / (1024 * 1024) : bytes / 1024;
  const unit = bytes >= 1024 * 1024 ? 'MB' : 'KB';
  return `${new Intl.NumberFormat(locale, { maximumFractionDigits: unit === 'MB' ? 1 : 0 }).format(value)} ${unit}`;
}

function DownloadCard({
  app,
  locale,
  copiedAssetID,
  onCopy,
  onOpenQr,
}: {
  app: PublicDownloadApp;
  locale: string;
  copiedAssetID: string | null;
  onCopy: (asset: DownloadAsset) => void;
  onOpenQr: (app: PublicDownloadApp, asset: DownloadAsset) => void;
}) {
  const t = useTranslations('LandingPage');
  const theme = themes[app.platform];
  const primaryAsset =
    app.assets.find((asset) => asset.primary) ?? app.assets[0];
  const qrAsset = primaryAsset?.url.trim() ? primaryAsset : null;
  const isWide = app.platform === 'android';

  return (
    <article
      className={`relative flex h-full flex-col overflow-hidden rounded-[2.25rem] border p-7 sm:p-9 ${theme.card}`}
    >
      <div
        className={`pointer-events-none absolute -top-20 -right-20 size-60 rounded-full blur-3xl ${theme.glow}`}
        aria-hidden="true"
      />
      <div className="relative flex h-full flex-col">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span
              className={`flex size-11 items-center justify-center rounded-2xl ${theme.icon}`}
            >
              {app.platform === 'android' ? (
                <Smartphone className="size-6" aria-hidden="true" />
              ) : app.platform === 'windows' ? (
                <Monitor className="size-6" aria-hidden="true" />
              ) : (
                <Puzzle className="size-6" aria-hidden="true" />
              )}
            </span>
            <div>
              <span
                className={`text-[0.68rem] font-bold tracking-wider uppercase ${theme.eyebrow}`}
              >
                {localized(app.eyebrow, locale)}
              </span>
              <p className={`text-xs font-semibold ${theme.detail}`}>
                {localized(app.requirements, locale)} •{' '}
                {localized(app.architecture, locale)}
              </p>
            </div>
          </div>
          <span
            className={`rounded-full px-3 py-1.5 text-xs font-extrabold ${theme.badge}`}
          >
            {app.version} •{' '}
            {primaryAsset
              ? formatFileSize(primaryAsset.size_bytes, locale)
              : '—'}
          </span>
        </div>

        <div
          className={`mt-7 ${isWide ? 'grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(20rem,0.8fr)] lg:items-center' : ''}`}
        >
          <div>
            <h3
              className={`text-2xl font-extrabold tracking-tight sm:text-3xl ${theme.title}`}
            >
              {localized(app.title, locale)}
            </h3>
            <p
              className={`mt-3 text-sm leading-6 font-medium ${theme.description}`}
            >
              {localized(app.description, locale)}
            </p>
          </div>
          <ul
            className={`mt-6 space-y-2.5 ${isWide ? `lg:mt-0 lg:border-l lg:pl-8 ${theme.border}` : ''}`}
          >
            {app.features.map((feature, index) => (
              <li
                key={`${app.platform}-${index}`}
                className={`flex items-start gap-3 text-sm font-semibold ${theme.feature}`}
              >
                <span
                  className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full ${theme.tick}`}
                >
                  <Check className="size-3" aria-hidden="true" />
                </span>
                <span>{localized(feature, locale)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div
          className={`mt-8 border-t pt-6 ${theme.border} ${isWide ? 'lg:mx-auto lg:mt-auto lg:w-full lg:max-w-4xl' : ''}`}
        >
          <div
            className={`grid gap-3 ${app.assets.length > 1 ? 'sm:grid-cols-2' : 'sm:grid-cols-[minmax(0,1fr)_auto]'}`}
          >
            {app.assets.map((asset) => (
              <Button
                key={asset.id}
                render={<a href={asset.url} target="_blank" rel="noreferrer" />}
                variant={asset.primary ? 'primary' : 'outline'}
                size="lg"
                className={`min-w-0 rounded-full px-5 ${asset.primary ? theme.primary : theme.secondary}`}
              >
                <Download className="size-5 shrink-0" aria-hidden="true" />
                <span className="truncate">
                  {localized(asset.label, locale)}
                </span>
              </Button>
            ))}
            {app.platform !== 'browser_extension' && qrAsset ? (
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => onOpenQr(app, qrAsset)}
                className={`rounded-full ${theme.secondary}`}
              >
                <QrCode className="size-5" aria-hidden="true" />
                <span>{t('downloadBtnQr')}</span>
              </Button>
            ) : null}
          </div>
          <div
            className={`mt-4 grid gap-2 ${app.assets.length > 1 ? 'sm:grid-cols-2' : ''}`}
          >
            {app.assets.map((asset) => {
              const copied = copiedAssetID === `${app.platform}:${asset.id}`;
              return (
                <div
                  key={`${asset.id}-checksum`}
                  className={`flex min-w-0 items-center justify-between gap-2 rounded-xl px-3.5 py-2 text-xs font-medium ${theme.checksum}`}
                >
                  <div className="flex min-w-0 items-center gap-2 overflow-hidden">
                    <span
                      className={`shrink-0 font-bold ${theme.checksumLabel}`}
                    >
                      {app.assets.length > 1
                        ? localized(asset.label, locale)
                        : t('downloadChecksumLabel')}
                      :
                    </span>
                    <span className="truncate font-mono text-[0.7rem]">
                      {asset.sha256}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onCopy(asset)}
                    title={t('downloadCopyChecksum')}
                    className={`flex shrink-0 items-center gap-1 rounded px-2 py-0.5 text-[0.7rem] font-bold transition-colors focus-visible:outline-2 ${theme.copy}`}
                  >
                    {copied ? (
                      <>
                        <CheckCheck className="size-3.5 text-emerald-500" />
                        <span className="text-emerald-500">
                          {t('downloadCopied')}
                        </span>
                      </>
                    ) : (
                      <>
                        <Copy className="size-3.5" />
                        <span>{t('downloadCopyChecksumShort')}</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </article>
  );
}

function DownloadCardsSkeleton() {
  return (
    <div
      className="mt-14 grid gap-8 lg:grid-cols-2"
      aria-label="Loading releases"
      aria-busy="true"
    >
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className={`shadow-soft animate-pulse rounded-[2.25rem] bg-white/70 p-8 ${index === 0 ? 'min-h-96 lg:col-span-2' : 'min-h-[31rem]'}`}
        >
          <div className="bg-navy/10 h-12 w-52 rounded-2xl" />
          <div className="bg-navy/10 mt-9 h-9 w-2/3 rounded" />
          <div className="bg-navy/10 mt-4 h-16 rounded" />
          <div className="mt-8 space-y-3">
            {[0, 1, 2, 3].map((line) => (
              <div key={line} className="bg-navy/10 h-4 rounded" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function DownloadSection() {
  const t = useTranslations('LandingPage');
  const locale = useLocale();
  const { data: apps, loading, error } = usePublicDownloadApps();
  const [copiedAssetID, setCopiedAssetID] = useState<string | null>(null);
  const [qrSelection, setQrSelection] = useState<QrSelection | null>(null);
  const qrDialogId = useId();
  const appsByPlatform = useMemo(
    () => new Map(apps.map((app) => [app.platform, app])),
    [apps]
  );
  const android = appsByPlatform.get('android');
  const companionApps = platformOrder
    .filter((platform) => platform !== 'android')
    .map((platform) => appsByPlatform.get(platform))
    .filter((app): app is PublicDownloadApp => Boolean(app));

  const copyChecksum = (app: PublicDownloadApp, asset: DownloadAsset) => {
    if (!navigator.clipboard) return;
    const assetID = `${app.platform}:${asset.id}`;
    void navigator.clipboard.writeText(asset.sha256).then(() => {
      setCopiedAssetID(assetID);
      window.setTimeout(
        () =>
          setCopiedAssetID((current) => (current === assetID ? null : current)),
        2500
      );
    });
  };
  const trustItems = [
    {
      icon: ShieldCheck,
      titleKey: 'downloadTrust1',
      descKey: 'downloadTrust1Desc',
    },
    { icon: Lock, titleKey: 'downloadTrust2', descKey: 'downloadTrust2Desc' },
    {
      icon: GraduationCap,
      titleKey: 'downloadTrust3',
      descKey: 'downloadTrust3Desc',
    },
    {
      icon: FileCheck2,
      titleKey: 'downloadTrust4',
      descKey: 'downloadTrust4Desc',
    },
  ] as const;

  return (
    <section
      id="unduh"
      className="relative overflow-hidden bg-[#f4faff] px-4 py-24 sm:px-6 md:px-10 md:py-32"
      aria-labelledby="download-section-heading"
    >
      <SectionTransition tone="team-to-pale" />
      <div
        className="bg-sky/20 pointer-events-none absolute top-1/4 -left-48 size-[34rem] rounded-full blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-1/2 -right-36 size-[32rem] rounded-full bg-[#c8102e]/5 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="marketing-dot-field pointer-events-none absolute right-0 bottom-12 h-1/3 w-1/4 opacity-40"
        aria-hidden="true"
      />
      <SectionDecoration className="top-28 left-[6%]" tone="sky" size="md" />
      <SectionDecoration
        className="right-[8%] bottom-32 -rotate-12"
        tone="pink"
      />
      <div className="relative z-10 mx-auto max-w-[82rem]">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <p className="text-label text-[#c8102e]">
              07 / {t('downloadKicker')}
            </p>
            <h2
              id="download-section-heading"
              className="marketing-display text-navy mt-4 text-4xl md:text-5xl lg:text-6xl"
            >
              {t('downloadTitle')}
            </h2>
            <p className="text-navy/75 mx-auto mt-5 max-w-2xl text-base leading-7 font-medium sm:text-lg">
              {t('downloadSubtitle')}
            </p>
          </Reveal>
        </div>
        {loading ? (
          <DownloadCardsSkeleton />
        ) : apps.length === 0 ? (
          <div className="border-navy/10 shadow-soft mx-auto mt-14 max-w-2xl rounded-[2rem] border bg-white/80 p-8 text-center">
            <h3 className="text-navy text-xl font-extrabold">
              {t('downloadReleaseUnavailableTitle')}
            </h3>
            <p className="text-navy/70 mt-3 text-sm leading-6 font-medium">
              {error
                ? t('downloadReleaseUnavailableBody')
                : t('downloadReleaseEmptyBody')}
            </p>
          </div>
        ) : (
          <div className="mt-14 space-y-8">
            {android ? (
              <Reveal delay={0.08} className="h-full">
                <DownloadCard
                  app={android}
                  locale={locale}
                  copiedAssetID={copiedAssetID}
                  onCopy={(asset) => copyChecksum(android, asset)}
                  onOpenQr={(app, asset) => setQrSelection({ app, asset })}
                />
              </Reveal>
            ) : null}
            {companionApps.length > 0 ? (
              <div className="grid gap-8 lg:grid-cols-2">
                {companionApps.map((app, index) => (
                  <Reveal
                    key={app.platform}
                    delay={0.12 + index * 0.04}
                    className="h-full"
                  >
                    <DownloadCard
                      app={app}
                      locale={locale}
                      copiedAssetID={copiedAssetID}
                      onCopy={(asset) => copyChecksum(app, asset)}
                      onOpenQr={(selectedApp, asset) =>
                        setQrSelection({ app: selectedApp, asset })
                      }
                    />
                  </Reveal>
                ))}
              </div>
            ) : null}
          </div>
        )}
        <Reveal delay={0.16} className="mt-14">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {trustItems.map(({ icon: Icon, titleKey, descKey }) => (
              <div
                key={titleKey}
                className="border-navy/10 flex items-start gap-4 rounded-2xl border bg-white/80 p-5 shadow-sm backdrop-blur-sm"
              >
                <div className="bg-sky/20 flex size-10 shrink-0 items-center justify-center rounded-xl text-[#1685a6]">
                  <Icon className="size-5" aria-hidden="true" />
                </div>
                <div>
                  <h4 className="text-navy text-sm font-bold">{t(titleKey)}</h4>
                  <p className="text-navy/65 mt-1 text-xs leading-5 font-medium">
                    {t(descKey)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
      {qrSelection ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={`${qrDialogId}-title`}
          className="bg-navy/60 fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setQrSelection(null)}
        >
          <div
            className="relative w-full max-w-md rounded-[2rem] border border-white/80 bg-white p-6 shadow-2xl sm:p-8"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setQrSelection(null)}
              aria-label={t('downloadQrClose')}
              className="text-navy/60 hover:text-navy focus-visible:outline-sky absolute top-5 right-5 rounded-full p-2 hover:bg-[#edf8ff] focus-visible:outline-2"
            >
              <X className="size-5" />
            </button>
            <div className="text-center">
              <div className="bg-sky/20 mx-auto flex size-12 items-center justify-center rounded-2xl text-[#1685a6]">
                <QrCode className="size-6" aria-hidden="true" />
              </div>
              <h3
                id={`${qrDialogId}-title`}
                className="text-navy mt-4 text-xl font-extrabold"
              >
                {qrSelection.app.platform === 'windows'
                  ? t('downloadQrWindowsTitle')
                  : t('downloadQrTitle')}
              </h3>
              <p className="text-navy/70 mt-2 text-xs leading-6 font-medium">
                {qrSelection.app.platform === 'windows'
                  ? t('downloadQrWindowsDesc')
                  : t('downloadQrDesc')}
              </p>
              <div className="mt-6 flex justify-center">
                <QrDownloadCode
                  value={qrSelection.asset.url}
                  title={localized(qrSelection.app.title, locale)}
                />
              </div>
              <a
                href={qrSelection.asset.url}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex text-xs font-bold text-[#1685a6] underline underline-offset-4 hover:text-[#11748f]"
              >
                {t('downloadQrOpenLink')}
              </a>
              <p className="text-navy/60 mt-4 text-[0.75rem] font-bold break-all">
                {qrSelection.asset.file_name} •{' '}
                {formatFileSize(qrSelection.asset.size_bytes, locale)}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
