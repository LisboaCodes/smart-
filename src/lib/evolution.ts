import { getEvolutionConfigFromDb } from './db'

interface SendMessageOptions {
  to: string
  message: string
  mediaUrl?: string
}

export async function getEvolutionConfig() {
  return getEvolutionConfigFromDb()
}

export async function sendWhatsAppMessage({ to, message, mediaUrl }: SendMessageOptions) {
  const config = await getEvolutionConfig()

  if (!config) {
    throw new Error('WhatsApp não configurado')
  }

  const { apiUrl, apiKey, instance } = config

  // Formatar número
  const phone = to.replace(/\D/g, '')

  try {
    if (mediaUrl) {
      // Enviar mensagem com mídia
      const response = await fetch(
        `${apiUrl}/message/sendMedia/${instance}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: apiKey,
          },
          body: JSON.stringify({
            number: phone,
            options: {
              delay: 1200,
              presence: 'composing',
            },
            mediaMessage: {
              mediatype: 'image',
              caption: message,
              media: mediaUrl,
            },
          }),
        }
      )

      if (!response.ok) {
        throw new Error(`Erro ao enviar mensagem: ${response.status}`)
      }

      return await response.json()
    } else {
      // Enviar mensagem de texto
      const response = await fetch(
        `${apiUrl}/message/sendText/${instance}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: apiKey,
          },
          body: JSON.stringify({
            number: phone,
            options: {
              delay: 1200,
              presence: 'composing',
            },
            textMessage: {
              text: message,
            },
          }),
        }
      )

      if (!response.ok) {
        throw new Error(`Erro ao enviar mensagem: ${response.status}`)
      }

      return await response.json()
    }
  } catch (error) {
    console.error('Erro ao enviar WhatsApp:', error)
    throw error
  }
}

export async function checkInstanceStatus() {
  const config = await getEvolutionConfig()

  if (!config) {
    return { connected: false, error: 'Não configurado' }
  }

  const { apiUrl, apiKey, instance } = config

  try {
    const response = await fetch(
      `${apiUrl}/instance/connectionState/${instance}`,
      {
        headers: {
          apikey: apiKey,
        },
      }
    )

    if (!response.ok) {
      return { connected: false, error: 'Erro ao verificar status' }
    }

    const data = await response.json()
    return {
      connected: data.state === 'open',
      state: data.state,
    }
  } catch (error) {
    return { connected: false, error: String(error) }
  }
}

export function replaceMessageVariables(
  message: string,
  variables: Record<string, string>
): string {
  let result = message

  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value)
  }

  return result
}
