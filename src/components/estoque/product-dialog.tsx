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

const productSchema = z.object({
  sku: z.string().min(1, 'SKU é obrigatório'),
  barcode: z.string().optional().transform(val => val || undefined),
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional().transform(val => val || undefined),
  categoryId: z.string().min(1, 'Categoria é obrigatória'),
  supplierId: z.string().optional().transform(val => val || undefined),
  costPrice: z.coerce.number().min(0, 'Custo deve ser maior ou igual a 0'),
  salePrice: z.coerce.number().min(0.01, 'Preço de venda é obrigatório'),
  stock: z.coerce.number().int().min(0, 'Estoque deve ser maior ou igual a 0'),
  minStock: z.coerce.number().int().min(0, 'Estoque mínimo deve ser maior ou igual a 0'),
  active: z.boolean(),
  showInStore: z.boolean(),
  featured: z.boolean(),
})

type ProductFormData = z.infer<typeof productSchema>

interface ProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: any | null
  categories: { id: string; name: string }[]
  suppliers: { id: string; name: string }[]
  onSuccess: () => void
}

export function ProductDialog({
  open,
  onOpenChange,
  product,
  categories,
  suppliers,
  onSuccess,
}: ProductDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      sku: '',
      barcode: '',
      name: '',
      description: '',
      categoryId: '',
      supplierId: '',
      costPrice: 0,
      salePrice: 0,
      stock: 0,
      minStock: 5,
      active: true,
      showInStore: true,
      featured: false,
    },
  })

  useEffect(() => {
    if (product) {
      reset({
        sku: product.sku,
        barcode: product.barcode || '',
        name: product.name,
        description: product.description || '',
        categoryId: product.category?.id || '',
        supplierId: product.supplierId || '',
        costPrice: Number(product.costPrice),
        salePrice: Number(product.salePrice),
        stock: product.stock,
        minStock: product.minStock,
        active: product.active,
        showInStore: product.showInStore,
        featured: product.featured,
      })
    } else {
      reset({
        sku: generateSKU(),
        barcode: '',
        name: '',
        description: '',
        categoryId: '',
        supplierId: '',
        costPrice: 0,
        salePrice: 0,
        stock: 0,
        minStock: 5,
        active: true,
        showInStore: true,
        featured: false,
      })
    }
  }, [product, reset, open])

  function generateSKU() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  const onSubmit = async (data: ProductFormData) => {
    setLoading(true)
    try {
      const url = product ? `/api/produtos/${product.id}` : '/api/produtos'
      const method = product ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (res.ok) {
        toast({
          title: 'Sucesso',
          description: product ? 'Produto atualizado' : 'Produto criado',
          variant: 'success',
        })
        onOpenChange(false)
        onSuccess()
      } else {
        const error = await res.json()
        toast({
          title: 'Erro',
          description: error.message || 'Erro ao salvar produto',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao salvar produto',
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
          <DialogTitle>{product ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
          <DialogDescription>
            {product
              ? 'Atualize as informações do produto'
              : 'Preencha os dados do novo produto'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sku">SKU *</Label>
              <Input id="sku" {...register('sku')} />
              {errors.sku && (
                <p className="text-xs text-destructive">{errors.sku.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="barcode">Código de Barras</Label>
              <Input id="barcode" {...register('barcode')} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input id="name" {...register('name')} />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea id="description" {...register('description')} rows={3} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="categoryId">Categoria *</Label>
              <Select
                value={watch('categoryId')}
                onValueChange={(value) => setValue('categoryId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categoryId && (
                <p className="text-xs text-destructive">{errors.categoryId.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplierId">Fornecedor</Label>
              <Select
                value={watch('supplierId') || 'none'}
                onValueChange={(value) => setValue('supplierId', value === 'none' ? '' : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {suppliers.map((sup) => (
                    <SelectItem key={sup.id} value={sup.id}>
                      {sup.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="costPrice">Preço de Custo *</Label>
              <Input
                id="costPrice"
                type="number"
                step="0.01"
                {...register('costPrice')}
              />
              {errors.costPrice && (
                <p className="text-xs text-destructive">{errors.costPrice.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="salePrice">Preço de Venda *</Label>
              <Input
                id="salePrice"
                type="number"
                step="0.01"
                {...register('salePrice')}
              />
              {errors.salePrice && (
                <p className="text-xs text-destructive">{errors.salePrice.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stock">Estoque Atual *</Label>
              <Input id="stock" type="number" {...register('stock')} />
              {errors.stock && (
                <p className="text-xs text-destructive">{errors.stock.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="minStock">Estoque Mínimo</Label>
              <Input id="minStock" type="number" {...register('minStock')} />
            </div>
          </div>

          <div className="flex flex-wrap gap-6">
            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={watch('active')}
                onCheckedChange={(checked) => setValue('active', checked)}
              />
              <Label htmlFor="active">Produto ativo</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="showInStore"
                checked={watch('showInStore')}
                onCheckedChange={(checked) => setValue('showInStore', checked)}
              />
              <Label htmlFor="showInStore">Mostrar na loja</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="featured"
                checked={watch('featured')}
                onCheckedChange={(checked) => setValue('featured', checked)}
              />
              <Label htmlFor="featured">Destaque</Label>
            </div>
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
              {product ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
