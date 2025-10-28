'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase-client'

interface AuthContextType {
  session: Session | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  loading: true,
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check current session
    const checkSession = async () => {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession()
      setSession(currentSession)
      setLoading(false)
    }

    checkSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, newSession) => {
      setSession(newSession)
    })

    return () => subscription?.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ session, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
