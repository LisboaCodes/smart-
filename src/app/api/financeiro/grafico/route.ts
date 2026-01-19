import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getFinancialChartData } from '@/lib/db'
import { format, subDays, subMonths, startOfMonth, endOfMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'month'

    const data: { date: string; income: number; expense: number }[] = []

    if (period === 'week') {
      // Últimos 7 dias
      for (let i = 6; i >= 0; i--) {
        const date = subDays(new Date(), i)
        const startOfDay = new Date(date)
        startOfDay.setHours(0, 0, 0, 0)
        const endOfDay = new Date(date)
        endOfDay.setHours(23, 59, 59, 999)

        const result = await getFinancialChartData(startOfDay, endOfDay)

        data.push({
          date: format(date, 'dd/MM', { locale: ptBR }),
          income: result.income,
          expense: result.expense,
        })
      }
    } else if (period === 'month') {
      // Último mês por semana
      for (let i = 3; i >= 0; i--) {
        const weekEnd = subDays(new Date(), i * 7)
        const weekStart = subDays(weekEnd, 6)

        const result = await getFinancialChartData(weekStart, weekEnd)

        data.push({
          date: `${format(weekStart, 'dd/MM')} - ${format(weekEnd, 'dd/MM')}`,
          income: result.income,
          expense: result.expense,
        })
      }
    } else {
      // Por mês
      const months = period === 'quarter' ? 3 : 12
      for (let i = months - 1; i >= 0; i--) {
        const month = subMonths(new Date(), i)
        const start = startOfMonth(month)
        const end = endOfMonth(month)

        const result = await getFinancialChartData(start, end)

        data.push({
          date: format(month, 'MMM/yy', { locale: ptBR }),
          income: result.income,
          expense: result.expense,
        })
      }
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Erro ao buscar dados do gráfico:', error)
    return NextResponse.json([], { status: 500 })
  }
}
