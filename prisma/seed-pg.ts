import { Pool } from 'pg'
import bcrypt from 'bcryptjs'

async function main() {
  const pool = new Pool({
    host: '201.23.70.201',
    port: 5432,
    database: 'filehub',
    user: 'filehub',
    password: 'FileHub2024@Secure!Pass',
  })

  console.log('Conectando ao banco de dados...')

  try {
    // Criar configurações da loja
    console.log('Criando configurações da loja...')
    await pool.query(`
      INSERT INTO smartloja."StoreSettings" (
        id, "storeName", cnpj, address, phone, whatsapp, instagram,
        "receiptMessage", "primaryColor", "secondaryColor", "createdAt", "updatedAt"
      ) VALUES (
        'default-settings', 'Smart+ Acessórios', '52.875.660/0001-10',
        'Galeria Porto Plaza, sala 05., Nossa Senhora da Glória, Sergipe 49680-000',
        '(79) 99999-9999', '5579999999999', '@smartmaisacessorios',
        'Obrigado pela preferência! Volte sempre!', '#8B5CF6', '#EC4899',
        NOW(), NOW()
      ) ON CONFLICT (id) DO NOTHING
    `)

    // Criar usuário admin
    console.log('Criando usuário admin...')
    const hashedPassword = await bcrypt.hash('admin123', 10)
    await pool.query(`
      INSERT INTO smartloja.users (
        id, name, email, password, role, "createdAt", "updatedAt"
      ) VALUES (
        gen_random_uuid(), 'Administrador', 'admin@smartacessorios.com.br',
        $1, 'ADMIN', NOW(), NOW()
      ) ON CONFLICT (email) DO NOTHING
    `, [hashedPassword])

    // Criar categorias
    console.log('Criando categorias...')
    const categories = [
      ['Bolsas', 'Bolsas femininas e masculinas'],
      ['Joias', 'Joias em ouro e prata'],
      ['Semi-joias', 'Semi-joias banhadas a ouro'],
      ['Bijuterias', 'Bijuterias diversas'],
      ['Relógios', 'Relógios masculinos e femininos'],
      ['Óculos', 'Óculos de sol e armações'],
      ['Acessórios', 'Outros acessórios'],
    ]

    for (const [name, description] of categories) {
      await pool.query(`
        INSERT INTO smartloja.categories (id, name, description, "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), $1, $2, NOW(), NOW())
        ON CONFLICT (name) DO NOTHING
      `, [name, description])
    }

    // Criar formas de pagamento
    console.log('Criando formas de pagamento...')
    const paymentMethods = [
      ['Dinheiro', 'CASH'],
      ['PIX', 'PIX'],
      ['Cartão de Crédito', 'CREDIT'],
      ['Cartão de Débito', 'DEBIT'],
      ['Transferência', 'TRANSFER'],
    ]

    for (const [name, type] of paymentMethods) {
      await pool.query(`
        INSERT INTO smartloja.payment_methods (id, name, type, active, "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), $1, $2, true, NOW(), NOW())
        ON CONFLICT (name) DO NOTHING
      `, [name, type])
    }

    // Criar maquineta
    console.log('Criando maquineta...')
    const creditMethod = await pool.query(`
      SELECT id FROM smartloja.payment_methods WHERE type = 'CREDIT' LIMIT 1
    `)

    if (creditMethod.rows.length > 0) {
      await pool.query(`
        INSERT INTO smartloja.card_machines (
          id, name, brand, "paymentMethodId", "creditFee", "debitFee", "pixFee",
          "installmentFees", "createdAt", "updatedAt"
        ) VALUES (
          'default-machine', 'Maquineta Principal', 'Stone', $1, 2.99, 1.49, 0,
          '{"2": 4.99, "3": 5.99, "4": 6.99, "5": 7.99, "6": 8.99, "7": 9.99, "8": 10.99, "9": 11.99, "10": 12.99, "11": 13.99, "12": 14.99}',
          NOW(), NOW()
        ) ON CONFLICT (id) DO NOTHING
      `, [creditMethod.rows[0].id])
    }

    // Criar contas fixas
    console.log('Criando contas fixas...')
    const expenses = [
      ['expense-aluguel', 'Aluguel', 1500, 'MONTHLY', 10, 'Aluguel'],
      ['expense-energia', 'Energia', 250, 'MONTHLY', 15, 'Utilidades'],
      ['expense-internet', 'Internet', 150, 'MONTHLY', 20, 'Utilidades'],
      ['expense-contador', 'Contador', 300, 'MONTHLY', 5, 'Serviços'],
    ]

    for (const [id, name, amount, frequency, dueDay, category] of expenses) {
      await pool.query(`
        INSERT INTO smartloja.expenses (
          id, name, amount, frequency, "dueDay", category, active, "createdAt", "updatedAt"
        ) VALUES ($1, $2, $3, $4, $5, $6, true, NOW(), NOW())
        ON CONFLICT (id) DO NOTHING
      `, [id, name, amount, frequency, dueDay, category])
    }

    // Criar templates de mensagem
    console.log('Criando templates de mensagem...')
    const templates = [
      ['template-birthday', 'Aniversário', 'BIRTHDAY', 'Olá {nome}! 🎂 Feliz aniversário! A Smart+ Acessórios deseja um dia maravilhoso para você! Como presente, preparamos um desconto especial de 15% em qualquer produto. Válido até o final do mês! 🎁', '{"nome": "Nome do cliente"}'],
      ['template-welcome', 'Boas-vindas', 'WELCOME', 'Olá {nome}! Seja bem-vindo(a) à Smart+ Acessórios! 💜 Ficamos felizes em tê-lo(a) como cliente.', '{"nome": "Nome do cliente"}'],
      ['template-abandoned_cart', 'Carrinho Abandonado', 'ABANDONED_CART', 'Oi {nome}! Percebemos que você deixou alguns produtos no carrinho. 🛒 Que tal finalizar sua compra?', '{"nome": "Nome do cliente"}'],
      ['template-inactive', 'Cliente Inativo', 'INACTIVE', 'Olá {nome}! Sentimos sua falta na Smart+ Acessórios! 💜 Faz um tempo que você não nos visita.', '{"nome": "Nome do cliente"}'],
    ]

    for (const [id, name, type, message, variables] of templates) {
      await pool.query(`
        INSERT INTO smartloja.message_templates (
          id, name, type, message, variables, active, "createdAt", "updatedAt"
        ) VALUES ($1, $2, $3, $4, $5, true, NOW(), NOW())
        ON CONFLICT (id) DO NOTHING
      `, [id, name, type, message, variables])
    }

    console.log('')
    console.log('✅ Seed concluído com sucesso!')
    console.log('')
    console.log('📧 Login: admin@smartacessorios.com.br')
    console.log('🔑 Senha: admin123')

  } catch (error) {
    console.error('Erro no seed:', error)
    throw error
  } finally {
    await pool.end()
  }
}

main().catch(console.error)
