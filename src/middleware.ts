import { NextRequest, NextResponse } from 'next/server'

// Routes yang tidak memerlukan authentication
const publicRoutes = ['/login', '/api/auth/login', '/api/transactions', '/api/auth/change-pin']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip authentication untuk public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Get session cookie
  const sessionCookie = request.cookies.get('sahasrara_session')

  // Jika tidak ada session cookie, redirect ke login
  if (!sessionCookie || !sessionCookie.value) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Parse session data
  let sessionData
  try {
    sessionData = JSON.parse(sessionCookie.value)
  } catch (error) {
    // Invalid session format, redirect to login
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Check if session is valid
  if (!sessionData.authenticated) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Check if session is expired
  if (sessionData.expiresAt && sessionData.expiresAt < Date.now()) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    loginUrl.searchParams.set('expired', 'true')
    return NextResponse.redirect(loginUrl)
  }

  // Session is valid, continue
  return NextResponse.next()
}

// Configure middleware untuk specific routes
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}