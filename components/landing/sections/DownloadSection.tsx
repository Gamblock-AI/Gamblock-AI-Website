'use client';

import { useState, useId } from 'react';
import {
  Download,
  Smartphone,
  Monitor,
  Check,
  Copy,
  CheckCheck,
  QrCode,
  ShieldCheck,
  Lock,
  GraduationCap,
  FileCheck2,
  X,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Reveal } from '@/components/common/Reveal';
import { SectionDecoration } from '@/components/landing/SectionDecoration';
import { SectionTransition } from '@/components/landing/SectionTransition';
import { Button } from '@/components/ui/button';

const ANDROID_SHA256 = '7f83b1657ff145399a9a3b614d101297e68e4bf2c8a77918a38a77d853b05f24';
const WINDOWS_SHA256 = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

export function DownloadSection() {
  const t = useTranslations('LandingPage');
  const [copiedAndroid, setCopiedAndroid] = useState(false);
  const [copiedWindows, setCopiedWindows] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [qrPlatform, setQrPlatform] = useState<'android' | 'windows'>('android');
  const qrDialogId = useId();

  const copyToClipboard = (text: string, platform: 'android' | 'windows') => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      void navigator.clipboard.writeText(text);
      if (platform === 'android') {
        setCopiedAndroid(true);
        setTimeout(() => setCopiedAndroid(false), 2500);
      } else {
        setCopiedWindows(true);
        setTimeout(() => setCopiedWindows(false), 2500);
      }
    }
  };

  const androidFeatures = [
    t('downloadAndroidFeature1'),
    t('downloadAndroidFeature2'),
    t('downloadAndroidFeature3'),
    t('downloadAndroidFeature4'),
  ];

  const windowsFeatures = [
    t('downloadWindowsFeature1'),
    t('downloadWindowsFeature2'),
    t('downloadWindowsFeature3'),
    t('downloadWindowsFeature4'),
  ];

  const trustItems = [
    { icon: ShieldCheck, titleKey: 'downloadTrust1', descKey: 'downloadTrust1Desc' },
    { icon: Lock, titleKey: 'downloadTrust2', descKey: 'downloadTrust2Desc' },
    { icon: GraduationCap, titleKey: 'downloadTrust3', descKey: 'downloadTrust3Desc' },
    { icon: FileCheck2, titleKey: 'downloadTrust4', descKey: 'downloadTrust4Desc' },
  ] as const;

  return (
    <section
      id="unduh"
      className="relative overflow-hidden bg-[#f4faff] px-4 py-24 sm:px-6 md:px-10 md:py-32"
      aria-labelledby="download-section-heading"
    >
      <SectionTransition tone="team-to-pale" />
      <div
        className="pointer-events-none absolute -left-48 top-1/4 size-[34rem] rounded-full bg-sky/20 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-36 top-1/2 size-[32rem] rounded-full bg-[#c8102e]/5 blur-3xl"
        aria-hidden="true"
      />
      <div className="marketing-dot-field pointer-events-none absolute bottom-12 right-0 h-1/3 w-1/4 opacity-40" aria-hidden="true" />
      <SectionDecoration className="left-[6%] top-28" tone="sky" size="md" />
      <SectionDecoration className="right-[8%] bottom-32 -rotate-12" tone="pink" />

      <div className="relative z-10 mx-auto max-w-[82rem]">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <p className="text-label text-[#c8102e]">07 / {t('downloadKicker')}</p>
            <h2
              id="download-section-heading"
              className="marketing-display mt-4 text-4xl text-navy md:text-5xl lg:text-6xl"
            >
              {t('downloadTitle')}
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base font-medium leading-7 text-navy/75 sm:text-lg">
              {t('downloadSubtitle')}
            </p>
          </Reveal>
        </div>

        {/* Download Cards Grid */}
        <div className="mt-14 grid gap-8 lg:grid-cols-2">
          {/* Android Card */}
          <Reveal delay={0.08} className="h-full">
            <article className="relative flex h-full flex-col justify-between overflow-hidden rounded-[2.25rem] border border-white bg-white p-7 shadow-[0_24px_60px_-24px_rgba(20,52,100,0.18)] sm:p-9">
              <div className="pointer-events-none absolute -right-20 -top-20 size-60 rounded-full bg-sky/15 blur-2xl" aria-hidden="true" />
              
              <div>
                {/* Badges Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="flex size-11 items-center justify-center rounded-2xl bg-sky text-navy">
                      <Smartphone className="size-6" aria-hidden="true" />
                    </span>
                    <div>
                      <span className="text-[0.68rem] font-bold uppercase tracking-wider text-[#1685a6]">
                        {t('downloadAndroidEyebrow')}
                      </span>
                      <p className="text-xs font-semibold text-navy/60">
                        {t('downloadAndroidReq')} • {t('downloadAndroidArch')}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-[#f2f7fb] px-3 py-1.5 text-xs font-extrabold text-navy">
                    {t('downloadAndroidVersion')} • {t('downloadAndroidSize')}
                  </span>
                </div>

                {/* Title & Desc */}
                <h3 className="mt-6 text-2xl font-extrabold tracking-tight text-navy sm:text-3xl">
                  {t('downloadAndroidTitle')}
                </h3>
                <p className="mt-3 text-sm font-medium leading-6 text-navy/75">
                  {t('downloadAndroidDesc')}
                </p>

                {/* Features List */}
                <ul className="mt-6 space-y-2.5">
                  {androidFeatures.map((feat) => (
                    <li key={feat} className="flex items-start gap-3 text-sm font-semibold text-navy/85">
                      <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-sky/20 text-[#1685a6]">
                        <Check className="size-3" aria-hidden="true" />
                      </span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons & Checksum */}
              <div className="mt-8 pt-6 border-t border-navy/10">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    render={<a href="/downloads/gamblock-ai-v1.0.0-beta.apk" download="gamblock-ai-v1.0.0-beta.apk" />}
                    variant="primary"
                    size="lg"
                    className="flex-1 rounded-full bg-[#c8102e] px-6 text-white shadow-[0_12px_24px_-10px_rgba(200,16,46,0.65)] hover:bg-[#da1c3a] focus-visible:ring-[#f5a9b5]"
                  >
                    <Download className="size-5" aria-hidden="true" />
                    <span>{t('downloadBtnApk')}</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => {
                      setQrPlatform('android');
                      setQrOpen(true);
                    }}
                    className="rounded-full border-navy/20 bg-white text-navy hover:bg-[#eaf7ff] hover:text-navy focus-visible:ring-sky"
                  >
                    <QrCode className="size-5" aria-hidden="true" />
                    <span>{t('downloadBtnQr')}</span>
                  </Button>
                </div>

                {/* SHA-256 Checksum preview */}
                <div className="mt-4 flex items-center justify-between gap-2 rounded-xl bg-[#f2f7fb] px-3.5 py-2 text-xs font-medium text-navy/70">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="shrink-0 font-bold text-navy/80">{t('downloadChecksumLabel')}:</span>
                    <span className="truncate font-mono text-[0.7rem]">{ANDROID_SHA256}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(ANDROID_SHA256, 'android')}
                    title={t('downloadCopyChecksum')}
                    className="flex items-center gap-1 shrink-0 rounded px-2 py-0.5 text-[0.7rem] font-bold text-[#1685a6] transition-colors hover:bg-sky/20 focus-visible:outline-2 focus-visible:outline-sky"
                  >
                    {copiedAndroid ? (
                      <>
                        <CheckCheck className="size-3.5 text-emerald-600" />
                        <span className="text-emerald-600">{t('downloadCopied')}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="size-3.5" />
                        <span>Salin</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </article>
          </Reveal>

          {/* Windows Card */}
          <Reveal delay={0.12} className="h-full">
            <article className="relative flex h-full flex-col justify-between overflow-hidden rounded-[2.25rem] border border-white/20 bg-[#081a39] p-7 text-white shadow-[0_24px_60px_-24px_rgba(4,14,35,0.45)] sm:p-9">
              <div className="pointer-events-none absolute -right-20 -top-20 size-60 rounded-full bg-sky/20 blur-3xl" aria-hidden="true" />
              
              <div>
                {/* Badges Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="flex size-11 items-center justify-center rounded-2xl bg-white/10 text-sky">
                      <Monitor className="size-6" aria-hidden="true" />
                    </span>
                    <div>
                      <span className="text-[0.68rem] font-bold uppercase tracking-wider text-sky">
                        {t('downloadWindowsEyebrow')}
                      </span>
                      <p className="text-xs font-semibold text-white/60">
                        {t('downloadWindowsReq')} • {t('downloadWindowsArch')}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-extrabold text-white">
                    {t('downloadWindowsVersion')} • {t('downloadWindowsSize')}
                  </span>
                </div>

                {/* Title & Desc */}
                <h3 className="mt-6 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                  {t('downloadWindowsTitle')}
                </h3>
                <p className="mt-3 text-sm font-medium leading-6 text-white/75">
                  {t('downloadWindowsDesc')}
                </p>

                {/* Features List */}
                <ul className="mt-6 space-y-2.5">
                  {windowsFeatures.map((feat) => (
                    <li key={feat} className="flex items-start gap-3 text-sm font-semibold text-white/90">
                      <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-sky/20 text-sky">
                        <Check className="size-3" aria-hidden="true" />
                      </span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons & Checksum */}
              <div className="mt-8 pt-6 border-t border-white/10">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    render={<a href="/downloads/gamblock-ai-setup-v1.0.0-beta.msi" download="gamblock-ai-setup-v1.0.0-beta.msi" />}
                    variant="primary"
                    size="lg"
                    className="flex-1 rounded-full bg-sky px-6 font-extrabold text-navy shadow-[0_12px_24px_-10px_rgba(56,189,248,0.5)] hover:bg-[#6bd6ff] focus-visible:ring-white"
                  >
                    <Download className="size-5" aria-hidden="true" />
                    <span>{t('downloadBtnMsi')}</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => {
                      setQrPlatform('windows');
                      setQrOpen(true);
                    }}
                    className="rounded-full border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white focus-visible:ring-sky"
                  >
                    <QrCode className="size-5" aria-hidden="true" />
                    <span>{t('downloadBtnQr')}</span>
                  </Button>
                </div>

                {/* SHA-256 Checksum preview */}
                <div className="mt-4 flex items-center justify-between gap-2 rounded-xl bg-white/[0.07] px-3.5 py-2 text-xs font-medium text-white/70">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="shrink-0 font-bold text-white/80">{t('downloadChecksumLabel')}:</span>
                    <span className="truncate font-mono text-[0.7rem]">{WINDOWS_SHA256}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(WINDOWS_SHA256, 'windows')}
                    title={t('downloadCopyChecksum')}
                    className="flex items-center gap-1 shrink-0 rounded px-2 py-0.5 text-[0.7rem] font-bold text-sky transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-sky"
                  >
                    {copiedWindows ? (
                      <>
                        <CheckCheck className="size-3.5 text-emerald-400" />
                        <span className="text-emerald-400">{t('downloadCopied')}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="size-3.5" />
                        <span>Salin</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </article>
          </Reveal>
        </div>

        {/* Trust & Safety Badges */}
        <Reveal delay={0.16} className="mt-14">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {trustItems.map(({ icon: Icon, titleKey, descKey }) => (
              <div
                key={titleKey}
                className="flex items-start gap-4 rounded-2xl border border-navy/10 bg-white/80 p-5 shadow-sm backdrop-blur-sm"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sky/20 text-[#1685a6]">
                  <Icon className="size-5" aria-hidden="true" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-navy">{t(titleKey)}</h4>
                  <p className="mt-1 text-xs font-medium leading-5 text-navy/65">
                    {t(descKey)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>

      {/* QR Code Dialog Modal */}
      {qrOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={`${qrDialogId}-title`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-navy/60 p-4 backdrop-blur-sm"
          onClick={() => setQrOpen(false)}
        >
          <div
            className="relative w-full max-w-md rounded-[2rem] border border-white/80 bg-white p-6 shadow-2xl sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setQrOpen(false)}
              aria-label={t('downloadQrClose')}
              className="absolute right-5 top-5 rounded-full p-2 text-navy/60 hover:bg-[#edf8ff] hover:text-navy focus-visible:outline-2 focus-visible:outline-sky"
            >
              <X className="size-5" />
            </button>

            <div className="text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-sky/20 text-[#1685a6]">
                <QrCode className="size-6" aria-hidden="true" />
              </div>
              <h3 id={`${qrDialogId}-title`} className="mt-4 text-xl font-extrabold text-navy">
                {qrPlatform === 'android' ? t('downloadQrTitle') : t('downloadQrWindowsTitle')}
              </h3>
              <p className="mt-2 text-xs sm:text-sm font-medium text-navy/70">
                {qrPlatform === 'android' ? t('downloadQrDesc') : t('downloadQrWindowsDesc')}
              </p>

              {/* QR Code representation */}
              <div className="mx-auto mt-6 flex size-52 items-center justify-center rounded-2xl border-2 border-dashed border-sky/40 bg-[#f4faff] p-3">
                <svg
                  className="size-full text-navy"
                  viewBox="0 0 100 100"
                  fill="currentColor"
                  shapeRendering="crispEdges"
                  aria-hidden="true"
                >
                  {/* Top-left corner finder */}
                  <rect x="10" y="10" width="24" height="24" rx="4" fill="currentColor" />
                  <rect x="14" y="14" width="16" height="16" rx="2" fill="white" />
                  <rect x="18" y="18" width="8" height="8" rx="1" fill="currentColor" />

                  {/* Top-right corner finder */}
                  <rect x="66" y="10" width="24" height="24" rx="4" fill="currentColor" />
                  <rect x="70" y="14" width="16" height="16" rx="2" fill="white" />
                  <rect x="74" y="18" width="8" height="8" rx="1" fill="currentColor" />

                  {/* Bottom-left corner finder */}
                  <rect x="10" y="66" width="24" height="24" rx="4" fill="currentColor" />
                  <rect x="14" y="70" width="16" height="16" rx="2" fill="white" />
                  <rect x="18" y="74" width="8" height="8" rx="1" fill="currentColor" />

                  {/* Data patterns */}
                  <rect x="40" y="12" width="6" height="6" rx="1" fill="currentColor" />
                  <rect x="52" y="12" width="6" height="6" rx="1" fill="currentColor" />
                  <rect x="44" y="24" width="6" height="6" rx="1" fill="currentColor" />
                  <rect x="38" y="38" width="8" height="8" rx="1" fill={qrPlatform === 'android' ? '#c8102e' : '#081a39'} />
                  <rect x="54" y="38" width="8" height="8" rx="1" fill="currentColor" />
                  <rect x="70" y="44" width="6" height="6" rx="1" fill="currentColor" />
                  <rect x="82" y="52" width="6" height="6" rx="1" fill="currentColor" />
                  <rect x="42" y="56" width="8" height="8" rx="1" fill="currentColor" />
                  <rect x="56" y="56" width="6" height="6" rx="1" fill="#1685a6" />
                  <rect x="42" y="72" width="6" height="6" rx="1" fill="currentColor" />
                  <rect x="54" y="72" width="8" height="8" rx="1" fill="currentColor" />
                  <rect x="72" y="70" width="6" height="6" rx="1" fill="currentColor" />
                  <rect x="80" y="78" width="8" height="8" rx="1" fill={qrPlatform === 'android' ? '#c8102e' : '#1685a6'} />
                </svg>
              </div>

              <p className="mt-4 text-[0.75rem] font-bold text-navy/60">
                {qrPlatform === 'android'
                  ? 'gamblock-ai-v1.0.0-beta.apk • 28.4 MB'
                  : 'gamblock-ai-setup-v1.0.0-beta.msi • 44.8 MB'}
              </p>

              <Button
                type="button"
                variant="outline"
                size="default"
                onClick={() => setQrOpen(false)}
                className="mt-5 w-full rounded-full border-navy/20 text-navy hover:bg-[#edf8ff]"
              >
                {t('downloadQrClose')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
