import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

// Migrate old image URLs to use API route
export async function POST(request: NextRequest) {
  try {
    // Security: Add authentication check here in production
    const { authorization } = Object.fromEntries(request.headers)

    // Update product_images URLs
    const result = await query(`
      UPDATE smartloja.product_images
      SET url = REPLACE(url, '/uploads/', '/api/uploads/')
      WHERE url LIKE '/uploads/%'
      AND url NOT LIKE '/api/uploads/%'
      RETURNING id, url
    `)

    return NextResponse.json({
      success: true,
      message: 'Image URLs migrated successfully',
      updated: result.length,
      urls: result,
    })
  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json(
      { error: 'Migration failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// GET endpoint to check current URLs
export async function GET(request: NextRequest) {
  try {
    const oldUrls = await query(`
      SELECT id, "productId", url
      FROM smartloja.product_images
      WHERE url LIKE '/uploads/%'
      AND url NOT LIKE '/api/uploads/%'
      LIMIT 50
    `)

    const newUrls = await query(`
      SELECT id, "productId", url
      FROM smartloja.product_images
      WHERE url LIKE '/api/uploads/%'
      LIMIT 50
    `)

    return NextResponse.json({
      oldUrls: {
        count: oldUrls.length,
        samples: oldUrls,
      },
      newUrls: {
        count: newUrls.length,
        samples: newUrls,
      },
    })
  } catch (error) {
    console.error('Check error:', error)
    return NextResponse.json(
      { error: 'Check failed' },
      { status: 500 }
    )
  }
}
