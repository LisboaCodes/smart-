import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

// PDF Report Generation API
// In production, use a library like PDFKit, jsPDF, or Puppeteer

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    switch (type) {
      case 'vendas':
        return await generateSalesReport(startDate, endDate)
      case 'estoque':
        return await generateInventoryReport()
      case 'financeiro':
        return await generateFinancialReport(startDate, endDate)
      case 'clientes':
        return await generateCustomersReport()
      default:
        return NextResponse.json({ error: 'Tipo de relatorio invalido' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error generating report:', error)
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 })
  }
}

async function generateSalesReport(startDate: string | null, endDate: string | null) {
  const dateFilter = startDate && endDate
    ? `WHERE s."createdAt" BETWEEN '${startDate}' AND '${endDate}'`
    : ''

  const sales = await query(`
    SELECT
      s.id,
      s."saleNumber",
      s."createdAt",
      s.total,
      s.discount,
      s."paymentMethod",
      s.status,
      c.name as "customerName"
    FROM smartloja.sales s
    LEFT JOIN smartloja.customers c ON s."customerId" = c.id
    ${dateFilter}
    ORDER BY s."createdAt" DESC
  `)

  const summary = await query(`
    SELECT
      COUNT(*) as total_vendas,
      SUM(total) as receita_total,
      SUM(discount) as descontos_total,
      AVG(total) as ticket_medio
    FROM smartloja.sales
    ${dateFilter}
  `)

  // Generate HTML report (can be converted to PDF using browser print or Puppeteer)
  const html = generateSalesReportHTML(sales, summary[0], startDate, endDate)

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  })
}

async function generateInventoryReport() {
  const products = await query(`
    SELECT
      p.id,
      p.name,
      p.sku,
      p.stock,
      p."minStock",
      p."costPrice",
      p."salePrice",
      c.name as "categoryName",
      CASE
        WHEN p.stock <= 0 THEN 'Sem estoque'
        WHEN p.stock <= p."minStock" THEN 'Estoque baixo'
        ELSE 'Normal'
      END as status
    FROM smartloja.products p
    LEFT JOIN smartloja.categories c ON p."categoryId" = c.id
    WHERE p.active = true
    ORDER BY p.stock ASC
  `)

  const summary = await query(`
    SELECT
      COUNT(*) as total_produtos,
      SUM(stock) as total_itens,
      SUM(stock * "costPrice") as valor_custo,
      SUM(stock * "salePrice") as valor_venda,
      COUNT(CASE WHEN stock <= 0 THEN 1 END) as sem_estoque,
      COUNT(CASE WHEN stock > 0 AND stock <= "minStock" THEN 1 END) as estoque_baixo
    FROM smartloja.products
    WHERE active = true
  `)

  const html = generateInventoryReportHTML(products, summary[0])

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  })
}

async function generateFinancialReport(startDate: string | null, endDate: string | null) {
  const dateFilter = startDate && endDate
    ? `WHERE date BETWEEN '${startDate}' AND '${endDate}'`
    : ''

  const entries = await query(`
    SELECT
      id,
      type,
      category,
      description,
      amount,
      date,
      status
    FROM smartloja.financial_entries
    ${dateFilter}
    ORDER BY date DESC
  `)

  const summary = await query(`
    SELECT
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as receitas,
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as despesas,
      SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) as saldo
    FROM smartloja.financial_entries
    ${dateFilter}
  `)

  const html = generateFinancialReportHTML(entries, summary[0], startDate, endDate)

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  })
}

async function generateCustomersReport() {
  const customers = await query(`
    SELECT
      c.id,
      c.name,
      c.email,
      c.phone,
      c."createdAt",
      COUNT(s.id) as total_compras,
      COALESCE(SUM(s.total), 0) as valor_total
    FROM smartloja.customers c
    LEFT JOIN smartloja.sales s ON c.id = s."customerId"
    WHERE c.active = true
    GROUP BY c.id
    ORDER BY valor_total DESC
  `)

  const html = generateCustomersReportHTML(customers)

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  })
}

// HTML Report Templates
function generateSalesReportHTML(sales: any[], summary: any, startDate: string | null, endDate: string | null) {
  const period = startDate && endDate
    ? `${new Date(startDate).toLocaleDateString('pt-BR')} a ${new Date(endDate).toLocaleDateString('pt-BR')}`
    : 'Todos os periodos'

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Relatorio de Vendas</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #7c3aed; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #7c3aed; color: white; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 20px; }
        .summary-card { background: #f3f4f6; padding: 15px; border-radius: 8px; }
        .summary-card h3 { margin: 0; font-size: 14px; color: #666; }
        .summary-card p { margin: 5px 0 0; font-size: 24px; font-weight: bold; }
        @media print { body { margin: 0; } }
      </style>
    </head>
    <body>
      <h1>Relatorio de Vendas</h1>
      <p>Periodo: ${period}</p>

      <div class="summary">
        <div class="summary-card">
          <h3>Total de Vendas</h3>
          <p>${summary?.total_vendas || 0}</p>
        </div>
        <div class="summary-card">
          <h3>Receita Total</h3>
          <p>R$ ${Number(summary?.receita_total || 0).toFixed(2)}</p>
        </div>
        <div class="summary-card">
          <h3>Descontos</h3>
          <p>R$ ${Number(summary?.descontos_total || 0).toFixed(2)}</p>
        </div>
        <div class="summary-card">
          <h3>Ticket Medio</h3>
          <p>R$ ${Number(summary?.ticket_medio || 0).toFixed(2)}</p>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Numero</th>
            <th>Data</th>
            <th>Cliente</th>
            <th>Pagamento</th>
            <th>Valor</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${sales.map(sale => `
            <tr>
              <td>${sale.saleNumber}</td>
              <td>${new Date(sale.createdAt).toLocaleDateString('pt-BR')}</td>
              <td>${sale.customerName || 'Cliente Avulso'}</td>
              <td>${sale.paymentMethod}</td>
              <td>R$ ${Number(sale.total).toFixed(2)}</td>
              <td>${sale.status}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <p style="margin-top: 20px; text-align: center; color: #666;">
        Gerado em ${new Date().toLocaleString('pt-BR')} - Smart+ Acessorios
      </p>
    </body>
    </html>
  `
}

function generateInventoryReportHTML(products: any[], summary: any) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Relatorio de Estoque</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #7c3aed; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #7c3aed; color: white; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .status-sem { color: #dc2626; font-weight: bold; }
        .status-baixo { color: #f59e0b; font-weight: bold; }
        .status-normal { color: #22c55e; }
        .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 20px; }
        .summary-card { background: #f3f4f6; padding: 15px; border-radius: 8px; }
        .summary-card h3 { margin: 0; font-size: 14px; color: #666; }
        .summary-card p { margin: 5px 0 0; font-size: 24px; font-weight: bold; }
      </style>
    </head>
    <body>
      <h1>Relatorio de Estoque</h1>

      <div class="summary">
        <div class="summary-card">
          <h3>Total Produtos</h3>
          <p>${summary?.total_produtos || 0}</p>
        </div>
        <div class="summary-card">
          <h3>Total Itens</h3>
          <p>${summary?.total_itens || 0}</p>
        </div>
        <div class="summary-card">
          <h3>Valor (Custo)</h3>
          <p>R$ ${Number(summary?.valor_custo || 0).toFixed(2)}</p>
        </div>
        <div class="summary-card">
          <h3>Valor (Venda)</h3>
          <p>R$ ${Number(summary?.valor_venda || 0).toFixed(2)}</p>
        </div>
      </div>

      <p><strong>Sem estoque:</strong> ${summary?.sem_estoque || 0} | <strong>Estoque baixo:</strong> ${summary?.estoque_baixo || 0}</p>

      <table>
        <thead>
          <tr>
            <th>SKU</th>
            <th>Produto</th>
            <th>Categoria</th>
            <th>Estoque</th>
            <th>Min.</th>
            <th>Custo</th>
            <th>Venda</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${products.map(p => `
            <tr>
              <td>${p.sku}</td>
              <td>${p.name}</td>
              <td>${p.categoryName || '-'}</td>
              <td>${p.stock}</td>
              <td>${p.minStock}</td>
              <td>R$ ${Number(p.costPrice).toFixed(2)}</td>
              <td>R$ ${Number(p.salePrice).toFixed(2)}</td>
              <td class="status-${p.status === 'Sem estoque' ? 'sem' : p.status === 'Estoque baixo' ? 'baixo' : 'normal'}">${p.status}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <p style="margin-top: 20px; text-align: center; color: #666;">
        Gerado em ${new Date().toLocaleString('pt-BR')} - Smart+ Acessorios
      </p>
    </body>
    </html>
  `
}

function generateFinancialReportHTML(entries: any[], summary: any, startDate: string | null, endDate: string | null) {
  const period = startDate && endDate
    ? `${new Date(startDate).toLocaleDateString('pt-BR')} a ${new Date(endDate).toLocaleDateString('pt-BR')}`
    : 'Todos os periodos'

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Relatorio Financeiro</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #7c3aed; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #7c3aed; color: white; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .income { color: #22c55e; }
        .expense { color: #dc2626; }
        .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 20px; }
        .summary-card { background: #f3f4f6; padding: 15px; border-radius: 8px; }
        .summary-card h3 { margin: 0; font-size: 14px; color: #666; }
        .summary-card p { margin: 5px 0 0; font-size: 24px; font-weight: bold; }
        .summary-card.receitas p { color: #22c55e; }
        .summary-card.despesas p { color: #dc2626; }
      </style>
    </head>
    <body>
      <h1>Relatorio Financeiro (DRE)</h1>
      <p>Periodo: ${period}</p>

      <div class="summary">
        <div class="summary-card receitas">
          <h3>Receitas</h3>
          <p>R$ ${Number(summary?.receitas || 0).toFixed(2)}</p>
        </div>
        <div class="summary-card despesas">
          <h3>Despesas</h3>
          <p>R$ ${Number(summary?.despesas || 0).toFixed(2)}</p>
        </div>
        <div class="summary-card">
          <h3>Saldo</h3>
          <p style="color: ${Number(summary?.saldo || 0) >= 0 ? '#22c55e' : '#dc2626'}">R$ ${Number(summary?.saldo || 0).toFixed(2)}</p>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Data</th>
            <th>Tipo</th>
            <th>Categoria</th>
            <th>Descricao</th>
            <th>Valor</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${entries.map(e => `
            <tr>
              <td>${new Date(e.date).toLocaleDateString('pt-BR')}</td>
              <td class="${e.type}">${e.type === 'income' ? 'Receita' : 'Despesa'}</td>
              <td>${e.category}</td>
              <td>${e.description}</td>
              <td class="${e.type}">R$ ${Number(e.amount).toFixed(2)}</td>
              <td>${e.status}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <p style="margin-top: 20px; text-align: center; color: #666;">
        Gerado em ${new Date().toLocaleString('pt-BR')} - Smart+ Acessorios
      </p>
    </body>
    </html>
  `
}

function generateCustomersReportHTML(customers: any[]) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Relatorio de Clientes</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #7c3aed; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #7c3aed; color: white; }
        tr:nth-child(even) { background-color: #f9f9f9; }
      </style>
    </head>
    <body>
      <h1>Relatorio de Clientes</h1>
      <p>Total: ${customers.length} clientes</p>

      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>E-mail</th>
            <th>Telefone</th>
            <th>Desde</th>
            <th>Compras</th>
            <th>Total Gasto</th>
          </tr>
        </thead>
        <tbody>
          ${customers.map(c => `
            <tr>
              <td>${c.name}</td>
              <td>${c.email || '-'}</td>
              <td>${c.phone || '-'}</td>
              <td>${new Date(c.createdAt).toLocaleDateString('pt-BR')}</td>
              <td>${c.total_compras}</td>
              <td>R$ ${Number(c.valor_total).toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <p style="margin-top: 20px; text-align: center; color: #666;">
        Gerado em ${new Date().toLocaleString('pt-BR')} - Smart+ Acessorios
      </p>
    </body>
    </html>
  `
}
