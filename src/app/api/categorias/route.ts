import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  getCategoriesWithCount,
  findCategoryByName,
  createCategory,
} from '@/lib/db'

export async function GET() {
  try {
    const categories = await getCategoriesWithCount()
    return NextResponse.json(categories)
  } catch (error) {
    console.error('Erro ao buscar categorias:', error)
    return NextResponse.json(
      { message: 'Erro ao buscar categorias' },
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

    const existing = await findCategoryByName(data.name)
    if (existing) {
      return NextResponse.json(
        { message: 'Categoria já existe' },
        { status: 400 }
      )
    }

    const category = await createCategory({
      name: data.name,
      description: data.description || null,
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar categoria:', error)
    return NextResponse.json(
      { message: 'Erro ao criar categoria' },
      { status: 500 }
    )
  }
}
