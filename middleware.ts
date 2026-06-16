import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { PROTECTED_ROUTES, GUEST_ROUTES } from './routes';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('gamblock_access_token')?.value;

  const isProtected = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  );
  if (isProtected) {
    if (!token) {
      const url = new URL('/login', request.url);
      return NextResponse.redirect(url);
    }
  }

  const isGuest = GUEST_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  );
  if (isGuest) {
    if (token) {
      const url = new URL('/dashboard', request.url);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images).*)'],
};
