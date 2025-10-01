import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { pin, rememberMe } = await request.json()

    // Validasi input
    if (!pin || typeof pin !== 'string') {
      return NextResponse.json(
        { success: false, error: 'PIN diperlukan' },
        { status: 400 }
      )
    }

    // Cek PIN (harus 4 digit)
    if (pin.length !== 4) {
      return NextResponse.json(
        { success: false, error: 'PIN harus 4 digit' },
        { status: 400 }
      )
    }

    // Cari user di database berdasarkan PIN
    const user = await db.user.findFirst({
      where: {
        pin: pin,
        isActive: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'PIN salah' },
        { status: 401 }
      )
    }

    // Hitung expiry time
    const expiryTime = rememberMe 
      ? Date.now() + (30 * 24 * 60 * 60 * 1000) // 30 hari
      : Date.now() + (30 * 60 * 1000) // 30 menit

    // Create session data
    const sessionData = {
      authenticated: true,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      loginTime: Date.now(),
      expiresAt: expiryTime,
      rememberMe
    }

    // Create response with session cookie
    const response = NextResponse.json({
      success: true,
      message: 'Login berhasil',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      session: {
        expiresAt: expiryTime,
        rememberMe
      }
    })

    // Set HTTP-only cookie
    response.cookies.set('sahasrara_session', JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: rememberMe ? 30 * 24 * 60 * 60 : 30 * 60, // 30 days or 30 minutes
      path: '/'
    })

    return response

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}