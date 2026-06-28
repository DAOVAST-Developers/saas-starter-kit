import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { rateLimitRequest } from '@/lib/rate-limit';

const PROTECTED_PREFIXES = ['/dashboard', '/admin', '/settings'];
const AUTH_PAGES = ['/login', '/signup', '/forgot-password', '/reset-password'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Rate limit API routes before doing any auth work.
  if (pathname.startsWith('/api')) {
    const limited = await rateLimitRequest(request);
    if (limited) return limited;
  }

  // 2. Refresh the Supabase session (rotates auth cookies).
  const { response, user } = await updateSession(request);

  // 3. Route protection.
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (isProtected && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // 4. Keep authenticated users out of auth pages.
  if (user && AUTH_PAGES.some((p) => pathname.startsWith(p))) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/dashboard';
    redirectUrl.search = '';
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static assets and image optimization.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
