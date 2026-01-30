import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  getProductByIdWithDetails,
  getProductById,
  findProductBySku,
  findProductByBarcode,
  updateProduct,
  createStockMovement,
  countSaleItemsByProduct,
  deactivateProduct,
  deleteProduct,
} from '@/lib/db'
import { deleteProductImages } from '@/lib/upload'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const product = await getProductByIdWithDetails(params.id)

    if (!product) {
      return NextResponse.json(
        { message: 'Produto não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Erro ao buscar produto:', error)
    return NextResponse.json(
      { message: 'Erro ao buscar produto' },
      { status: 500 }
    )
  }
}

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

    const existingProduct = await getProductById(params.id)

    if (!existingProduct) {
      return NextResponse.json(
        { message: 'Produto não encontrado' },
        { status: 404 }
      )
    }

    // Verificar SKU duplicado
    if (data.sku && data.sku !== existingProduct.sku) {
      const existingSku = await findProductBySku(data.sku, params.id)
      if (existingSku) {
        return NextResponse.json(
          { message: 'SKU já cadastrado' },
          { status: 400 }
        )
      }
    }

    // Verificar código de barras duplicado
    if (data.barcode && data.barcode !== existingProduct.barcode) {
      const existingBarcode = await findProductByBarcode(data.barcode, params.id)
      if (existingBarcode) {
        return NextResponse.json(
          { message: 'Código de barras já cadastrado' },
          { status: 400 }
        )
      }
    }

    // Registrar movimentação de estoque se houve alteração
    const stockDiff = (data.stock || existingProduct.stock) - existingProduct.stock
    if (stockDiff !== 0) {
      await createStockMovement({
        productId: params.id,
        type: stockDiff > 0 ? 'ENTRY' : 'ADJUSTMENT',
        quantity: Math.abs(stockDiff),
        previousStock: existingProduct.stock,
        newStock: data.stock || existingProduct.stock,
        reason: 'Ajuste manual',
        userId: session.user.id,
      })
    }

    const product = await updateProduct(params.id, {
      sku: data.sku,
      barcode: data.barcode || null,
      name: data.name,
      description: data.description || null,
      categoryId: data.categoryId,
      supplierId: data.supplierId || null,
      costPrice: data.costPrice,
      salePrice: data.salePrice,
      stock: data.stock,
      minStock: data.minStock,
      active: data.active,
      showInStore: data.showInStore,
      featured: data.featured,
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error('Erro ao atualizar produto:', error)
    return NextResponse.json(
      { message: 'Erro ao atualizar produto' },
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

    // Verificar se há vendas com este produto
    const salesCount = await countSaleItemsByProduct(params.id)

    if (salesCount > 0) {
      // Apenas desativar
      await deactivateProduct(params.id)
      return NextResponse.json({
        message: 'Produto desativado (possui vendas vinculadas)',
      })
    }

    // Deletar imagens do filesystem
    await deleteProductImages(params.id)

    // Deletar produto (imagens no banco serão deletadas pelo CASCADE)
    await deleteProduct(params.id)

    return NextResponse.json({ message: 'Produto excluído' })
  } catch (error) {
    console.error('Erro ao excluir produto:', error)
    return NextResponse.json(
      { message: 'Erro ao excluir produto' },
      { status: 500 }
    )
  }
}
