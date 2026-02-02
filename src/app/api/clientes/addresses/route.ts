import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'

// GET - List all addresses for a customer
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get('customerId')

    if (!customerId) {
      return NextResponse.json({ error: 'Customer ID required' }, { status: 400 })
    }

    const addresses = await query(`
      SELECT * FROM smartloja.addresses
      WHERE "customerId" = $1 AND active = true
      ORDER BY "isDefault" DESC, "createdAt" DESC
    `, [customerId])

    return NextResponse.json({ success: true, addresses })
  } catch (error) {
    console.error('Get addresses error:', error)
    return NextResponse.json({ error: 'Failed to get addresses' }, { status: 500 })
  }
}

// POST - Create new address
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      customerId,
      label,
      recipientName,
      zipCode,
      street,
      number,
      complement,
      neighborhood,
      city,
      state,
      reference,
      isDefault,
    } = body

    // Validate required fields
    if (!customerId || !label || !recipientName || !zipCode || !street || !number || !neighborhood || !city || !state) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // If setting as default, unset other defaults
    if (isDefault) {
      await query(`
        UPDATE smartloja.addresses
        SET "isDefault" = false
        WHERE "customerId" = $1
      `, [customerId])
    }

    const address = await queryOne(`
      INSERT INTO smartloja.addresses (
        id, "customerId", label, "recipientName", "zipCode", street, number,
        complement, neighborhood, city, state, reference, "isDefault", active, "createdAt", "updatedAt"
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, true, NOW(), NOW()
      )
      RETURNING *
    `, [
      uuidv4(),
      customerId,
      label,
      recipientName,
      zipCode,
      street,
      number,
      complement || null,
      neighborhood,
      city,
      state,
      reference || null,
      isDefault || false,
    ])

    return NextResponse.json({ success: true, address })
  } catch (error) {
    console.error('Create address error:', error)
    return NextResponse.json({ error: 'Failed to create address' }, { status: 500 })
  }
}
