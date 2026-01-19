import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  getProductsAPI,
  findProductBySku,
  findProductByBarcode,
  createProduct,
  createStockMovement,
} from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const categoryId = searchParams.get('categoryId')
    const active = searchParams.get('active')

    const products = await getProductsAPI({
      search: search || undefined,
      categoryId: categoryId || undefined,
      active: active !== null ? active === 'true' : null,
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('Erro ao buscar produtos:', error)
    return NextResponse.json(
      { message: 'Erro ao buscar produtos' },
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

    // Verificar se SKU já existe
    const existingSku = await findProductBySku(data.sku)
    if (existingSku) {
      return NextResponse.json(
        { message: 'SKU já cadastrado' },
        { status: 400 }
      )
    }

    // Verificar se código de barras já existe
    if (data.barcode) {
      const existingBarcode = await findProductByBarcode(data.barcode)
      if (existingBarcode) {
        return NextResponse.json(
          { message: 'Código de barras já cadastrado' },
          { status: 400 }
        )
      }
    }

    const product = await createProduct({
      sku: data.sku,
      barcode: data.barcode || null,
      name: data.name,
      description: data.description || null,
      categoryId: data.categoryId,
      supplierId: data.supplierId || null,
      costPrice: data.costPrice,
      salePrice: data.salePrice,
      stock: data.stock || 0,
      minStock: data.minStock || 5,
      active: data.active ?? true,
      showInStore: data.showInStore ?? true,
      featured: data.featured ?? false,
    })

    // Registrar movimentação de estoque inicial
    if (data.stock > 0) {
      await createStockMovement({
        productId: product.id,
        type: 'ENTRY',
        quantity: data.stock,
        previousStock: 0,
        newStock: data.stock,
        reason: 'Estoque inicial',
        userId: session.user.id,
      })
    }

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar produto:', error)
    return NextResponse.json(
      { message: 'Erro ao criar produto' },
      { status: 500 }
    )
  }
}
