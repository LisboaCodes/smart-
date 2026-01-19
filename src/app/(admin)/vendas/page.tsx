'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar, Search, Eye, FileText, DollarSign, TrendingUp } from 'lucide-react'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

interface Sale {
  id: string
  code: string
  total: number
  profit: number
  netProfit: number
  status: string
  createdAt: string
  customer: { name: string } | null
  user: { name: string }
  items: {
    quantity: number
    unitPrice: number
    product: { name: string; sku: string }
  }[]
  payments: {
    amount: number
    paymentMethod: { name: string; type: string }
  }[]
}

export default function VendasPage() {
  const { toast } = useToast()
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  useEffect(() => {
    fetchSales()
  }, [])

  async function fetchSales() {
    setLoading(true)
    try {
      const res = await fetch('/api/vendas')
      if (res.ok) {
        setSales(await res.json())
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao carregar vendas',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredSales = sales.filter((sale) => {
    const matchesSearch =
      sale.code.toLowerCase().includes(search.toLowerCase()) ||
      sale.customer?.name.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || sale.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totals = filteredSales.reduce(
    (acc, sale) => ({
      total: acc.total + Number(sale.total),
      profit: acc.profit + Number(sale.profit),
      netProfit: acc.netProfit + Number(sale.netProfit),
      count: acc.count + 1,
    }),
    { total: 0, profit: 0, netProfit: 0, count: 0 }
  )

  const openDetails = (sale: Sale) => {
    setSelectedSale(sale)
    setDetailsOpen(true)
  }

  const statusColors: Record<string, string> = {
    COMPLETED: 'success',
    PENDING: 'warning',
    CANCELLED: 'destructive',
    REFUNDED: 'secondary',
  }

  const statusLabels: Record<string, string> = {
    COMPLETED: 'Concluída',
    PENDING: 'Pendente',
    CANCELLED: 'Cancelada',
    REFUNDED: 'Reembolsada',
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Vendas</h2>
        <p className="text-muted-foreground">
          Histórico de vendas realizadas
        </p>
      </div>

      {/* Cards de resumo */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vendas</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.count}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faturamento</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totals.total)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lucro Bruto</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totals.profit)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lucro Líquido</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totals.netProfit)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por código ou cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="COMPLETED">Concluídas</SelectItem>
            <SelectItem value="PENDING">Pendentes</SelectItem>
            <SelectItem value="CANCELLED">Canceladas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabela */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Vendedor</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Lucro</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : filteredSales.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Nenhuma venda encontrada
                  </TableCell>
                </TableRow>
              ) : (
                filteredSales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="font-mono">{sale.code}</TableCell>
                    <TableCell>{formatDateTime(sale.createdAt)}</TableCell>
                    <TableCell>{sale.customer?.name || '-'}</TableCell>
                    <TableCell>{sale.user.name}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(Number(sale.total))}
                    </TableCell>
                    <TableCell className="text-right text-green-600">
                      {formatCurrency(Number(sale.profit))}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={statusColors[sale.status] as any}>
                        {statusLabels[sale.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDetails(sale)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog de detalhes */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Venda #{selectedSale?.code}</DialogTitle>
          </DialogHeader>
          {selectedSale && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Data</p>
                  <p className="font-medium">{formatDateTime(selectedSale.createdAt)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Vendedor</p>
                  <p className="font-medium">{selectedSale.user.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Cliente</p>
                  <p className="font-medium">{selectedSale.customer?.name || 'Não identificado'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <Badge variant={statusColors[selectedSale.status] as any}>
                    {statusLabels[selectedSale.status]}
                  </Badge>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Itens</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto</TableHead>
                      <TableHead className="text-center">Qtd</TableHead>
                      <TableHead className="text-right">Preço</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedSale.items.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell>
                          <p className="font-medium">{item.product.name}</p>
                          <p className="text-xs text-muted-foreground">{item.product.sku}</p>
                        </TableCell>
                        <TableCell className="text-center">{item.quantity}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(Number(item.unitPrice))}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(Number(item.unitPrice) * item.quantity)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div>
                <h4 className="font-medium mb-2">Pagamentos</h4>
                {selectedSale.payments.map((payment, idx) => (
                  <div key={idx} className="flex justify-between py-2">
                    <span>{payment.paymentMethod.name}</span>
                    <span className="font-medium">{formatCurrency(Number(payment.amount))}</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-1">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(Number(selectedSale.total))}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Lucro Bruto</span>
                  <span>{formatCurrency(Number(selectedSale.profit))}</span>
                </div>
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Lucro Líquido</span>
                  <span>{formatCurrency(Number(selectedSale.netProfit))}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
