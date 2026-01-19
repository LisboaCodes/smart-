import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getStoreSettings, query, queryOne } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    let settings = await getStoreSettings()

    if (!settings) {
      // Criar configurações padrão
      const result = await query(`
        INSERT INTO smartloja."StoreSettings" (
          id, "storeName", cnpj, address, "receiptMessage", "primaryColor", "secondaryColor", "createdAt", "updatedAt"
        ) VALUES (
          'default-settings', 'Smart+ Acessórios', '52.875.660/0001-10',
          'Galeria Porto Plaza, sala 05., Nossa Senhora da Glória, Sergipe 49680-000',
          'Obrigado pela preferência! Volte sempre!', '#8B5CF6', '#EC4899', NOW(), NOW()
        ) RETURNING *
      `)
      settings = result[0]
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Erro ao buscar configurações:', error)
    return NextResponse.json(
      { message: 'Erro ao buscar configurações' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    // Verificar se é admin
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Apenas administradores podem alterar configurações' },
        { status: 403 }
      )
    }

    const data = await request.json()

    const settings = await queryOne(`
      UPDATE smartloja."StoreSettings"
      SET
        "storeName" = $1,
        cnpj = $2,
        address = $3,
        phone = $4,
        email = $5,
        instagram = $6,
        whatsapp = $7,
        "logoUrl" = $8,
        "primaryColor" = $9,
        "secondaryColor" = $10,
        "receiptMessage" = $11,
        "receiptFooter" = $12,
        "evolutionApiUrl" = $13,
        "evolutionApiKey" = $14,
        "evolutionInstance" = $15,
        "mercadoPagoToken" = $16,
        "mercadoPagoPublicKey" = $17,
        "n8nUrl" = $18,
        "n8nApiKey" = $19,
        "n8nWebhookUrl" = $20,
        "updatedAt" = NOW()
      WHERE id = $21
      RETURNING *
    `, [
      data.storeName,
      data.cnpj,
      data.address,
      data.phone || null,
      data.email || null,
      data.instagram || null,
      data.whatsapp || null,
      data.logoUrl || null,
      data.primaryColor,
      data.secondaryColor,
      data.receiptMessage,
      data.receiptFooter || null,
      data.evolutionApiUrl || null,
      data.evolutionApiKey || null,
      data.evolutionInstance || null,
      data.mercadoPagoToken || null,
      data.mercadoPagoPublicKey || null,
      data.n8nUrl || null,
      data.n8nApiKey || null,
      data.n8nWebhookUrl || null,
      data.id,
    ])

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Erro ao atualizar configurações:', error)
    return NextResponse.json(
      { message: 'Erro ao atualizar configurações' },
      { status: 500 }
    )
  }
}
