import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'

// PUT - Update address
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const {
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
      customerId,
    } = body

    // If setting as default, unset other defaults
    if (isDefault && customerId) {
      await query(`
        UPDATE smartloja.addresses
        SET "isDefault" = false
        WHERE "customerId" = $1 AND id != $2
      `, [customerId, params.id])
    }

    const address = await queryOne(`
      UPDATE smartloja.addresses
      SET
        label = COALESCE($1, label),
        "recipientName" = COALESCE($2, "recipientName"),
        "zipCode" = COALESCE($3, "zipCode"),
        street = COALESCE($4, street),
        number = COALESCE($5, number),
        complement = $6,
        neighborhood = COALESCE($7, neighborhood),
        city = COALESCE($8, city),
        state = COALESCE($9, state),
        reference = $10,
        "isDefault" = COALESCE($11, "isDefault"),
        "updatedAt" = NOW()
      WHERE id = $12
      RETURNING *
    `, [
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
      params.id,
    ])

    if (!address) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, address })
  } catch (error) {
    console.error('Update address error:', error)
    return NextResponse.json({ error: 'Failed to update address' }, { status: 500 })
  }
}

// DELETE - Soft delete address
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await query(`
      UPDATE smartloja.addresses
      SET active = false, "updatedAt" = NOW()
      WHERE id = $1
    `, [params.id])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete address error:', error)
    return NextResponse.json({ error: 'Failed to delete address' }, { status: 500 })
  }
}
