import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      nama,
      umur,
      jenisKelamin,
      beratBadan,
      panjangBadan,
      namaOrtu,
      alamat,
      tindakan,
      biaya,
      keterangan,
      tanggal
    } = body

    // Validasi required fields
    if (!nama || !umur || !jenisKelamin || !beratBadan || !panjangBadan || 
        !namaOrtu || !alamat || !tindakan || !biaya) {
      return NextResponse.json(
        { error: 'Semua field wajib harus diisi' },
        { status: 400 }
      )
    }

    // Convert biaya to integer
    const biayaInt = parseInt(biaya)
    if (isNaN(biayaInt)) {
      return NextResponse.json(
        { error: 'Biaya harus berupa angka yang valid' },
        { status: 400 }
      )
    }

    // Convert jenisKelamin from L/P to MALE/FEMALE
    const jenisKelaminMapped = jenisKelamin === 'L' ? 'MALE' : 'FEMALE'

    // Prepare transaction data
    const transactionData: any = {
      namaBayi: nama,
      umur,
      jenisKelamin: jenisKelaminMapped,
      beratBadan,
      panjangBadan,
      namaOrtu,
      alamat,
      tindakan,
      biaya: biayaInt,
      keterangan: keterangan || null
    }

    // Add custom date if provided
    if (tanggal) {
      transactionData.createdAt = new Date(tanggal)
    }

    // Create transaction
    const transaction = await db.transaction.create({
      data: transactionData
    })

    return NextResponse.json({
      success: true,
      data: transaction,
      message: 'Transaksi berhasil disimpan'
    })

  } catch (error) {
    console.error('Error creating transaction:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, tanggal, ...updateData } = body
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID transaksi diperlukan' },
        { status: 400 }
      )
    }

    // Validasi required fields
    const { nama, umur, jenisKelamin, beratBadan, panjangBadan, 
            namaOrtu, alamat, tindakan, biaya } = updateData
    
    if (!nama || !umur || !jenisKelamin || !beratBadan || !panjangBadan || 
        !namaOrtu || !alamat || !tindakan || !biaya) {
      return NextResponse.json(
        { error: 'Semua field wajib harus diisi' },
        { status: 400 }
      )
    }

    // Convert biaya to integer
    const biayaInt = parseInt(biaya)
    if (isNaN(biayaInt)) {
      return NextResponse.json(
        { error: 'Biaya harus berupa angka yang valid' },
        { status: 400 }
      )
    }

    // Convert jenisKelamin from L/P to MALE/FEMALE for PUT method
    const jenisKelaminMapped = jenisKelamin === 'L' ? 'MALE' : 'FEMALE'

    // Check if transaction exists
    const existingTransaction = await db.transaction.findUnique({
      where: { id }
    })

    if (!existingTransaction) {
      return NextResponse.json(
        { error: 'Transaksi tidak ditemukan' },
        { status: 404 }
      )
    }

    // Prepare update data
    const finalUpdateData: any = {
      namaBayi: nama,
      umur,
      jenisKelamin: jenisKelaminMapped,
      beratBadan,
      panjangBadan,
      namaOrtu,
      alamat,
      tindakan,
      biaya: biayaInt,
      keterangan: updateData.keterangan || null
    }

    // Add custom date if provided
    if (tanggal) {
      finalUpdateData.createdAt = new Date(tanggal)
    }

    // Update transaction
    const transaction = await db.transaction.update({
      where: { id },
      data: finalUpdateData
    })

    return NextResponse.json({
      success: true,
      data: transaction,
      message: 'Transaksi berhasil diperbarui'
    })

  } catch (error) {
    console.error('Error updating transaction:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID transaksi diperlukan' },
        { status: 400 }
      )
    }

    // Check if transaction exists
    const existingTransaction = await db.transaction.findUnique({
      where: { id }
    })

    if (!existingTransaction) {
      return NextResponse.json(
        { error: 'Transaksi tidak ditemukan' },
        { status: 404 }
      )
    }

    // Delete transaction
    await db.transaction.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Transaksi berhasil dihapus'
    })

  } catch (error) {
    console.error('Error deleting transaction:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search') || ''
    const tindakan = searchParams.get('tindakan') || ''
    
    const offset = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    if (search) {
      where.OR = [
        { namaBayi: { contains: search, mode: 'insensitive' } },
        { namaOrtu: { contains: search, mode: 'insensitive' } },
        { alamat: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    if (tindakan) {
      where.tindakan = tindakan
    }

    // Get transactions with pagination
    const [transactions, total] = await Promise.all([
      db.transaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit
      }),
      db.transaction.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: transactions.map((t: any) => ({
        ...t,
        jenisKelamin: t.jenisKelamin === 'MALE' ? 'L' : 'P'
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}