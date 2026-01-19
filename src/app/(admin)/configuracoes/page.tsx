'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import {
  Store,
  Palette,
  Receipt,
  MessageCircle,
  CreditCard,
  Workflow,
  Loader2,
  Save,
} from 'lucide-react'

interface StoreSettings {
  id: string
  storeName: string
  cnpj: string
  address: string
  phone: string | null
  email: string | null
  instagram: string | null
  whatsapp: string | null
  logoUrl: string | null
  primaryColor: string
  secondaryColor: string
  receiptMessage: string
  receiptFooter: string | null
  evolutionApiUrl: string | null
  evolutionApiKey: string | null
  evolutionInstance: string | null
  mercadoPagoToken: string | null
  mercadoPagoPublicKey: string | null
  n8nUrl: string | null
  n8nApiKey: string | null
  n8nWebhookUrl: string | null
}

export default function ConfiguracoesPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<StoreSettings | null>(null)

  useEffect(() => {
    fetchSettings()
  }, [])

  async function fetchSettings() {
    try {
      const res = await fetch('/api/configuracoes')
      if (res.ok) {
        setSettings(await res.json())
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao carregar configurações',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    if (!settings) return
    setSettings({ ...settings, [field]: value })
  }

  const handleSave = async () => {
    if (!settings) return
    setSaving(true)

    try {
      const res = await fetch('/api/configuracoes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })

      if (res.ok) {
        toast({
          title: 'Sucesso',
          description: 'Configurações salvas',
          variant: 'success',
        })
      } else {
        throw new Error('Erro ao salvar')
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao salvar configurações',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!settings) {
    return <div>Erro ao carregar configurações</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Configurações</h2>
          <p className="text-muted-foreground">
            Configure sua loja e integrações
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Salvar Alterações
        </Button>
      </div>

      <Tabs defaultValue="loja">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="loja" className="gap-2">
            <Store className="h-4 w-4" />
            Loja
          </TabsTrigger>
          <TabsTrigger value="aparencia" className="gap-2">
            <Palette className="h-4 w-4" />
            Aparência
          </TabsTrigger>
          <TabsTrigger value="comprovante" className="gap-2">
            <Receipt className="h-4 w-4" />
            Comprovante
          </TabsTrigger>
          <TabsTrigger value="whatsapp" className="gap-2">
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </TabsTrigger>
          <TabsTrigger value="pagamentos" className="gap-2">
            <CreditCard className="h-4 w-4" />
            Pagamentos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="loja">
          <Card>
            <CardHeader>
              <CardTitle>Dados da Loja</CardTitle>
              <CardDescription>
                Informações básicas do seu estabelecimento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="storeName">Nome da Loja</Label>
                  <Input
                    id="storeName"
                    value={settings.storeName}
                    onChange={(e) => handleChange('storeName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input
                    id="cnpj"
                    value={settings.cnpj}
                    onChange={(e) => handleChange('cnpj', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Endereço</Label>
                <Textarea
                  id="address"
                  value={settings.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={settings.phone || ''}
                    onChange={(e) => handleChange('phone', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.email || ''}
                    onChange={(e) => handleChange('email', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    value={settings.instagram || ''}
                    onChange={(e) => handleChange('instagram', e.target.value)}
                    placeholder="@usuario"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    value={settings.whatsapp || ''}
                    onChange={(e) => handleChange('whatsapp', e.target.value)}
                    placeholder="5579999999999"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="aparencia">
          <Card>
            <CardHeader>
              <CardTitle>Aparência</CardTitle>
              <CardDescription>
                Personalize as cores da sua loja
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Cor Primária</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={settings.primaryColor}
                      onChange={(e) => handleChange('primaryColor', e.target.value)}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={settings.primaryColor}
                      onChange={(e) => handleChange('primaryColor', e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondaryColor">Cor Secundária</Label>
                  <div className="flex gap-2">
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={settings.secondaryColor}
                      onChange={(e) => handleChange('secondaryColor', e.target.value)}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={settings.secondaryColor}
                      onChange={(e) => handleChange('secondaryColor', e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="logoUrl">URL do Logo</Label>
                <Input
                  id="logoUrl"
                  value={settings.logoUrl || ''}
                  onChange={(e) => handleChange('logoUrl', e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comprovante">
          <Card>
            <CardHeader>
              <CardTitle>Comprovante de Venda</CardTitle>
              <CardDescription>
                Configure as mensagens do comprovante
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="receiptMessage">Mensagem Principal</Label>
                <Textarea
                  id="receiptMessage"
                  value={settings.receiptMessage}
                  onChange={(e) => handleChange('receiptMessage', e.target.value)}
                  rows={3}
                  placeholder="Obrigado pela preferência!"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="receiptFooter">Rodapé</Label>
                <Textarea
                  id="receiptFooter"
                  value={settings.receiptFooter || ''}
                  onChange={(e) => handleChange('receiptFooter', e.target.value)}
                  rows={2}
                  placeholder="Texto adicional..."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="whatsapp">
          <Card>
            <CardHeader>
              <CardTitle>Integração WhatsApp (Evolution API)</CardTitle>
              <CardDescription>
                Configure a integração com WhatsApp para marketing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="evolutionApiUrl">URL da API</Label>
                <Input
                  id="evolutionApiUrl"
                  value={settings.evolutionApiUrl || ''}
                  onChange={(e) => handleChange('evolutionApiUrl', e.target.value)}
                  placeholder="http://localhost:8080"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="evolutionApiKey">API Key</Label>
                <Input
                  id="evolutionApiKey"
                  type="password"
                  value={settings.evolutionApiKey || ''}
                  onChange={(e) => handleChange('evolutionApiKey', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="evolutionInstance">Nome da Instância</Label>
                <Input
                  id="evolutionInstance"
                  value={settings.evolutionInstance || ''}
                  onChange={(e) => handleChange('evolutionInstance', e.target.value)}
                  placeholder="smart-acessorios"
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Workflow className="h-4 w-4" />
                  Integração n8n (Automações)
                </h4>
                <div className="space-y-2">
                  <Label htmlFor="n8nUrl">URL do n8n</Label>
                  <Input
                    id="n8nUrl"
                    value={settings.n8nUrl || ''}
                    onChange={(e) => handleChange('n8nUrl', e.target.value)}
                    placeholder="http://localhost:5678"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="n8nApiKey">API Key do n8n</Label>
                  <Input
                    id="n8nApiKey"
                    type="password"
                    value={settings.n8nApiKey || ''}
                    onChange={(e) => handleChange('n8nApiKey', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="n8nWebhookUrl">URL Webhook</Label>
                  <Input
                    id="n8nWebhookUrl"
                    value={settings.n8nWebhookUrl || ''}
                    onChange={(e) => handleChange('n8nWebhookUrl', e.target.value)}
                    placeholder="http://localhost:5678/webhook/..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pagamentos">
          <Card>
            <CardHeader>
              <CardTitle>Mercado Pago</CardTitle>
              <CardDescription>
                Configure a integração para pagamentos online
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mercadoPagoToken">Access Token</Label>
                <Input
                  id="mercadoPagoToken"
                  type="password"
                  value={settings.mercadoPagoToken || ''}
                  onChange={(e) => handleChange('mercadoPagoToken', e.target.value)}
                  placeholder="APP_USR-..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mercadoPagoPublicKey">Public Key</Label>
                <Input
                  id="mercadoPagoPublicKey"
                  value={settings.mercadoPagoPublicKey || ''}
                  onChange={(e) => handleChange('mercadoPagoPublicKey', e.target.value)}
                  placeholder="APP_USR-..."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
