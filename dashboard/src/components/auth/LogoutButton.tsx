'use client'

import { LogOut, X } from 'lucide-react'
import { useState } from 'react'

interface LogoutButtonProps {
  variant?: 'default' | 'ghost' | 'sidebar'
  className?: string
}

export default function LogoutButton({ variant = 'default', className = '' }: LogoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)

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
      setShowModal(false)
    }
  }

  const handleOpenModal = () => {
    setShowModal(true)
  }

  const handleCancel = () => {
    setShowModal(false)
  }

  const handleConfirmLogout = () => {
    handleLogout()
  }

  const variants = {
    default: 'px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center gap-2',
    ghost: 'px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors flex items-center gap-2',
    sidebar: 'w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-md transition-colors flex items-center gap-2'
  }

  return (
    <>
      <button
        onClick={handleOpenModal}
        disabled={isLoading}
        className={`${variants[variant]} ${className} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <LogOut className="w-4 h-4" />
        <span>{isLoading ? 'Logging out...' : 'Logout'}</span>
      </button>

      {/* Logout Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8 relative animate-in fade-in zoom-in duration-200">
            {/* Close Button */}
            <button
              onClick={handleCancel}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isLoading}
            >
              <X className="w-6 h-6" />
            </button>

            {/* Title */}
            <h2 className="text-[20px] font-bold text-gray-900 mb-4">
              Log Out
            </h2>

            {/* Message */}
            <p className="text-gray-600 text-[14px] mb-8">
              Are you sure you want to log out of your account?
            </p>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleCancel}
                disabled={isLoading}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLogout}
                disabled={isLoading}
                className="flex-1 px-6 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg shadow-lg shadow-red-500/30"
              >
                {isLoading ? 'Logging out...' : 'Logout'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
