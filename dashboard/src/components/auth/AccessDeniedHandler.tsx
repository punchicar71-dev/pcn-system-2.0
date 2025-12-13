'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'

/**
 * Component that handles access denied notifications
 * Shows a toast when user is redirected due to insufficient permissions
 */
export function AccessDeniedHandler() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Check if user was redirected due to access denial
    if (searchParams.get('access') === 'denied') {
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to access that page. Please contact an administrator if you need access.',
        variant: 'destructive',
      })

      // Clean up the URL parameter
      const url = new URL(window.location.href)
      url.searchParams.delete('access')
      router.replace(url.pathname, { scroll: false })
    }
  }, [searchParams, router, toast])

  return null // This component doesn't render anything
}
