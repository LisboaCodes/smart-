'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/contexts/cart-context'
import { useToast } from '@/hooks/use-toast'
import { storeConfig } from '@/lib/store-config'
import {
  Heart,
  Share2,
  MessageCircle,
  ShoppingCart,
  Plus,
  Minus,
  Check,
  Loader2,
} from 'lucide-react'

interface ProductActionsProps {
  product: {
    id: string
    name: string
    price: number
    originalPrice?: number
    image: string | null
    sku: string
    stock: number
  }
}

export function ProductActions({ product }: ProductActionsProps) {
  const { addItem } = useCart()
  const { toast } = useToast()
  const [quantity, setQuantity] = useState(1)
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
    })

    setIsAdding(false)
    setJustAdded(true)

    toast({
      title: 'Adicionado ao carrinho',
      description: `${quantity}x ${product.name} foi adicionado ao seu carrinho.`,
    })

    setTimeout(() => setJustAdded(false), 2000)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Confira este produto: ${product.name}`,
          url: window.location.href,
        })
      } catch (error) {
        // User cancelled or error
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(window.location.href)
      toast({
        title: 'Link copiado!',
        description: 'O link do produto foi copiado para a area de transferencia.',
      })
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const total = product.price * quantity

  const whatsappMessage = encodeURIComponent(
    `🛍️ *Pedido - Smart+ Acessórios*\n\n` +
    `*Produto:* ${product.name}\n` +
    `*SKU:* ${product.sku}\n` +
    `*Quantidade:* ${quantity}\n` +
    `*Valor unitário:* ${formatCurrency(product.price)}\n` +
    `${product.originalPrice ? `*Valor original:* ${formatCurrency(product.originalPrice)}\n` : ''}` +
    `*Total:* ${formatCurrency(total)}\n\n` +
    `🔗 Link do produto:\n${typeof window !== 'undefined' ? window.location.href : ''}`
  )

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Quantity Selector */}
      <div className="flex items-center gap-3 sm:gap-4">
        <span className="text-sm font-medium text-gold-800">Quantidade:</span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 sm:h-8 sm:w-8 border-gold-400 hover:bg-gold-50 hover:border-gold-500"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="w-10 text-center font-medium text-gold-700">{quantity}</span>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 sm:h-8 sm:w-8 border-gold-400 hover:bg-gold-50 hover:border-gold-500"
            onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
            disabled={quantity >= product.stock}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 sm:gap-3">
        <Button
          size="lg"
          className={`flex-1 text-sm sm:text-base h-11 sm:h-12 ${justAdded ? 'bg-green-600 hover:bg-green-700' : 'bg-gold-600 hover:bg-gold-700'} text-white`}
          disabled={product.stock === 0 || isAdding}
          onClick={handleAddToCart}
        >
          {isAdding ? (
            <>
              <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2 animate-spin" />
              <span className="hidden sm:inline">Adicionando...</span>
              <span className="sm:hidden">Aguarde...</span>
            </>
          ) : justAdded ? (
            <>
              <Check className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" />
              Adicionado!
            </>
          ) : (
            <>
              <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" />
              <span className="hidden sm:inline">Adicionar ao Carrinho</span>
              <span className="sm:hidden">Adicionar</span>
            </>
          )}
        </Button>
        <Button size="lg" variant="outline" className="h-11 w-11 sm:h-12 sm:w-auto px-3 border-gold-400 hover:bg-gold-50 hover:border-gold-500">
          <Heart className="h-5 w-5 text-gold-600" />
        </Button>
        <Button size="lg" variant="outline" className="h-11 w-11 sm:h-12 sm:w-auto px-3 border-gold-400 hover:bg-gold-50 hover:border-gold-500" onClick={handleShare}>
          <Share2 className="h-5 w-5 text-gold-600" />
        </Button>
      </div>

      {/* WhatsApp Button */}
      <Button
        size="lg"
        variant="outline"
        className="w-full h-11 sm:h-12 border-green-500 text-green-600 hover:bg-green-50 active:bg-green-100 text-sm sm:text-base"
        asChild
      >
        <a
          href={`https://wa.me/${storeConfig.whatsapp}?text=${whatsappMessage}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <MessageCircle className="h-5 w-5 mr-2" />
          Comprar pelo WhatsApp
        </a>
      </Button>
    </div>
  )
}
