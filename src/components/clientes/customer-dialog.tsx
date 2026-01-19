'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'

const customerSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  cpf: z.string().optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  instagram: z.string().optional(),
  birthDate: z.string().optional(),
  type: z.enum(['REGULAR', 'VIP', 'WHOLESALE']),
  notes: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  acceptsMarketing: z.boolean(),
})

type CustomerFormData = z.infer<typeof customerSchema>

interface CustomerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customer: any | null
  onSuccess: () => void
}

export function CustomerDialog({
  open,
  onOpenChange,
  customer,
  onSuccess,
}: CustomerDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: '',
      email: '',
      cpf: '',
      phone: '',
      whatsapp: '',
      instagram: '',
      birthDate: '',
      type: 'REGULAR',
      notes: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      acceptsMarketing: true,
    },
  })

  useEffect(() => {
    if (customer) {
      reset({
        name: customer.name,
        email: customer.email || '',
        cpf: customer.cpf || '',
        phone: customer.phone || '',
        whatsapp: customer.whatsapp || '',
        instagram: customer.instagram || '',
        birthDate: customer.birthDate
          ? new Date(customer.birthDate).toISOString().split('T')[0]
          : '',
        type: customer.type,
        notes: customer.notes || '',
        address: customer.address || '',
        city: customer.city || '',
        state: customer.state || '',
        zipCode: customer.zipCode || '',
        acceptsMarketing: customer.acceptsMarketing,
      })
    } else {
      reset({
        name: '',
        email: '',
        cpf: '',
        phone: '',
        whatsapp: '',
        instagram: '',
        birthDate: '',
        type: 'REGULAR',
        notes: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        acceptsMarketing: true,
      })
    }
  }, [customer, reset, open])

  const onSubmit = async (data: CustomerFormData) => {
    setLoading(true)
    try {
      const url = customer ? `/api/clientes/${customer.id}` : '/api/clientes'
      const method = customer ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (res.ok) {
        toast({
          title: 'Sucesso',
          description: customer ? 'Cliente atualizado' : 'Cliente criado',
          variant: 'success',
        })
        onOpenChange(false)
        onSuccess()
      } else {
        const error = await res.json()
        toast({
          title: 'Erro',
          description: error.message || 'Erro ao salvar cliente',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao salvar cliente',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{customer ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
          <DialogDescription>
            {customer
              ? 'Atualize as informações do cliente'
              : 'Preencha os dados do novo cliente'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input id="name" {...register('name')} />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register('email')} />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input id="cpf" {...register('cpf')} placeholder="000.000.000-00" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input id="phone" {...register('phone')} placeholder="(00) 00000-0000" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input
                id="whatsapp"
                {...register('whatsapp')}
                placeholder="5500000000000"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram</Label>
              <Input id="instagram" {...register('instagram')} placeholder="@usuario" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="birthDate">Data de Nascimento</Label>
              <Input id="birthDate" type="date" {...register('birthDate')} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Tipo de Cliente</Label>
            <Select
              value={watch('type')}
              onValueChange={(value) => setValue('type', value as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="REGULAR">Regular</SelectItem>
                <SelectItem value="VIP">VIP</SelectItem>
                <SelectItem value="WHOLESALE">Atacado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Endereço</Label>
            <Input id="address" {...register('address')} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">Cidade</Label>
              <Input id="city" {...register('city')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">Estado</Label>
              <Input id="state" {...register('state')} placeholder="SE" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zipCode">CEP</Label>
              <Input id="zipCode" {...register('zipCode')} placeholder="00000-000" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea id="notes" {...register('notes')} rows={3} />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="acceptsMarketing"
              checked={watch('acceptsMarketing')}
              onCheckedChange={(checked) => setValue('acceptsMarketing', checked)}
            />
            <Label htmlFor="acceptsMarketing">Aceita receber mensagens de marketing</Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {customer ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
