import { NextRequest, NextResponse } from 'next/server'

const ALLOWED_HOSTS = [
  'avito.st',           // Авито CDN (img.avito.st, NN.img.avito.st)
  'pexels.com',
  'images.pexels.com',
  'upload.wikimedia.org', // Wikimedia Commons
  'inaturalist.org',    // iNaturalist CDN
]

function isAllowed(url: string): boolean {
  try {
    const { hostname } = new URL(url)
    return ALLOWED_HOSTS.some(h => hostname.endsWith(h))
  } catch {
    return false
  }
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url')
  if (!url || !isAllowed(url)) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  try {
    const upstream = await fetch(url, {
      headers: { 'Referer': 'https://www.avito.ru/' },
      signal: AbortSignal.timeout(10000),
    })
    if (!upstream.ok) {
      return new NextResponse('Upstream error', { status: upstream.status })
    }

    const contentType = upstream.headers.get('content-type') ?? 'image/jpeg'
    const body = await upstream.arrayBuffer()

    return new NextResponse(body, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': 'attachment',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch {
    return new NextResponse('Fetch failed', { status: 502 })
  }
}
