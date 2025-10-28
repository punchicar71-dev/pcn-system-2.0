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
  LogOut
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
    }
  }

  return (
    <div className="min-h-screen bg-white">
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
                onClick={handleLogout}
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
