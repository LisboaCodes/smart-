# SISTEMA LOJA - Smart+ Acessorios

Sistema completo de gestao de loja com PDV, estoque, financeiro, clientes, loja virtual e muito mais.

## Tecnologias

- **Framework**: Next.js 14.1.0 (App Router)
- **Linguagem**: TypeScript
- **Banco de Dados**: PostgreSQL (schema: `smartloja`)
- **ORM**: Prisma + SQL puro com biblioteca `pg`
- **Autenticacao**: NextAuth.js
- **UI**: Tailwind CSS + Radix UI + shadcn/ui
- **Graficos**: Recharts
- **Icones**: Lucide React
- **Tema**: Paleta dourada customizada

## URLs de Producao

- **Dominio**: https://smart.creativenext.com.br
- **Loja**: https://smart.creativenext.com.br/loja
- **Login Admin**: https://smart.creativenext.com.br/login
- **Dashboard**: https://smart.creativenext.com.br/dashboard
- **Admin Loja**: https://smart.creativenext.com.br/loja-admin

## Deploy no Coolify

### Repositorio GitHub
```
https://github.com/LisboaCodes/smart-.git
```

### Configuracao no Coolify
- **Build Pack**: Nixpacks
- **Porta**: 3001
- **Branch**: main

### Variaveis de Ambiente (Coolify)
```env
DATABASE_URL=postgresql://filehub:FileHub2024%40Secure%21Pass@201.23.70.201:5432/filehub?schema=smartloja
NEXTAUTH_URL=https://smart.creativenext.com.br
NEXTAUTH_SECRET=chave-secreta-super-segura-minimo-32-caracteres-aqui
```

## Configuracao Local

### Variaveis de Ambiente (.env)

```env
# Database (PostgreSQL - Coolify Remoto)
DATABASE_URL="postgresql://filehub:FileHub2024%40Secure%21Pass@201.23.70.201:5432/filehub?schema=smartloja"
DB_HOST="201.23.70.201"
DB_PORT="5432"
DB_NAME="filehub"
DB_USER="filehub"
DB_PASSWORD="FileHub2024@Secure!Pass"

# NextAuth
NEXTAUTH_URL="http://localhost:3001"
NEXTAUTH_SECRET="chave-secreta-super-segura-minimo-32-caracteres-aqui"

# Evolution API (WhatsApp)
EVOLUTION_API_URL="http://localhost:8080"
EVOLUTION_API_KEY="sua-api-key"
EVOLUTION_INSTANCE="smart-acessorios"

# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN="sua-access-token"
MERCADOPAGO_PUBLIC_KEY="sua-public-key"

# Upload
UPLOAD_DIR="./public/uploads"
MAX_FILE_SIZE="5242880"

# n8n (Automacao de Atendimento)
N8N_URL="http://localhost:5678"
N8N_API_KEY="sua-n8n-api-key"
N8N_WEBHOOK_URL="http://localhost:5678/webhook"

# Instagram
INSTAGRAM_ACCESS_TOKEN="seu-instagram-token"
INSTAGRAM_BUSINESS_ID="seu-business-id"
```

### Scripts

```bash
# Desenvolvimento (porta 3001 com Turbopack)
npm run dev

# Build de producao
npm run build

# Iniciar producao (porta 3001)
npm start

# Prisma
npm run db:generate   # Gerar cliente
npm run db:push       # Push schema
npm run db:migrate    # Migrations
npm run db:seed       # Seed data
npm run db:studio     # Prisma Studio
```

## Paleta de Cores (Tema Dourado)

```css
/* Cores principais */
gold-50:  #fefce8
gold-100: #fef9c3
gold-200: #fef08a
gold-300: #fee09f
gold-400: #f9dc9c
gold-500: #deb65c
gold-600: #c99c38
gold-700: #a16207
gold-800: #854d0e
gold-900: #713f12
```

Configurado em `tailwind.config.ts` e `src/styles/globals.css`.

## Configuracao da Loja

Arquivo: `src/lib/store-config.ts`

```typescript
export const storeConfig = {
  name: 'Smart+ Acessorios',
  logo: '/logo.png',
  phone: '(79) 99999-9999',
  whatsapp: '5579999999999',
  email: 'contato@smartacessorios.com.br',
  instagram: '@smartmaisacessorios',
  address: 'Galeria Porto Plaza, sala 05',
  city: 'Nossa Senhora da Gloria - SE',
  cnpj: '52.875.660/0001-10',
}
```

Para trocar a logo: substitua `/public/logo.png` ou altere o caminho no config.

## Estrutura do Projeto

```
src/
├── app/
│   ├── (admin)/              # Rotas admin (route group)
│   │   ├── dashboard/
│   │   ├── estoque/
│   │   ├── pdv/
│   │   ├── vendas/
│   │   ├── clientes/
│   │   ├── financeiro/
│   │   ├── contas/
│   │   ├── configuracoes/
│   │   ├── marketing/
│   │   ├── atendimento/
│   │   └── usuarios/
│   ├── (loja)/               # Loja publica (route group)
│   │   ├── page.tsx          # Home
│   │   ├── carrinho/
│   │   └── produto/[id]/
│   ├── loja/                 # Loja virtual
│   │   ├── page.tsx          # Catalogo
│   │   ├── carrinho/
│   │   ├── checkout/
│   │   ├── conta/
│   │   ├── pedidos/
│   │   └── produto/[id]/
│   ├── loja-admin/           # Admin da loja virtual
│   ├── login/
│   └── api/
│       ├── produtos/
│       ├── categorias/
│       ├── clientes/
│       ├── vendas/
│       ├── pedidos/
│       ├── frete/
│       ├── cupons/
│       ├── avaliacoes/
│       ├── relatorios/
│       └── financeiro/
├── components/
│   ├── ui/                   # Componentes shadcn/ui
│   ├── admin/                # Sidebar e header admin
│   ├── dashboard/            # Widgets do dashboard
│   ├── estoque/              # Dialogs de estoque
│   ├── clientes/             # Dialogs de clientes
│   └── loja/                 # Componentes da loja
│       ├── store-header.tsx
│       ├── store-footer.tsx
│       ├── product-card.tsx
│       ├── add-to-cart-button.tsx
│       └── product-reviews.tsx
├── contexts/
│   └── cart-context.tsx      # Context do carrinho
└── lib/
    ├── db.ts                 # Funcoes de banco de dados
    ├── prisma.ts             # Cliente Prisma
    ├── auth.ts               # Configuracao NextAuth
    ├── utils.ts              # Utilitarios
    ├── store-config.ts       # Configuracoes da loja
    ├── permissions.ts        # Sistema de permissoes
    ├── loyalty-program.ts    # Programa de fidelidade
    ├── print-receipt.ts      # Impressao de recibos
    ├── whatsapp-notifications.ts
    ├── n8n.ts
    └── evolution.ts
```

## Funcionalidades Implementadas

### Loja Virtual (E-commerce)

- [x] **Catalogo de produtos** com filtro por categoria
- [x] **Carrinho de compras** persistente (localStorage)
- [x] **Checkout completo** com formulario de dados
- [x] **Calculo de frete** por CEP (API simulada dos Correios)
- [x] **Pagamento PIX** com codigo copia e cola
- [x] **Area do cliente** (login/cadastro)
- [x] **Historico de pedidos** do cliente
- [x] **Sistema de cupons** de desconto
- [x] **Avaliacoes de produtos** com estrelas
- [x] **Produtos relacionados** na pagina do produto
- [x] **Header com carrinho** e contador de itens
- [x] **Footer com informacoes** da loja

### Painel Administrativo

- [x] **Dashboard** com metricas e graficos
- [x] **Gestao de estoque** (produtos, categorias, fornecedores)
- [x] **PDV** com busca rapida e multiplos pagamentos
- [x] **Historico de vendas** com filtros
- [x] **Gestao de clientes** com historico de compras
- [x] **Financeiro** (entradas, saidas, DRE)
- [x] **Contas fixas** mensais
- [x] **Marketing** e campanhas
- [x] **Atendimento** via WhatsApp
- [x] **Admin da loja virtual** com estatisticas

### Relatorios

- [x] **Relatorio de vendas** (HTML para impressao/PDF)
- [x] **Relatorio de estoque** com alertas
- [x] **Relatorio financeiro** (DRE)
- [x] **Relatorio de clientes** com valor total

### Impressao

- [x] **Impressao de recibos** via navegador
- [x] **Suporte a impressoras termicas** (ESC/POS)
- [x] **Cupom formatado** com dados da loja

### Notificacoes WhatsApp

- [x] **Notificacao de nova venda** para admin
- [x] **Confirmacao de pedido** para cliente
- [x] **Aviso de envio** com codigo de rastreio
- [x] **Alerta de estoque baixo**
- [x] **Lembrete de pagamento**
- [x] **Mensagem de boas-vindas**

### Sistema de Permissoes

- [x] **5 niveis de acesso**: Admin, Gerente, Vendedor, Caixa, Visualizador
- [x] **Controle por modulo** e acao (view, create, edit, delete)
- [x] **Menu filtrado** por permissoes
- [x] **Log de auditoria** de acoes

### Programa de Fidelidade

- [x] **Sistema de pontos** (1 ponto por R$ 1)
- [x] **4 niveis**: Bronze, Prata, Ouro, Diamante
- [x] **Bonus**: boas-vindas, aniversario, avaliacao, indicacao
- [x] **Resgate de pontos** como desconto

## APIs Disponiveis

### Produtos
- `GET /api/produtos` - Listar produtos
- `POST /api/produtos` - Criar produto
- `GET /api/produtos/[id]` - Detalhes do produto
- `PUT /api/produtos/[id]` - Atualizar produto
- `DELETE /api/produtos/[id]` - Excluir produto

### Pedidos (Loja Online)
- `GET /api/pedidos` - Listar pedidos
- `GET /api/pedidos?email=x` - Pedidos do cliente
- `POST /api/pedidos` - Criar pedido

### Frete
- `POST /api/frete` - Calcular frete por CEP

### Cupons
- `GET /api/cupons` - Listar cupons
- `POST /api/cupons` - Criar/validar cupom

### Avaliacoes
- `GET /api/avaliacoes?productId=x` - Avaliacoes do produto
- `POST /api/avaliacoes` - Criar avaliacao

### Relatorios
- `GET /api/relatorios?type=vendas` - Relatorio de vendas
- `GET /api/relatorios?type=estoque` - Relatorio de estoque
- `GET /api/relatorios?type=financeiro` - Relatorio financeiro
- `GET /api/relatorios?type=clientes` - Relatorio de clientes

## Utilitarios (src/lib)

### print-receipt.ts
```typescript
import { printReceiptBrowser } from '@/lib/print-receipt'

printReceiptBrowser({
  orderNumber: 'PED123',
  date: new Date(),
  items: [...],
  subtotal: 100,
  discount: 10,
  shipping: 0,
  total: 90,
  paymentMethod: 'PIX',
})
```

### whatsapp-notifications.ts
```typescript
import { notifyNewOrder, notifyLowStock } from '@/lib/whatsapp-notifications'

await notifyNewOrder(orderData, '79999999999')
await notifyLowStock({ products: [...] }, '79999999999')
```

### permissions.ts
```typescript
import { hasPermission, canAccessRoute } from '@/lib/permissions'

if (hasPermission(user.role, 'estoque', 'edit')) {
  // Usuario pode editar estoque
}
```

### loyalty-program.ts
```typescript
import { calculatePointsEarned, getLoyaltyTier } from '@/lib/loyalty-program'

const points = calculatePointsEarned(150, config, true) // 150 + 50 bonus
const tier = getLoyaltyTier(2500) // Ouro
```

## Tabelas do Banco de Dados (Schema: smartloja)

### Principais
- `users` - Usuarios do sistema
- `products` - Produtos
- `product_images` - Imagens dos produtos
- `categories` - Categorias
- `suppliers` - Fornecedores
- `customers` - Clientes (PDV)
- `store_customers` - Clientes (Loja Online)
- `sales` - Vendas (PDV)
- `sale_items` - Itens da venda
- `orders` - Pedidos (Loja Online)
- `order_items` - Itens do pedido
- `financial_entries` - Lancamentos financeiros
- `fixed_accounts` - Contas fixas
- `coupons` - Cupons de desconto
- `product_reviews` - Avaliacoes de produtos
- `configurations` - Configuracoes do sistema

## Cupons Disponiveis (Teste)

- `PRIMEIRACOMPRA` - 10% de desconto
- `FRETEGRATIS` - Frete gratis
- `BEMVINDO10` - 10% de desconto (boas-vindas)

## Integracao com Servicos

### Coolify
- Servidor: 201.23.70.201
- Painel: https://painel.creativenext.com.br

### PostgreSQL
- Host: 201.23.70.201
- Porta: 5432
- Database: filehub
- Schema: smartloja

### Evolution API (WhatsApp)
- Para notificacoes automaticas via WhatsApp
- Configurar URL e API Key no .env

### n8n (Automacoes)
- Para fluxos de automacao de atendimento
- Configurar URL e API Key no .env

### Mercado Pago
- Para pagamentos online
- Configurar Access Token e Public Key no .env

## Contato

**Loja**: Smart+ Acessorios
**Endereco**: Galeria Porto Plaza, sala 05 - Nossa Senhora da Gloria, SE
**CNPJ**: 52.875.660/0001-10
**Instagram**: @smartmaisacessorios
