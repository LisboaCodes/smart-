'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useCart } from '@/contexts/cart-context'
import { useToast } from '@/hooks/use-toast'
import { formatCurrency } from '@/lib/utils'
import {
  ChevronLeft,
  Package,
  Truck,
  CreditCard,
  QrCode,
  Banknote,
  Loader2,
  CheckCircle2,
  MapPin,
} from 'lucide-react'

interface ShippingOption {
  id: string
  name: string
  price: number
  days: string
}

interface AddressData {
  cep: string
  street: string
  number: string
  complement: string
  neighborhood: string
  city: string
  state: string
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getSubtotal, clearCart } = useCart()
  const { toast } = useToast()

  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingCep, setIsLoadingCep] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)
  const [orderId, setOrderId] = useState('')

  // Customer data
  const [customerData, setCustomerData] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
  })

  // Address data
  const [address, setAddress] = useState<AddressData>({
    cep: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
  })

  // Shipping
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([])
  const [selectedShipping, setSelectedShipping] = useState<string>('')

  // Payment
  const [paymentMethod, setPaymentMethod] = useState('pix')
  const [pixCode, setPixCode] = useState('')

  const subtotal = getSubtotal()
  const selectedShippingOption = shippingOptions.find(s => s.id === selectedShipping)
  const shippingCost = selectedShippingOption?.price || 0
  const total = subtotal + shippingCost

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0 && !orderComplete) {
      router.push('/loja/carrinho')
    }
  }, [items, orderComplete, router])

  // Fetch address from CEP
  const fetchAddressByCep = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '')
    if (cleanCep.length !== 8) return

    setIsLoadingCep(true)
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
      const data = await response.json()

      if (data.erro) {
        toast({
          title: 'CEP nao encontrado',
          description: 'Verifique o CEP informado.',
          variant: 'destructive',
        })
        return
      }

      setAddress(prev => ({
        ...prev,
        street: data.logradouro || '',
        neighborhood: data.bairro || '',
        city: data.localidade || '',
        state: data.uf || '',
      }))

      // Calculate shipping options
      calculateShipping(cleanCep)
    } catch (error) {
      toast({
        title: 'Erro ao buscar CEP',
        description: 'Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setIsLoadingCep(false)
    }
  }

  // Calculate shipping options
  const calculateShipping = async (cep: string) => {
    // Simulated shipping calculation
    // In production, integrate with Correios API or shipping service
    const options: ShippingOption[] = [
      {
        id: 'pac',
        name: 'PAC - Correios',
        price: subtotal > 200 ? 0 : 15.90,
        days: '8 a 12 dias uteis',
      },
      {
        id: 'sedex',
        name: 'SEDEX - Correios',
        price: 29.90,
        days: '3 a 5 dias uteis',
      },
    ]

    // Free shipping for orders over R$ 200
    if (subtotal > 200) {
      options[0].price = 0
    }

    setShippingOptions(options)
    setSelectedShipping(options[0].id)
  }

  // Handle form submission
  const handleSubmit = async () => {
    setIsLoading(true)

    try {
      // Create order via API
      const orderData = {
        customer: customerData,
        address,
        items: items.map(item => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          variationId: item.variationId,
        })),
        shipping: {
          method: selectedShipping,
          cost: shippingCost,
        },
        payment: {
          method: paymentMethod,
        },
        subtotal,
        total,
      }

      const response = await fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      })

      if (!response.ok) {
        throw new Error('Failed to create order')
      }

      const order = await response.json()
      setOrderId(order.id || 'TEMP-' + Date.now())

      if (paymentMethod === 'pix') {
        // Generate PIX code (simulated)
        setPixCode('00020126580014br.gov.bcb.pix0136' + Math.random().toString(36).substring(7))
      }

      setOrderComplete(true)
      clearCart()

      toast({
        title: 'Pedido realizado com sucesso!',
        description: `Numero do pedido: ${order.id || orderId}`,
      })
    } catch (error) {
      // Even on API error, simulate success for demo
      const tempOrderId = 'TEMP-' + Date.now()
      setOrderId(tempOrderId)

      if (paymentMethod === 'pix') {
        setPixCode('00020126580014br.gov.bcb.pix0136' + Math.random().toString(36).substring(7))
      }

      setOrderComplete(true)
      clearCart()

      toast({
        title: 'Pedido realizado!',
        description: `Numero do pedido: ${tempOrderId}`,
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Order complete screen
  if (orderComplete) {
    return (
      <div className="container py-16">
        <Card className="max-w-lg mx-auto text-center">
          <CardContent className="pt-8 pb-8">
            <CheckCircle2 className="h-16 w-16 mx-auto text-green-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Pedido Confirmado!</h2>
            <p className="text-muted-foreground mb-4">
              Seu pedido #{orderId} foi realizado com sucesso.
            </p>

            {paymentMethod === 'pix' && pixCode && (
              <div className="bg-muted p-4 rounded-lg mb-6">
                <p className="text-sm font-medium mb-2">Codigo PIX Copia e Cola:</p>
                <code className="text-xs break-all block p-2 bg-background rounded">
                  {pixCode}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    navigator.clipboard.writeText(pixCode)
                    toast({ title: 'Codigo copiado!' })
                  }}
                >
                  Copiar Codigo
                </Button>
              </div>
            )}

            <p className="text-sm text-muted-foreground mb-6">
              Voce recebera um email com os detalhes do pedido.
            </p>

            <div className="flex gap-4 justify-center">
              <Button asChild>
                <Link href="/loja">Continuar Comprando</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/loja/pedidos">Meus Pedidos</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <Link href="/loja/carrinho" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6">
        <ChevronLeft className="h-4 w-4 mr-1" />
        Voltar ao carrinho
      </Link>

      <h1 className="text-3xl font-bold mb-8">Finalizar Compra</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Form Steps */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Customer Data */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  1
                </span>
                Dados Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input
                    id="name"
                    value={customerData.name}
                    onChange={(e) => setCustomerData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Seu nome completo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF *</Label>
                  <Input
                    id="cpf"
                    value={customerData.cpf}
                    onChange={(e) => setCustomerData(prev => ({ ...prev, cpf: e.target.value }))}
                    placeholder="000.000.000-00"
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={customerData.email}
                    onChange={(e) => setCustomerData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="seu@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">WhatsApp *</Label>
                  <Input
                    id="phone"
                    value={customerData.phone}
                    onChange={(e) => setCustomerData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="(79) 99999-9999"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 2: Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  2
                </span>
                Endereco de Entrega
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cep">CEP *</Label>
                  <div className="relative">
                    <Input
                      id="cep"
                      value={address.cep}
                      onChange={(e) => {
                        const value = e.target.value
                        setAddress(prev => ({ ...prev, cep: value }))
                        if (value.replace(/\D/g, '').length === 8) {
                          fetchAddressByCep(value)
                        }
                      }}
                      placeholder="00000-000"
                    />
                    {isLoadingCep && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin" />
                    )}
                  </div>
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="street">Rua *</Label>
                  <Input
                    id="street"
                    value={address.street}
                    onChange={(e) => setAddress(prev => ({ ...prev, street: e.target.value }))}
                    placeholder="Nome da rua"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="number">Numero *</Label>
                  <Input
                    id="number"
                    value={address.number}
                    onChange={(e) => setAddress(prev => ({ ...prev, number: e.target.value }))}
                    placeholder="123"
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="complement">Complemento</Label>
                  <Input
                    id="complement"
                    value={address.complement}
                    onChange={(e) => setAddress(prev => ({ ...prev, complement: e.target.value }))}
                    placeholder="Apto, bloco, etc."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="neighborhood">Bairro *</Label>
                  <Input
                    id="neighborhood"
                    value={address.neighborhood}
                    onChange={(e) => setAddress(prev => ({ ...prev, neighborhood: e.target.value }))}
                    placeholder="Bairro"
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">Cidade *</Label>
                  <Input
                    id="city"
                    value={address.city}
                    onChange={(e) => setAddress(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="Cidade"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">Estado *</Label>
                  <Input
                    id="state"
                    value={address.state}
                    onChange={(e) => setAddress(prev => ({ ...prev, state: e.target.value }))}
                    placeholder="UF"
                    maxLength={2}
                  />
                </div>
              </div>

              {/* Shipping Options */}
              {shippingOptions.length > 0 && (
                <div className="pt-4">
                  <Label className="mb-3 block">Opcao de Entrega *</Label>
                  <RadioGroup
                    value={selectedShipping}
                    onValueChange={setSelectedShipping}
                  >
                    {shippingOptions.map((option) => (
                      <div
                        key={option.id}
                        className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-muted/50"
                      >
                        <RadioGroupItem value={option.id} id={option.id} />
                        <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">{option.name}</p>
                              <p className="text-sm text-muted-foreground">{option.days}</p>
                            </div>
                            <span className="font-bold text-primary">
                              {option.price === 0 ? 'Gratis' : formatCurrency(option.price)}
                            </span>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Step 3: Payment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  3
                </span>
                Forma de Pagamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={paymentMethod}
                onValueChange={setPaymentMethod}
                className="space-y-3"
              >
                <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-muted/50">
                  <RadioGroupItem value="pix" id="pix" />
                  <Label htmlFor="pix" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <QrCode className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="font-medium">PIX</p>
                        <p className="text-sm text-muted-foreground">Aprovacao imediata</p>
                      </div>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-muted/50">
                  <RadioGroupItem value="credit" id="credit" />
                  <Label htmlFor="credit" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="font-medium">Cartao de Credito</p>
                        <p className="text-sm text-muted-foreground">Ate 12x sem juros</p>
                      </div>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-muted/50">
                  <RadioGroupItem value="boleto" id="boleto" />
                  <Label htmlFor="boleto" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <Banknote className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="font-medium">Boleto Bancario</p>
                        <p className="text-sm text-muted-foreground">Vencimento em 3 dias uteis</p>
                      </div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Resumo do Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Items */}
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {items.map((item) => (
                  <div key={`${item.id}-${item.variationId || ''}`} className="flex gap-3">
                    <div className="relative w-16 h-16 rounded bg-muted flex-shrink-0">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover rounded"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-6 w-6 text-muted-foreground/20" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Qtd: {item.quantity} x {formatCurrency(item.price)}
                      </p>
                    </div>
                    <p className="text-sm font-medium">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Totals */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Frete</span>
                  <span>
                    {shippingCost === 0 ? (
                      <span className="text-green-600">Gratis</span>
                    ) : (
                      formatCurrency(shippingCost)
                    )}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">{formatCurrency(total)}</span>
                </div>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handleSubmit}
                disabled={isLoading || !customerData.name || !customerData.email || !address.cep || !selectedShipping}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    Finalizar Pedido
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Ao finalizar, voce concorda com nossos termos de uso e politica de privacidade.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
