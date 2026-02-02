'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { ProductImage } from '@/components/loja/product-image'
import { useCart } from '@/contexts/cart-context'
import { formatCurrency } from '@/lib/utils'
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Package,
  ShoppingBag,
  Tag,
} from 'lucide-react'
import { useState } from 'react'

export default function CarrinhoPage() {
  const { items, updateQuantity, removeItem, getSubtotal } = useCart()
  const [couponCode, setCouponCode] = useState('')
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [couponError, setCouponError] = useState('')

  const subtotal = getSubtotal()
  const shipping = subtotal > 200 ? 0 : 15
  const discount = couponDiscount
  const total = subtotal + shipping - discount

  const handleApplyCoupon = () => {
    // TODO: Validate coupon against API
    if (couponCode.toUpperCase() === 'PRIMEIRACOMPRA') {
      setCouponDiscount(subtotal * 0.1) // 10% discount
      setCouponError('')
    } else if (couponCode.toUpperCase() === 'FRETEGRATIS') {
      setCouponDiscount(shipping)
      setCouponError('')
    } else if (couponCode) {
      setCouponError('Cupom invalido')
      setCouponDiscount(0)
    }
  }

  if (items.length === 0) {
    return (
      <div className="container py-16">
        <Card className="max-w-lg mx-auto text-center">
          <CardContent className="pt-8 pb-8">
            <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Seu carrinho esta vazio</h2>
            <p className="text-muted-foreground mb-6">
              Que tal explorar nossos produtos?
            </p>
            <Button asChild>
              <Link href="/loja">
                <ShoppingBag className="h-4 w-4 mr-2" />
                Continuar comprando
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Carrinho de Compras</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Lista de itens */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={`${item.id}-${item.variationId || ''}`}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="relative w-24 h-24 rounded-md overflow-hidden bg-gradient-to-br from-gold-50 to-gold-100 border border-gold-200 flex-shrink-0">
                    <ProductImage
                      src={item.image || '/placeholder.svg'}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1">
                    <h3 className="font-medium">{item.name}</h3>
                    {item.variationName && (
                      <p className="text-sm text-muted-foreground">
                        {item.variationName}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-lg font-bold text-primary">
                        {formatCurrency(item.price)}
                      </p>
                      {item.originalPrice && item.originalPrice > item.price && (
                        <p className="text-sm text-muted-foreground line-through">
                          {formatCurrency(item.originalPrice)}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity - 1, item.variationId)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity + 1, item.variationId)}
                          disabled={item.quantity >= item.maxStock}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        {item.quantity >= item.maxStock && (
                          <span className="text-xs text-muted-foreground">
                            (max)
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="font-bold">
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => removeItem(item.id, item.variationId)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Resumo */}
        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Resumo do Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Frete</span>
                <span>
                  {shipping === 0 ? (
                    <span className="text-green-600">Gratis</span>
                  ) : (
                    formatCurrency(shipping)
                  )}
                </span>
              </div>
              {subtotal < 200 && (
                <p className="text-xs text-muted-foreground">
                  Frete gratis para compras acima de R$ 200,00
                </p>
              )}
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Desconto</span>
                  <span>-{formatCurrency(discount)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">{formatCurrency(total)}</span>
              </div>

              <div className="space-y-2">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Cupom de desconto"
                      className="pl-9"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                    />
                  </div>
                  <Button variant="outline" onClick={handleApplyCoupon}>
                    Aplicar
                  </Button>
                </div>
                {couponError && (
                  <p className="text-xs text-destructive">{couponError}</p>
                )}
                {discount > 0 && (
                  <p className="text-xs text-green-600">Cupom aplicado com sucesso!</p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-3">
              <Button className="w-full" size="lg" asChild>
                <Link href="/loja/checkout">
                  Finalizar Compra
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
              <Button variant="ghost" className="w-full" asChild>
                <Link href="/loja">Continuar comprando</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
