// Thermal Receipt Printing Utility
// Uses ESC/POS commands for thermal printers

interface ReceiptItem {
  name: string
  quantity: number
  price: number
}

interface ReceiptData {
  orderNumber: string
  date: Date
  items: ReceiptItem[]
  subtotal: number
  discount: number
  shipping: number
  total: number
  paymentMethod: string
  customerName?: string
  customerPhone?: string
}

export function generateReceiptText(data: ReceiptData): string {
  const lines: string[] = []
  const width = 48 // Standard thermal printer width

  const center = (text: string) => {
    const padding = Math.floor((width - text.length) / 2)
    return ' '.repeat(Math.max(0, padding)) + text
  }

  const line = (left: string, right: string) => {
    const spaces = width - left.length - right.length
    return left + ' '.repeat(Math.max(1, spaces)) + right
  }

  const divider = '='.repeat(width)
  const thinDivider = '-'.repeat(width)

  // Header
  lines.push(center('SMART+ ACESSORIOS'))
  lines.push(center('Galeria Porto Plaza, sala 05'))
  lines.push(center('Nossa Senhora da Gloria - SE'))
  lines.push(center('CNPJ: 52.875.660/0001-10'))
  lines.push(center('(79) 99999-9999'))
  lines.push('')
  lines.push(divider)
  lines.push('')

  // Order info
  lines.push(center(`PEDIDO #${data.orderNumber}`))
  lines.push(center(data.date.toLocaleString('pt-BR')))
  lines.push('')

  if (data.customerName) {
    lines.push(`Cliente: ${data.customerName}`)
    if (data.customerPhone) {
      lines.push(`Telefone: ${data.customerPhone}`)
    }
    lines.push('')
  }

  lines.push(thinDivider)

  // Items
  lines.push(line('ITEM', 'TOTAL'))
  lines.push(thinDivider)

  for (const item of data.items) {
    const itemTotal = item.quantity * item.price
    lines.push(item.name.substring(0, width - 15))
    lines.push(line(
      `  ${item.quantity}x R$ ${item.price.toFixed(2)}`,
      `R$ ${itemTotal.toFixed(2)}`
    ))
  }

  lines.push(thinDivider)

  // Totals
  lines.push(line('Subtotal:', `R$ ${data.subtotal.toFixed(2)}`))

  if (data.discount > 0) {
    lines.push(line('Desconto:', `-R$ ${data.discount.toFixed(2)}`))
  }

  if (data.shipping > 0) {
    lines.push(line('Frete:', `R$ ${data.shipping.toFixed(2)}`))
  } else {
    lines.push(line('Frete:', 'GRATIS'))
  }

  lines.push(divider)
  lines.push(line('TOTAL:', `R$ ${data.total.toFixed(2)}`))
  lines.push(divider)
  lines.push('')

  // Payment method
  lines.push(center(`Pagamento: ${data.paymentMethod.toUpperCase()}`))
  lines.push('')

  // Footer
  lines.push(center('Obrigado pela preferencia!'))
  lines.push(center('Volte sempre!'))
  lines.push('')
  lines.push(center('@smartmaisacessorios'))
  lines.push('')
  lines.push('')
  lines.push('')

  return lines.join('\n')
}

// Print using browser print dialog (works with any printer)
export function printReceiptBrowser(data: ReceiptData): void {
  const receiptText = generateReceiptText(data)

  const printWindow = window.open('', '_blank', 'width=400,height=600')
  if (!printWindow) {
    alert('Por favor, permita popups para imprimir o recibo.')
    return
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Recibo #${data.orderNumber}</title>
      <style>
        body {
          font-family: 'Courier New', monospace;
          font-size: 12px;
          line-height: 1.4;
          margin: 0;
          padding: 10px;
          width: 280px;
        }
        pre {
          margin: 0;
          white-space: pre-wrap;
          word-wrap: break-word;
        }
        @media print {
          body {
            width: 100%;
          }
        }
      </style>
    </head>
    <body>
      <pre>${receiptText}</pre>
      <script>
        window.onload = function() {
          window.print();
          window.onafterprint = function() {
            window.close();
          };
        };
      </script>
    </body>
    </html>
  `)

  printWindow.document.close()
}

// ESC/POS commands for thermal printers (for use with escpos library on server)
export function generateEscPosCommands(data: ReceiptData): Buffer {
  // This is a simplified version - full implementation requires the escpos library
  // Which should be used on the server side

  const receiptText = generateReceiptText(data)

  // Convert to buffer with basic ESC/POS commands
  const commands: number[] = []

  // Initialize printer
  commands.push(0x1B, 0x40) // ESC @

  // Set character set
  commands.push(0x1B, 0x74, 0x02) // ESC t 2 (PC850 character set)

  // Add text
  for (const char of receiptText) {
    commands.push(char.charCodeAt(0))
  }

  // Cut paper
  commands.push(0x1D, 0x56, 0x00) // GS V 0

  return Buffer.from(commands)
}
