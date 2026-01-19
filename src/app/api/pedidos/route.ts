import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get('customerId')
    const email = searchParams.get('email')

    let orders
    if (customerId) {
      orders = await query(`
        SELECT o.*,
          json_agg(json_build_object(
            'id', oi.id,
            'productId', oi."productId",
            'name', oi.name,
            'price', oi.price,
            'quantity', oi.quantity
          )) as items
        FROM smartloja.orders o
        LEFT JOIN smartloja.order_items oi ON o.id = oi."orderId"
        WHERE o."customerId" = $1
        GROUP BY o.id
        ORDER BY o."createdAt" DESC
      `, [customerId])
    } else if (email) {
      orders = await query(`
        SELECT o.*,
          json_agg(json_build_object(
            'id', oi.id,
            'productId', oi."productId",
            'name', oi.name,
            'price', oi.price,
            'quantity', oi.quantity
          )) as items
        FROM smartloja.orders o
        LEFT JOIN smartloja.order_items oi ON o.id = oi."orderId"
        WHERE o."customerEmail" = $1
        GROUP BY o.id
        ORDER BY o."createdAt" DESC
      `, [email])
    } else {
      orders = await query(`
        SELECT o.*,
          json_agg(json_build_object(
            'id', oi.id,
            'productId', oi."productId",
            'name', oi.name,
            'price', oi.price,
            'quantity', oi.quantity
          )) as items
        FROM smartloja.orders o
        LEFT JOIN smartloja.order_items oi ON o.id = oi."orderId"
        GROUP BY o.id
        ORDER BY o."createdAt" DESC
        LIMIT 50
      `)
    }

    return NextResponse.json(orders)
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customer, address, items, shipping, payment, subtotal, total } = body

    const orderId = uuidv4()
    const orderNumber = `PED${Date.now().toString(36).toUpperCase()}`

    // Create order
    await query(`
      INSERT INTO smartloja.orders (
        id, "orderNumber", "customerName", "customerEmail", "customerPhone", "customerCpf",
        "shippingCep", "shippingStreet", "shippingNumber", "shippingComplement",
        "shippingNeighborhood", "shippingCity", "shippingState",
        "shippingMethod", "shippingCost",
        "paymentMethod", subtotal, total, status, "createdAt", "updatedAt"
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, NOW(), NOW()
      )
    `, [
      orderId,
      orderNumber,
      customer.name,
      customer.email,
      customer.phone,
      customer.cpf,
      address.cep,
      address.street,
      address.number,
      address.complement || '',
      address.neighborhood,
      address.city,
      address.state,
      shipping.method,
      shipping.cost,
      payment.method,
      subtotal,
      total,
      'pending',
    ])

    // Create order items
    for (const item of items) {
      await query(`
        INSERT INTO smartloja.order_items (
          id, "orderId", "productId", name, price, quantity, "variationId", "createdAt"
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, NOW()
        )
      `, [
        uuidv4(),
        orderId,
        item.productId,
        item.name,
        item.price,
        item.quantity,
        item.variationId || null,
      ])

      // Update product stock
      await query(`
        UPDATE smartloja.products
        SET stock = stock - $1, "updatedAt" = NOW()
        WHERE id = $2 AND stock >= $1
      `, [item.quantity, item.productId])
    }

    // Create financial entry for the sale
    await query(`
      INSERT INTO smartloja.financial_entries (
        id, type, category, description, amount, date, status, "orderId", "createdAt", "updatedAt"
      ) VALUES (
        $1, 'income', 'Venda Online', $2, $3, NOW(), 'pending', $4, NOW(), NOW()
      )
    `, [
      uuidv4(),
      `Pedido #${orderNumber}`,
      total,
      orderId,
    ])

    return NextResponse.json({
      id: orderId,
      orderNumber,
      message: 'Order created successfully',
    })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
