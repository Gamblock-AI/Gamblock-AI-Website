import { ArrowRight, BookOpen, CircleHelp } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { LucideIcon } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { ROUTES } from '@/routes';

export function RecoveryLinks() {
  const t = useTranslations('recoveryHub');

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <RecoveryLinkCard
        icon={BookOpen}
        id="recovery-education-title"
        title={t('educationTitle')}
        body={t('educationBody')}
        action={t('educationAction')}
        href={ROUTES.EDUCATION}
      />
      <RecoveryLinkCard
        icon={CircleHelp}
        id="recovery-support-title"
        title={t('supportTitle')}
        body={t('supportBody')}
        action={t('supportAction')}
        href={ROUTES.SUPPORT}
      />
    </div>
  );
}

function RecoveryLinkCard({
  icon: Icon,
  id,
  title,
  body,
  action,
  href,
}: {
  icon: LucideIcon;
  id: string;
  title: string;
  body: string;
  action: string;
  href: typeof ROUTES.EDUCATION | typeof ROUTES.SUPPORT;
}) {
  return (
    <section
      className="border-border bg-card shadow-soft rounded-2xl border p-5"
      aria-labelledby={id}
    >
      <span className="bg-navy flex size-10 items-center justify-center rounded-xl text-white shadow-sm">
        <Icon className="size-[1.125rem]" aria-hidden="true" />
      </span>
      <h2 id={id} className="text-navy mt-4 text-base leading-6 font-bold">
        {title}
      </h2>
      <p className="text-muted-foreground mt-2 text-sm leading-6">{body}</p>
      <Link
        href={href}
        className="text-navy hover:text-sage focus-visible:ring-navy/30 mt-3 inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-bold transition-colors outline-none focus-visible:ring-2"
      >
        {action}
        <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </section>
  );
}
