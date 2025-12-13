import { updateSession, getUserRole } from '@/lib/supabase-middleware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that are restricted to admin users only
const ADMIN_ONLY_ROUTES = ['/reports', '/user-management']

// Check if path matches any admin-only route
function isAdminOnlyRoute(pathname: string): boolean {
  return ADMIN_ONLY_ROUTES.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  )
}

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname
  
  console.log('Middleware checking path:', pathname)
  
  // Skip middleware for API routes, static files, and public assets
  if (
    pathname.startsWith('/api/') || 
    pathname.startsWith('/_next/') || 
    pathname === '/favicon.ico' ||
    pathname.startsWith('/documents/') ||
    pathname.startsWith('/uploads/')
  ) {
    return NextResponse.next()
  }

  try {
    // Update session and get user
    const { supabaseResponse, user, supabase } = await updateSession(req)

    console.log('User authenticated:', !!user, 'for path:', pathname)

    // If user is not signed in and trying to access protected routes, redirect to login
    if (!user && (
      pathname.startsWith('/dashboard') ||
      pathname.startsWith('/add-vehicle') ||
      pathname.startsWith('/inventory') ||
      pathname.startsWith('/reports') ||
      pathname.startsWith('/sales-transactions') ||
      pathname.startsWith('/sell-vehicle') ||
      pathname.startsWith('/settings') ||
      pathname.startsWith('/user-management')
    )) {
      console.log('No user, redirecting to login from protected route')
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = '/login'
      return NextResponse.redirect(redirectUrl)
    }

    // Role-based access control for admin-only routes
    if (user && isAdminOnlyRoute(pathname)) {
      const userRole = await getUserRole(supabase, user.id)
      console.log('User role for', pathname, ':', userRole)
      
      if (userRole !== 'admin') {
        console.log('Access denied: Editor trying to access admin-only route')
        // Redirect to dashboard with access denied
        const redirectUrl = req.nextUrl.clone()
        redirectUrl.pathname = '/dashboard'
        redirectUrl.searchParams.set('access', 'denied')
        return NextResponse.redirect(redirectUrl)
      }
    }

    // If user is signed in and trying to access root (/), redirect to dashboard
    if (user && pathname === '/') {
      console.log('User exists, redirecting from root to dashboard')
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = '/dashboard'
      return NextResponse.redirect(redirectUrl)
    }

    // If user is signed in and trying to access login, redirect to dashboard
    if (user && pathname === '/login') {
      console.log('User exists, redirecting from login to dashboard')
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = '/dashboard'
      return NextResponse.redirect(redirectUrl)
    }

    return supabaseResponse
  } catch (error) {
    console.error('Middleware error:', error)
    // Return a fresh response on error
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
