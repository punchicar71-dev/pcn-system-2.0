'use client'

/**
 * Login Page
 * 
 * MIGRATING: Supabase Auth has been removed.
 * This page will be updated to use Better Auth in Step 2.
 * 
 * Currently, this page uses a temporary login mechanism that validates
 * against the users table with password_hash.
 * 
 * TODO: Replace with Better Auth signIn in Step 2.
 */

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase-client'
import { Eye, EyeOff } from 'lucide-react'
import * as crypto from 'crypto'

// Temporary password verification (will be replaced by Better Auth)
function verifyPassword(password: string, hash: string): boolean {
  const inputHash = crypto.createHash('sha256').update(password).digest('hex')
  return inputHash === hash
}

export default function LoginPage() {
  const [emailOrUsername, setEmailOrUsername] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  // Helper function to detect if input is a phone number
  const isPhoneNumber = (input: string): boolean => {
    const cleaned = input.replace(/\D/g, '')
    // Sri Lankan mobile: starts with 0 and has 10 digits, or starts with 94 and has 11 digits
    if (cleaned.startsWith('0') && cleaned.length === 10 && cleaned.startsWith('07')) {
      return true
    }
    if (cleaned.startsWith('94') && cleaned.length === 11 && cleaned.substring(2).startsWith('7')) {
      return true
    }
    // Also handle if just 9 digits starting with 7 (missing leading 0)
    if (cleaned.startsWith('7') && cleaned.length === 9) {
      return true
    }
    return false
  }

  // Helper function to get all possible phone number formats for database lookup
  const getPhoneFormatsForLookup = (input: string): string[] => {
    let cleaned = input.replace(/\D/g, '')
    const formats: string[] = []
    
    // If starts with 0, we have 10 digit local format (e.g., 0778895688)
    if (cleaned.startsWith('0') && cleaned.length === 10) {
      formats.push(cleaned) // 0778895688
      formats.push('94' + cleaned.substring(1)) // 94778895688
      formats.push('+94' + cleaned.substring(1)) // +94778895688
    }
    // If starts with 94, we have international format without +
    else if (cleaned.startsWith('94') && cleaned.length === 11) {
      formats.push(cleaned) // 94778895688
      formats.push('0' + cleaned.substring(2)) // 0778895688
      formats.push('+' + cleaned) // +94778895688
    }
    // If starts with 7 and has 9 digits (missing leading 0)
    else if (cleaned.startsWith('7') && cleaned.length === 9) {
      formats.push('0' + cleaned) // 0778895688
      formats.push('94' + cleaned) // 94778895688
      formats.push('+94' + cleaned) // +94778895688
    }
    
    return formats
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      console.log('Login attempt with:', emailOrUsername)
      
      // Determine input type: email, phone number, or username
      const isEmail = emailOrUsername.includes('@')
      const isPhone = isPhoneNumber(emailOrUsername)
      
      let userData = null
      let userError = null
      
      if (isEmail) {
        // Look up by email
        const result = await supabase
          .from('users')
          .select('id, email, username, mobile_number, password_hash, first_name, last_name, access_level, role, status')
          .eq('email', emailOrUsername)
          .single()
        userData = result.data
        userError = result.error
      } else if (isPhone) {
        // Try multiple phone number formats
        const phoneFormats = getPhoneFormatsForLookup(emailOrUsername)
        console.log('Searching by mobile_number formats:', phoneFormats)
        
        // Use 'in' filter to check all possible formats at once
        const result = await supabase
          .from('users')
          .select('id, email, username, mobile_number, password_hash, first_name, last_name, access_level, role, status')
          .in('mobile_number', phoneFormats)
          .single()
        userData = result.data
        userError = result.error
      } else {
        // Look up by username
        const result = await supabase
          .from('users')
          .select('id, email, username, mobile_number, password_hash, first_name, last_name, access_level, role, status')
          .eq('username', emailOrUsername)
          .single()
        userData = result.data
        userError = result.error
      }
      
      if (userError || !userData) {
        console.error('User lookup error:', userError)
        setError('Invalid username/email or password')
        setLoading(false)
        return
      }
      
      // Check if user is active
      if (userData.status?.toLowerCase() !== 'active') {
        setError('Your account is not active. Please contact an administrator.')
        setLoading(false)
        return
      }
      
      // Verify password (temporary - will be replaced by Better Auth)
      // TODO: Better Auth will handle password verification properly
      if (!userData.password_hash) {
        // If no password_hash, the user was created with Supabase Auth
        // They need to reset their password
        setError('Please reset your password to continue. Your account needs to be migrated.')
        setLoading(false)
        return
      }
      
      // Simple hash verification (temporary)
      const passwordHash = await fetch('/api/auth/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, hash: userData.password_hash })
      }).then(r => r.json()).catch(() => ({ valid: false }))
      
      if (!passwordHash.valid) {
        setError('Invalid username/email or password')
        setLoading(false)
        return
      }

      console.log('Login successful! User:', userData.email)
      
      // Set a temporary session cookie (will be replaced by Better Auth)
      // TODO: Replace with Better Auth session management
      document.cookie = `pcn-dashboard.session_token=${userData.id}; path=/; max-age=${60 * 60 * 24 * 7}` // 7 days
      
      // Store user info in localStorage for client-side access
      localStorage.setItem('pcn-user', JSON.stringify({
        id: userData.id,
        email: userData.email,
        username: userData.username,
        firstName: userData.first_name,
        lastName: userData.last_name,
        accessLevel: userData.access_level,
        role: userData.role,
      }))
      
      // Short delay to allow cookies to be set
      await new Promise(resolve => setTimeout(resolve, 300))
      
      console.log('Redirecting to dashboard...')
      router.push('/dashboard')
      router.refresh()
      
    } catch (err) {
      console.error('Login error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      
      if (errorMessage.includes('fetch') || errorMessage.includes('Network')) {
        setError('Network error. Please check your internet connection and try again.')
      } else {
        setError('An unexpected error occurred. Please try again.')
      }
      
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Section - Full Cover Image */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-gray-900 to-gray-800">
        <Image
          src="/login_cover.png"
          alt="Punchi Car Niwasa"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute top-8 left-8 z-10 flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="Logo"
            width={60}
            height={60}
            className="rounded-full"
          />
          <div className="text-white">
            <h1 className="text-2xl font-bold">Punchi Car Niwasa</h1>
            <p className="text-sm text-gray-300">Management System</p>
          </div>
        </div>
        <div className="absolute bottom-8 left-8 z-10 text-white text-sm">
          © 2025 Punchi Car. All rights reserved.
        </div>
      </div>

      {/* Right Section - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          {/* Welcome Text */}
          <div className="text-center">
            <h2 className="text-[24px] font-bold text-gray-900 flex justify-center items-center gap-4">
              👋 Welcome Back!
            </h2>
            <p className="mt-2 text-gray-600">
              Let's continue today. Sign in to your account
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="mt-12 space-y-6  p-6 rounded-[12px] bg-gray-100">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="space-y-5 ">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address or Username
                </label>
                <input
                  id="email"
                  name="email"
                  type="text"
                  required
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                  placeholder="Enter email, username, or mobile number"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Remember Me & Forget Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-gray-900 focus:ring-gray-900 border-gray-300 rounded cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 cursor-pointer">
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <Link href="/forgot-password" className="text-red-500 hover:text-red-600 font-medium">
                  Forget Password?
                </Link>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
            
            {/* Clear Cache Button - shown when there's a session error */}
            {error.includes('Session') || error.includes('refresh_token') || error.includes('cache') ? (
              <button
                type="button"
                onClick={() => window.location.href = '/clear-cookies'}
                className="w-full py-3 px-4 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600 transition-colors"
              >
                Clear Cache & Retry
              </button>
            ) : null}
          </form>

          {/* Register Information Box */}
          <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800 text-start leading-relaxed">
              If you don't have an account, please contact the administrator. 
              Account creation is not available for existing users.
            </p>
            <div className="mt-4 space-y-1 text-sm text-blue-800">
              <p>
                <span className="font-medium">Email:</span>{' '}
                <a href="mailto:admin@punchicar.com" className="text-blue-800 font-semibold hover:underline">
                  admin@punchicar.com
                </a>
              </p>
              <p>
                <span className="font-medium">Call:</span>{' '}
                <a href="tel:0112413865" className="text-blue-800 font-semibold hover:underline">
                  0112 413 865
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
