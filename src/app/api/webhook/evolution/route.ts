import { NextRequest, NextResponse } from 'next/server'
import {
  findCustomerByWhatsapp,
  upsertConversation,
  createConversationMessage,
  updateConversationMessageStatus,
} from '@/lib/db'
import { triggerN8nWebhook, N8N_EVENTS } from '@/lib/n8n'

// Webhook para receber eventos da Evolution API (WhatsApp)
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    console.log('Webhook Evolution recebido:', JSON.stringify(data, null, 2))

    const { event, instance, data: eventData } = data

    switch (event) {
      case 'messages.upsert':
        // Nova mensagem recebida
        const message = eventData.message
        if (!message || message.key.fromMe) {
          // Ignora mensagens enviadas por nós
          return NextResponse.json({ received: true })
        }

        const phone = message.key.remoteJid?.replace('@s.whatsapp.net', '')
        const content = message.message?.conversation ||
          message.message?.extendedTextMessage?.text ||
          message.message?.imageMessage?.caption ||
          '[Mídia]'

        // Verificar se existe cliente com este WhatsApp
        const customer = await findCustomerByWhatsapp(phone || '')

        // Criar ou atualizar conversa
        const conversation = await upsertConversation({
          channel: 'WHATSAPP',
          externalId: phone || '',
          customerPhone: phone,
          customerName: message.pushName || 'Cliente',
          customerId: customer?.id,
        })

        // Salvar mensagem
        await createConversationMessage({
          conversationId: conversation.id,
          direction: 'INBOUND',
          type: message.message?.imageMessage ? 'IMAGE' :
                message.message?.audioMessage ? 'AUDIO' :
                message.message?.videoMessage ? 'VIDEO' :
                message.message?.documentMessage ? 'DOCUMENT' : 'TEXT',
          content,
          externalId: message.key.id,
        })

        // Disparar webhook para n8n processar
        await triggerN8nWebhook({
          event: N8N_EVENTS.NEW_MESSAGE,
          data: {
            conversationId: conversation.id,
            channel: 'WHATSAPP',
            phone,
            name: message.pushName,
            content,
            customerId: customer?.id,
            customerName: customer?.name,
          },
        })

        break

      case 'messages.update':
        // Atualização de status de mensagem
        const updates = eventData
        for (const update of updates) {
          if (update.status) {
            const status = update.status === 3 ? 'DELIVERED' :
                          update.status === 4 ? 'READ' : 'SENT'
            await updateConversationMessageStatus(
              update.key.id,
              status,
              update.status === 3 ? new Date() : undefined,
              update.status === 4 ? new Date() : undefined
            )
          }
        }
        break

      case 'connection.update':
        // Status de conexão alterado
        console.log('Status de conexão:', eventData)
        break
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Erro no webhook Evolution:', error)
    return NextResponse.json(
      { error: 'Erro interno' },
      { status: 500 }
    )
  }
}
