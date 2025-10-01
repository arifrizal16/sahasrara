import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Create response with cleared cookie
    const response = NextResponse.json({
      success: true,
      message: 'Logout berhasil'
    })

    // Clear session cookie
    response.cookies.set('sahasrara_session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/'
    })

    return response

  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}