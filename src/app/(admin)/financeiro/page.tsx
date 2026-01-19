'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowUpCircle,
  ArrowDownCircle,
  Wallet,
  Calendar,
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts'

interface FinancialSummary {
  todayIncome: number
  todayExpense: number
  monthIncome: number
  monthExpense: number
  balance: number
  pendingIncome: number
  pendingExpense: number
}

interface FinancialEntry {
  id: string
  type: string
  status: string
  description: string
  amount: number
  dueDate: string
  paidDate: string | null
  category: string
}

export default function FinanceiroPage() {
  const { toast } = useToast()
  const [summary, setSummary] = useState<FinancialSummary | null>(null)
  const [entries, setEntries] = useState<FinancialEntry[]>([])
  const [chartData, setChartData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('month')

  useEffect(() => {
    fetchData()
  }, [period])

  async function fetchData() {
    setLoading(true)
    try {
      const [summaryRes, entriesRes, chartRes] = await Promise.all([
        fetch('/api/financeiro/resumo'),
        fetch('/api/financeiro/entradas'),
        fetch(`/api/financeiro/grafico?period=${period}`),
      ])

      if (summaryRes.ok) setSummary(await summaryRes.json())
      if (entriesRes.ok) setEntries(await entriesRes.json())
      if (chartRes.ok) setChartData(await chartRes.json())
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao carregar dados financeiros',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const incomes = entries.filter((e) => e.type === 'INCOME')
  const expenses = entries.filter((e) => e.type === 'EXPENSE')

  const statusColors: Record<string, string> = {
    PENDING: 'warning',
    PAID: 'success',
    OVERDUE: 'destructive',
    CANCELLED: 'secondary',
  }

  const statusLabels: Record<string, string> = {
    PENDING: 'Pendente',
    PAID: 'Pago',
    OVERDUE: 'Vencido',
    CANCELLED: 'Cancelado',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Financeiro</h2>
          <p className="text-muted-foreground">
            Acompanhe suas receitas, despesas e fluxo de caixa
          </p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Última semana</SelectItem>
            <SelectItem value="month">Este mês</SelectItem>
            <SelectItem value="quarter">Trimestre</SelectItem>
            <SelectItem value="year">Este ano</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Cards de resumo */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receitas (Mês)</CardTitle>
            <ArrowUpCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(summary?.monthIncome || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Hoje: {formatCurrency(summary?.todayIncome || 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas (Mês)</CardTitle>
            <ArrowDownCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(summary?.monthExpense || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Hoje: {formatCurrency(summary?.todayExpense || 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                (summary?.balance || 0) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {formatCurrency(summary?.balance || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Receitas - Despesas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Calendar className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                (summary?.pendingIncome || 0) - (summary?.pendingExpense || 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              A receber: {formatCurrency(summary?.pendingIncome || 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico */}
      <Card>
        <CardHeader>
          <CardTitle>Fluxo de Caixa</CardTitle>
          <CardDescription>Receitas vs Despesas</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `R$${v}`} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-md">
                        <p className="text-sm font-medium">{label}</p>
                        <p className="text-sm text-green-600">
                          Receitas: {formatCurrency(payload[0]?.value as number)}
                        </p>
                        <p className="text-sm text-red-600">
                          Despesas: {formatCurrency(payload[1]?.value as number)}
                        </p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Bar dataKey="income" fill="#22c55e" name="Receitas" />
              <Bar dataKey="expense" fill="#ef4444" name="Despesas" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Tabs de entradas */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="income" className="text-green-600">
            Receitas
          </TabsTrigger>
          <TabsTrigger value="expense" className="text-red-600">
            Despesas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <FinancialTable entries={entries} statusColors={statusColors} statusLabels={statusLabels} />
        </TabsContent>
        <TabsContent value="income">
          <FinancialTable entries={incomes} statusColors={statusColors} statusLabels={statusLabels} />
        </TabsContent>
        <TabsContent value="expense">
          <FinancialTable entries={expenses} statusColors={statusColors} statusLabels={statusLabels} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function FinancialTable({
  entries,
  statusColors,
  statusLabels,
}: {
  entries: FinancialEntry[]
  statusColors: Record<string, string>
  statusLabels: Record<string, string>
}) {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Descrição</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  Nenhuma entrada encontrada
                </TableCell>
              </TableRow>
            ) : (
              entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="font-medium">{entry.description}</TableCell>
                  <TableCell>{entry.category}</TableCell>
                  <TableCell>{formatDate(entry.dueDate)}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={statusColors[entry.status] as any}>
                      {statusLabels[entry.status]}
                    </Badge>
                  </TableCell>
                  <TableCell
                    className={`text-right font-medium ${
                      entry.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {entry.type === 'INCOME' ? '+' : '-'}
                    {formatCurrency(Number(entry.amount))}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
