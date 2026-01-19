'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency, formatDate, formatDateTime, formatPhone } from '@/lib/utils'
import { User, Mail, Phone, MapPin, Calendar, ShoppingBag } from 'lucide-react'

interface CustomerDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customerId: string | null
}

interface CustomerDetails {
  id: string
  name: string
  email: string | null
  cpf: string | null
  phone: string | null
  whatsapp: string | null
  instagram: string | null
  birthDate: string | null
  type: string
  totalPurchases: number
  lastPurchase: string | null
  address: string | null
  city: string | null
  state: string | null
  zipCode: string | null
  notes: string | null
  createdAt: string
  sales: {
    id: string
    code: string
    total: number
    createdAt: string
    items: { product: { name: string }; quantity: number }[]
  }[]
}

export function CustomerDetailsDialog({
  open,
  onOpenChange,
  customerId,
}: CustomerDetailsDialogProps) {
  const [customer, setCustomer] = useState<CustomerDetails | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && customerId) {
      fetchCustomer()
    }
  }, [open, customerId])

  async function fetchCustomer() {
    setLoading(true)
    try {
      const res = await fetch(`/api/clientes/${customerId}`)
      if (res.ok) {
        setCustomer(await res.json())
      }
    } catch (error) {
      console.error('Erro ao carregar cliente:', error)
    } finally {
      setLoading(false)
    }
  }

  const typeLabels: Record<string, string> = {
    REGULAR: 'Regular',
    VIP: 'VIP',
    WHOLESALE: 'Atacado',
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes do Cliente</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : customer ? (
          <div className="space-y-6">
            {/* Informações básicas */}
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-semibold">{customer.name}</h3>
                  <Badge>{typeLabels[customer.type]}</Badge>
                </div>
                {customer.email && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {customer.email}
                  </p>
                )}
                {customer.phone && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {formatPhone(customer.phone)}
                  </p>
                )}
              </div>
            </div>

            <Separator />

            {/* Estatísticas */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(Number(customer.totalPurchases))}
                </p>
                <p className="text-xs text-muted-foreground">Total em compras</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold">{customer.sales.length}</p>
                <p className="text-xs text-muted-foreground">Compras realizadas</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold">
                  {customer.lastPurchase ? formatDate(customer.lastPurchase) : '-'}
                </p>
                <p className="text-xs text-muted-foreground">Última compra</p>
              </div>
            </div>

            <Separator />

            {/* Dados adicionais */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              {customer.birthDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Nascimento: {formatDate(customer.birthDate)}</span>
                </div>
              )}
              {customer.instagram && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">@</span>
                  <span>{customer.instagram}</span>
                </div>
              )}
              {(customer.address || customer.city) && (
                <div className="flex items-center gap-2 col-span-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {[customer.address, customer.city, customer.state]
                      .filter(Boolean)
                      .join(', ')}
                  </span>
                </div>
              )}
            </div>

            {customer.notes && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Observações</p>
                <p className="text-sm">{customer.notes}</p>
              </div>
            )}

            <Separator />

            {/* Histórico de compras */}
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" />
                Histórico de Compras
              </h4>
              {customer.sales.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  Nenhuma compra realizada
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Produtos</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customer.sales.map((sale) => (
                      <TableRow key={sale.id}>
                        <TableCell className="font-mono text-sm">
                          {sale.code}
                        </TableCell>
                        <TableCell>{formatDateTime(sale.createdAt)}</TableCell>
                        <TableCell>
                          <p className="text-sm truncate max-w-[200px]">
                            {sale.items
                              .map((i) => `${i.quantity}x ${i.product.name}`)
                              .join(', ')}
                          </p>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(Number(sale.total))}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            Cliente não encontrado
          </p>
        )}
      </DialogContent>
    </Dialog>
  )
}
