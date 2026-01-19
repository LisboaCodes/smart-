'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Plus, Search, MoreHorizontal, Pencil, Trash2, Eye, MessageCircle } from 'lucide-react'
import { formatCurrency, formatDate, formatPhone } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { CustomerDialog } from '@/components/clientes/customer-dialog'
import { CustomerDetailsDialog } from '@/components/clientes/customer-details-dialog'
import { DeleteDialog } from '@/components/estoque/delete-dialog'

interface Customer {
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
  active: boolean
}

export default function ClientesPage() {
  const { toast } = useToast()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [deleteCustomer, setDeleteCustomer] = useState<Customer | null>(null)

  useEffect(() => {
    fetchCustomers()
  }, [])

  async function fetchCustomers() {
    setLoading(true)
    try {
      const res = await fetch('/api/clientes')
      if (res.ok) {
        setCustomers(await res.json())
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao carregar clientes',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(search.toLowerCase()) ||
    customer.email?.toLowerCase().includes(search.toLowerCase()) ||
    customer.phone?.includes(search) ||
    customer.cpf?.includes(search)
  )

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer)
    setDialogOpen(true)
  }

  const handleDetails = (customer: Customer) => {
    setSelectedCustomer(customer)
    setDetailsOpen(true)
  }

  const handleDelete = (customer: Customer) => {
    setDeleteCustomer(customer)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!deleteCustomer) return

    try {
      const res = await fetch(`/api/clientes/${deleteCustomer.id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        toast({
          title: 'Sucesso',
          description: 'Cliente desativado',
          variant: 'success',
        })
        fetchCustomers()
      } else {
        toast({
          title: 'Erro',
          description: 'Erro ao desativar cliente',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao desativar cliente',
        variant: 'destructive',
      })
    } finally {
      setDeleteDialogOpen(false)
      setDeleteCustomer(null)
    }
  }

  const typeLabels: Record<string, string> = {
    REGULAR: 'Regular',
    VIP: 'VIP',
    WHOLESALE: 'Atacado',
  }

  const typeColors: Record<string, string> = {
    REGULAR: 'secondary',
    VIP: 'default',
    WHOLESALE: 'outline',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Clientes</h2>
          <p className="text-muted-foreground">
            Gerencie seus clientes e acompanhe o histórico de compras
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingCustomer(null)
            setDialogOpen(true)
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Cliente
        </Button>
      </div>

      {/* Busca */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, email, telefone ou CPF..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Tabela */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Total Compras</TableHead>
                <TableHead>Última Compra</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Nenhum cliente encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{customer.name}</p>
                        {customer.email && (
                          <p className="text-xs text-muted-foreground">
                            {customer.email}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {customer.phone && (
                          <p className="text-sm">{formatPhone(customer.phone)}</p>
                        )}
                        {customer.whatsapp && (
                          <a
                            href={`https://wa.me/${customer.whatsapp}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-green-600 hover:underline"
                          >
                            <MessageCircle className="h-3 w-3" />
                            WhatsApp
                          </a>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={typeColors[customer.type] as any}>
                        {typeLabels[customer.type]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(Number(customer.totalPurchases))}
                    </TableCell>
                    <TableCell>
                      {customer.lastPurchase
                        ? formatDate(customer.lastPurchase)
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleDetails(customer)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Ver detalhes
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(customer)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDelete(customer)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Desativar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <CustomerDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        customer={editingCustomer}
        onSuccess={fetchCustomers}
      />

      <CustomerDetailsDialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        customerId={selectedCustomer?.id || null}
      />

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        itemName={deleteCustomer?.name || ''}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
