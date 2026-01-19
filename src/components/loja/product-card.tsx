'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AddToCartButton } from './add-to-cart-button'
import { formatCurrency } from '@/lib/utils'
import { ShoppingCart, Sparkles } from 'lucide-react'

interface ProductCardProps {
  product: {
    id: string
    name: string
    salePrice: number | string
    promoPrice?: number | string | null
    promoEndDate?: string | null
    imageUrl?: string | null
    categoryName?: string
    featured?: boolean
    stock: number
    sku: string
  }
}

export function ProductCard({ product }: ProductCardProps) {
  const imageUrl = product.imageUrl || '/placeholder.jpg'
  const hasPromo = product.promoPrice && product.promoEndDate && new Date() <= new Date(product.promoEndDate)
  const price = hasPromo ? Number(product.promoPrice) : Number(product.salePrice)
  const originalPrice = hasPromo ? Number(product.salePrice) : undefined

  return (
    <Card className="group overflow-hidden border-gold-200 hover:border-gold-400 hover:shadow-lg transition-all">
      <Link href={`/loja/produto/${product.id}`}>
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gold-50 to-gold-100">
          {product.imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingCart className="h-12 w-12 text-gold-300" />
            </div>
          )}
          {hasPromo && (
            <Badge className="absolute top-2 left-2 bg-red-500">Promocao</Badge>
          )}
          {product.featured && (
            <Badge className="absolute top-2 right-2 bg-gold-500 text-white hover:bg-gold-600">
              <Sparkles className="h-3 w-3 mr-1" />
              Destaque
            </Badge>
          )}
          {product.stock <= 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="destructive" className="text-sm">Esgotado</Badge>
            </div>
          )}
        </div>
      </Link>
      <CardContent className="p-4">
        <Link href={`/loja/produto/${product.id}`}>
          <p className="text-xs text-gold-600 mb-1">
            {product.categoryName}
          </p>
          <h3 className="font-medium line-clamp-2 group-hover:text-gold-700 transition-colors">
            {product.name}
          </h3>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-lg font-bold text-gold-700">
              {formatCurrency(price)}
            </span>
            {hasPromo && originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                {formatCurrency(originalPrice)}
              </span>
            )}
          </div>
        </Link>
        <AddToCartButton
          product={{
            id: product.id,
            name: product.name,
            price,
            originalPrice,
            image: product.imageUrl || null,
            sku: product.sku,
            stock: product.stock,
          }}
          className="w-full mt-3 bg-gold-600 hover:bg-gold-700 text-white"
          size="sm"
        />
      </CardContent>
    </Card>
  )
}
