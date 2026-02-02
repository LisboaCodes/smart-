import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'

// Serve uploaded files from public/uploads
export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const filePath = join(process.cwd(), 'public', 'uploads', ...params.path)

    const file = await readFile(filePath)

    // Determine content type based on extension
    const ext = params.path[params.path.length - 1].split('.').pop()?.toLowerCase()
    let contentType = 'application/octet-stream'

    if (ext === 'webp') contentType = 'image/webp'
    else if (ext === 'jpg' || ext === 'jpeg') contentType = 'image/jpeg'
    else if (ext === 'png') contentType = 'image/png'
    else if (ext === 'gif') contentType = 'image/gif'
    else if (ext === 'svg') contentType = 'image/svg+xml'

    return new NextResponse(file, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('Error serving file:', error)
    return new NextResponse('File not found', { status: 404 })
  }
}
