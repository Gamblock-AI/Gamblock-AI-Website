import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

export default function NotFound() {
  const t = useTranslations('NotFound');

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-aqua px-4 text-center">
      <h1 className="text-6xl font-extrabold text-navy">404</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        {t('message')}
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-crimson px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-crimson/90"
      >
        {t('backHome')}
      </Link>
    </div>
  );
}
