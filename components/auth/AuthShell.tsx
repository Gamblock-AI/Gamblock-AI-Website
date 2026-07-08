'use client';

import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ROUTES } from '@/routes';
import type { ReactNode } from 'react';

interface AuthShellProps {
  /** Form-side header. */
  heading: string;
  subheading: string;
  children: ReactNode;
  /** Bottom-of-form switch link (e.g. to register / login). */
  footer?: ReactNode;
}

/**
 * AuthShell — centered single-column auth layout. A centered brand lockup sits
 * directly above a wide white card that contains the back link and the form.
 */
export function AuthShell({ heading, subheading, children, footer }: AuthShellProps) {
  const t = useTranslations('loginPage');

  return (
    <div className="bg-mesh flex min-h-[100dvh] w-full flex-col items-center justify-center px-4 py-10 sm:px-6">
      <div className="w-full max-w-xl">
        {/* Brand lockup — centered, directly above the card */}
        <Link href={ROUTES.HOME} className="mx-auto mb-6 flex w-fit items-center gap-2.5">
          <Image
            src="/images/gamblock-1.png"
            alt="Logo Gamblock-AI"
            width={40}
            height={40}
            className="h-10 w-10 object-contain"
          />
          <span className="text-xl font-extrabold tracking-tight text-navy">
            Gamblock<span className="text-crimson">-AI</span>
          </span>
        </Link>

        {/* Card */}
        <div className="w-full rounded-3xl border border-border bg-card p-8 shadow-card sm:p-10">
          <Link
            href={ROUTES.HOME}
            className="group mb-6 inline-flex w-fit items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-navy"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            {t('text_235')}
          </Link>

          <div className="mb-7">
            <h1 className="text-heading text-2xl text-navy sm:text-3xl">{heading}</h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{subheading}</p>
          </div>

          {children}

          {footer ? <div className="mt-7">{footer}</div> : null}
        </div>
      </div>
    </div>
  );
}
