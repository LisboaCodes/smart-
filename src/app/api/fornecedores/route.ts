import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getSuppliersWithCount, createSupplier } from '@/lib/db'

export async function GET() {
  try {
    const suppliers = await getSuppliersWithCount()
    return NextResponse.json(suppliers)
  } catch (error) {
    console.error('Erro ao buscar fornecedores:', error)
    return NextResponse.json(
      { message: 'Erro ao buscar fornecedores' },
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

    const supplier = await createSupplier({
      name: data.name,
      cnpj: data.cnpj || null,
      phone: data.phone || null,
      email: data.email || null,
      address: data.address || null,
      notes: data.notes || null,
    })

    return NextResponse.json(supplier, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar fornecedor:', error)
    return NextResponse.json(
      { message: 'Erro ao criar fornecedor' },
      { status: 500 }
    )
  }
}
