import { getRecentSales } from '@/lib/db'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export async function RecentSales() {
  const sales = await getRecentSales(5)

  if (sales.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        Nenhuma venda realizada ainda
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {sales.map((sale: any) => {
        const initials = (sale.customer?.name || 'Cliente')
          .split(' ')
          .map((n: string) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2)

        return (
          <div key={sale.id} className="flex items-center gap-4">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium leading-none">
                {sale.customer?.name || 'Cliente não identificado'}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDateTime(sale.createdAt)} - {sale.user?.name}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">{formatCurrency(Number(sale.total))}</p>
              <p className="text-xs text-green-600">
                +{formatCurrency(Number(sale.profit))}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
