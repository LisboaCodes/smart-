import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getFinancialEntries, createFinancialEntry } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const status = searchParams.get('status')

    const entries = await getFinancialEntries({
      type: type || undefined,
      status: status || undefined,
    })

    return NextResponse.json(entries)
  } catch (error) {
    console.error('Erro ao buscar entradas:', error)
    return NextResponse.json(
      { message: 'Erro ao buscar entradas' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const data = await request.json()

    const entry = await createFinancialEntry({
      type: data.type,
      status: data.status || 'PENDING',
      description: data.description,
      amount: data.amount,
      dueDate: new Date(data.dueDate),
      paidDate: data.paidDate ? new Date(data.paidDate) : null,
      paidAmount: data.paidAmount || null,
      category: data.category,
      notes: data.notes || null,
    })

    return NextResponse.json(entry, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar entrada:', error)
    return NextResponse.json(
      { message: 'Erro ao criar entrada' },
      { status: 500 }
    )
  }
}
