'use client';

import Image from 'next/image';
import { Link } from '@/i18n/routing';
import {
  ArrowRight,
  AtSign,
  BriefcaseBusiness,
  Camera,
  Code2,
  Globe,
  MessageCircle,
  Music2,
  Play,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/routes';
import { useSiteSocialLinks } from '@/hooks/use-site-social-links';

const SOCIAL_ICONS = {
  instagram: Camera,
  tiktok: Music2,
  youtube: Play,
  facebook: Globe,
  linkedin: BriefcaseBusiness,
  x: AtSign,
  threads: MessageCircle,
  github: Code2,
} as const;

const COLUMNS = [
  {
    titleKey: 'colProduct',
    links: [
      { labelKey: 'linkFeatures', href: '/#fitur' },
      { labelKey: 'linkTechnology', href: '/technology' },
      { labelKey: 'linkHowItWorks', href: '/#cara-kerja' },
      { labelKey: 'linkImpact', href: '/dampak' },
    ],
  },
  {
    titleKey: 'colResources',
    links: [
      { labelKey: 'linkDownload', href: ROUTES.DOWNLOAD },
      { labelKey: 'linkFaq', href: '/#faq' },
      { labelKey: 'linkHelp', href: ROUTES.HELP },
      { labelKey: 'linkContact', href: ROUTES.CONTACT },
    ],
  },
  {
    titleKey: 'colAcademic',
    links: [
      { labelKey: 'linkTeam', href: '/#tim' },
      { labelKey: 'linkProposal', href: '/dampak' },
      { labelKey: 'linkTerms', href: ROUTES.TERMS },
      { labelKey: 'linkPrivacy', href: ROUTES.PRIVACY },
    ],
  },
] as const;

/**
 * SiteFooter — product navigation and academic project context.
 */
export function SiteFooter() {
  const t = useTranslations('Footer');
  const socialLinks = useSiteSocialLinks();

  return (
    <footer className="bg-footer-navy relative overflow-hidden text-white">
      <Image
        src="/images/landing/generated/gami-encourage.webp"
        alt=""
        aria-hidden
        width={1024}
        height={1536}
        className="pointer-events-none absolute -right-10 -bottom-28 w-80 opacity-[0.05] select-none"
      />

      <div className="relative mx-auto max-w-6xl px-6 py-16 md:px-10">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          {/* Brand + CTA */}
          <div className="space-y-5">
            <div className="flex items-center gap-2.5">
              <span className="shadow-soft flex h-10 w-10 items-center justify-center rounded-xl bg-white">
                <Image
                  src="/images/gamblock-1.png"
                  alt="Logo Gamblock-AI"
                  width={32}
                  height={32}
                  className="h-7 w-7 object-contain"
                />
              </span>
              <span className="text-lg font-extrabold tracking-tight text-white">
                Gamblock<span className="text-crimson-light">-AI</span>
              </span>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-white/60">
              {t('tagline')}
            </p>
            {socialLinks.length > 0 ? (
              <div
                className="flex flex-wrap gap-2"
                aria-label={t('socialLabel')}
              >
                {socialLinks.map((social) => {
                  const Icon =
                    SOCIAL_ICONS[
                      social.platform as keyof typeof SOCIAL_ICONS
                    ] ?? AtSign;
                  return (
                    <a
                      key={social.id}
                      href={social.url ?? undefined}
                      target="_blank"
                      rel="noreferrer noopener"
                      aria-label={social.label}
                      title={social.label}
                      className="flex size-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/75 transition-colors hover:border-white/30 hover:bg-white/10 hover:text-white"
                    >
                      <Icon className="size-4" aria-hidden="true" />
                    </a>
                  );
                })}
              </div>
            ) : null}
            <div className="pt-2">
              <Link href={ROUTES.REGISTER}>
                <Button
                  variant="primary"
                  className="text-navy rounded-full border-white bg-white hover:bg-white/90"
                >
                  {t('ctaStart')}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Link columns */}
          {COLUMNS.map((col) => (
            <div key={col.titleKey}>
              <h4 className="text-label mb-4 text-white/45">
                {t(col.titleKey)}
              </h4>
              <ul className="space-y-3">
                {col.links.map((l) => (
                  <li key={l.labelKey}>
                    <Link
                      href={l.href}
                      className="text-sm font-medium text-white/70 transition-colors hover:text-white"
                    >
                      {t(l.labelKey)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-6 md:flex-row md:items-center">
          <p className="text-xs text-white/45">{t('copyright')}</p>
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-crimson rounded-full px-3 py-1 text-[10px] font-bold tracking-wider text-white uppercase">
              {t('badgePkm')}
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold tracking-wider text-white/80 uppercase">
              {t('badgeYear')}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
