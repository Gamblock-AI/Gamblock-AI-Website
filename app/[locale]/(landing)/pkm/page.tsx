import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import {
  ArrowRight,
  BookOpenText,
  BrainCircuit,
  CheckCircle2,
  Clock3,
  FileCheck2,
  FileText,
  FlaskConical,
  GraduationCap,
  HandHeart,
  Laptop,
  LockKeyhole,
  Radio,
  ShieldCheck,
  Smartphone,
  TriangleAlert,
  Video,
} from 'lucide-react';

import { Link } from '@/i18n/routing';
import { MarketingNav } from '@/components/landing/MarketingNav';
import { SkipLink } from '@/components/landing/SkipLink';
import { FixedBackground } from '@/components/landing/FixedBackground';
import { SiteFooter } from '@/components/landing/SiteFooter';
import { Button } from '@/components/ui/button';
import { Pill } from '@/components/ui/pill';
import { Section } from '@/components/ui/section';
import { ROUTES } from '@/routes';

export const metadata: Metadata = {
  title: 'Transparansi PKM-KC 2026',
  description:
    'Metode, milestone, keterbatasan, dan status luaran Gamblock-AI yang dipisahkan secara jujur dari evaluasi eksternal yang masih menunggu.',
};

export default async function PkmPage() {
  const t = await getTranslations('PkmPage');

  const methods = [
    {
      icon: BrainCircuit,
      title: t('method1Title'),
      body: t('method1Body'),
    },
    {
      icon: ShieldCheck,
      title: t('method2Title'),
      body: t('method2Body'),
    },
    {
      icon: HandHeart,
      title: t('method3Title'),
      body: t('method3Body'),
    },
    {
      icon: GraduationCap,
      title: t('method4Title'),
      body: t('method4Body'),
    },
  ];

  const outputs = [
    {
      icon: FileText,
      title: t('output1Title'),
      body: t('output1Body'),
      status: t('statusDraft'),
      statusClass: 'border-amber-200 bg-amber-50 text-amber-800',
    },
    {
      icon: FileCheck2,
      title: t('output2Title'),
      body: t('output2Body'),
      status: t('statusDraft'),
      statusClass: 'border-amber-200 bg-amber-50 text-amber-800',
    },
    {
      icon: Smartphone,
      title: t('output3Title'),
      body: t('output3Body'),
      status: t('statusPrototype'),
      statusClass: 'border-sky-200 bg-sky-50 text-sky-800',
    },
    {
      icon: Radio,
      title: t('output4Title'),
      body: t('output4Body'),
      status: t('statusConfigured'),
      statusClass: 'border-violet-200 bg-violet-50 text-violet-800',
    },
    {
      icon: Video,
      title: t('output5Title'),
      body: t('output5Body'),
      status: t('statusProduction'),
      statusClass: 'border-rose-200 bg-rose-50 text-rose-800',
    },
    {
      icon: BookOpenText,
      title: t('output6Title'),
      body: t('output6Body'),
      status: t('statusDraft'),
      statusClass: 'border-amber-200 bg-amber-50 text-amber-800',
    },
  ];

  const milestones = Array.from({ length: 5 }, (_, index) => ({
    number: String(index + 1).padStart(2, '0'),
    title: t(`timeline${index + 1}Title`),
    body: t(`timeline${index + 1}Body`),
    status: t(`timeline${index + 1}Status`),
    pending: index >= 3,
  }));

  const safeguards = Array.from({ length: 4 }, (_, index) =>
    t(`safeguard${index + 1}`)
  );

  const limitations = Array.from({ length: 4 }, (_, index) => ({
    title: t(`limitation${index + 1}Title`),
    body: t(`limitation${index + 1}Body`),
  }));

  return (
    <div className="text-foreground relative">
      <SkipLink />
      <FixedBackground />
      <MarketingNav />

      <main id="main-content">
        <section className="relative overflow-hidden px-6 pt-32 pb-20 md:px-10 md:pt-40 md:pb-24">
          <div
            className="bg-crimson/10 pointer-events-none absolute top-20 -right-20 size-80 rounded-full blur-3xl"
            aria-hidden="true"
          />
          <div
            className="bg-sky-light/35 pointer-events-none absolute -bottom-24 -left-24 size-96 rounded-full blur-3xl"
            aria-hidden="true"
          />

          <div className="relative mx-auto max-w-6xl">
            <div className="max-w-4xl">
              <Pill variant="accent">{t('heroKicker')}</Pill>
              <h1 className="text-display text-navy mt-6 text-4xl md:text-6xl">
                {t('heroTitle')}
              </h1>
              <p className="text-muted-foreground mt-6 max-w-3xl text-base leading-relaxed md:text-lg">
                {t('heroBody')}
              </p>
            </div>

            <dl className="mt-12 grid gap-4 md:grid-cols-3">
              {[
                [t('phaseLabel'), t('phaseValue')],
                [t('evidenceLabel'), t('evidenceValue')],
                [t('institutionLabel'), t('institutionValue')],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="border-border bg-card/90 shadow-soft rounded-3xl border p-6 backdrop-blur"
                >
                  <dt className="text-label text-navy/55">{label}</dt>
                  <dd className="text-navy mt-2 text-sm leading-relaxed font-bold">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <Section tone="grid">
          <div className="max-w-3xl">
            <Pill variant="navy">{t('methodKicker')}</Pill>
            <h2 className="text-heading text-navy mt-5 text-3xl md:text-4xl">
              {t('methodTitle')}
            </h2>
            <p className="text-muted-foreground mt-4 leading-relaxed">
              {t('methodBody')}
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {methods.map(({ icon: Icon, title, body }) => (
              <article
                key={title}
                className="border-border bg-card shadow-soft rounded-3xl border p-7"
              >
                <div className="bg-navy/10 flex size-12 items-center justify-center rounded-2xl">
                  <Icon className="text-navy size-6" aria-hidden="true" />
                </div>
                <h3 className="text-navy mt-5 text-lg font-bold">{title}</h3>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  {body}
                </p>
              </article>
            ))}
          </div>
        </Section>

        <Section tone="pastel">
          <div className="max-w-3xl">
            <Pill variant="accent">{t('outputsKicker')}</Pill>
            <h2 className="text-heading text-navy mt-5 text-3xl md:text-4xl">
              {t('outputsTitle')}
            </h2>
            <p className="text-muted-foreground mt-4 leading-relaxed">
              {t('outputsBody')}
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {outputs.map(({ icon: Icon, title, body, status, statusClass }) => (
              <article
                key={title}
                className="border-border bg-card shadow-soft flex h-full flex-col rounded-3xl border p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="bg-crimson/10 flex size-11 items-center justify-center rounded-xl">
                    <Icon className="text-crimson size-5" aria-hidden="true" />
                  </div>
                  <span
                    className={`rounded-full border px-2.5 py-1 text-[10px] font-bold tracking-wide ${statusClass}`}
                  >
                    {status}
                  </span>
                </div>
                <h3 className="text-navy mt-5 font-bold">{title}</h3>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  {body}
                </p>
              </article>
            ))}
          </div>
        </Section>

        <Section tone="white" panel>
          <div className="max-w-3xl">
            <Pill variant="sky">{t('timelineKicker')}</Pill>
            <h2 className="text-heading text-navy mt-5 text-3xl md:text-4xl">
              {t('timelineTitle')}
            </h2>
          </div>

          <ol className="mt-12 space-y-5">
            {milestones.map(({ number, title, body, status, pending }) => (
              <li
                key={number}
                className="border-border bg-background/70 grid gap-4 rounded-3xl border p-6 md:grid-cols-[4rem_1fr_auto] md:items-center"
              >
                <span className="text-navy/35 font-mono text-sm">{number}</span>
                <div>
                  <h3 className="text-navy font-bold">{title}</h3>
                  <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                    {body}
                  </p>
                </div>
                <span className="text-muted-foreground flex items-center gap-2 text-xs font-bold md:max-w-60 md:text-right">
                  {pending ? (
                    <Clock3
                      className="size-4 shrink-0 text-amber-600"
                      aria-hidden="true"
                    />
                  ) : (
                    <CheckCircle2
                      className="text-sage size-4 shrink-0"
                      aria-hidden="true"
                    />
                  )}
                  {status}
                </span>
              </li>
            ))}
          </ol>
        </Section>

        <Section tone="navy">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <Pill variant="ghost">{t('safeguardsKicker')}</Pill>
              <h2 className="text-heading mt-5 text-3xl text-white md:text-4xl">
                {t('safeguardsTitle')}
              </h2>
              <ul className="mt-8 space-y-4">
                {safeguards.map((item) => (
                  <li
                    key={item}
                    className="flex gap-3 text-sm leading-relaxed text-white/75"
                  >
                    <LockKeyhole
                      className="text-crimson-light mt-0.5 size-5 shrink-0"
                      aria-hidden="true"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-7 md:p-8">
              <Pill variant="ghost">{t('limitationsKicker')}</Pill>
              <h2 className="mt-5 text-2xl font-extrabold text-white">
                {t('limitationsTitle')}
              </h2>
              <div className="mt-7 space-y-5">
                {limitations.map(({ title, body }) => (
                  <div key={title} className="flex gap-3">
                    <TriangleAlert
                      className="mt-0.5 size-5 shrink-0 text-amber-300"
                      aria-hidden="true"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-white">{title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-white/65">
                        {body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>

        <Section tone="dots" className="text-center">
          <div className="mx-auto max-w-3xl">
            <div className="bg-sage/10 mx-auto flex size-14 items-center justify-center rounded-2xl">
              <FlaskConical className="text-sage size-7" aria-hidden="true" />
            </div>
            <h2 className="text-heading text-navy mt-6 text-3xl md:text-4xl">
              {t('ctaTitle')}
            </h2>
            <p className="text-muted-foreground mx-auto mt-4 max-w-2xl leading-relaxed">
              {t('ctaBody')}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button
                render={<Link href={ROUTES.TECHNOLOGY} />}
                variant="accent"
                size="lg"
                className="rounded-full"
              >
                {t('ctaTechnology')}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Button>
              <Button
                render={<Link href={ROUTES.DOWNLOAD} />}
                variant="outline"
                size="lg"
                className="rounded-full"
              >
                <Laptop className="size-4" aria-hidden="true" />
                {t('ctaDownload')}
              </Button>
              <Button
                render={<Link href={ROUTES.PRIVACY} />}
                variant="outline"
                size="lg"
                className="rounded-full"
              >
                {t('ctaPrivacy')}
              </Button>
            </div>
          </div>
        </Section>
      </main>

      <SiteFooter />
    </div>
  );
}
