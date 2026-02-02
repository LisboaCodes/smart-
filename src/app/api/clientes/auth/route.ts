import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    if (action === 'login') {
      const { email, password } = body

      const customer = await queryOne(`
        SELECT * FROM smartloja.customers
        WHERE email = $1 AND active = true AND password IS NOT NULL
      `, [email.toLowerCase()])

      if (!customer) {
        return NextResponse.json({ success: false, error: 'Email ou senha incorretos' })
      }

      const isValid = await bcrypt.compare(password, customer.password)
      if (!isValid) {
        return NextResponse.json({ success: false, error: 'Email ou senha incorretos' })
      }

      // Update last login
      await query(`
        UPDATE smartloja.customers
        SET "lastLogin" = NOW()
        WHERE id = $1
      `, [customer.id])

      // Generate simple token (in production, use JWT)
      const token = Buffer.from(`${customer.id}:${Date.now()}`).toString('base64')

      return NextResponse.json({
        success: true,
        token,
        customer: {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          cpf: customer.cpf,
        },
      })
    }

    if (action === 'register') {
      const { name, email, phone, cpf, password } = body

      // Check if email already exists
      const existing = await queryOne(`
        SELECT id FROM smartloja.customers WHERE email = $1
      `, [email.toLowerCase()])

      if (existing) {
        return NextResponse.json({ success: false, error: 'Este email ja esta cadastrado' })
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10)

      const customer = await queryOne(`
        INSERT INTO smartloja.customers (
          id, name, email, phone, cpf, password, active, type, "totalPurchases", "acceptsMarketing", "createdAt", "updatedAt"
        ) VALUES (
          $1, $2, $3, $4, $5, $6, true, 'REGULAR', 0, true, NOW(), NOW()
        )
        RETURNING id, name, email, phone, cpf
      `, [
        uuidv4(),
        name,
        email.toLowerCase(),
        phone || null,
        cpf || null,
        hashedPassword,
      ])

      const token = Buffer.from(`${customer.id}:${Date.now()}`).toString('base64')

      return NextResponse.json({
        success: true,
        token,
        customer,
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 })
  }
}
