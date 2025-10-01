import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { currentPin: inputCurrentPin, newPin } = await request.json()

    // Validasi input
    if (!inputCurrentPin || !newPin) {
      return NextResponse.json(
        { success: false, error: 'PIN saat ini dan PIN baru diperlukan' },
        { status: 400 }
      )
    }

    // Validasi format PIN (4 digit)
    if (!/^\d{4}$/.test(inputCurrentPin) || !/^\d{4}$/.test(newPin)) {
      return NextResponse.json(
        { success: false, error: 'PIN harus 4 digit angka' },
        { status: 400 }
      )
    }

    // Cek jika PIN baru sama dengan PIN lama
    if (inputCurrentPin === newPin) {
      return NextResponse.json(
        { success: false, error: 'PIN baru tidak boleh sama dengan PIN saat ini' },
        { status: 400 }
      )
    }

    // Cari user dengan PIN saat ini
    const user = await db.user.findFirst({
      where: {
        pin: inputCurrentPin,
        isActive: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'PIN saat ini salah' },
        { status: 401 }
      )
    }

    // Update PIN user
    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: { pin: newPin }
    })

    return NextResponse.json({
      success: true,
      message: 'PIN berhasil diubah',
      data: {
        userName: updatedUser.name,
        newPin: newPin.slice(0, 2) + "**" // Hanya tampilkan 2 digit pertama untuk security
      }
    })

  } catch (error) {
    console.error('Change PIN error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint untuk melihat semua user (admin only)
export async function GET() {
  try {
    const users = await db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
        // Jangan tampilkan PIN untuk security
      }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Daftar User',
      data: users
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}