'use client'

import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Mail, Phone } from 'lucide-react'

export default function VerifyOTPPage() {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''
  const mobile = searchParams.get('mobile') || ''
  const method = searchParams.get('method') || (email ? 'email' : 'mobile')
  
  // Refs for input fields
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus()
  }, [])

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(0, 1)
    }

    if (!/^\d*$/.test(value)) {
      return
    }

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').slice(0, 6)
    const newOtp = [...otp]
    
    for (let i = 0; i < pastedData.length; i++) {
      if (/^\d$/.test(pastedData[i])) {
        newOtp[i] = pastedData[i]
      }
    }
    
    setOtp(newOtp)
    
    // Focus the next empty input or the last input
    const nextEmptyIndex = newOtp.findIndex(val => !val)
    if (nextEmptyIndex !== -1) {
      inputRefs.current[nextEmptyIndex]?.focus()
    } else {
      inputRefs.current[5]?.focus()
    }
  }

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault()
    const otpCode = otp.join('')
    
    if (otpCode.length !== 6) {
      setError('Please enter the complete OTP code')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Verify OTP
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(
          method === 'email' 
            ? { email, otp: otpCode, method: 'email' }
            : { mobileNumber: mobile, otp: otpCode, method: 'mobile' }
        ),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Invalid OTP code')
        setLoading(false)
        return
      }

      // Navigate to change password page with token
      router.push(`/change-password?token=${data.token}`)
    } catch (err) {
      setError('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  // Mask email for display (e.g., j***@example.com)
  const maskedEmail = email ? email.replace(/(.{2})(.*)(@.*)/, '$1***$3') : ''
  
  // Mask mobile for display (e.g., 077***4567)
  const maskedMobile = mobile ? mobile.replace(/(\d{3})(\d*)(\d{4})/, '$1***$3') : ''

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

      {/* Right Section - OTP Verification Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          {/* Title */}
          <div className="text-center">
            <h2 className="text-[24px] font-bold text-gray-900">
              Verify OTP Code
            </h2>
            <p className="mt-2 text-gray-600">
              We've sent a 6-digit OTP code to your {method === 'email' ? 'email address' : 'mobile number'}.
            </p>
            {method === 'email' && email && (
              <div className="mt-3 flex items-center justify-center gap-2 text-gray-700">
                <Mail className="w-4 h-4" />
                <span className="font-medium">{maskedEmail}</span>
              </div>
            )}
            {method === 'mobile' && mobile && (
              <div className="mt-3 flex items-center justify-center gap-2 text-gray-700">
                <Phone className="w-4 h-4" />
                <span className="font-medium">{maskedMobile}</span>
              </div>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleContinue} className="mt-8 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Enter OTP Code
              </label>
              <div className="flex gap-3 justify-center">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className="w-14 h-14 text-center text-2xl font-semibold border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                  />
                ))}
              </div>
            </div>

            {/* Continue Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gray-900 text-white font-medium rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Verify & Continue'}
            </button>
          </form>

          {/* Contact Information Box */}
          <div className="mt-8 p-6 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-700 text-center leading-relaxed">
              Didn't receive the {method === 'email' ? 'email' : 'SMS'}? {method === 'email' ? 'Check your spam folder or' : 'Please wait and'} contact support.
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
