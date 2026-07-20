'use client';

import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { ROUTES } from '@/routes';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import { BackButton } from '@/components/common/BackButton';
import type { ReactNode } from 'react';

interface AuthShellProps {
  /** Form-side header. */
  heading: string;
  subheading: string;
  children: ReactNode;
  /** Bottom-of-form switch link (e.g. to register / login). */
  footer?: ReactNode;
  /** Route used when this page is the first browser-history entry. */
  backFallbackHref?: string;
  /** Defaults to the localized "Back to Home" label. */
  backLabel?: string;
}

/**
 * AuthShell — centered single-column auth layout. A centered brand lockup sits
 * directly above a wide white card that contains the back link and the form.
 */
export function AuthShell({
  heading,
  subheading,
  children,
  footer,
  backFallbackHref,
  backLabel,
}: AuthShellProps) {
  const t = useTranslations('authShell');

  return (
    <div className="bg-mesh relative flex min-h-[100dvh] w-full flex-col items-center justify-center px-4 py-10 sm:px-6">
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <LanguageSwitcher />
      </div>
      <div className="w-full max-w-xl">
        {/* Brand lockup — centered, directly above the card */}
        <Link
          href={ROUTES.HOME}
          className="mx-auto mb-6 flex w-fit items-center gap-2.5"
        >
          <Image
            src="/images/gamblock-1.png"
            alt={t('brandLogoAlt')}
            width={40}
            height={40}
            className="h-10 w-10 object-contain"
          />
          <span className="text-navy text-xl font-extrabold tracking-tight">
            Gamblock<span className="text-crimson">-AI</span>
          </span>
        </Link>

        {/* Card */}
        <div className="border-border bg-card shadow-card w-full rounded-3xl border px-5 py-8 sm:p-10">
          <div className="mb-6">
            <BackButton
              label={backLabel ?? t('backHome')}
              fallbackHref={backFallbackHref}
            />
          </div>

          <div className="mb-7">
            <h1 className="text-heading text-navy text-2xl sm:text-3xl">
              {heading}
            </h1>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
              {subheading}
            </p>
          </div>

          {children}

          {footer ? <div className="mt-7">{footer}</div> : null}
        </div>
      </div>
    </div>
  );
}
