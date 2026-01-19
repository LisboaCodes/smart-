import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getPaymentMethods, findPaymentMethodByName, createPaymentMethod } from '@/lib/db'

export async function GET() {
  try {
    const paymentMethods = await getPaymentMethods()
    return NextResponse.json(paymentMethods)
  } catch (error) {
    console.error('Erro ao buscar formas de pagamento:', error)
    return NextResponse.json(
      { message: 'Erro ao buscar formas de pagamento' },
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

    const existing = await findPaymentMethodByName(data.name)
    if (existing) {
      return NextResponse.json(
        { message: 'Forma de pagamento já existe' },
        { status: 400 }
      )
    }

    const paymentMethod = await createPaymentMethod({
      name: data.name,
      type: data.type,
    })

    return NextResponse.json(paymentMethod, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar forma de pagamento:', error)
    return NextResponse.json(
      { message: 'Erro ao criar forma de pagamento' },
      { status: 500 }
    )
  }
}
