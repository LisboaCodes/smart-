import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getExpenses, createExpense } from '@/lib/db'
import { addMonths, addDays, addWeeks, addYears, setDate } from 'date-fns'

function calculateNextDueDate(frequency: string, dueDay: number | null): Date {
  const today = new Date()
  let nextDue = new Date()

  switch (frequency) {
    case 'DAILY':
      nextDue = addDays(today, 1)
      break
    case 'WEEKLY':
      nextDue = addWeeks(today, 1)
      break
    case 'BIWEEKLY':
      nextDue = addWeeks(today, 2)
      break
    case 'MONTHLY':
      if (dueDay) {
        nextDue = setDate(today, dueDay)
        if (nextDue <= today) {
          nextDue = setDate(addMonths(today, 1), dueDay)
        }
      } else {
        nextDue = addMonths(today, 1)
      }
      break
    case 'QUARTERLY':
      nextDue = addMonths(today, 3)
      break
    case 'YEARLY':
      nextDue = addYears(today, 1)
      break
    default:
      nextDue = today
  }

  return nextDue
}

export async function GET() {
  try {
    const expenses = await getExpenses()
    return NextResponse.json(expenses)
  } catch (error) {
    console.error('Erro ao buscar contas:', error)
    return NextResponse.json(
      { message: 'Erro ao buscar contas' },
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

    const nextDueDate = calculateNextDueDate(data.frequency, data.dueDay)

    const expense = await createExpense({
      name: data.name,
      description: data.description || null,
      amount: data.amount,
      frequency: data.frequency,
      dueDay: data.dueDay || null,
      category: data.category,
      nextDueDate,
    })

    return NextResponse.json(expense, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar conta:', error)
    return NextResponse.json(
      { message: 'Erro ao criar conta' },
      { status: 500 }
    )
  }
}
