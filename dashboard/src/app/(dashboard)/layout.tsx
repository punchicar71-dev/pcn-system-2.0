'use client'

/**
 * Dashboard Layout
 * 
 * MIGRATING: Supabase Auth session checks have been removed.
 * This layout will be updated to work with Better Auth in Step 2.
 * 
 * Currently uses localStorage for user data during migration.
 * TODO: Replace with Better Auth session in Step 2.
 */

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useMemo } from 'react'
import { usePathname, useRouter } from 'next/navigation'
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
  X,
  ChevronDown,
  User,
  Key,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { useSessionHeartbeat } from '@/hooks/useSessionHeartbeat'
import { supabaseClient } from '@/lib/supabase-db'
import { NotificationProvider } from '@/contexts/NotificationContext'
import { NotificationDropdown } from '@/components/notifications/NotificationDropdown'
import { Toaster } from '@/components/ui/toaster'
import { UserProfileModal } from '@/components/profile/UserProfileModal'
import { useRoleAccess } from '@/hooks/useRoleAccess'
import { UserRole } from '@/lib/rbac'
import { AccessDeniedBanner } from '@/components/auth/RouteProtection'

// Navigation items with optional role restrictions
// If allowedRoles is undefined, the item is accessible to all authenticated users
const navigation: Array<{
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  allowedRoles?: UserRole[]
}> = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Add Vehicle', href: '/add-vehicle', icon: PlusCircle },
  { name: 'Inventory', href: '/inventory', icon: Package },
  { name: 'Reserve Vehicle', href: '/reserve-vehicle', icon: DollarSign },
  { name: 'Sales Transactions', href: '/sales-transactions', icon: FileText },
  { name: 'Reports & Analytics', href: '/reports', icon: BarChart3, allowedRoles: ['admin'] },
  { name: 'User Management', href: '/user-management', icon: Users, allowedRoles: ['admin'] },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [greeting, setGreeting] = useState('')
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const pathname = usePathname()
  const router = useRouter()

  // Initialize session heartbeat to track user activity
  useSessionHeartbeat()
  
  // Get role-based access control utilities
  const { hasPermissionFor, shouldShowNavItem, isAdmin, isEditor } = useRoleAccess()
  
  // Filter navigation items based on user's role using shouldShowNavItem
  const filteredNavigation = useMemo(() => {
    return navigation.filter(item => shouldShowNavItem(item.href))
  }, [shouldShowNavItem])

  // Fetch current user data and set greeting
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        // TODO: Replace with Better Auth session check
        // const session = await auth.getSession()
        
        // Temporary: Get user from localStorage during migration
        const storedUser = localStorage.getItem('pcn-user')
        if (storedUser) {
          const userData = JSON.parse(storedUser)
          
          // Fetch full user data from database
          const { data: fullUserData, error } = await supabaseClient
            .from('users')
            .select('*')
            .eq('id', userData.id)
            .single()
          
          if (fullUserData && !error) {
            setCurrentUser(fullUserData)
          } else if (error) {
            console.error('Error fetching user data:', error)
          }
        } else {
          // No user data, redirect to login
          router.push('/login')
        }
      } catch (error) {
        console.error('Error fetching current user:', error)
      }
    }

    // Set greeting based on time of day
    const updateGreeting = () => {
      const hour = new Date().getHours()
      if (hour < 12) {
        setGreeting('Good Morning')
      } else if (hour < 18) {
        setGreeting('Good Afternoon')
      } else {
        setGreeting('Good Evening')
      }
    }

    fetchCurrentUser()
    updateGreeting()
    
    // Update greeting every minute
    const interval = setInterval(updateGreeting, 60000)
    return () => clearInterval(interval)
  }, [router])

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      console.log('Starting logout process...')
      
      // End the session before logging out
      try {
        const storedUser = localStorage.getItem('pcn-user')
        if (storedUser) {
          const userData = JSON.parse(storedUser)
          console.log('Found user, ending user session...')
          const { endUserSession } = await import('@/lib/sessionManager')
          const endSessionResult = await endUserSession(userData.id)
          console.log('End session result:', endSessionResult)
        }
      } catch (sessionError) {
        console.warn('Warning: Could not end user session, continuing with logout:', sessionError)
      }
      
      console.log('Calling logout API...')
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

      console.log('Logout API successful, clearing storage...')
      
      // Clear browser storage
      localStorage.clear()
      sessionStorage.clear()
      
      // Clear any cookies
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
      
      console.log('Waiting for cleanup to complete...')
      await new Promise(resolve => setTimeout(resolve, 300))
      
      console.log('Redirecting to login page...')
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
    <NotificationProvider>
      <div className="min-h-screen bg-white">
        {/* Logout Confirmation Modal */}
        {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
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

      {/* Sidebar - Dynamic width with smooth transition */}
      <aside 
        className={`fixed inset-y-0 z-40 left-0 pt-3 bg-white border-r transition-all duration-300 ease-in-out  ${
          isSidebarCollapsed ? 'w-[80px]' : 'w-[260px]'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section - 50px height */}
          <div className="h-[50px] flex items-center px-5 relative">
            <Image 
              src="/logo.png" 
              alt="Punchi Car Niwasa" 
              width={40} 
              height={40}
              className={`transition-all duration-300 ${isSidebarCollapsed ? 'mr-0' : 'mr-3'}`}
            />
            <div className={`overflow-hidden transition-all duration-300 ${
              isSidebarCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
            }`}>
              <h1 className="text-sm font-bold text-gray-800 leading-tight whitespace-nowrap">Punchi Car Niwasa</h1>
              <p className="text-[10px] text-gray-500 whitespace-nowrap">Management System</p>
            </div>
            
            {/* Toggle Button */}
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className={`absolute ${isSidebarCollapsed ? 'left-1/2 -translate-x-1/2 ml-10' : 'right-2'}  z top-1/2 -translate-y-1/2 w-6 h-6 bg-gray-100 hover:bg-gray-300 rounded-md flex items-center justify-center transition-all duration-300 z-30`}
            >
              {isSidebarCollapsed ? (
                <ChevronRight className="w-4 h-4 text-gray-600" />
              ) : (
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              )}
            </button>
          </div>

          {/* Navigation - Scrollable area (role-filtered) */}
          <nav className="flex-1 overflow-y-auto py-5">
            <ul className={`space-y-5 ${isSidebarCollapsed ? 'px-3' : 'px-5'}`}>
              {filteredNavigation.map((item) => (
                <li 
                  key={item.name}
                  className="relative"
                  onMouseEnter={() => isSidebarCollapsed && setHoveredItem(item.name)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 text-[16px] rounded-lg transition-all duration-200 ${
                      isSidebarCollapsed ? 'justify-center' : ''
                    } ${
                      pathname === item.href 
                        ? 'bg-gray-100 text-gray-900 font-medium' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    <span className={`leading-tight whitespace-nowrap transition-all duration-300 ${
                      isSidebarCollapsed ? 'w-0 opacity-0 overflow-hidden' : 'w-auto opacity-100'
                    }`}>
                      {item.name}
                    </span>
                  </Link>
                  
                  {/* Tooltip for collapsed state */}
                  {isSidebarCollapsed && hoveredItem === item.name && (
                    <div className="fixed left-[80px] z-30 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap shadow-lg animate-in fade-in slide-in-from-left-1 duration-200" style={{ top: `${(document.querySelector(`a[href="${item.href}"]`)?.getBoundingClientRect().top || 0) + (document.querySelector(`a[href="${item.href}"]`)?.getBoundingClientRect().height || 0) / 2 - 16}px` }}>
                      {item.name}
                      <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer Section - margin 20px */}
          <div className={` py-4 mb-2 transition-all duration-300 ${
            isSidebarCollapsed ? 'px-3' : 'px-5'
          }`}>
            <div className={`text-[12px] text-gray-400 transition-all duration-300 ${
              isSidebarCollapsed ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100 h-auto'
            }`}>
              <p></p>
              <p>Application Version 1.2.4</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content - offset by sidebar width with smooth transition */}
      <main className={`transition-all bg-slate-50 duration-300 ease-in-out ${
        isSidebarCollapsed ? 'ml-[80px]' : 'ml-[260px]'
      }`}>
        {/* Header - 50px height */}
        <header className="bg-white border-b h-[50px] z-40 flex items-center justify-between px-6 sticky top-0 ">
          {/* Header Left Side - Greeting */}
          <div className="flex items-center gap-2">
            <span className="text-gray-600 text-[16px]">{greeting}!</span>
            {currentUser && (
              <span className="text-gray-900 text-[16px] font-semibold">
                {currentUser.first_name}
              </span>
            )}
          </div>
          
          {/* Header Right Side */}
          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <NotificationDropdown />
            
            {/* User Profile with Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center gap-3 hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors"
              >
                {/* Avatar or Letter */}
                {currentUser?.profile_picture_url ? (
                  <Image
                    src={currentUser.profile_picture_url}
                    alt={currentUser.first_name}
                    width={32}
                    height={32}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gray-300 flex items-center justify-center text-gray-500 font-semibold text-sm">
                    {currentUser ? currentUser.first_name.charAt(0).toUpperCase() : ''}
                  </div>
                )}
                
                {/* User First Name */}
                {currentUser && (
                  <span className="text-sm font-medium text-gray-700">
                    {currentUser.first_name}
                  </span>
                )}
                
                {/* Dropdown Arrow */}
                <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${showProfileDropdown ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {showProfileDropdown && (
                <>
                  {/* Backdrop to close dropdown */}
                  <div 
                    className="fixed inset-0 z-30" 
                    onClick={() => setShowProfileDropdown(false)}
                  />
                  
                  {/* Dropdown Content */}
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-40">
                    {/* My Profile */}
                    <button
                      onClick={() => {
                        setShowProfileDropdown(false)
                        setShowProfileModal(true)
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      <span className="text-sm font-medium">My Profile</span>
                    </button>
                    
                    
                    {/* Divider */}
                    <div className="my-1 border-t border-gray-200"></div>
                    
                    {/* Logout */}
                    <button
                      onClick={() => {
                        setShowProfileDropdown(false)
                        handleOpenLogoutModal()
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm font-medium">Logout</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page content - Full height body */}
        <div className="min-h-[calc(100vh-50px)] w-auto ">
          {/* Show access denied banner if user was redirected */}
          <div className="px-6 ">
            <AccessDeniedBanner />
          </div>
          {children}
        </div>
      </main>
      
      {/* Toast Notifications */}
      <Toaster />

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        user={currentUser}
      />
    </div>
    </NotificationProvider>
  )
}
