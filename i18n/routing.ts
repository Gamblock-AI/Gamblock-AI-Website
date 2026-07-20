import {defineRouting} from 'next-intl/routing';
import {createNavigation} from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['id', 'en'],
  defaultLocale: 'id',
  localeDetection: false,
});

export const {Link, redirect, usePathname, useRouter} = createNavigation(routing);
