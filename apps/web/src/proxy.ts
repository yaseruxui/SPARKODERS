import { NextResponse, type NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from '@/lib/i18n/routing';
import { GATE_COOKIE, getGateConfig, isValidGateToken } from '@/lib/site-gate';

const intl = createMiddleware(routing);

/** Reachable without the password: the unlock page and the assets it shows. */
const OPEN_PATHS = new Set(['/unlock', '/brand/sparkoders-mark.webp', '/icon.png', '/apple-icon.png', '/favicon.ico']);

/** Pages are paths without a file extension outside Next's internals (the old next-intl matcher). */
function isPage(pathname: string): boolean {
  return !/^\/(api|_next|_vercel)(\/|$)/.test(pathname) && !pathname.includes('.');
}

export default function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const gate = getGateConfig();

  if (gate && !OPEN_PATHS.has(pathname) && !isValidGateToken(request.cookies.get(GATE_COOKIE)?.value, gate)) {
    if (!isPage(pathname)) return new NextResponse(null, { status: 401 });
    const unlock = new URL('/unlock', request.url);
    unlock.searchParams.set('next', `${pathname}${search}`);
    return NextResponse.redirect(unlock);
  }

  const response = isPage(pathname) && pathname !== '/unlock' ? intl(request) : NextResponse.next();
  // A private site should never reach search results.
  if (gate) response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return response;
}

export const config = {
  // Everything except build assets, so public/ files (fonts, images) are gated too.
  matcher: ['/((?!_next/static|_next/webpack-hmr).*)'],
};
