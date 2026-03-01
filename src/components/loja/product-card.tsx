'use client'

import { useState } from 'react'
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
  const [imageError, setImageError] = useState(false)
  const imageUrl = imageError || !product.imageUrl ? '/placeholder.svg' : product.imageUrl
  const hasPromo = product.promoPrice && product.promoEndDate && new Date() <= new Date(product.promoEndDate)
  const price = hasPromo ? Number(product.promoPrice) : Number(product.salePrice)
  const originalPrice = hasPromo ? Number(product.salePrice) : undefined
  const discount = hasPromo && originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0

  return (
    <Card className="group overflow-hidden border-gold-200 hover:border-gold-400 hover:shadow-lg transition-all">
      <Link href={`/loja/produto/${product.id}`}>
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gold-50 to-gold-100">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            unoptimized={imageUrl === '/placeholder.svg'}
            onError={() => setImageError(true)}
          />
          {hasPromo && discount > 0 && (
            <Badge className="absolute top-2 left-2 bg-red-500 text-white font-bold">
              -{discount}%
            </Badge>
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
      <CardContent className="p-3 sm:p-4">
        <Link href={`/loja/produto/${product.id}`}>
          <p className="text-xs text-gold-600 dark:text-gold-400 mb-1">
            {product.categoryName}
          </p>
          <h3 className="font-medium text-sm sm:text-base line-clamp-2 text-gray-900 dark:text-gray-100 group-hover:text-gold-700 dark:group-hover:text-gold-400 transition-colors">
            {product.name}
          </h3>
          <div className="mt-2">
            {hasPromo && originalPrice && (
              <span className="text-xs text-muted-foreground line-through block">
                {formatCurrency(originalPrice)}
              </span>
            )}
            <span className="text-lg font-bold text-gold-700 dark:text-gold-400">
              {formatCurrency(price)}
            </span>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              ou 12x de {formatCurrency(price / 12)}
            </p>
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
