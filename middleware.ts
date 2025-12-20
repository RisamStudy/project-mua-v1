import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token');
  const { pathname } = request.nextUrl;

  console.log('Middleware:', {
    path: pathname,
    hasToken: !!token?.value,
  });

  // Public paths yang boleh diakses tanpa login
  const publicPaths = ['/login'];
  const isPublicPath = publicPaths.some(path => pathname === path || pathname.startsWith(path + '/'));

  // Root path - redirect based on auth status
  if (pathname === '/') {
    console.log('Root path detected');
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Jika user sudah login dan coba akses login page
  if (isPublicPath && token) {
    console.log('Logged in, redirect to dashboard');
    // PREVENT LOOP: Check if we're already redirecting
    const referer = request.headers.get('referer');
    if (referer?.includes('/dashboard')) {
      console.log('Loop detected! Allow request');
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Jika user belum login dan coba akses protected route
  if (!isPublicPath && !token) {
    console.log('No token, redirect to login');
    const loginUrl = new URL('/login', request.url);
    if (pathname !== '/') {
      loginUrl.searchParams.set('from', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  console.log('Allow request');
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};