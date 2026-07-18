import {
  ArrowUpRight,
  BarChart3,
  BookOpen,
  HeartHandshake,
  Settings2,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ROUTES } from '@/routes';

const shortcuts = [
  {
    href: ROUTES.PROGRESS,
    titleKey: 'glanceProgressTitle',
    bodyKey: 'shortcutProgressBody',
    icon: BarChart3,
  },
  {
    href: ROUTES.EDUCATION,
    titleKey: 'glanceLearnTitle',
    bodyKey: 'glanceLearnBody',
    icon: BookOpen,
  },
  {
    href: ROUTES.RECOVERY,
    titleKey: 'glanceRecoveryTitle',
    bodyKey: 'glanceRecoveryBody',
    icon: HeartHandshake,
  },
  {
    href: ROUTES.SETTINGS,
    titleKey: 'shortcutSettingsTitle',
    bodyKey: 'shortcutSettingsBody',
    icon: Settings2,
  },
] as const;

export function DashboardShortcuts() {
  const t = useTranslations('recoveryDashboard');

  return (
    <section aria-labelledby="dashboard-shortcuts-title">
      <div>
        <h2
          id="dashboard-shortcuts-title"
          className="text-navy text-xl font-bold"
        >
          {t('shortcutTitle')}
        </h2>
        <p className="text-muted-foreground mt-1 text-sm leading-6">
          {t('shortcutDescription')}
        </p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {shortcuts.map(({ href, titleKey, bodyKey, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="group border-border bg-card shadow-soft hover:border-navy/30 hover:shadow-card focus-visible:ring-navy/35 grid min-h-28 grid-cols-[2.75rem_minmax(0,1fr)_1rem] items-center gap-3 rounded-2xl border p-4 transition-[transform,border-color,box-shadow] duration-200 outline-none hover:-translate-y-px focus-visible:ring-2 motion-reduce:transform-none motion-reduce:transition-none"
          >
            <span className="bg-azure/70 text-navy group-hover:bg-navy flex size-11 items-center justify-center rounded-xl transition-colors group-hover:text-white">
              <Icon className="size-5" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="text-navy block text-sm font-bold">
                {t(titleKey)}
              </span>
              <span className="text-muted-foreground mt-1 block text-xs leading-5">
                {t(bodyKey)}
              </span>
            </span>
            <ArrowUpRight
              className="text-navy/55 size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transform-none"
              aria-hidden="true"
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
