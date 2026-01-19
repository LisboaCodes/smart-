import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  TrendingDown,
  AlertTriangle
} from 'lucide-react'
import { getDashboardStats } from '@/lib/db'
import { formatCurrency } from '@/lib/utils'

async function getStats() {
  return await getDashboardStats()
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
}: {
  title: string
  value: string
  description?: string
  icon: React.ElementType
  trend?: { value: number; isPositive: boolean }
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        {trend && (
          <div className={`flex items-center text-xs ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {trend.isPositive ? (
              <TrendingUp className="mr-1 h-3 w-3" />
            ) : (
              <TrendingDown className="mr-1 h-3 w-3" />
            )}
            {Math.abs(trend.value).toFixed(1)}% vs mês anterior
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function StatsLoading() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-3 w-24" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

async function StatsCards() {
  const stats = await getStats()

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Vendas Hoje"
        value={formatCurrency(stats.todaySales.total)}
        description={`${stats.todaySales.count} venda(s)`}
        icon={DollarSign}
      />
      <StatCard
        title="Vendas do Mês"
        value={formatCurrency(stats.monthSales.total)}
        description={`${stats.monthSales.count} venda(s)`}
        icon={ShoppingCart}
      />
      <StatCard
        title="Clientes"
        value={stats.totalCustomers.toString()}
        icon={Users}
      />
      <StatCard
        title="Estoque Baixo"
        value={stats.lowStockProducts.toString()}
        description={stats.lowStockProducts > 0 ? 'produtos precisam reposição' : 'Estoque ok'}
        icon={stats.lowStockProducts > 0 ? AlertTriangle : Package}
      />
    </div>
  )
}

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Visão geral do seu negócio
        </p>
      </div>

      <Suspense fallback={<StatsLoading />}>
        <StatsCards />
      </Suspense>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Faturamento</CardTitle>
            <CardDescription>Em breve: gráficos de vendas</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[350px] flex items-center justify-center text-muted-foreground">
              Gráficos em desenvolvimento
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Vendas Recentes</CardTitle>
            <CardDescription>Últimas vendas realizadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] flex items-center justify-center text-muted-foreground">
              Nenhuma venda ainda
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
