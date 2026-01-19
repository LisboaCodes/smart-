'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/contexts/cart-context'
import { ShoppingCart, Check, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface AddToCartButtonProps {
  product: {
    id: string
    name: string
    price: number
    originalPrice?: number
    image: string | null
    sku: string
    stock: number
    variationId?: string
    variationName?: string
  }
  quantity?: number
  className?: string
  size?: 'default' | 'sm' | 'lg' | 'icon'
  showText?: boolean
  disabled?: boolean
}

export function AddToCartButton({
  product,
  quantity = 1,
  className,
  size = 'default',
  showText = true,
  disabled = false,
}: AddToCartButtonProps) {
  const { addItem } = useCart()
  const { toast } = useToast()
  const [isAdding, setIsAdding] = useState(false)
  const [justAdded, setJustAdded] = useState(false)

  const handleAddToCart = async () => {
    if (product.stock <= 0) {
      toast({
        title: 'Produto esgotado',
        description: 'Este produto nao esta disponivel no momento.',
        variant: 'destructive',
      })
      return
    }

    setIsAdding(true)

    // Simulate small delay for better UX
    await new Promise((resolve) => setTimeout(resolve, 300))

    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.image,
      sku: product.sku,
      maxStock: product.stock,
      quantity,
      variationId: product.variationId,
      variationName: product.variationName,
    })

    setIsAdding(false)
    setJustAdded(true)

    toast({
      title: 'Adicionado ao carrinho',
      description: `${product.name} foi adicionado ao seu carrinho.`,
    })

    // Reset the "just added" state after 2 seconds
    setTimeout(() => setJustAdded(false), 2000)
  }

  const isDisabled = disabled || product.stock <= 0 || isAdding

  return (
    <Button
      onClick={handleAddToCart}
      disabled={isDisabled}
      size={size}
      className={className}
      variant={justAdded ? 'secondary' : 'default'}
    >
      {isAdding ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {showText && <span className="ml-2">Adicionando...</span>}
        </>
      ) : justAdded ? (
        <>
          <Check className="h-4 w-4" />
          {showText && <span className="ml-2">Adicionado!</span>}
        </>
      ) : (
        <>
          <ShoppingCart className="h-4 w-4" />
          {showText && <span className="ml-2">Adicionar</span>}
        </>
      )}
    </Button>
  )
}
