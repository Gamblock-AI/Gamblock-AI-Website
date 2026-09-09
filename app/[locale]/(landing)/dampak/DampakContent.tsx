'use client';

import { Link } from '@/i18n/routing';
import {
  Activity,
  ArrowRight,
  CalendarDays,
  ExternalLink,
  HeartHandshake,
  Newspaper,
  ShieldX,
  TrendingUp,
  Users,
  UserX,
  Zap,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Section } from '@/components/ui/section';
import { Pill } from '@/components/ui/pill';
import { StatCounter } from '@/components/ui/stat-counter';
import { GradientBlob } from '@/components/ui/gradient-blob';
import { Reveal } from '@/components/common/Reveal';
import { MarketingNav } from '@/components/landing/MarketingNav';
import { SkipLink } from '@/components/landing/SkipLink';
import { FixedBackground } from '@/components/landing/FixedBackground';
import { SiteFooter } from '@/components/landing/SiteFooter';
import { ROUTES } from '@/routes';

const NEWS_UPDATED_AT = '2026-09-10';

const NEWS_DATE_FORMATTERS = {
  en: new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }),
  id: new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }),
} as const;

const NEWS_ITEMS = [
  {
    source: 'ANTARA',
    publishedAt: '2026-07-23',
    topicKey: 'newsTopicScale',
    summaryKey: 'news1Summary',
    title: 'PPATK: Perputaran dana judi online Rp40,3 triliun pada triwulan I-2026',
    href: 'https://www.antaranews.com/berita/5663168/ppatk-perputaran-dana-judi-online-rp403-triliun-pada-triwulan-i-2026',
  },
  {
    source: 'Kompas',
    publishedAt: '2026-05-29',
    topicKey: 'newsTopicYouth',
    summaryKey: 'news2Summary',
    title: 'Judol Merebak di Kalangan Pelajar, Berawal dari Ajakan Teman hingga Sulit Berhenti',
    href: 'https://amp.kompas.com/tren/read/2026/05/29/130000465/judol-merebak-di-kalangan-pelajar-berawal-dari-ajakan-teman-hingga-sulit',
  },
  {
    source: 'Katadata',
    publishedAt: '2026-07-24',
    topicKey: 'newsTopicPayment',
    summaryKey: 'news3Summary',
    title: 'PPATK Ungkap Modus Baru: QRIS Jadi Jalur Utama Deposit Judol',
    href: 'https://katadata.co.id/digital/teknologi/6a62ec8989a99/ppatk-ungkap-modus-baru-qris-jadi-jalur-utama-deposit-judol',
  },
  {
    source: 'Tirto',
    publishedAt: '2026-07-03',
    topicKey: 'newsTopicExposure',
    summaryKey: 'news4Summary',
    title: 'Euforia Piala Dunia: Ladang Baru Sindikat Judol Berburu Korban',
    href: 'https://tirto.id/euforia-piala-dunia-ladang-baru-sindikat-judol-berburu-korban-hy7t',
  },
  {
    source: 'detikNews',
    publishedAt: '2026-08-14',
    topicKey: 'newsTopicAccess',
    summaryKey: 'news5Summary',
    title: 'Marak Judol Modus Deposit Pulsa, Bareskrim Imbau Orang Tua Awasi Anak',
    href: 'https://news.detik.com/berita/d-8619345/marak-judol-modus-deposit-pulsa-bareskrim-imbau-orang-tua-awasi-anak',
  },
  {
    source: 'ANTARA',
    publishedAt: '2026-09-03',
    topicKey: 'newsTopicEnforcement',
    summaryKey: 'news6Summary',
    title: 'Bareskrim ungkap jaringan judi daring dengan transaksi Rp1,03 triliun',
    href: 'https://www.antaranews.com/berita/5724419/bareskrim-ungkap-jaringan-judi-daring-dengan-transaksi-rp103-triliun',
  },
] as const;

export function DampakContent() {
  const t = useTranslations('DampakContent');
  const locale = useLocale();
  const isEnglish = locale === 'en';
  const formatLocale = isEnglish ? 'en-US' : 'id-ID';
  const newsDateFormatter = NEWS_DATE_FORMATTERS[isEnglish ? 'en' : 'id'];

  const crisis = [
    { icon: TrendingUp, value: 286.84, prefix: 'Rp', suffix: t('crisis1Suffix'), decimals: 2, label: t('crisis1'), src: 'PPATK, 2026' },
    { icon: Users, value: 12.3, prefix: '', suffix: t('crisis2Suffix'), decimals: 1, label: t('crisis2'), src: 'PPATK, 2026' },
    { icon: ShieldX, value: 5.5, prefix: '', suffix: t('crisis3Suffix'), decimals: 1, label: t('crisis3'), src: 'Kemkomdigi, 2025' },
  ];

  const demographics = [
    { value: 440, suffix: t('demo1Suffix'), label: t('demo1Label'), note: t('demo1Note') },
    { value: 520, suffix: t('demo2Suffix'), label: t('demo2Label'), note: t('demo2Note') },
  ];

  const arc = [
    { n: '01', icon: UserX, title: t('arc1Title'), desc: t('arc1Body') },
    { n: '02', icon: Zap, title: t('arc2Title'), desc: t('arc2Body') },
    { n: '03', icon: Activity, title: t('arc3Title'), desc: t('arc3Body') },
    { n: '04', icon: HeartHandshake, title: t('arc4Title'), desc: t('arc4Body') },
  ];

  return (
    <div className="relative text-foreground">
      <SkipLink />
      <FixedBackground />
      <MarketingNav minimal />
      <main id="main-content">

      {/* HERO */}
      <section className="relative overflow-hidden px-6 pt-32 pb-20 md:px-10 md:pt-40 md:pb-24">
        <GradientBlob className="left-[-4rem] top-28 h-72 w-72" color="bg-azure" />
        <div className="relative mx-auto max-w-4xl text-center">
          <Reveal>
            <Pill variant="accent" className="mb-5">{t('heroKicker')}</Pill>
            <h1 className="text-display text-4xl text-navy md:text-6xl">
              {t('heroTitle')} <span className="text-crimson">{t('heroTitleAccent')}</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
              {t('heroBody')}
            </p>
          </Reveal>

          <div className="mt-12 grid gap-5 sm:grid-cols-3">
            {crisis.map(({ icon: Icon, value, prefix, suffix, decimals, label, src }) => (
              <Reveal key={label}>
                <div className="h-full rounded-3xl border border-border bg-card p-6 text-left shadow-soft">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-crimson/10">
                    <Icon className="size-5 text-crimson" />
                  </div>
                  <p className="mt-5 text-3xl font-extrabold tracking-tight text-navy md:text-4xl">
                    <StatCounter value={value} prefix={prefix} suffix={suffix} decimals={decimals} locale={formatLocale} />
                  </p>
                  <p className="mt-2 text-sm leading-snug text-muted-foreground">{label}</p>
                  <p className="text-label mt-3 text-navy/40">{src}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* DEMOGRAPHICS */}
      <Section tone="pastel">
        <div className="grid gap-12 md:grid-cols-2 md:gap-16">
          <Reveal>
            <h2 className="text-heading text-3xl text-navy md:text-4xl">{t('demoTitle')}</h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">{t('demoBody')}</p>
            <p className="text-label mt-4 text-navy/40">PPATK, 2025</p>
          </Reveal>
          <div className="grid gap-4">
            {demographics.map(({ value, suffix, label, note }) => (
              <Reveal key={label}>
                <div className="flex items-end justify-between rounded-3xl border border-border bg-card p-6 shadow-soft">
                  <div>
                    <p className="text-3xl font-extrabold tracking-tight text-navy md:text-4xl">
                      <StatCounter value={value} suffix={suffix} locale={formatLocale} />
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">{label}</p>
                  </div>
                  <p className="max-w-[10rem] text-right text-xs leading-snug text-navy/40">{note}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      {/* MEDIA COVERAGE */}
      <Section tone="plain" panel>
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <Reveal className="max-w-2xl">
            <Pill variant="accent" className="mb-4">
              <Newspaper className="size-3.5" aria-hidden="true" />
              {t('newsKicker')}
            </Pill>
            <h2 className="text-heading text-3xl text-navy md:text-4xl">{t('newsTitle')}</h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              {t('newsBody')}
            </p>
          </Reveal>

          <Reveal className="shrink-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-navy/10 bg-sky-light/40 px-4 py-2 text-xs font-semibold text-navy/65">
              <CalendarDays className="size-4 text-crimson" aria-hidden="true" />
              {t('newsUpdated', {
                date: newsDateFormatter.format(new Date(`${NEWS_UPDATED_AT}T00:00:00Z`)),
              })}
            </div>
          </Reveal>
        </div>

        <ul className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {NEWS_ITEMS.map((item, index) => {
            const readLabel = t('newsReadAt', { source: item.source });

            return (
              <li key={item.href}>
                <Reveal className="h-full" delay={(index % 3) * 0.06}>
                  <a
                    href={item.href}
                    hrefLang="id"
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={`${readLabel}: ${item.title}`}
                    className="group flex h-full flex-col rounded-3xl border border-navy/10 bg-sky-light/25 p-6 outline-none transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-1 hover:border-navy/20 hover:shadow-soft focus-visible:ring-2 focus-visible:ring-crimson/50 focus-visible:ring-offset-2 motion-reduce:transform-none"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-label rounded-full bg-crimson/10 px-2.5 py-1 text-crimson">
                        {t(item.topicKey)}
                      </span>
                      <span className="text-xs font-semibold text-navy/45">{item.source}</span>
                    </div>

                    <h3 lang="id" className="mt-5 text-lg font-bold leading-snug text-navy">
                      {item.title}
                    </h3>
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                      {t(item.summaryKey)}
                    </p>

                    <div className="mt-6 border-t border-navy/10 pt-4">
                      <p className="text-xs text-navy/45">
                        {newsDateFormatter.format(new Date(`${item.publishedAt}T00:00:00Z`))}
                        {isEnglish ? ` · ${t('newsSourceLanguage')}` : ''}
                      </p>
                      <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-navy transition-colors group-hover:text-crimson">
                        {readLabel}
                        <ExternalLink className="size-3.5" aria-hidden="true" />
                      </span>
                    </div>
                  </a>
                </Reveal>
              </li>
            );
          })}
        </ul>
      </Section>

      {/* WHY BLOCKING ALONE FAILS */}
      <Section tone="dots">
        <Reveal className="mx-auto max-w-3xl text-center">
          <Pill variant="navy" className="mb-4">{t('whyKicker')}</Pill>
          <h2 className="text-heading text-3xl text-navy md:text-4xl">{t('whyTitle')}</h2>
          <p className="mt-4 text-base text-muted-foreground">{t('whyBody')}</p>
        </Reveal>
      </Section>

      {/* RECOVERY ARC */}
      <Section tone="navy">
        <Reveal className="mb-12 max-w-2xl">
          <Pill variant="ghost" className="mb-4 bg-white/10 text-white">{t('arcKicker')}</Pill>
          <h2 className="text-heading text-3xl text-white md:text-4xl">{t('arcTitle')}</h2>
        </Reveal>
        <div className="flex flex-col gap-4 md:flex-row md:items-stretch">
          {arc.map(({ n, icon: Icon, title, desc }, i) => (
            <Reveal
              key={n}
              delay={i * 0.07}
              className="relative flex-1 rounded-3xl border border-white/10 bg-white/[0.06] p-6 backdrop-blur"
            >
              <span className="font-mono text-xs tracking-widest text-white/30">{n}</span>
              <div className="mt-3 flex size-11 items-center justify-center rounded-xl bg-crimson text-white">
                <Icon className="size-5" />
              </div>
              <h3 className="mt-4 text-sm font-bold text-white">{title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-white/65">{desc}</p>
              {i < arc.length - 1 && (
                <ArrowRight className="absolute -right-2 top-1/2 hidden size-4 -translate-y-1/2 text-white/20 md:block" />
              )}
            </Reveal>
          ))}
        </div>
      </Section>

      {/* CTA */}
      <section className="relative overflow-hidden px-6 py-24 md:px-10">
        <GradientBlob className="left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2" color="bg-sky-light" />
        <Reveal className="relative mx-auto max-w-3xl text-center">
          <h2 className="text-display text-3xl text-navy md:text-5xl">
            {t('ctaTitle')} <span className="text-crimson">{t('ctaTitleAccent')}</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground md:text-lg">{t('ctaBody')}</p>
          <Button
            render={<Link href={ROUTES.REGISTER} />}
            variant="accent"
            size="lg"
            className="mt-8 rounded-full px-8"
          >
            {t('ctaButton')}
            <ArrowRight className="size-5" />
          </Button>
        </Reveal>
      </section>

      </main>
      <SiteFooter />
    </div>
  );
}
