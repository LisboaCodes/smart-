# SISTEMA LOJA - Smart+ Acessorios

Sistema completo de gestao de loja com PDV, estoque, financeiro, clientes, loja virtual e muito mais.

## Tecnologias

- **Framework**: Next.js 14.1.0 (App Router)
- **Linguagem**: TypeScript
- **Banco de Dados**: PostgreSQL (schema: `smartloja`)
- **ORM**: SQL puro com biblioteca `pg`
- **Autenticacao**: NextAuth.js
- **UI**: Tailwind CSS + Radix UI + shadcn/ui
- **Graficos**: Recharts
- **Icones**: Lucide React

## Configuracao do Ambiente

### Variaveis de Ambiente (.env)

```env
# Banco de Dados
DB_HOST=201.23.70.201
DB_PORT=5432
DB_NAME=filehub
DB_USER=filehub
DB_PASSWORD=FileHub2024@Secure!Pass

# NextAuth
NEXTAUTH_SECRET=sua-chave-secreta
NEXTAUTH_URL=http://localhost:3003

# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN=seu-token

# Evolution API (WhatsApp)
EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_API_KEY=sua-api-key
EVOLUTION_INSTANCE=smartplus
```

### Scripts

```bash
# Desenvolvimento (porta 3003 com Turbopack)
npm run dev

# Build de producao
npm run build

# Iniciar producao (porta 3001)
npm start
```

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
│   ├── loja/                 # Loja virtual publica
│   │   ├── page.tsx          # Catalogo
│   │   ├── carrinho/         # Carrinho de compras
│   │   ├── checkout/         # Checkout completo
│   │   ├── conta/            # Area do cliente
│   │   ├── pedidos/          # Historico de pedidos
│   │   └── produto/[id]/     # Detalhes do produto
│   ├── loja-admin/           # Admin da loja virtual
│   ├── login/
│   └── api/
│       ├── produtos/
│       ├── categorias/
│       ├── clientes/
│       ├── vendas/
│       ├── pedidos/          # Pedidos da loja online
│       ├── frete/            # Calculo de frete
│       ├── cupons/           # Sistema de cupons
│       ├── avaliacoes/       # Avaliacoes de produtos
│       ├── relatorios/       # Relatorios em HTML/PDF
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
    ├── auth.ts               # Configuracao NextAuth
    ├── utils.ts              # Utilitarios
    ├── permissions.ts        # Sistema de permissoes
    ├── loyalty-program.ts    # Programa de fidelidade
    ├── print-receipt.ts      # Impressao de recibos
    ├── whatsapp-notifications.ts  # Notificacoes WhatsApp
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

## Tabelas do Banco de Dados

### Principais
- `users` - Usuarios do sistema
- `products` - Produtos
- `categories` - Categorias
- `customers` - Clientes (PDV)
- `store_customers` - Clientes (Loja Online)
- `sales` - Vendas (PDV)
- `orders` - Pedidos (Loja Online)
- `order_items` - Itens do pedido
- `financial_entries` - Lancamentos financeiros
- `coupons` - Cupons de desconto
- `product_reviews` - Avaliacoes de produtos

### Novas tabelas necessarias
```sql
-- Cupons de desconto
CREATE TABLE smartloja.coupons (
  id UUID PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  type VARCHAR(20) NOT NULL, -- 'percentage' ou 'fixed'
  value DECIMAL(10,2) NOT NULL,
  description TEXT,
  "minValue" DECIMAL(10,2),
  "maxDiscount" DECIMAL(10,2),
  "usageLimit" INTEGER,
  "usageCount" INTEGER DEFAULT 0,
  "expiresAt" TIMESTAMP,
  active BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Avaliacoes de produtos
CREATE TABLE smartloja.product_reviews (
  id UUID PRIMARY KEY,
  "productId" UUID REFERENCES smartloja.products(id),
  "customerName" VARCHAR(255) NOT NULL,
  "customerEmail" VARCHAR(255) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  verified BOOLEAN DEFAULT false,
  approved BOOLEAN DEFAULT false,
  helpful INTEGER DEFAULT 0,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Clientes da loja online
CREATE TABLE smartloja.store_customers (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  cpf VARCHAR(14),
  password VARCHAR(255) NOT NULL,
  active BOOLEAN DEFAULT true,
  "lastLogin" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Pedidos da loja online
CREATE TABLE smartloja.orders (
  id UUID PRIMARY KEY,
  "orderNumber" VARCHAR(50) UNIQUE NOT NULL,
  "customerName" VARCHAR(255) NOT NULL,
  "customerEmail" VARCHAR(255) NOT NULL,
  "customerPhone" VARCHAR(20),
  "customerCpf" VARCHAR(14),
  "shippingCep" VARCHAR(10),
  "shippingStreet" VARCHAR(255),
  "shippingNumber" VARCHAR(20),
  "shippingComplement" VARCHAR(255),
  "shippingNeighborhood" VARCHAR(255),
  "shippingCity" VARCHAR(255),
  "shippingState" VARCHAR(2),
  "shippingMethod" VARCHAR(50),
  "shippingCost" DECIMAL(10,2),
  "paymentMethod" VARCHAR(50),
  subtotal DECIMAL(10,2),
  total DECIMAL(10,2),
  status VARCHAR(50) DEFAULT 'pending',
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Itens do pedido
CREATE TABLE smartloja.order_items (
  id UUID PRIMARY KEY,
  "orderId" UUID REFERENCES smartloja.orders(id),
  "productId" UUID REFERENCES smartloja.products(id),
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  quantity INTEGER NOT NULL,
  "variationId" UUID,
  "createdAt" TIMESTAMP DEFAULT NOW()
);
```

## Cupons Disponiveis (Teste)

- `PRIMEIRACOMPRA` - 10% de desconto
- `FRETEGRATIS` - Frete gratis
- `BEMVINDO10` - 10% de desconto (boas-vindas)

## URLs da Aplicacao

- **Painel Admin**: http://localhost:3003/dashboard
- **Loja Virtual**: http://localhost:3003/loja
- **Checkout**: http://localhost:3003/loja/checkout
- **Minha Conta**: http://localhost:3003/loja/conta
- **Meus Pedidos**: http://localhost:3003/loja/pedidos

## Contato

**Loja**: Smart+ Acessorios
**Endereco**: Galeria Porto Plaza, sala 05 - Nossa Senhora da Gloria, Sergipe
**CNPJ**: 52.875.660/0001-10
**Instagram**: @smartmaisacessorios
