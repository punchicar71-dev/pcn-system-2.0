'use client'

import { LogOut } from 'lucide-react'
import { useState } from 'react'

interface LogoutButtonProps {
  variant?: 'default' | 'ghost' | 'sidebar'
  className?: string
}

export default function LogoutButton({ variant = 'default', className = '' }: LogoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleLogout = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Logout failed')
      }

      // Clear browser storage
      localStorage.clear()
      sessionStorage.clear()
      
      // Clear any cookies (redundant but ensures complete cleanup)
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
      
      // Wait briefly for cookies to be cleared
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // Force full page reload and navigate to login page
      // This ensures middleware re-evaluates the session
      window.location.replace('/')
    } catch (error) {
      console.error('Error logging out:', error)
      alert(`Logout failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setIsLoading(false)
    }
  }

  const variants = {
    default: 'px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center gap-2',
    ghost: 'px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors flex items-center gap-2',
    sidebar: 'w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-md transition-colors flex items-center gap-2'
  }

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className={`${variants[variant]} ${className} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <LogOut className="w-4 h-4" />
      <span>{isLoading ? 'Logging out...' : 'Logout'}</span>
    </button>
  )
}
