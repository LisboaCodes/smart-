import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { updateSupplier, unlinkProductsFromSupplier, deleteSupplier } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const data = await request.json()

    const supplier = await updateSupplier(params.id, {
      name: data.name,
      cnpj: data.cnpj || null,
      phone: data.phone || null,
      email: data.email || null,
      address: data.address || null,
      notes: data.notes || null,
    })

    return NextResponse.json(supplier)
  } catch (error) {
    console.error('Erro ao atualizar fornecedor:', error)
    return NextResponse.json(
      { message: 'Erro ao atualizar fornecedor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    // Desvincula os produtos antes de excluir
    await unlinkProductsFromSupplier(params.id)
    await deleteSupplier(params.id)

    return NextResponse.json({ message: 'Fornecedor excluído' })
  } catch (error) {
    console.error('Erro ao excluir fornecedor:', error)
    return NextResponse.json(
      { message: 'Erro ao excluir fornecedor' },
      { status: 500 }
    )
  }
}
