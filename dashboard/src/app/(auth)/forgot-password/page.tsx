'use client'

import Image from 'next/image'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Phone } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [otpMethod, setOtpMethod] = useState<'email' | 'mobile'>('email')
  const [email, setEmail] = useState('')
  const [mobileNumber, setMobileNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  // Validate Sri Lankan mobile number
  const isValidMobile = (phone: string): boolean => {
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.startsWith('0') && cleaned.length === 10 && cleaned.startsWith('07')) {
      return true
    }
    if (cleaned.startsWith('94') && cleaned.length === 11 && cleaned.substring(2).startsWith('7')) {
      return true
    }
    return false
  }

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Validate input based on method
      if (otpMethod === 'mobile' && !isValidMobile(mobileNumber)) {
        setError('Please enter a valid Sri Lankan mobile number')
        setLoading(false)
        return
      }

      // Send OTP via selected method
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(
          otpMethod === 'email' 
            ? { email, method: 'email' }
            : { mobileNumber, method: 'mobile' }
        ),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to send OTP')
        setLoading(false)
        return
      }

      // If devMode, show the OTP in an alert (for development testing)
      if (data.devMode && data.devOtp) {
        alert(`🔐 Development Mode\n\nYour OTP code is: ${data.devOtp}\n\nThis will not appear in production.`)
      }

      // Navigate to OTP verification page with appropriate params
      if (otpMethod === 'email') {
        router.push(`/verify-otp?email=${encodeURIComponent(email)}&method=email`)
      } else {
        router.push(`/verify-otp?mobile=${encodeURIComponent(mobileNumber)}&method=mobile`)
      }
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
            <h1 className="text-2xl font-bold">Punchi Car Niwasa</h1>
            <p className="text-sm text-gray-300">Management System</p>
          </div>
        </div>
        <div className="absolute bottom-8 left-8 z-10 text-white text-sm">
          © 2025 Punchi Car. All rights reserved.
        </div>
      </div>

      {/* Right Section - Forgot Password Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          {/* Title */}
          <div className="text-center">
            <h2 className="text-[24px] font-bold text-gray-900">
              Forget Password
            </h2>
            <p className="mt-2 text-gray-600">
              Choose how you want to receive your password reset OTP.
            </p>
          </div>

          {/* Method Selection Tabs */}
          <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
            <button
              type="button"
              onClick={() => setOtpMethod('email')}
              className={`flex-1 py-3 px-4 rounded-md font-medium transition-all flex items-center justify-center gap-2 ${
                otpMethod === 'email'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Mail className="w-4 h-4" />
              Email
            </button>
            <button
              type="button"
              onClick={() => setOtpMethod('mobile')}
              className={`flex-1 py-3 px-4 rounded-md font-medium transition-all flex items-center justify-center gap-2 ${
                otpMethod === 'mobile'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Phone className="w-4 h-4" />
              Mobile
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSendOTP} className="mt-8 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            {otpMethod === 'email' ? (
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                    placeholder="Enter your email address"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-2">
                  Mobile Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="mobile"
                    name="mobile"
                    type="tel"
                    required
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                    placeholder="Enter your mobile number (e.g., 0771234567)"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Sri Lankan mobile numbers only (07X XXX XXXX)
                </p>
              </div>
            )}

            {/* Send OTP Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gray-900 text-white font-medium rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : `Send OTP to ${otpMethod === 'email' ? 'Email' : 'Mobile'}`}
            </button>

            {/* Back to Login Button */}
            <Link
              href="/login"
              className="w-full py-3 px-4 bg-white text-gray-900 font-medium rounded-md border-2 border-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors flex items-center justify-center"
            >
              Back to Login
            </Link>
          </form>

          {/* Contact Information Box */}
          <div className="mt-8 p-6 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-700 text-center leading-relaxed">
              If you don't have an account, please contact the administrator. 
              Account creation is not available for existing users.
            </p>
            <div className="mt-4 space-y-1 text-sm text-gray-700">
              <p>
                <span className="font-medium">Email:</span>{' '}
                <a href="mailto:admin@punchicar.com" className="text-gray-900 font-medium hover:underline">
                  admin@punchicar.com
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
