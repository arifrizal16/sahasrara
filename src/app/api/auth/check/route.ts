import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Get session cookie
    const sessionCookie = request.cookies.get('sahasrara_session')

    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json(
        { success: false, error: 'No session found' },
        { status: 401 }
      )
    }

    // Parse session data
    let sessionData
    try {
      sessionData = JSON.parse(sessionCookie.value)
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid session format' },
        { status: 401 }
      )
    }

    // Check if session is valid
    if (!sessionData.authenticated) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Check if session is expired
    if (sessionData.expiresAt && sessionData.expiresAt < Date.now()) {
      return NextResponse.json(
        { success: false, error: 'Session expired' },
        { status: 401 }
      )
    }

    // Session is valid
    return NextResponse.json({
      success: true,
      session: {
        authenticated: true,
        expiresAt: sessionData.expiresAt,
        rememberMe: sessionData.rememberMe || false
      }
    })

  } catch (error) {
    console.error('Auth check error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}