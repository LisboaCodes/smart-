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
import { calculateShipping, formatZipCode, isValidZipCode } from '@/lib/shipping'

export default function CarrinhoPage() {
  const { items, updateQuantity, removeItem, getSubtotal } = useCart()
  const [couponCode, setCouponCode] = useState('')
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [couponError, setCouponError] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [shippingCost, setShippingCost] = useState<number | null>(null)
  const [zipError, setZipError] = useState('')

  const subtotal = getSubtotal()
  const shipping = shippingCost !== null ? shippingCost : 0
  const discount = couponDiscount
  const total = subtotal + shipping - discount

  const handleCalculateShipping = () => {
    if (!zipCode) {
      setZipError('Digite o CEP')
      return
    }

    if (!isValidZipCode(zipCode)) {
      setZipError('CEP inválido')
      return
    }

    const cost = calculateShipping(zipCode)
    setShippingCost(cost)
    setZipError('')
  }

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
      <div className="container py-12 sm:py-16">
        <Card className="max-w-lg mx-auto text-center">
          <CardContent className="pt-8 pb-8 px-4">
            <ShoppingCart className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-muted-foreground/30 mb-4" />
            <h2 className="text-xl sm:text-2xl font-bold mb-2">Seu carrinho esta vazio</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-6">
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
    <div className="container py-4 sm:py-8">
      <h1 className="text-xl sm:text-3xl font-bold mb-4 sm:mb-8">Carrinho de Compras</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
        {/* Lista de itens */}
        <div className="lg:col-span-2 space-y-3 sm:space-y-4">
          {items.map((item) => (
            <Card key={`${item.id}-${item.variationId || ''}`}>
              <CardContent className="p-3 sm:p-4">
                <div className="flex gap-3 sm:gap-4">
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-md overflow-hidden bg-gradient-to-br from-gold-50 to-gold-100 border border-gold-200 flex-shrink-0">
                    <ProductImage
                      src={item.image || '/placeholder.svg'}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm sm:text-base line-clamp-2">{item.name}</h3>
                    {item.variationName && (
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {item.variationName}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-base sm:text-lg font-bold text-primary">
                        {formatCurrency(item.price)}
                      </p>
                      {item.originalPrice && item.originalPrice > item.price && (
                        <p className="text-xs sm:text-sm text-muted-foreground line-through">
                          {formatCurrency(item.originalPrice)}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-2 sm:mt-4">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity - 1, item.variationId)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-7 sm:w-8 text-center text-sm font-medium">
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
                      </div>

                      <div className="flex items-center gap-2 sm:gap-4">
                        <span className="font-bold text-sm sm:text-base">
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
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
          <Card className="sticky top-20 sm:top-24">
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="text-base sm:text-lg">Resumo do Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <div className="flex justify-between text-sm sm:text-base">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>

              {/* CEP Input */}
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-medium">Calcular Frete</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="00000-000"
                    value={zipCode}
                    onChange={(e) => {
                      setZipCode(e.target.value)
                      setZipError('')
                    }}
                    maxLength={9}
                    className="text-sm"
                  />
                  <Button variant="outline" onClick={handleCalculateShipping} className="text-sm flex-shrink-0">
                    Calcular
                  </Button>
                </div>
                {zipError && (
                  <p className="text-xs text-destructive">{zipError}</p>
                )}
                {shippingCost !== null && !zipError && (
                  <p className="text-xs text-green-600">
                    {shippingCost === 0 ? 'Frete grátis!' : `Frete: ${formatCurrency(shippingCost)}`}
                  </p>
                )}
              </div>

              <div className="flex justify-between text-sm sm:text-base">
                <span className="text-muted-foreground">Frete</span>
                <span>
                  {shippingCost === null ? (
                    <span className="text-xs text-muted-foreground">Calcule acima</span>
                  ) : shippingCost === 0 ? (
                    <span className="text-green-600">Grátis</span>
                  ) : (
                    formatCurrency(shippingCost)
                  )}
                </span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm sm:text-base text-green-600">
                  <span>Desconto</span>
                  <span>-{formatCurrency(discount)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-base sm:text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">{formatCurrency(total)}</span>
              </div>

              <div className="space-y-2">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Cupom de desconto"
                      className="pl-9 text-sm"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                    />
                  </div>
                  <Button variant="outline" onClick={handleApplyCoupon} className="text-sm flex-shrink-0">
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
            <CardFooter className="flex-col gap-2 sm:gap-3">
              <Button className="w-full h-11 sm:h-12 text-sm sm:text-base" size="lg" asChild>
                <Link href="/loja/checkout">
                  Finalizar Compra
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
              <Button variant="ghost" className="w-full text-sm" asChild>
                <Link href="/loja">Continuar comprando</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
