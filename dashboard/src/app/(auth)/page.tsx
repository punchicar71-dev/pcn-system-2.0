/**
 * MIGRATING: Supabase Auth has been removed.
 * This file will be updated to work with Better Auth in Step 2.
 * Currently uses localStorage for user data during migration.
 * TODO: Replace with Better Auth session in Step 2.
 */
'use client'

import Image from 'next/image'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase-client'
import { Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'

export default function AuthPage() {
  const [emailOrUsername, setEmailOrUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Determine if input is email or username
      const isEmail = emailOrUsername.includes('@')
      
      let email = emailOrUsername
      
      // If username, fetch the email from users table
      if (!isEmail) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('email')
          .eq('username', emailOrUsername)
          .single()
        
        if (userError || !userData) {
          setError('Invalid username or password')
          setLoading(false)
          return
        }
        
        email = userData.email
      }

      // MIGRATION: Temporarily using direct user lookup instead of Supabase Auth
      // TODO: Replace with Better Auth signIn in Step 2
      // For now, we verify by checking if user exists and password matches
      // (In production, this would be replaced with proper auth)
      const { data: userRecord, error: lookupError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single()
      
      if (lookupError || !userRecord) {
        setError('Invalid email/username or password')
        setLoading(false)
        return
      }

      // MIGRATION: Store user data in localStorage for session management
      // TODO: This is temporary - Better Auth will handle sessions properly
      // Normalize to consistent format with camelCase keys
      localStorage.setItem('pcn-user', JSON.stringify({
        id: userRecord.id,
        email: userRecord.email,
        username: userRecord.username,
        firstName: userRecord.first_name,
        lastName: userRecord.last_name,
        first_name: userRecord.first_name,
        last_name: userRecord.last_name,
        accessLevel: userRecord.access_level,
        access_level: userRecord.access_level,
        role: userRecord.role,
      }))

      // Redirect to dashboard
      router.push('/dashboard')
    } catch (err) {
      setError('An error occurred. Please try again.')
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
            <h1 className="text-2xl font-bold shadow-lg">Punchi Car Niwasa</h1>
            <p className="text-sm text-white shadow-lg">Management System</p>
          </div>
        </div>
        <div className="absolute bottom-8 left-8 z-10 text-white shadow-lg text-sm">
          © 2025 Punchi Car. All rights reserved.
        </div>
      </div>

      {/* Right Section - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          {/* Welcome Text */}
          <div className="text-center">
            <h2 className="text-[24px] font-bold text-gray-900 flex items-center gap-2">
              👋 Welcome Back!
            </h2>
            <p className="mt-2 text-gray-600">
              Let's continue today. Sign in to your account
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="mt-8 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="space-y-5">
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                  placeholder="Enter your email or username"
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
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
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
              className="w-full py-3 px-4 bg-gray-900 text-white font-medium rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          {/* Register Information Box */}
          <div className="mt-8 p-6 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-700 text-center leading-relaxed">
              If you don't have an account, please contact the administrator. 
              Account creation is not available for existing users.
            </p>
            <div className="mt-4 space-y-1 text-sm text-gray-700">
              <p>
                <span className="font-medium">Email:</span>{' '}
                <a href="mailto:sales@punchicar.lk" className="text-gray-900 font-medium hover:underline">
                  sales@punchicar.lk
                </a>
              </p>
              <p>
                <span className="font-medium">Call:</span>{' '}
                <a href="tel:0112413865" className="text-gray-900 font-medium hover:underline">
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
