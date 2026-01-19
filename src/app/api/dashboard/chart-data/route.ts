import { NextResponse } from 'next/server'
import { getDashboardChartData } from '@/lib/db'
import { format, subDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export async function GET() {
  try {
    const days = 7
    const data = []

    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i)
      const startOfDay = new Date(date)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(date)
      endOfDay.setHours(23, 59, 59, 999)

      const result = await getDashboardChartData(startOfDay, endOfDay)

      data.push({
        date: format(date, 'dd/MM', { locale: ptBR }),
        total: result.total,
        profit: result.profit,
      })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Erro ao buscar dados do gráfico:', error)
    return NextResponse.json([], { status: 500 })
  }
}
