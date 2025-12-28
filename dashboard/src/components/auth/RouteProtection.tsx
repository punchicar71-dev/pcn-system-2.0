'use client'

/**
 * Route Protection Component
 * 
 * Wraps pages that require specific roles.
 * Redirects unauthorized users to the dashboard with an access denied message.
 */

import { useEffect, useState, ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useRoleAccess } from '@/hooks/useRoleAccess'
import { Shield, AlertTriangle } from 'lucide-react'

interface RouteProtectionProps {
  children: ReactNode
  /** If true, only admins can access this page */
  adminOnly?: boolean
  /** Custom redirect path (defaults to /dashboard) */
  redirectTo?: string
  /** Custom fallback component while checking permissions */
  loadingFallback?: ReactNode
}

/**
 * Component that protects routes based on user role
 * Use this to wrap entire pages that need role-based access control
 * 
 * @example
 * ```tsx
 * <RouteProtection adminOnly>
 *   <UserManagementPage />
 * </RouteProtection>
 * ```
 */
export function RouteProtection({
  children,
  adminOnly = false,
  redirectTo = '/dashboard',
  loadingFallback
}: RouteProtectionProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAdmin, isEditor, isLoading, canAccessRoute, isPageHidden } = useRoleAccess()
  const [shouldRender, setShouldRender] = useState(false)
  const [showAccessDenied, setShowAccessDenied] = useState(false)

  useEffect(() => {
    if (isLoading) return

    // Check if user can access this route
    const hasAccess = adminOnly ? isAdmin : canAccessRoute(pathname)
    const pageHidden = isPageHidden(pathname)

    if (!hasAccess || pageHidden) {
      // Show access denied briefly before redirect
      setShowAccessDenied(true)
      
      // Redirect after showing message
      const timer = setTimeout(() => {
        router.push(`${redirectTo}?access=denied`)
      }, 1500)

      return () => clearTimeout(timer)
    } else {
      setShouldRender(true)
    }
  }, [isLoading, isAdmin, adminOnly, canAccessRoute, isPageHidden, pathname, router, redirectTo])

  // Show loading state
  if (isLoading) {
    if (loadingFallback) return <>{loadingFallback}</>
    
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-gray-500">Checking permissions...</p>
        </div>
      </div>
    )
  }

  // Show access denied message before redirect
  if (showAccessDenied) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4 p-8 bg-red-50 rounded-xl border border-red-200 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-red-900">Access Denied</h2>
          <p className="text-red-700">
            You don't have permission to access this page.
            {adminOnly && " This page is restricted to administrators only."}
          </p>
          <p className="text-sm text-red-600">Redirecting to dashboard...</p>
        </div>
      </div>
    )
  }

  // Render children if user has access
  if (shouldRender) {
    return <>{children}</>
  }

  return null
}

/**
 * Access Denied Banner Component
 * Shows when user was redirected due to insufficient permissions
 * 
 * Usage: Place at the top of the dashboard or layout
 */
export function AccessDeniedBanner() {
  const [show, setShow] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    // Check if redirected with access denied
    const params = new URLSearchParams(window.location.search)
    if (params.get('access') === 'denied') {
      setShow(true)
      
      // Clean up the URL
      const url = new URL(window.location.href)
      url.searchParams.delete('access')
      window.history.replaceState({}, '', url.toString())

      // Auto-hide after 5 seconds
      const timer = setTimeout(() => setShow(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [pathname])

  if (!show) return null

  return (
    <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-4 rounded-r-lg">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="font-semibold text-amber-800">Access Restricted</h3>
          <p className="text-sm text-amber-700">
            The page you tried to access is restricted to administrators only. 
            If you believe this is an error, please contact your system administrator.
          </p>
        </div>
        <button 
          onClick={() => setShow(false)}
          className="text-amber-600 hover:text-amber-800 ml-auto"
        >
          ×
        </button>
      </div>
    </div>
  )
}
