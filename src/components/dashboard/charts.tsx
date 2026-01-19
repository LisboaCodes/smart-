'use client'

import { useEffect, useState } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { formatCurrency } from '@/lib/utils'

interface ChartData {
  date: string
  total: number
  profit: number
}

export function DashboardCharts() {
  const [data, setData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/dashboard/chart-data')
        const result = await response.json()
        setData(result)
      } catch (error) {
        console.error('Erro ao carregar dados do gráfico:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return <div className="h-[350px] flex items-center justify-center text-muted-foreground">Carregando...</div>
  }

  if (data.length === 0) {
    return (
      <div className="h-[350px] flex items-center justify-center text-muted-foreground">
        Nenhuma venda nos últimos 7 dias
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `R$ ${value}`}
        />
        <Tooltip
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              return (
                <div className="rounded-lg border bg-background p-2 shadow-md">
                  <p className="text-sm font-medium">{label}</p>
                  <p className="text-sm text-primary">
                    Vendas: {formatCurrency(payload[0].value as number)}
                  </p>
                  <p className="text-sm text-green-600">
                    Lucro: {formatCurrency(payload[1].value as number)}
                  </p>
                </div>
              )
            }
            return null
          }}
        />
        <Area
          type="monotone"
          dataKey="total"
          stroke="hsl(var(--primary))"
          fillOpacity={1}
          fill="url(#colorTotal)"
          strokeWidth={2}
        />
        <Area
          type="monotone"
          dataKey="profit"
          stroke="#22c55e"
          fillOpacity={1}
          fill="url(#colorProfit)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
