'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { 
  LayoutDashboard, 
  PlusCircle, 
  Package, 
  DollarSign, 
  FileText, 
  BarChart3, 
  Users, 
  Settings,
  Bell,
  LogOut,
  X
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Add Vehicle', href: '/add-vehicle', icon: PlusCircle },
  { name: 'Inventory', href: '/inventory', icon: Package },
  { name: 'Sell Vehicle', href: '/sell-vehicle', icon: DollarSign },
  { name: 'Sales Transactions', href: '/sales-transactions', icon: FileText },
  { name: 'Reports & Analytics', href: '/reports', icon: BarChart3 },
  { name: 'User Management', href: '/user-management', icon: Users },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
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
      setIsLoggingOut(false)
      setShowLogoutModal(false)
    }
  }

  const handleOpenLogoutModal = () => {
    setShowLogoutModal(true)
  }

  const handleCancelLogout = () => {
    setShowLogoutModal(false)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8 relative animate-in fade-in zoom-in duration-200">
            {/* Close Button */}
            <button
              onClick={handleCancelLogout}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isLoggingOut}
            >
              <X className="w-6 h-6" />
            </button>

            {/* Title */}
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Log Out
            </h2>

            {/* Message */}
            <p className="text-gray-600 text-lg mb-8">
              Are you sure you want to log out of your account?
            </p>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleCancelLogout}
                disabled={isLoggingOut}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex-1 px-6 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg shadow-lg shadow-red-500/30"
              >
                {isLoggingOut ? 'Logging out...' : 'Logout'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar - 260px width */}
      <aside className="fixed inset-y-0 left-0 w-[260px] pt-3 bg-white border-r">
        <div className="flex flex-col h-full">
          {/* Logo Section - 50px height */}
          <div className="h-[50px] flex items-center px-5 ">
            <Image 
              src="/logo.png" 
              alt="Punchi Car Niwasa" 
              width={40} 
              height={40}
              className="mr-3"
            />
            <div>
              <h1 className="text-sm font-bold text-gray-800 leading-tight">Punchi Car Niwasa</h1>
              <p className="text-[10px] text-gray-500">Management System</p>
            </div>
          </div>

          {/* Navigation - Scrollable area */}
          <nav className="flex-1 overflow-y-auto py-5">
            <ul className="space-y-5 px-5">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="flex items-center gap-3 px-3 py-2 text-[16px] text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    <span className="leading-tight">{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer Section - margin 20px */}
          <div className="border-t px-5 py-4 mb-5">
            <div className="text-[10px] text-gray-400">
              <p>Powered By Aerotop.com</p>
              <p>Application Version 1.0.0</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content - offset by sidebar width */}
      <main className="ml-[260px]">
        {/* Header - 50px height */}
        <header className="bg-white border-b h-[50px] flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="flex items-center gap-4">
          </div>
          
          {/* Header Right Side */}
          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <button className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            
            {/* User Profile */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-sm">
                R
              </div>
              <span className="text-sm font-medium text-gray-700">Rashmina</span>
              <button 
                onClick={handleOpenLogoutModal}
                disabled={isLoggingOut}
                className={`p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ${isLoggingOut ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={isLoggingOut ? 'Logging out...' : 'Logout'}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Page content - Full height body */}
        <div className="min-h-[calc(100vh-50px)] ">
          {children}
        </div>
      </main>
    </div>
  )
}
