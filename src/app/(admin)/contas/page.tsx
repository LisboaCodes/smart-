'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Receipt,
  Calendar,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

interface Expense {
  id: string
  name: string
  description: string | null
  amount: number
  frequency: string
  dueDay: number | null
  category: string
  active: boolean
  nextDueDate: string | null
  lastPaidDate: string | null
}

const frequencyLabels: Record<string, string> = {
  DAILY: 'Diário',
  WEEKLY: 'Semanal',
  BIWEEKLY: 'Quinzenal',
  MONTHLY: 'Mensal',
  QUARTERLY: 'Trimestral',
  YEARLY: 'Anual',
  ONCE: 'Único',
}

export default function ContasPage() {
  const { toast } = useToast()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    amount: '',
    frequency: 'MONTHLY',
    dueDay: '',
    category: 'Outros',
  })

  useEffect(() => {
    fetchExpenses()
  }, [])

  async function fetchExpenses() {
    setLoading(true)
    try {
      const res = await fetch('/api/contas')
      if (res.ok) {
        setExpenses(await res.json())
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao carregar contas',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const openDialog = (expense?: Expense) => {
    if (expense) {
      setEditingExpense(expense)
      setFormData({
        name: expense.name,
        description: expense.description || '',
        amount: String(expense.amount),
        frequency: expense.frequency,
        dueDay: expense.dueDay ? String(expense.dueDay) : '',
        category: expense.category,
      })
    } else {
      setEditingExpense(null)
      setFormData({
        name: '',
        description: '',
        amount: '',
        frequency: 'MONTHLY',
        dueDay: '',
        category: 'Outros',
      })
    }
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const url = editingExpense
        ? `/api/contas/${editingExpense.id}`
        : '/api/contas'
      const method = editingExpense ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
          dueDay: formData.dueDay ? parseInt(formData.dueDay) : null,
        }),
      })

      if (res.ok) {
        toast({
          title: 'Sucesso',
          description: editingExpense ? 'Conta atualizada' : 'Conta criada',
          variant: 'success',
        })
        setDialogOpen(false)
        fetchExpenses()
      } else {
        const error = await res.json()
        toast({
          title: 'Erro',
          description: error.message || 'Erro ao salvar conta',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao salvar conta',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir esta conta?')) return

    try {
      const res = await fetch(`/api/contas/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast({
          title: 'Sucesso',
          description: 'Conta excluída',
          variant: 'success',
        })
        fetchExpenses()
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao excluir conta',
        variant: 'destructive',
      })
    }
  }

  const totalMonthly = expenses
    .filter((e) => e.active && e.frequency === 'MONTHLY')
    .reduce((acc, e) => acc + Number(e.amount), 0)

  const upcomingExpenses = expenses.filter((e) => {
    if (!e.nextDueDate || !e.active) return false
    const dueDate = new Date(e.nextDueDate)
    const today = new Date()
    const diff = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return diff <= 7 && diff >= 0
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Contas Fixas</h2>
          <p className="text-muted-foreground">
            Gerencie suas despesas recorrentes
          </p>
        </div>
        <Button onClick={() => openDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Conta
        </Button>
      </div>

      {/* Cards de resumo */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Mensal</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalMonthly)}</div>
            <p className="text-xs text-muted-foreground">
              {expenses.filter((e) => e.active).length} conta(s) ativa(s)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximos 7 dias</CardTitle>
            <Calendar className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {upcomingExpenses.length} vencimento(s)
            </div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(
                upcomingExpenses.reduce((acc, e) => acc + Number(e.amount), 0)
              )}
            </p>
          </CardContent>
        </Card>

        {upcomingExpenses.length > 0 && (
          <Card className="border-yellow-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-yellow-600">
                Atenção
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                {upcomingExpenses[0].name} vence{' '}
                {formatDate(upcomingExpenses[0].nextDueDate!)}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Tabela */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Frequência</TableHead>
                <TableHead>Dia Venc.</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Próx. Vencimento</TableHead>
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
              ) : expenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Nenhuma conta cadastrada
                  </TableCell>
                </TableRow>
              ) : (
                expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>
                      <p className="font-medium">{expense.name}</p>
                      {expense.description && (
                        <p className="text-xs text-muted-foreground">
                          {expense.description}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>{expense.category}</TableCell>
                    <TableCell>{frequencyLabels[expense.frequency]}</TableCell>
                    <TableCell>{expense.dueDay || '-'}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(Number(expense.amount))}
                    </TableCell>
                    <TableCell>
                      {expense.nextDueDate ? formatDate(expense.nextDueDate) : '-'}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={expense.active ? 'success' : 'secondary'}>
                        {expense.active ? 'Ativa' : 'Inativa'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openDialog(expense)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDelete(expense.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir
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

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingExpense ? 'Editar Conta' : 'Nova Conta'}
            </DialogTitle>
            <DialogDescription>
              Preencha os dados da conta fixa
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Valor *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, amount: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, category: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Aluguel">Aluguel</SelectItem>
                    <SelectItem value="Utilidades">Utilidades</SelectItem>
                    <SelectItem value="Serviços">Serviços</SelectItem>
                    <SelectItem value="Impostos">Impostos</SelectItem>
                    <SelectItem value="Funcionários">Funcionários</SelectItem>
                    <SelectItem value="Outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="frequency">Frequência *</Label>
                <Select
                  value={formData.frequency}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, frequency: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(frequencyLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDay">Dia do Vencimento</Label>
                <Input
                  id="dueDay"
                  type="number"
                  min="1"
                  max="31"
                  value={formData.dueDay}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, dueDay: e.target.value }))
                  }
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingExpense ? 'Salvar' : 'Criar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
