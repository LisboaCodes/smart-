import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { generateCode } from '@/lib/utils'
import {
  getSalesAPI,
  getProductForSale,
  getPaymentMethodById,
  getActiveCardMachine,
  createSaleTransaction,
} from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const status = searchParams.get('status')

    const sales = await getSalesAPI({
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      status: status || undefined,
    })

    return NextResponse.json(sales)
  } catch (error) {
    console.error('Erro ao buscar vendas:', error)
    return NextResponse.json(
      { message: 'Erro ao buscar vendas' },
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
    const { customerId, items, discountType, discountValue, payments } = data

    // Validar estoque
    for (const item of items) {
      const product = await getProductForSale(item.productId)
      if (!product) {
        return NextResponse.json(
          { message: `Produto não encontrado` },
          { status: 400 }
        )
      }
      if (product.stock < item.quantity) {
        return NextResponse.json(
          { message: `Estoque insuficiente para ${product.name}` },
          { status: 400 }
        )
      }
    }

    // Calcular valores
    const subtotal = items.reduce(
      (acc: number, item: any) =>
        acc + item.unitPrice * item.quantity - (item.discount || 0),
      0
    )
    const discountAmount =
      discountType === 'PERCENT'
        ? (subtotal * (discountValue || 0)) / 100
        : discountValue || 0
    const total = subtotal - discountAmount

    const totalCost = items.reduce(
      (acc: number, item: any) => acc + item.costPrice * item.quantity,
      0
    )
    const profit = total - totalCost

    // Calcular taxas
    let totalFees = 0
    for (const payment of payments) {
      const method = await getPaymentMethodById(payment.paymentMethodId)
      if (method?.type === 'CREDIT' || method?.type === 'DEBIT') {
        // Buscar taxa da maquineta padrão
        const cardMachine = await getActiveCardMachine()
        if (cardMachine) {
          const feeRate =
            method.type === 'CREDIT'
              ? Number(cardMachine.creditFee)
              : Number(cardMachine.debitFee)
          totalFees += (payment.amount * feeRate) / 100
        }
      }
    }

    const netProfit = profit - totalFees

    // Criar venda com transação
    const sale = await createSaleTransaction({
      code: generateCode('V'),
      customerId: customerId || undefined,
      userId: session.user.id,
      subtotal,
      discountType: discountType || null,
      discountValue: discountValue || null,
      discountAmount,
      total,
      totalCost,
      profit,
      netProfit,
      totalFees,
      items: items.map((item: any) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        costPrice: item.costPrice,
        discount: item.discount || 0,
        total: item.unitPrice * item.quantity - (item.discount || 0),
      })),
      payments: payments.map((payment: any) => ({
        paymentMethodId: payment.paymentMethodId,
        amount: payment.amount,
        installments: payment.installments || 1,
      })),
    })

    return NextResponse.json(sale, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar venda:', error)
    return NextResponse.json(
      { message: 'Erro ao criar venda' },
      { status: 500 }
    )
  }
}
