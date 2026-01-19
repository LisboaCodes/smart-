import { NextRequest, NextResponse } from 'next/server'
import {
  getCustomerById,
  updateCustomer,
  getMessageTemplateById,
  upsertConversation,
  createConversationMessage,
  updateConversationLastMessage,
} from '@/lib/db'
import { sendWhatsAppMessage, replaceMessageVariables } from '@/lib/evolution'

// Webhook para receber ações do n8n
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { action, payload } = data

    switch (action) {
      case 'send_whatsapp':
        // Envia mensagem via WhatsApp
        if (!payload.phone || !payload.message) {
          return NextResponse.json(
            { error: 'phone e message são obrigatórios' },
            { status: 400 }
          )
        }

        const result = await sendWhatsAppMessage({
          to: payload.phone,
          message: payload.message,
          mediaUrl: payload.mediaUrl,
        })

        return NextResponse.json({ success: true, result })

      case 'send_campaign_message':
        // Envia mensagem de campanha para um cliente
        if (!payload.customerId || !payload.templateId) {
          return NextResponse.json(
            { error: 'customerId e templateId são obrigatórios' },
            { status: 400 }
          )
        }

        const customer = await getCustomerById(payload.customerId)

        if (!customer || !customer.whatsapp) {
          return NextResponse.json(
            { error: 'Cliente não encontrado ou sem WhatsApp' },
            { status: 404 }
          )
        }

        const template = await getMessageTemplateById(payload.templateId)

        if (!template) {
          return NextResponse.json(
            { error: 'Template não encontrado' },
            { status: 404 }
          )
        }

        const message = replaceMessageVariables(template.message, {
          nome: customer.name,
          ...payload.variables,
        })

        await sendWhatsAppMessage({
          to: customer.whatsapp,
          message,
        })

        return NextResponse.json({ success: true })

      case 'update_customer':
        // Atualiza dados do cliente
        if (!payload.customerId) {
          return NextResponse.json(
            { error: 'customerId é obrigatório' },
            { status: 400 }
          )
        }

        const updatedCustomer = await updateCustomer(payload.customerId, payload.data)

        return NextResponse.json({ success: true, customer: updatedCustomer })

      case 'create_conversation':
        // Cria/atualiza conversa de atendimento
        const conversation = await upsertConversation({
          channel: payload.channel,
          externalId: payload.externalId,
          customerPhone: payload.phone,
          customerName: payload.name,
        })

        return NextResponse.json({ success: true, conversation })

      case 'add_message':
        // Adiciona mensagem a uma conversa
        const msg = await createConversationMessage({
          conversationId: payload.conversationId,
          direction: payload.direction,
          type: payload.type || 'TEXT',
          content: payload.content,
          mediaUrl: payload.mediaUrl,
          externalId: payload.externalId,
        })

        // Atualiza última mensagem da conversa
        await updateConversationLastMessage(payload.conversationId)

        return NextResponse.json({ success: true, message: msg })

      default:
        return NextResponse.json(
          { error: `Ação desconhecida: ${action}` },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Erro no webhook n8n:', error)
    return NextResponse.json(
      { error: 'Erro interno' },
      { status: 500 }
    )
  }
}
