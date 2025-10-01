import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const sessionCookie = request.cookies.get('sahasrara_session');

  // Jika tidak ada session cookie dan pengguna tidak berada di halaman login,
  // maka alihkan ke halaman login
  if (!sessionCookie && pathname !== '/login') {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Jika ada session cookie dan pengguna berada di halaman login,
  // maka alihkan ke dashboard (atau halaman utama)
  if (sessionCookie && pathname === '/login') {
    const dashboardUrl = new URL('/', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // Lanjutkan seperti biasa jika kondisi di atas tidak terpenuhi
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Kecualikan semua rute yang dimulai dengan:
     * - /api/auth (semua endpoint auth)
     * - _next/static (file statis)
     * - _next/image (optimasi gambar)
     * - favicon.ico (ikon favorit)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
};