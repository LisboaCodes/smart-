import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  findCategoryByName,
  updateCategory,
  countProductsByCategory,
  deleteCategory,
} from '@/lib/db'

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

    const existing = await findCategoryByName(data.name, params.id)
    if (existing) {
      return NextResponse.json(
        { message: 'Categoria já existe' },
        { status: 400 }
      )
    }

    const category = await updateCategory(params.id, {
      name: data.name,
      description: data.description || null,
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error('Erro ao atualizar categoria:', error)
    return NextResponse.json(
      { message: 'Erro ao atualizar categoria' },
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

    const productsCount = await countProductsByCategory(params.id)

    if (productsCount > 0) {
      return NextResponse.json(
        { message: 'Categoria possui produtos vinculados' },
        { status: 400 }
      )
    }

    await deleteCategory(params.id)

    return NextResponse.json({ message: 'Categoria excluída' })
  } catch (error) {
    console.error('Erro ao excluir categoria:', error)
    return NextResponse.json(
      { message: 'Erro ao excluir categoria' },
      { status: 500 }
    )
  }
}
