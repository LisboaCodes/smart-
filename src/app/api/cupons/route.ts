import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'

export async function GET(request: NextRequest) {
  try {
    const coupons = await query(`
      SELECT * FROM smartloja.coupons
      ORDER BY "createdAt" DESC
    `)

    return NextResponse.json(coupons)
  } catch (error) {
    console.error('Error fetching coupons:', error)
    return NextResponse.json({ error: 'Failed to fetch coupons' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // If validating a coupon
    if (body.action === 'validate') {
      const { code, subtotal } = body

      const coupon = await queryOne(`
        SELECT * FROM smartloja.coupons
        WHERE UPPER(code) = UPPER($1) AND active = true
      `, [code])

      if (!coupon) {
        return NextResponse.json({ valid: false, error: 'Cupom nao encontrado' })
      }

      // Check expiry
      if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
        return NextResponse.json({ valid: false, error: 'Cupom expirado' })
      }

      // Check minimum value
      if (coupon.minValue && subtotal < Number(coupon.minValue)) {
        return NextResponse.json({
          valid: false,
          error: `Valor minimo de R$ ${Number(coupon.minValue).toFixed(2)} para este cupom`,
        })
      }

      // Check usage limit
      if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
        return NextResponse.json({ valid: false, error: 'Cupom esgotado' })
      }

      // Calculate discount
      let discount = 0
      if (coupon.type === 'percentage') {
        discount = subtotal * (Number(coupon.value) / 100)
        if (coupon.maxDiscount) {
          discount = Math.min(discount, Number(coupon.maxDiscount))
        }
      } else {
        discount = Number(coupon.value)
      }

      return NextResponse.json({
        valid: true,
        coupon: {
          id: coupon.id,
          code: coupon.code,
          type: coupon.type,
          value: Number(coupon.value),
          discount,
          description: coupon.description,
        },
      })
    }

    // Create new coupon (admin only)
    const { code, type, value, description, minValue, maxDiscount, usageLimit, expiresAt, active } = body

    // Check if code already exists
    const existing = await queryOne(`
      SELECT id FROM smartloja.coupons WHERE UPPER(code) = UPPER($1)
    `, [code])

    if (existing) {
      return NextResponse.json({ error: 'Codigo ja existe' }, { status: 400 })
    }

    const coupon = await queryOne(`
      INSERT INTO smartloja.coupons (
        id, code, type, value, description, "minValue", "maxDiscount",
        "usageLimit", "usageCount", "expiresAt", active, "createdAt", "updatedAt"
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, 0, $9, $10, NOW(), NOW()
      )
      RETURNING *
    `, [
      uuidv4(),
      code.toUpperCase(),
      type,
      value,
      description || '',
      minValue || null,
      maxDiscount || null,
      usageLimit || null,
      expiresAt || null,
      active !== false,
    ])

    return NextResponse.json(coupon)
  } catch (error) {
    console.error('Error with coupons:', error)
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  }
}
