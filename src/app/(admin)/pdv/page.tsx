'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import {
  Search,
  Plus,
  Minus,
  Trash2,
  User,
  CreditCard,
  Banknote,
  QrCode,
  Percent,
  ShoppingCart,
  Loader2,
  Printer,
  X,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface Product {
  id: string
  sku: string
  name: string
  salePrice: number
  costPrice: number
  stock: number
  category: { name: string }
}

interface CartItem {
  product: Product
  quantity: number
  discount: number
}

interface Customer {
  id: string
  name: string
  phone: string | null
}

interface PaymentMethod {
  id: string
  name: string
  type: string
}

export default function PDVPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const searchRef = useRef<HTMLInputElement>(null)

  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [discount, setDiscount] = useState({ type: 'VALUE', value: 0 })
  const [loading, setLoading] = useState(false)

  const [customerDialogOpen, setCustomerDialogOpen] = useState(false)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [customerSearch, setCustomerSearch] = useState('')

  const [payments, setPayments] = useState<{ methodId: string; amount: number }[]>([])

  useEffect(() => {
    fetchData()
    searchRef.current?.focus()
  }, [])

  useEffect(() => {
    if (search.length >= 2) {
      const filtered = products.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.sku.toLowerCase().includes(search.toLowerCase())
      )
      setFilteredProducts(filtered.slice(0, 10))
    } else {
      setFilteredProducts([])
    }
  }, [search, products])

  async function fetchData() {
    try {
      const [productsRes, customersRes, methodsRes] = await Promise.all([
        fetch('/api/produtos?active=true'),
        fetch('/api/clientes'),
        fetch('/api/formas-pagamento'),
      ])

      if (productsRes.ok) setProducts(await productsRes.json())
      if (customersRes.ok) setCustomers(await customersRes.json())
      if (methodsRes.ok) setPaymentMethods(await methodsRes.json())
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao carregar dados',
        variant: 'destructive',
      })
    }
  }

  const addToCart = useCallback((product: Product) => {
    if (product.stock <= 0) {
      toast({
        title: 'Produto sem estoque',
        description: 'Este produto não possui estoque disponível',
        variant: 'destructive',
      })
      return
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id)
      if (existing) {
        if (existing.quantity >= product.stock) {
          toast({
            title: 'Estoque insuficiente',
            description: `Máximo disponível: ${product.stock}`,
            variant: 'destructive',
          })
          return prev
        }
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, { product, quantity: 1, discount: 0 }]
    })
    setSearch('')
    searchRef.current?.focus()
  }, [toast])

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta
            if (newQty <= 0) return null
            if (newQty > item.product.stock) {
              toast({
                title: 'Estoque insuficiente',
                description: `Máximo disponível: ${item.product.stock}`,
                variant: 'destructive',
              })
              return item
            }
            return { ...item, quantity: newQty }
          }
          return item
        })
        .filter(Boolean) as CartItem[]
    )
  }

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId))
  }

  const clearCart = () => {
    setCart([])
    setSelectedCustomer(null)
    setDiscount({ type: 'VALUE', value: 0 })
    searchRef.current?.focus()
  }

  const subtotal = cart.reduce(
    (acc, item) => acc + item.product.salePrice * item.quantity - item.discount,
    0
  )

  const discountAmount =
    discount.type === 'PERCENT'
      ? (subtotal * discount.value) / 100
      : discount.value

  const total = subtotal - discountAmount

  const handleOpenPayment = () => {
    if (cart.length === 0) {
      toast({
        title: 'Carrinho vazio',
        description: 'Adicione produtos ao carrinho',
        variant: 'destructive',
      })
      return
    }
    setPayments([{ methodId: '', amount: total }])
    setPaymentDialogOpen(true)
  }

  const finalizeSale = async () => {
    if (payments.some((p) => !p.methodId)) {
      toast({
        title: 'Erro',
        description: 'Selecione a forma de pagamento',
        variant: 'destructive',
      })
      return
    }

    const totalPaid = payments.reduce((acc, p) => acc + p.amount, 0)
    if (Math.abs(totalPaid - total) > 0.01) {
      toast({
        title: 'Erro',
        description: 'O valor pago deve ser igual ao total',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)

    try {
      const saleData = {
        customerId: selectedCustomer?.id || null,
        items: cart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          unitPrice: item.product.salePrice,
          costPrice: item.product.costPrice,
          discount: item.discount,
        })),
        discountType: discount.type,
        discountValue: discount.value,
        payments: payments.map((p) => ({
          paymentMethodId: p.methodId,
          amount: p.amount,
        })),
      }

      const res = await fetch('/api/vendas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saleData),
      })

      if (res.ok) {
        const sale = await res.json()
        toast({
          title: 'Venda finalizada!',
          description: `Venda #${sale.code} - ${formatCurrency(sale.total)}`,
          variant: 'success',
        })
        setPaymentDialogOpen(false)
        clearCart()
        fetchData() // Atualiza estoque
      } else {
        const error = await res.json()
        toast({
          title: 'Erro',
          description: error.message || 'Erro ao finalizar venda',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao finalizar venda',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(customerSearch.toLowerCase())
  )

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-4">
      {/* Área de busca e produtos */}
      <div className="flex-1 flex flex-col">
        <Card className="flex-1 flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  ref={searchRef}
                  placeholder="Buscar produto por nome ou SKU..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 text-lg h-12"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            {filteredProducts.length > 0 ? (
              <ScrollArea className="h-full">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {filteredProducts.map((product) => (
                    <Card
                      key={product.id}
                      className={`cursor-pointer transition-all hover:border-primary ${
                        product.stock <= 0 ? 'opacity-50' : ''
                      }`}
                      onClick={() => addToCart(product)}
                    >
                      <CardContent className="p-4">
                        <p className="font-medium truncate">{product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {product.sku}
                        </p>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-lg font-bold text-primary">
                            {formatCurrency(product.salePrice)}
                          </span>
                          <Badge
                            variant={
                              product.stock === 0
                                ? 'destructive'
                                : product.stock <= 5
                                ? 'warning'
                                : 'secondary'
                            }
                          >
                            {product.stock}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            ) : search.length >= 2 ? (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                Nenhum produto encontrado
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <ShoppingCart className="h-16 w-16 mx-auto mb-4 opacity-20" />
                  <p>Digite para buscar produtos</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Carrinho */}
      <Card className="w-[400px] flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Carrinho
            </CardTitle>
            {cart.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearCart}>
                <X className="h-4 w-4 mr-1" />
                Limpar
              </Button>
            )}
          </div>
          {/* Cliente */}
          <div
            className="flex items-center gap-2 p-2 rounded-md bg-muted cursor-pointer hover:bg-muted/80"
            onClick={() => setCustomerDialogOpen(true)}
          >
            <User className="h-4 w-4" />
            <span className="flex-1 text-sm">
              {selectedCustomer ? selectedCustomer.name : 'Selecionar cliente'}
            </span>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden flex flex-col">
          {/* Lista de itens */}
          <ScrollArea className="flex-1 -mx-6 px-6">
            {cart.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                Carrinho vazio
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex items-center gap-3 p-2 rounded-md bg-muted/50"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate text-sm">
                        {item.product.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(item.product.salePrice)} x {item.quantity}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => updateQuantity(item.product.id, -1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => updateQuantity(item.product.id, 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="text-right min-w-[70px]">
                      <p className="font-medium text-sm">
                        {formatCurrency(item.product.salePrice * item.quantity)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={() => removeFromCart(item.product.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Totais e ações */}
          <div className="pt-4 space-y-3 border-t mt-4">
            {/* Desconto */}
            <div className="flex items-center gap-2">
              <Percent className="h-4 w-4 text-muted-foreground" />
              <Select
                value={discount.type}
                onValueChange={(value) =>
                  setDiscount((prev) => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VALUE">R$</SelectItem>
                  <SelectItem value="PERCENT">%</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="number"
                value={discount.value || ''}
                onChange={(e) =>
                  setDiscount((prev) => ({
                    ...prev,
                    value: parseFloat(e.target.value) || 0,
                  }))
                }
                className="flex-1"
                placeholder="Desconto"
              />
            </div>

            <Separator />

            {/* Resumo */}
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Desconto</span>
                  <span>-{formatCurrency(discountAmount)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">{formatCurrency(total)}</span>
              </div>
            </div>

            {/* Botão finalizar */}
            <Button
              className="w-full h-12 text-lg"
              onClick={handleOpenPayment}
              disabled={cart.length === 0}
            >
              Finalizar Venda
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de seleção de cliente */}
      <Dialog open={customerDialogOpen} onOpenChange={setCustomerDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Selecionar Cliente</DialogTitle>
            <DialogDescription>
              Busque e selecione um cliente para a venda
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Buscar cliente..."
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
            />
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                <div
                  className="p-3 rounded-md hover:bg-muted cursor-pointer"
                  onClick={() => {
                    setSelectedCustomer(null)
                    setCustomerDialogOpen(false)
                  }}
                >
                  <p className="font-medium">Sem cliente</p>
                  <p className="text-xs text-muted-foreground">
                    Venda sem identificação
                  </p>
                </div>
                {filteredCustomers.map((customer) => (
                  <div
                    key={customer.id}
                    className="p-3 rounded-md hover:bg-muted cursor-pointer"
                    onClick={() => {
                      setSelectedCustomer(customer)
                      setCustomerDialogOpen(false)
                    }}
                  >
                    <p className="font-medium">{customer.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {customer.phone || 'Sem telefone'}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de pagamento */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Finalizar Pagamento</DialogTitle>
            <DialogDescription>
              Total: <strong className="text-primary">{formatCurrency(total)}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {payments.map((payment, index) => (
              <div key={index} className="flex gap-2">
                <Select
                  value={payment.methodId}
                  onValueChange={(value) => {
                    setPayments((prev) =>
                      prev.map((p, i) =>
                        i === index ? { ...p, methodId: value } : p
                      )
                    )
                  }}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Forma de pagamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map((method) => (
                      <SelectItem key={method.id} value={method.id}>
                        <div className="flex items-center gap-2">
                          {method.type === 'CASH' && <Banknote className="h-4 w-4" />}
                          {method.type === 'PIX' && <QrCode className="h-4 w-4" />}
                          {(method.type === 'CREDIT' || method.type === 'DEBIT') && (
                            <CreditCard className="h-4 w-4" />
                          )}
                          {method.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  step="0.01"
                  value={payment.amount || ''}
                  onChange={(e) => {
                    setPayments((prev) =>
                      prev.map((p, i) =>
                        i === index
                          ? { ...p, amount: parseFloat(e.target.value) || 0 }
                          : p
                      )
                    )
                  }}
                  className="w-32"
                />
                {payments.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      setPayments((prev) => prev.filter((_, i) => i !== index))
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              variant="outline"
              onClick={() =>
                setPayments((prev) => [...prev, { methodId: '', amount: 0 }])
              }
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar pagamento
            </Button>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPaymentDialogOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button onClick={finalizeSale} disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Confirmar Venda
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
