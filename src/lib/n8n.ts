import { getN8nConfigFromDb } from './db'

interface N8nWebhookPayload {
  event: string
  data: Record<string, any>
}

export async function getN8nConfig() {
  return getN8nConfigFromDb()
}

export async function triggerN8nWebhook(payload: N8nWebhookPayload) {
  const config = await getN8nConfig()

  if (!config || !config.webhookUrl) {
    console.log('n8n não configurado, webhook ignorado')
    return null
  }

  try {
    const response = await fetch(config.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(config.apiKey ? { 'X-N8N-API-KEY': config.apiKey } : {}),
      },
      body: JSON.stringify({
        ...payload,
        timestamp: new Date().toISOString(),
      }),
    })

    if (!response.ok) {
      console.error('Erro ao disparar webhook n8n:', response.status)
      return null
    }

    return await response.json()
  } catch (error) {
    console.error('Erro ao disparar webhook n8n:', error)
    return null
  }
}

// Eventos disponíveis para automação
export const N8N_EVENTS = {
  // Vendas
  SALE_CREATED: 'sale.created',
  SALE_CANCELLED: 'sale.cancelled',

  // Clientes
  CUSTOMER_CREATED: 'customer.created',
  CUSTOMER_BIRTHDAY: 'customer.birthday',
  CUSTOMER_INACTIVE: 'customer.inactive',

  // Pedidos (loja virtual)
  ORDER_CREATED: 'order.created',
  ORDER_PAID: 'order.paid',
  ORDER_SHIPPED: 'order.shipped',
  ORDER_DELIVERED: 'order.delivered',

  // Estoque
  STOCK_LOW: 'stock.low',

  // Atendimento
  NEW_MESSAGE: 'message.received',
} as const

// Dispara evento de nova venda
export async function notifySaleCreated(sale: {
  code: string
  total: number
  customerName?: string
  customerPhone?: string
}) {
  await triggerN8nWebhook({
    event: N8N_EVENTS.SALE_CREATED,
    data: sale,
  })
}

// Dispara evento de novo cliente
export async function notifyCustomerCreated(customer: {
  id: string
  name: string
  phone?: string
  email?: string
}) {
  await triggerN8nWebhook({
    event: N8N_EVENTS.CUSTOMER_CREATED,
    data: customer,
  })
}

// Dispara evento de aniversário
export async function notifyCustomerBirthday(customer: {
  id: string
  name: string
  phone?: string
}) {
  await triggerN8nWebhook({
    event: N8N_EVENTS.CUSTOMER_BIRTHDAY,
    data: customer,
  })
}

// Dispara evento de estoque baixo
export async function notifyLowStock(product: {
  id: string
  name: string
  sku: string
  stock: number
  minStock: number
}) {
  await triggerN8nWebhook({
    event: N8N_EVENTS.STOCK_LOW,
    data: product,
  })
}

// Dispara evento de novo pedido
export async function notifyOrderCreated(order: {
  code: string
  total: number
  customerName: string
  customerPhone?: string
  items: { name: string; quantity: number }[]
}) {
  await triggerN8nWebhook({
    event: N8N_EVENTS.ORDER_CREATED,
    data: order,
  })
}

// Dispara evento de pagamento confirmado
export async function notifyOrderPaid(order: {
  code: string
  total: number
  customerName: string
  customerPhone?: string
}) {
  await triggerN8nWebhook({
    event: N8N_EVENTS.ORDER_PAID,
    data: order,
  })
}
