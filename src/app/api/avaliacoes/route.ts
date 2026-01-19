import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')

    if (productId) {
      const reviews = await query(`
        SELECT * FROM smartloja.product_reviews
        WHERE "productId" = $1 AND approved = true
        ORDER BY "createdAt" DESC
      `, [productId])

      const stats = await queryOne(`
        SELECT
          COUNT(*) as total,
          AVG(rating) as average
        FROM smartloja.product_reviews
        WHERE "productId" = $1 AND approved = true
      `, [productId])

      return NextResponse.json({
        reviews,
        totalReviews: parseInt(stats?.total || '0'),
        averageRating: parseFloat(stats?.average || '0'),
      })
    }

    // Get all reviews (for admin)
    const reviews = await query(`
      SELECT r.*, p.name as "productName"
      FROM smartloja.product_reviews r
      LEFT JOIN smartloja.products p ON r."productId" = p.id
      ORDER BY r."createdAt" DESC
      LIMIT 100
    `)

    return NextResponse.json(reviews)
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, rating, comment, name, email } = body

    // Validate
    if (!productId || !rating || !comment || !name || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Invalid rating' }, { status: 400 })
    }

    // Check if customer has purchased this product (for verified badge)
    const purchase = await queryOne(`
      SELECT oi.id
      FROM smartloja.order_items oi
      JOIN smartloja.orders o ON oi."orderId" = o.id
      WHERE oi."productId" = $1 AND o."customerEmail" = $2
      LIMIT 1
    `, [productId, email])

    const review = await queryOne(`
      INSERT INTO smartloja.product_reviews (
        id, "productId", "customerName", "customerEmail", rating, comment,
        verified, approved, helpful, "createdAt", "updatedAt"
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, 0, NOW(), NOW()
      )
      RETURNING *
    `, [
      uuidv4(),
      productId,
      name,
      email,
      rating,
      comment,
      !!purchase, // verified if customer has purchased
      true, // auto-approve for now (can add moderation later)
    ])

    return NextResponse.json(review)
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 })
  }
}
