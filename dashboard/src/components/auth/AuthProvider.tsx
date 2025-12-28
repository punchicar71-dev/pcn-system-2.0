'use client'

/**
 * Auth Provider
 * 
 * MIGRATING: Supabase Auth has been removed.
 * This is a placeholder provider that will be replaced with Better Auth.
 * 
 * TODO: Replace with Better Auth provider in Step 2.
 */

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

// Placeholder user type - will be replaced with Better Auth User type
interface User {
  id: string
  email: string
  username?: string
  firstName?: string
  lastName?: string
  accessLevel?: string
  role?: string
  status?: string
}

// Session type - will be replaced with Better Auth Session type
interface Session {
  user: User
  expiresAt?: Date
}

interface AuthContextType {
  session: Session | null
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  // Placeholder methods - will be implemented with Better Auth
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  isAuthenticated: false,
  signIn: async () => ({ error: 'Not implemented' }),
  signOut: async () => {},
  refreshSession: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing session (will be replaced with Better Auth)
    const checkSession = async () => {
      try {
        // TODO: Replace with Better Auth session check
        // const { data } = await authClient.getSession()
        // setSession(data.session)
        
        // For now, check if there's a session cookie
        const hasSessionCookie = document.cookie.includes('pcn-dashboard.session_token')
        
        if (hasSessionCookie) {
          // Fetch session from API
          const response = await fetch('/api/auth/session')
          if (response.ok) {
            const data = await response.json()
            if (data.user) {
              setSession({ user: data.user })
            }
          }
        }
      } catch (error) {
        console.error('Error checking session:', error)
      } finally {
        setLoading(false)
      }
    }

    checkSession()
  }, [])

  // Placeholder sign in - will be replaced with Better Auth
  const signIn = async (email: string, password: string) => {
    try {
      // TODO: Replace with Better Auth signIn
      // const result = await authClient.signIn.email({ email, password })
      // if (result.error) return { error: result.error.message }
      // setSession(result.data.session)
      // return {}
      
      return { error: 'Better Auth not yet integrated. Use login page.' }
    } catch (error) {
      return { error: 'Sign in failed' }
    }
  }

  // Placeholder sign out - will be replaced with Better Auth
  const signOut = async () => {
    try {
      // TODO: Replace with Better Auth signOut
      // await authClient.signOut()
      
      // Call logout API
      await fetch('/api/auth/logout', { method: 'POST' })
      setSession(null)
      window.location.href = '/login'
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  // Refresh session
  const refreshSession = async () => {
    try {
      const response = await fetch('/api/auth/session')
      if (response.ok) {
        const data = await response.json()
        if (data.user) {
          setSession({ user: data.user })
        } else {
          setSession(null)
        }
      }
    } catch (error) {
      console.error('Error refreshing session:', error)
    }
  }

  const value: AuthContextType = {
    session,
    user: session?.user || null,
    loading,
    isAuthenticated: !!session?.user,
    signIn,
    signOut,
    refreshSession,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
