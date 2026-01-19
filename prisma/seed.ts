import { PrismaClient, UserRole, ExpenseFrequency } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import bcrypt from 'bcryptjs'

const connectionString = process.env.DATABASE_URL!
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Iniciando seed do banco de dados...')

  // Criar configurações da loja
  const storeSettings = await prisma.storeSettings.upsert({
    where: { id: 'default-settings' },
    update: {},
    create: {
      id: 'default-settings',
      storeName: 'Smart+ Acessórios',
      cnpj: '52.875.660/0001-10',
      address: 'Galeria Porto Plaza, sala 05., Nossa Senhora da Glória, Sergipe 49680-000',
      phone: '(79) 99999-9999',
      whatsapp: '5579999999999',
      instagram: '@smartmaisacessorios',
      receiptMessage: 'Obrigado pela preferência! Volte sempre!',
      primaryColor: '#8B5CF6',
      secondaryColor: '#EC4899',
    },
  })
  console.log('Configurações da loja criadas:', storeSettings.storeName)

  // Criar usuário admin
  const hashedPassword = await bcrypt.hash('admin123', 10)
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@smartacessorios.com.br' },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@smartacessorios.com.br',
      password: hashedPassword,
      role: UserRole.ADMIN,
    },
  })
  console.log('Usuário admin criado:', adminUser.email)

  // Criar categorias padrão
  const categories = [
    { name: 'Bolsas', description: 'Bolsas femininas e masculinas' },
    { name: 'Joias', description: 'Joias em ouro e prata' },
    { name: 'Semi-joias', description: 'Semi-joias banhadas a ouro' },
    { name: 'Bijuterias', description: 'Bijuterias diversas' },
    { name: 'Relógios', description: 'Relógios masculinos e femininos' },
    { name: 'Óculos', description: 'Óculos de sol e armações' },
    { name: 'Acessórios', description: 'Outros acessórios' },
  ]

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    })
  }
  console.log('Categorias criadas:', categories.length)

  // Criar formas de pagamento
  const paymentMethods = [
    { name: 'Dinheiro', type: 'CASH' },
    { name: 'PIX', type: 'PIX' },
    { name: 'Cartão de Crédito', type: 'CREDIT' },
    { name: 'Cartão de Débito', type: 'DEBIT' },
    { name: 'Transferência', type: 'TRANSFER' },
  ]

  for (const pm of paymentMethods) {
    await prisma.paymentMethod.upsert({
      where: { name: pm.name },
      update: {},
      create: pm,
    })
  }
  console.log('Formas de pagamento criadas:', paymentMethods.length)

  // Criar maquineta padrão
  const creditMethod = await prisma.paymentMethod.findFirst({
    where: { type: 'CREDIT' },
  })

  if (creditMethod) {
    await prisma.cardMachine.upsert({
      where: { id: 'default-machine' },
      update: {},
      create: {
        id: 'default-machine',
        name: 'Maquineta Principal',
        brand: 'Stone',
        paymentMethodId: creditMethod.id,
        creditFee: 2.99,
        debitFee: 1.49,
        pixFee: 0,
        installmentFees: {
          '2': 4.99,
          '3': 5.99,
          '4': 6.99,
          '5': 7.99,
          '6': 8.99,
          '7': 9.99,
          '8': 10.99,
          '9': 11.99,
          '10': 12.99,
          '11': 13.99,
          '12': 14.99,
        },
      },
    })
    console.log('Maquineta criada')
  }

  // Criar contas fixas de exemplo
  const expenses = [
    { name: 'Aluguel', amount: 1500, frequency: ExpenseFrequency.MONTHLY, dueDay: 10, category: 'Aluguel' },
    { name: 'Energia', amount: 250, frequency: ExpenseFrequency.MONTHLY, dueDay: 15, category: 'Utilidades' },
    { name: 'Internet', amount: 150, frequency: ExpenseFrequency.MONTHLY, dueDay: 20, category: 'Utilidades' },
    { name: 'Contador', amount: 300, frequency: ExpenseFrequency.MONTHLY, dueDay: 5, category: 'Serviços' },
  ]

  for (const expense of expenses) {
    await prisma.expense.upsert({
      where: { id: `expense-${expense.name.toLowerCase().replace(/\s/g, '-')}` },
      update: {},
      create: {
        id: `expense-${expense.name.toLowerCase().replace(/\s/g, '-')}`,
        ...expense,
      },
    })
  }
  console.log('Contas fixas criadas:', expenses.length)

  // Criar templates de mensagem
  const templates = [
    {
      name: 'Aniversário',
      type: 'BIRTHDAY',
      message: 'Olá {nome}! 🎂 Feliz aniversário! A Smart+ Acessórios deseja um dia maravilhoso para você! Como presente, preparamos um desconto especial de 15% em qualquer produto. Válido até o final do mês! 🎁',
      variables: { nome: 'Nome do cliente' },
    },
    {
      name: 'Boas-vindas',
      type: 'WELCOME',
      message: 'Olá {nome}! Seja bem-vindo(a) à Smart+ Acessórios! 💜 Ficamos felizes em tê-lo(a) como cliente. Acompanhe nossas novidades e promoções exclusivas!',
      variables: { nome: 'Nome do cliente' },
    },
    {
      name: 'Carrinho Abandonado',
      type: 'ABANDONED_CART',
      message: 'Oi {nome}! Percebemos que você deixou alguns produtos no carrinho. 🛒 Que tal finalizar sua compra? Os produtos estão esperando por você!',
      variables: { nome: 'Nome do cliente' },
    },
    {
      name: 'Cliente Inativo',
      type: 'INACTIVE',
      message: 'Olá {nome}! Sentimos sua falta na Smart+ Acessórios! 💜 Faz um tempo que você não nos visita. Venha conferir as novidades e aproveite condições especiais!',
      variables: { nome: 'Nome do cliente' },
    },
  ]

  for (const template of templates) {
    await prisma.messageTemplate.upsert({
      where: { id: `template-${template.type.toLowerCase()}` },
      update: {},
      create: {
        id: `template-${template.type.toLowerCase()}`,
        ...template,
      },
    })
  }
  console.log('Templates de mensagem criados:', templates.length)

  console.log('Seed concluído com sucesso!')
}

main()
  .catch((e) => {
    console.error('Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
