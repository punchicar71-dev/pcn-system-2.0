/**
 * Middleware
 * 
 * This middleware handles route protection and access control.
 * 
 * NOTE: Supabase Auth has been removed. This middleware is prepared for Better Auth.
 * Currently, it allows all routes through as a placeholder during migration.
 * 
 * Role-based access is enforced at the component level via:
 * - RouteProtection component for admin-only pages
 * - useRoleAccess hook for permission checks
 * - Navigation filtering in the dashboard layout
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that are restricted to admin users only
// These are also protected at the component level for extra security
const ADMIN_ONLY_ROUTES = ['/reports', '/user-management']

// Routes that require authentication
const PROTECTED_ROUTES = [
  '/dashboard',
  '/add-vehicle',
  '/inventory',
  '/reports',
  '/sales-transactions',
  '/sell-vehicle',
  '/settings',
  '/user-management'
]

// Check if path matches any admin-only route
function isAdminOnlyRoute(pathname: string): boolean {
  return ADMIN_ONLY_ROUTES.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  )
}

// Check if path matches any protected route
function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(route => 
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

  // Check for session cookie
  const sessionCookie = req.cookies.get('pcn-dashboard.session_token')?.value
  const hasSession = !!sessionCookie
  
  console.log('Has session cookie:', hasSession, 'for path:', pathname)

  // If no session and trying to access protected routes, redirect to login
  if (!hasSession && isProtectedRoute(pathname)) {
    console.log('No session, redirecting to login from protected route')
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/login'
    redirectUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If has session and trying to access root (/), redirect to dashboard
  if (hasSession && pathname === '/') {
    console.log('Has session, redirecting from root to dashboard')
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/dashboard'
    return NextResponse.redirect(redirectUrl)
  }

  // If has session and trying to access login, redirect to dashboard
  if (hasSession && pathname === '/login') {
    console.log('Has session, redirecting from login to dashboard')
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/dashboard'
    return NextResponse.redirect(redirectUrl)
  }

  // Note: Admin role verification for admin-only routes is handled at the component level
  // using the RouteProtection component. This provides:
  // 1. Better UX with loading states and access denied messages
  // 2. Access to the full user session data
  // 3. More flexible permission checking
  //
  // The RouteProtection component wraps admin-only pages like:
  // - /reports (Reports & Analytics)
  // - /user-management (User Management)

  return NextResponse.next()
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
