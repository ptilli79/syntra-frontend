import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || ''

  // Redirect mta-sts subdomain root to main site (but allow .well-known paths)
  if (host.startsWith('mta-sts.') && !request.nextUrl.pathname.startsWith('/.well-known')) {
    return NextResponse.redirect('https://syntra.build', { status: 301 })
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Match all paths except static files and api routes
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
