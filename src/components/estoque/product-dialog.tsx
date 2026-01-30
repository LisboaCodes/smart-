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
import { Loader2, Printer, RefreshCw } from 'lucide-react'
import { ImageUpload, ImageData } from './image-upload'
import { BarcodeDisplay } from './barcode-display'
import { PrintLabelDialog } from './print-label-dialog'
import { generateEAN13 } from '@/lib/barcode'

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
  const [images, setImages] = useState<ImageData[]>([])
  const [uploadingImages, setUploadingImages] = useState(false)
  const [printLabelOpen, setPrintLabelOpen] = useState(false)

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

      // Carregar imagens existentes
      if (product.images && product.images.length > 0) {
        const existingImages: ImageData[] = product.images.map((img: any) => ({
          id: img.id,
          url: img.url,
          order: img.order
        }))
        setImages(existingImages)
      } else {
        setImages([])
      }
    } else {
      reset({
        sku: generateSKU(),
        barcode: generateEAN13(), // Gerar código de barras automaticamente
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
      setImages([])
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

  const handleGenerateBarcode = () => {
    const newBarcode = generateEAN13()
    setValue('barcode', newBarcode)
    toast({
      title: 'Código gerado!',
      description: `Código de barras: ${newBarcode}`,
      variant: 'success',
    })
  }

  const uploadImages = async (productId: string): Promise<string[]> => {
    const imagesToUpload = images.filter(img => img.file)

    if (imagesToUpload.length === 0) {
      return images.map(img => img.url)
    }

    setUploadingImages(true)

    try {
      const formData = new FormData()
      formData.append('productId', productId)

      imagesToUpload.forEach(img => {
        if (img.file) {
          formData.append('files', img.file)
        }
      })

      const uploadRes = await fetch('/api/produtos/images', {
        method: 'POST',
        body: formData,
      })

      if (!uploadRes.ok) {
        throw new Error('Erro ao fazer upload das imagens')
      }

      const { urls } = await uploadRes.json()

      // Combinar URLs existentes com as novas
      const existingUrls = images.filter(img => !img.file).map(img => img.url)
      return [...existingUrls, ...urls]
    } finally {
      setUploadingImages(false)
    }
  }

  const onSubmit = async (data: ProductFormData) => {
    setLoading(true)
    try {
      const url = product ? `/api/produtos/${product.id}` : '/api/produtos'
      const method = product ? 'PUT' : 'POST'

      // Criar/atualizar produto
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Erro ao salvar produto')
      }

      const savedProduct = await res.json()
      const productId = savedProduct.id || product?.id

      // Upload de imagens se houver
      if (images.length > 0) {
        const imageUrls = await uploadImages(productId)

        // Salvar URLs das imagens no banco
        await fetch(`/api/produtos/${productId}/images`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ urls: imageUrls }),
        })
      }

      toast({
        title: 'Sucesso',
        description: product ? 'Produto atualizado' : 'Produto criado',
        variant: 'success',
      })
      onOpenChange(false)
      onSuccess()
    } catch (error) {
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao salvar produto',
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
              <div className="flex gap-2">
                <Input id="barcode" {...register('barcode')} />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleGenerateBarcode}
                  title="Gerar novo código"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Visualização do código de barras */}
          {watch('barcode') && watch('barcode')?.length === 13 && (
            <div className="border rounded-lg p-4 bg-muted/50">
              <div className="flex items-center justify-between mb-2">
                <Label>Preview do Código de Barras</Label>
                {product && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPrintLabelOpen(true)}
                    className="gap-2"
                  >
                    <Printer className="h-4 w-4" />
                    Imprimir Etiqueta
                  </Button>
                )}
              </div>
              <div className="flex justify-center">
                <BarcodeDisplay value={watch('barcode') || ''} />
              </div>
            </div>
          )}

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

          <div className="space-y-2">
            <Label>Imagens do Produto</Label>
            <ImageUpload
              productId={product?.id}
              initialImages={images}
              onChange={setImages}
            />
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
            <Button type="submit" disabled={loading || uploadingImages}>
              {(loading || uploadingImages) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {uploadingImages ? 'Enviando imagens...' : product ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>

      {/* Dialog de impressão de etiquetas */}
      {product && (
        <PrintLabelDialog
          open={printLabelOpen}
          onOpenChange={setPrintLabelOpen}
          product={{
            name: product.name,
            barcode: watch('barcode') || product.barcode || '',
            salePrice: watch('salePrice') || product.salePrice,
          }}
        />
      )}
    </Dialog>
  )
}
