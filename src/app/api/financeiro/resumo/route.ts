import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getFinancialSummary } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const summary = await getFinancialSummary()
    return NextResponse.json(summary)
  } catch (error) {
    console.error('Erro ao buscar resumo financeiro:', error)
    return NextResponse.json(
      { message: 'Erro ao buscar resumo' },
      { status: 500 }
    )
  }
}
