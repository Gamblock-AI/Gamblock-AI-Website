'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';
import { Button } from '@/components/ui/button';

export function LanguageToggle() {
  const t = useTranslations('dashboardNav');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const toggleLanguage = () => {
    const nextLocale = locale === 'en' ? 'id' : 'en';
    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <Button
      variant="outline"
      size="icon"
      className="h-9 w-9 rounded-lg"
      onClick={toggleLanguage}
      title={t('languageToggle')}
    >
      <span className="text-xs font-bold uppercase">{locale}</span>
    </Button>
  );
}
