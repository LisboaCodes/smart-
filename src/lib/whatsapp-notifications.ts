// WhatsApp Notifications Utility
// Integrates with Evolution API for WhatsApp messaging

import { getEvolutionConfigFromDb } from './db'

interface NotificationData {
  phone: string
  message: string
}

interface OrderNotification {
  orderNumber: string
  customerName: string
  customerPhone: string
  total: number
  items: Array<{ name: string; quantity: number }>
}

interface LowStockNotification {
  products: Array<{ name: string; sku: string; stock: number }>
}

interface PaymentReminderNotification {
  customerName: string
  customerPhone: string
  orderId: string
  amount: number
  dueDate: Date
}

// Get Evolution API config
async function getEvolutionConfig() {
  try {
    return await getEvolutionConfigFromDb()
  } catch {
    return {
      apiUrl: process.env.EVOLUTION_API_URL || 'http://localhost:8080',
      apiKey: process.env.EVOLUTION_API_KEY || '',
      instance: process.env.EVOLUTION_INSTANCE || 'smartplus',
    }
  }
}

// Send WhatsApp message via Evolution API
export async function sendWhatsAppMessage(data: NotificationData): Promise<boolean> {
  try {
    const config = await getEvolutionConfig()

    if (!config.apiUrl || !config.apiKey) {
      console.warn('Evolution API not configured')
      return false
    }

    // Clean phone number
    const phone = data.phone.replace(/\D/g, '')
    const formattedPhone = phone.startsWith('55') ? phone : `55${phone}`

    const response = await fetch(`${config.apiUrl}/message/sendText/${config.instance}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': config.apiKey,
      },
      body: JSON.stringify({
        number: formattedPhone,
        text: data.message,
      }),
    })

    if (!response.ok) {
      console.error('Failed to send WhatsApp message:', await response.text())
      return false
    }

    return true
  } catch (error) {
    console.error('Error sending WhatsApp message:', error)
    return false
  }
}

// Notify admin about new order
export async function notifyNewOrder(order: OrderNotification, adminPhone: string): Promise<boolean> {
  const itemsList = order.items
    .map(item => `  - ${item.quantity}x ${item.name}`)
    .join('\n')

  const message = `🛒 *NOVA VENDA!*

📦 Pedido: #${order.orderNumber}
👤 Cliente: ${order.customerName}
📱 Tel: ${order.customerPhone}

*Itens:*
${itemsList}

💰 *Total: R$ ${order.total.toFixed(2)}*

Acesse o painel para mais detalhes.`

  return sendWhatsAppMessage({ phone: adminPhone, message })
}

// Notify customer about order confirmation
export async function notifyOrderConfirmation(order: OrderNotification): Promise<boolean> {
  const message = `✅ *Pedido Confirmado!*

Ola ${order.customerName}! 👋

Seu pedido *#${order.orderNumber}* foi recebido com sucesso!

💰 Total: R$ ${order.total.toFixed(2)}

Voce recebera atualizacoes sobre o status da entrega.

Obrigado por comprar na *Smart+ Acessorios*! 💜

Duvidas? Responda esta mensagem.`

  return sendWhatsAppMessage({ phone: order.customerPhone, message })
}

// Notify about order shipment
export async function notifyOrderShipped(
  customerPhone: string,
  customerName: string,
  orderNumber: string,
  trackingCode?: string
): Promise<boolean> {
  let message = `📦 *Pedido Enviado!*

Ola ${customerName}!

Seu pedido *#${orderNumber}* foi enviado! 🚚`

  if (trackingCode) {
    message += `

🔍 Codigo de rastreio: *${trackingCode}*
Rastreie em: https://rastreamento.correios.com.br/`
  }

  message += `

Em breve voce recebera sua encomenda!

*Smart+ Acessorios* 💜`

  return sendWhatsAppMessage({ phone: customerPhone, message })
}

// Notify admin about low stock
export async function notifyLowStock(data: LowStockNotification, adminPhone: string): Promise<boolean> {
  const productsList = data.products
    .map(p => `  ⚠️ ${p.name} (SKU: ${p.sku}) - Estoque: ${p.stock}`)
    .join('\n')

  const message = `🚨 *ALERTA DE ESTOQUE BAIXO*

Os seguintes produtos estao com estoque baixo:

${productsList}

Acesse o painel para repor o estoque.`

  return sendWhatsAppMessage({ phone: adminPhone, message })
}

// Send payment reminder
export async function notifyPaymentReminder(data: PaymentReminderNotification): Promise<boolean> {
  const formattedDate = data.dueDate.toLocaleDateString('pt-BR')

  const message = `💳 *Lembrete de Pagamento*

Ola ${data.customerName}!

Identificamos que seu pedido ainda esta aguardando pagamento.

📦 Pedido: #${data.orderId}
💰 Valor: R$ ${data.amount.toFixed(2)}
📅 Vencimento: ${formattedDate}

Para nao perder sua compra, efetue o pagamento o mais breve possivel.

Ja pagou? Ignore esta mensagem ou responda com o comprovante.

*Smart+ Acessorios* 💜`

  return sendWhatsAppMessage({ phone: data.customerPhone, message })
}

// Send promotional message
export async function sendPromoMessage(
  phone: string,
  customerName: string,
  promoTitle: string,
  promoDescription: string,
  discount: string
): Promise<boolean> {
  const message = `🎉 *${promoTitle}*

Ola ${customerName}!

${promoDescription}

🏷️ *${discount}*

Aproveite! Oferta por tempo limitado.

Acesse: https://sualoja.com.br/loja

*Smart+ Acessorios* 💜`

  return sendWhatsAppMessage({ phone, message })
}

// Welcome message for new customers
export async function sendWelcomeMessage(phone: string, customerName: string): Promise<boolean> {
  const message = `👋 *Bem-vindo(a) a Smart+ Acessorios!*

Ola ${customerName}!

Obrigado por se cadastrar em nossa loja! 💜

Aqui voce encontra os melhores acessorios:
✨ Bolsas
💎 Joias
🌟 Semi-joias
💫 Bijuterias

Use o cupom *BEMVINDO10* para 10% de desconto na primeira compra!

Duvidas? Estamos aqui para ajudar!

*Smart+ Acessorios*
@smartmaisacessorios`

  return sendWhatsAppMessage({ phone, message })
}
