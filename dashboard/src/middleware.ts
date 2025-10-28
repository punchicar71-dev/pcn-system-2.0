import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  // Only handle auth on specific routes
  const pathname = req.nextUrl.pathname
  
  console.log('Middleware checking path:', pathname)
  
  // Skip middleware for API routes and static files
  if (pathname.startsWith('/api/') || pathname.startsWith('/_next/') || pathname === '/favicon.ico') {
    return NextResponse.next()
  }

  try {
    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req, res })

    const {
      data: { session },
    } = await supabase.auth.getSession()

    console.log('Session exists:', !!session, 'for path:', pathname)

    // If user is not signed in and trying to access protected dashboard routes, redirect to login
    if (!session && pathname.startsWith('/dashboard')) {
      console.log('No session, redirecting to login from dashboard')
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = '/login'
      return NextResponse.redirect(redirectUrl)
    }

    // If user is not signed in and trying to access other protected routes, redirect to login
    if (!session && (
      pathname.startsWith('/add-vehicle') ||
      pathname.startsWith('/inventory') ||
      pathname.startsWith('/reports') ||
      pathname.startsWith('/sales-transactions') ||
      pathname.startsWith('/sell-vehicle') ||
      pathname.startsWith('/settings') ||
      pathname.startsWith('/user-management')
    )) {
      console.log('No session, redirecting to login from protected route')
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = '/login'
      return NextResponse.redirect(redirectUrl)
    }

    // If user is signed in and trying to access root (/), redirect to dashboard
    if (session && pathname === '/') {
      console.log('Session exists, redirecting from root to dashboard')
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = '/dashboard'
      return NextResponse.redirect(redirectUrl)
    }

    // If user is signed in and trying to access login, redirect to dashboard
    if (session && pathname === '/login') {
      console.log('Session exists, redirecting from login to dashboard')
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = '/dashboard'
      return NextResponse.redirect(redirectUrl)
    }

    return res
  } catch (error) {
    console.error('Middleware error:', error)
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    '/(dashboard)/:path*',
    '/add-vehicle/:path*',
    '/inventory/:path*',
    '/reports/:path*',
    '/sales-transactions/:path*',
    '/sell-vehicle/:path*',
    '/settings/:path*',
    '/user-management/:path*',
    '/'
  ],
}
