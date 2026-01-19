import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  getCustomersAPI,
  findCustomerByCpf,
  findCustomerByEmail,
  createCustomer,
} from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''

    const customers = await getCustomersAPI(search || undefined)

    return NextResponse.json(customers)
  } catch (error) {
    console.error('Erro ao buscar clientes:', error)
    return NextResponse.json(
      { message: 'Erro ao buscar clientes' },
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

    // Verificar CPF duplicado
    if (data.cpf) {
      const existingCpf = await findCustomerByCpf(data.cpf)
      if (existingCpf) {
        return NextResponse.json(
          { message: 'CPF já cadastrado' },
          { status: 400 }
        )
      }
    }

    // Verificar email duplicado
    if (data.email) {
      const existingEmail = await findCustomerByEmail(data.email)
      if (existingEmail) {
        return NextResponse.json(
          { message: 'Email já cadastrado' },
          { status: 400 }
        )
      }
    }

    const customer = await createCustomer({
      name: data.name,
      email: data.email || null,
      cpf: data.cpf || null,
      phone: data.phone || null,
      whatsapp: data.whatsapp || null,
      instagram: data.instagram || null,
      birthDate: data.birthDate ? new Date(data.birthDate) : null,
      type: data.type || 'REGULAR',
      notes: data.notes || null,
      address: data.address || null,
      city: data.city || null,
      state: data.state || null,
      zipCode: data.zipCode || null,
      acceptsMarketing: data.acceptsMarketing ?? true,
    })

    return NextResponse.json(customer, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar cliente:', error)
    return NextResponse.json(
      { message: 'Erro ao criar cliente' },
      { status: 500 }
    )
  }
}
