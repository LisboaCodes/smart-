import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  getCustomerByIdWithSales,
  getCustomerById,
  findCustomerByCpf,
  findCustomerByEmail,
  updateCustomer,
  deactivateCustomer,
} from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const customer = await getCustomerByIdWithSales(params.id)

    if (!customer) {
      return NextResponse.json(
        { message: 'Cliente não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(customer)
  } catch (error) {
    console.error('Erro ao buscar cliente:', error)
    return NextResponse.json(
      { message: 'Erro ao buscar cliente' },
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

    const existingCustomer = await getCustomerById(params.id)

    if (!existingCustomer) {
      return NextResponse.json(
        { message: 'Cliente não encontrado' },
        { status: 404 }
      )
    }

    // Verificar CPF duplicado
    if (data.cpf && data.cpf !== existingCustomer.cpf) {
      const existingCpf = await findCustomerByCpf(data.cpf, params.id)
      if (existingCpf) {
        return NextResponse.json(
          { message: 'CPF já cadastrado' },
          { status: 400 }
        )
      }
    }

    // Verificar email duplicado
    if (data.email && data.email !== existingCustomer.email) {
      const existingEmail = await findCustomerByEmail(data.email, params.id)
      if (existingEmail) {
        return NextResponse.json(
          { message: 'Email já cadastrado' },
          { status: 400 }
        )
      }
    }

    const customer = await updateCustomer(params.id, {
      name: data.name,
      email: data.email || null,
      cpf: data.cpf || null,
      phone: data.phone || null,
      whatsapp: data.whatsapp || null,
      instagram: data.instagram || null,
      birthDate: data.birthDate ? new Date(data.birthDate) : null,
      type: data.type,
      notes: data.notes || null,
      address: data.address || null,
      city: data.city || null,
      state: data.state || null,
      zipCode: data.zipCode || null,
      acceptsMarketing: data.acceptsMarketing,
      active: data.active,
    })

    return NextResponse.json(customer)
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error)
    return NextResponse.json(
      { message: 'Erro ao atualizar cliente' },
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

    // Apenas desativar (soft delete)
    await deactivateCustomer(params.id)

    return NextResponse.json({ message: 'Cliente desativado' })
  } catch (error) {
    console.error('Erro ao excluir cliente:', error)
    return NextResponse.json(
      { message: 'Erro ao excluir cliente' },
      { status: 500 }
    )
  }
}
