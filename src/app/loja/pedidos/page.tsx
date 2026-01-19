'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { formatCurrency } from '@/lib/utils'
import {
  Package,
  ChevronLeft,
  Search,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  Eye,
} from 'lucide-react'

interface Order {
  id: string
  orderNumber: string
  status: string
  total: number
  createdAt: string
  items: Array<{
    name: string
    quantity: number
    price: number
  }>
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: 'Aguardando Pagamento', color: 'bg-yellow-500', icon: Clock },
  paid: { label: 'Pago', color: 'bg-blue-500', icon: CheckCircle2 },
  preparing: { label: 'Preparando', color: 'bg-purple-500', icon: Package },
  shipped: { label: 'Enviado', color: 'bg-indigo-500', icon: Truck },
  delivered: { label: 'Entregue', color: 'bg-green-500', icon: CheckCircle2 },
  cancelled: { label: 'Cancelado', color: 'bg-red-500', icon: XCircle },
}

export default function PedidosPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchEmail, setSearchEmail] = useState('')

  const fetchOrders = async (email?: string) => {
    setIsLoading(true)
    try {
      const url = email ? `/api/pedidos?email=${encodeURIComponent(email)}` : '/api/pedidos'
      const response = await fetch(url)
      const data = await response.json()
      setOrders(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching orders:', error)
      setOrders([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Try to get customer email from localStorage
    const savedEmail = localStorage.getItem('customerEmail')
    if (savedEmail) {
      setSearchEmail(savedEmail)
      fetchOrders(savedEmail)
    } else {
      setIsLoading(false)
    }
  }, [])

  const handleSearch = () => {
    if (searchEmail) {
      localStorage.setItem('customerEmail', searchEmail)
      fetchOrders(searchEmail)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="container py-8">
      <Link href="/loja" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6">
        <ChevronLeft className="h-4 w-4 mr-1" />
        Voltar para a loja
      </Link>

      <h1 className="text-3xl font-bold mb-8">Meus Pedidos</h1>

      {/* Search */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Digite seu e-mail para buscar seus pedidos"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4 mr-2" />
              Buscar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando pedidos...</p>
        </div>
      ) : orders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Nenhum pedido encontrado</h2>
            <p className="text-muted-foreground mb-6">
              {searchEmail
                ? 'Nao encontramos pedidos para este e-mail'
                : 'Digite seu e-mail para buscar seus pedidos'}
            </p>
            <Button asChild>
              <Link href="/loja">Ir para a loja</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const status = statusConfig[order.status] || statusConfig.pending
            const StatusIcon = status.icon

            return (
              <Card key={order.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        Pedido #{order.orderNumber}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <Badge className={`${status.color} text-white`}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {status.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {order.items?.length || 0} {order.items?.length === 1 ? 'item' : 'itens'}
                      </p>
                      <p className="text-lg font-bold text-primary">
                        {formatCurrency(Number(order.total))}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Detalhes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
