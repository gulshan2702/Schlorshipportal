import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  console.log('Middleware running for path:', request.nextUrl.pathname)
  
  // Create response object
  const res = NextResponse.next()

  // Add CORS headers
  res.headers.set('Access-Control-Allow-Origin', '*')
  res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    return res
  }
  
  try {
    const supabase = createMiddlewareClient({ req: request, res })
    
    // Try to get the session
    const {
      data: { session },
    } = await supabase.auth.getSession()

    const isAuthRoute = request.nextUrl.pathname === '/login' || 
                       request.nextUrl.pathname === '/signup' ||
                       request.nextUrl.pathname.startsWith('/auth/')
    
    const isApiRoute = request.nextUrl.pathname.startsWith('/api/')
    const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard') ||
                            request.nextUrl.pathname.startsWith('/scholarships') ||
                            request.nextUrl.pathname === '/profile'

    console.log({
      path: request.nextUrl.pathname,
      isAuthRoute,
      isProtectedRoute,
      hasSession: !!session
    })

    // Allow API routes to handle their own auth
    if (isApiRoute) {
      return res
    }

    // Redirect authenticated users away from auth routes
    if (session && isAuthRoute) {
      const redirectUrl = new URL('/dashboard', request.url)
      return NextResponse.redirect(redirectUrl)
    }

    // Redirect unauthenticated users to login from protected routes
    if (!session && isProtectedRoute) {
      const redirectUrl = new URL('/login', request.url)
      redirectUrl.searchParams.set('returnTo', request.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    return res
  } catch (e) {
    console.error('Middleware error:', e)
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 