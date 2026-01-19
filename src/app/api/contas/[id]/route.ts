import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { updateExpense, deleteExpense } from '@/lib/db'
import { addMonths, setDate } from 'date-fns'

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

    // Recalcular próximo vencimento se necessário
    let nextDueDate
    if (data.frequency === 'MONTHLY' && data.dueDay) {
      const today = new Date()
      nextDueDate = setDate(today, data.dueDay)
      if (nextDueDate <= today) {
        nextDueDate = setDate(addMonths(today, 1), data.dueDay)
      }
    }

    const expense = await updateExpense(params.id, {
      name: data.name,
      description: data.description || null,
      amount: data.amount,
      frequency: data.frequency,
      dueDay: data.dueDay || null,
      category: data.category,
      nextDueDate: nextDueDate,
      active: data.active,
    })

    return NextResponse.json(expense)
  } catch (error) {
    console.error('Erro ao atualizar conta:', error)
    return NextResponse.json(
      { message: 'Erro ao atualizar conta' },
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

    await deleteExpense(params.id)

    return NextResponse.json({ message: 'Conta excluída' })
  } catch (error) {
    console.error('Erro ao excluir conta:', error)
    return NextResponse.json(
      { message: 'Erro ao excluir conta' },
      { status: 500 }
    )
  }
}
