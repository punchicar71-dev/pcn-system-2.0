'use client'

import Image from 'next/image'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase-client'

export default function LoginPage() {
  const [emailOrUsername, setEmailOrUsername] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Clear any existing session first to avoid refresh token conflicts
      await supabase.auth.signOut()
      
      console.log('Login attempt with:', emailOrUsername)
      
      // Determine if input is email or username
      const isEmail = emailOrUsername.includes('@')
      
      let email = emailOrUsername
      
      // If username, fetch the email from users table
      if (!isEmail) {
        console.log('Looking up username in database...')
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('email')
          .eq('username', emailOrUsername)
          .single()
        
        if (userError || !userData) {
          console.error('Username lookup error:', userError)
          setError('Invalid username or password')
          setLoading(false)
          return
        }
        
        email = userData.email
        console.log('Found email for username:', email)
      }

      // Sign in with Supabase
      console.log('Attempting to sign in with email:', email)
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      })

      if (signInError) {
        console.error('Sign in error:', signInError)
        setError('Invalid email/username or password')
        setLoading(false)
        return
      }

      console.log('Login successful! Session:', data.session)
      
      // Set session on server side
      console.log('Setting session on server...')
      try {
        const sessionResponse = await fetch('/api/auth/session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            accessToken: data.session.access_token,
            refreshToken: data.session.refresh_token,
          }),
        })

        if (!sessionResponse.ok) {
          console.error('Failed to set session on server')
          setError('Failed to complete login. Please try again.')
          setLoading(false)
          return
        }

        console.log('Session set on server successfully!')
      } catch (fetchError) {
        console.error('Fetch error when setting session:', fetchError)
        setError('Network error. Please check your connection and try again.')
        setLoading(false)
        return
      }
      
      // Short delay then redirect
      await new Promise(resolve => setTimeout(resolve, 500))
      
      console.log('Redirecting to dashboard...')
      // Use window.location.href for a full page load
      window.location.href = '/dashboard'
    } catch (err) {
      console.error('Login error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      
      // Provide user-friendly error messages
      if (errorMessage.includes('fetch')) {
        setError('Network error. Please check your connection and try again.')
      } else if (errorMessage.includes('Invalid login') || errorMessage.includes('Invalid password')) {
        setError('Invalid email/username or password')
      } else if (errorMessage.includes('refresh_token') || errorMessage.includes('Already Used')) {
        setError('Session expired. Please clear your browser cache and try again.')
      } else {
        setError('An error occurred. Please try again.')
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
                  placeholder="Enter your email or username"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                  placeholder="Enter your password"
                />
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
                <a href="#" className="text-red-500 hover:text-red-600 font-medium">
                  Forget Password?
                </a>
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
