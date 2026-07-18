import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { routing } from './i18n/routing';
import { GUEST_ROUTES, PROTECTED_ROUTES } from './routes';

const intlMiddleware = createMiddleware(routing);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const localeMatch = pathname.match(/^\/(id|en)(?=\/|$)/);
  const locale = localeMatch ? localeMatch[1] : routing.defaultLocale;
  const pathnameWithoutLocale = pathname.replace(/^\/(id|en)(?=\/|$)/, '') || '/';

  // Keep next-intl's request header override intact. It carries the resolved
  // locale into the App Router and is required for matching app/[locale].
  const response = intlMiddleware(request);

  const token = request.cookies.get('gamblock_access_token')?.value;

  const isProtected = PROTECTED_ROUTES.some(
    (route) =>
      pathnameWithoutLocale === route ||
      pathnameWithoutLocale.startsWith(route + '/')
  );

  if (isProtected && !token) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/login`;
    url.search = '';
    url.searchParams.set(
      'next',
      `${pathnameWithoutLocale}${request.nextUrl.search}`
    );
    return NextResponse.redirect(url);
  }

  const isGuest = GUEST_ROUTES.some(
    (route) =>
      pathnameWithoutLocale === route ||
      pathnameWithoutLocale.startsWith(route + '/')
  );

  if (isGuest && token) {
    const url = request.nextUrl.clone();
    const nextPath = request.nextUrl.searchParams.get('next');
    url.pathname =
      nextPath && nextPath.startsWith('/') && !nextPath.startsWith('//')
        ? `/${locale}${nextPath}`
        : `/${locale}/dashboard`;
    url.search = '';
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ['/', '/(id|en)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)'],
};
