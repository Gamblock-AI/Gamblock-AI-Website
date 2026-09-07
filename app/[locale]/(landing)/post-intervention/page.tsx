'use client';

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CircleHelp,
  HeartPulse,
  ShieldCheck,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { FixedBackground } from '@/components/landing/FixedBackground';
import { PostInterventionPauseChoice } from '@/components/landing/post-intervention-pause-choice';
import { SkipLink } from '@/components/landing/SkipLink';
import { useBackNavigation } from '@/hooks/use-back-navigation';
import { Link } from '@/i18n/routing';
import { ROUTES } from '@/routes';

export default function PostInterventionPage() {
  const t = useTranslations('postIntervention');
  const { goBack } = useBackNavigation();

  return (
    <>
      <SkipLink />
      <FixedBackground />
      <main
        id="main-content"
        className="min-h-dvh px-4 py-5 sm:px-6 sm:py-8 lg:px-8 lg:py-10"
      >
        <div className="mx-auto w-full max-w-5xl">
          <nav
            className="flex items-center justify-between gap-4"
            aria-label={t('leave')}
          >
            <button
              type="button"
              onClick={() => goBack(ROUTES.HOME)}
              className="text-navy focus-visible:ring-navy/30 inline-flex min-h-10 sm:min-h-11 items-center gap-2 rounded-xl text-xs sm:text-sm font-semibold outline-none hover:underline focus-visible:ring-2"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              {t('leave')}
            </button>
            <span className="border-sage/25 bg-sage/[0.06] text-sage inline-flex min-h-10 sm:min-h-11 items-center gap-2 rounded-xl border px-3 text-xs font-semibold">
              <ShieldCheck className="size-4" aria-hidden="true" />
              Gamblock-AI
            </span>
          </nav>

          <div className="mt-5 sm:mt-8 grid items-stretch gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-[1.15fr_0.85fr]">
            {/* Primary Content Card: Recovery Space & Pathway Choices */}
            <section
              className="border-border/80 bg-card shadow-card relative flex h-full flex-col justify-between overflow-hidden rounded-2xl sm:rounded-[2rem] border p-4.5 sm:p-6 lg:p-7 backdrop-blur-md order-1"
              aria-labelledby="post-intervention-title"
            >
              <div
                className="pointer-events-none absolute -top-24 -left-24 size-80 sm:size-96 rounded-full bg-gradient-to-br from-azure/60 via-sky-light/20 to-transparent opacity-70 blur-3xl"
                aria-hidden="true"
              />
              <div className="relative">
                <p className="text-navy/70 mb-2 text-[10px] font-bold uppercase tracking-[0.18em] sm:text-xs">
                  {t('eyebrow')}
                </p>
                <h1
                  id="post-intervention-title"
                  className="text-navy max-w-2xl text-xl sm:text-2xl lg:text-[2rem] font-extrabold tracking-tight leading-snug sm:leading-tight"
                >
                  {t('title')}
                </h1>
                <p className="text-muted-foreground mt-2 sm:mt-3 max-w-2xl text-xs sm:text-sm lg:text-base leading-relaxed">
                  {t('description')}
                </p>

                <div className="border-sage/20 bg-sage/[0.06] mt-4 flex items-start gap-2 rounded-xl border p-2.5 sm:mt-5 sm:p-3">
                  <ShieldCheck className="text-sage mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  <div>
                    <p className="text-navy text-[11px] font-bold sm:text-xs">
                      {t('privacyTitle')}
                    </p>
                    <p className="text-muted-foreground mt-0.5 text-[10px] leading-relaxed sm:text-[11px]">
                      {t('privacyBody')}
                    </p>
                  </div>
                </div>

                {/* Pathway Choice Cards */}
                <div className="mt-4 sm:mt-5 space-y-2">
                  <span className="text-[11px] sm:text-xs font-bold text-navy uppercase tracking-wider">
                    {t('optionsTitle')}
                  </span>
                  <div className="grid gap-2">
                    <Link
                      href={ROUTES.RECOVERY}
                      className="group border-border/80 bg-background/60 hover:bg-azure/40 hover:border-navy/20 flex items-center justify-between rounded-xl border p-2.5 sm:p-3 transition-all duration-150"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="border-border/80 bg-card text-navy group-hover:bg-navy group-hover:text-white flex size-8 sm:size-9 shrink-0 items-center justify-center rounded-lg border transition-colors shadow-2xs">
                          <HeartPulse className="size-4 sm:size-4.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-navy truncate sm:text-sm">
                            {t('optionRecoveryTitle')}
                          </p>
                          <p className="text-muted-foreground text-[11px] truncate sm:text-xs">
                            {t('optionRecoveryDesc')}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="text-muted-foreground group-hover:text-navy group-hover:translate-x-0.5 size-4 shrink-0 transition-transform" />
                    </Link>

                    <Link
                      href={ROUTES.EDUCATION}
                      className="group border-border/80 bg-background/60 hover:bg-azure/40 hover:border-navy/20 flex items-center justify-between rounded-xl border p-2.5 sm:p-3 transition-all duration-150"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="border-border/80 bg-card text-navy group-hover:bg-navy group-hover:text-white flex size-8 sm:size-9 shrink-0 items-center justify-center rounded-lg border transition-colors shadow-2xs">
                          <BookOpen className="size-4 sm:size-4.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-navy truncate sm:text-sm">
                            {t('optionEducationTitle')}
                          </p>
                          <p className="text-muted-foreground text-[11px] truncate sm:text-xs">
                            {t('optionEducationDesc')}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="text-muted-foreground group-hover:text-navy group-hover:translate-x-0.5 size-4 shrink-0 transition-transform" />
                    </Link>

                    <Link
                      href={ROUTES.HELP}
                      className="group border-border/80 bg-background/60 hover:bg-azure/40 hover:border-navy/20 flex items-center justify-between rounded-xl border p-2.5 sm:p-3 transition-all duration-150"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="border-border/80 bg-card text-navy group-hover:bg-navy group-hover:text-white flex size-8 sm:size-9 shrink-0 items-center justify-center rounded-lg border transition-colors shadow-2xs">
                          <CircleHelp className="size-4 sm:size-4.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-navy truncate sm:text-sm">
                            {t('optionHelpTitle')}
                          </p>
                          <p className="text-muted-foreground text-[11px] truncate sm:text-xs">
                            {t('optionHelpDesc')}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="text-muted-foreground group-hover:text-navy group-hover:translate-x-0.5 size-4 shrink-0 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            </section>

            <PostInterventionPauseChoice />
          </div>

          {/* Bottom Card: Emergency Support Callout */}
          <section
            className="border-border/80 bg-card shadow-card relative mt-4 sm:mt-6 overflow-hidden rounded-2xl sm:rounded-[1.75rem] border p-4 sm:p-6 backdrop-blur-md"
            aria-labelledby="post-support-title"
          >
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="border-navy/10 bg-azure/60 text-navy flex size-9 sm:size-11 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl border shadow-2xs">
                <CircleHelp className="size-4.5 sm:size-5" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <h2
                  id="post-support-title"
                  className="text-navy text-sm sm:text-base font-bold"
                >
                  {t('supportTitle')}
                </h2>
                <p className="text-muted-foreground mt-0.5 sm:mt-1 max-w-3xl text-xs sm:text-sm leading-relaxed">
                  {t('supportBody')}
                </p>
                <Link
                  href={ROUTES.HELP}
                  className="text-navy focus-visible:ring-navy/30 mt-3 inline-flex min-h-10 items-center gap-1.5 rounded-lg text-xs font-bold outline-none hover:underline focus-visible:ring-2 sm:text-sm"
                >
                  {t('openHelp')}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
