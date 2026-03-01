'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { formatPhoneNumber, formatPhoneDisplay } from '@/lib/phone'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Package,
  Heart,
  LogIn,
  UserPlus,
  Loader2,
} from 'lucide-react'

export default function ContaPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [customerData, setCustomerData] = useState<any>(null)

  // Login form
  const [loginData, setLoginData] = useState({ email: '', password: '' })

  // Register form
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    password: '',
    confirmPassword: '',
  })

  const handleLogin = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/clientes/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', ...loginData }),
      })

      const data = await response.json()

      if (data.success) {
        setIsLoggedIn(true)
        setCustomerData(data.customer)
        localStorage.setItem('customerToken', data.token)
        localStorage.setItem('customerData', JSON.stringify(data.customer))
        toast({ title: 'Login realizado com sucesso!' })
      } else {
        toast({
          title: 'Erro no login',
          description: data.error || 'Email ou senha incorretos',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao fazer login',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async () => {
    if (registerData.password !== registerData.confirmPassword) {
      toast({
        title: 'Erro',
        description: 'As senhas nao coincidem',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)
    try {
      // Format phone before sending
      const formattedData = {
        ...registerData,
        phone: registerData.phone ? formatPhoneNumber(registerData.phone) : null,
      }

      const response = await fetch('/api/clientes/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'register', ...formattedData }),
      })

      const data = await response.json()

      if (data.success) {
        setIsLoggedIn(true)
        setCustomerData(data.customer)
        localStorage.setItem('customerToken', data.token)
        localStorage.setItem('customerData', JSON.stringify(data.customer))
        toast({ title: 'Conta criada com sucesso!' })
      } else {
        toast({
          title: 'Erro no cadastro',
          description: data.error || 'Falha ao criar conta',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao criar conta',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setCustomerData(null)
    localStorage.removeItem('customerToken')
    localStorage.removeItem('customerData')
    toast({ title: 'Voce saiu da sua conta' })
  }

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('customerToken')
      const storedCustomer = localStorage.getItem('customerData')

      if (token && storedCustomer) {
        try {
          const customer = JSON.parse(storedCustomer)
          setIsLoggedIn(true)
          setCustomerData(customer)
        } catch (error) {
          console.error('Error restoring session:', error)
          localStorage.removeItem('customerToken')
          localStorage.removeItem('customerData')
        }
      }
      setIsCheckingAuth(false)
    }

    checkAuth()
  }, [])

  // Show loading while checking auth
  if (isCheckingAuth) {
    return (
      <div className="container py-16 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Logged in view
  if (isLoggedIn && customerData) {
    return (
      <div className="container py-4 sm:py-8">
        <div className="flex items-center justify-between mb-4 sm:mb-8">
          <div>
            <h1 className="text-xl sm:text-3xl font-bold">Minha Conta</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Ola, {customerData.name}!</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Sair
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {/* Quick Links */}
          <Link href="/loja/pedidos">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <Package className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Meus Pedidos</CardTitle>
                <CardDescription>
                  Acompanhe seus pedidos e historico de compras
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <Heart className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Lista de Desejos</CardTitle>
              <CardDescription>
                Produtos salvos para comprar depois
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <MapPin className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Enderecos</CardTitle>
              <CardDescription>
                Gerencie seus enderecos de entrega
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Account Info */}
        <Card className="mt-4 sm:mt-8">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-base sm:text-lg">Dados da Conta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input value={customerData.name} disabled />
              </div>
              <div className="space-y-2">
                <Label>E-mail</Label>
                <Input value={customerData.email} disabled />
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input value={customerData.phone ? formatPhoneDisplay(customerData.phone) : ''} disabled />
              </div>
              <div className="space-y-2">
                <Label>CPF</Label>
                <Input value={customerData.cpf || ''} disabled />
              </div>
            </div>
            <Button variant="outline">Editar Dados</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Login/Register view
  return (
    <div className="container py-4 sm:py-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-xl sm:text-3xl font-bold text-center mb-6 sm:mb-8">Minha Conta</h1>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">
              <LogIn className="h-4 w-4 mr-2" />
              Entrar
            </TabsTrigger>
            <TabsTrigger value="register">
              <UserPlus className="h-4 w-4 mr-2" />
              Criar Conta
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Entrar na sua conta</CardTitle>
                <CardDescription>
                  Digite seu e-mail e senha para acessar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">E-mail</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={loginData.email}
                    onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Senha</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="Sua senha"
                    value={loginData.password}
                    onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={handleLogin}
                  disabled={isLoading || !loginData.email || !loginData.password}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    'Entrar'
                  )}
                </Button>
                <Button variant="link" className="w-full">
                  Esqueci minha senha
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle>Criar nova conta</CardTitle>
                <CardDescription>
                  Preencha seus dados para se cadastrar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-name">Nome Completo</Label>
                  <Input
                    id="register-name"
                    placeholder="Seu nome"
                    value={registerData.name}
                    onChange={(e) => setRegisterData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-email">E-mail</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={registerData.email}
                    onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-phone">Telefone</Label>
                    <Input
                      id="register-phone"
                      type="tel"
                      placeholder="(79) 99999-9999"
                      value={registerData.phone}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-cpf">CPF</Label>
                    <Input
                      id="register-cpf"
                      inputMode="numeric"
                      placeholder="000.000.000-00"
                      value={registerData.cpf}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, cpf: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password">Senha</Label>
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="Crie uma senha"
                    value={registerData.password}
                    onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-confirm">Confirmar Senha</Label>
                  <Input
                    id="register-confirm"
                    type="password"
                    placeholder="Confirme a senha"
                    value={registerData.confirmPassword}
                    onChange={(e) => setRegisterData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={handleRegister}
                  disabled={isLoading || !registerData.name || !registerData.email || !registerData.password}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Criando conta...
                    </>
                  ) : (
                    'Criar Conta'
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
