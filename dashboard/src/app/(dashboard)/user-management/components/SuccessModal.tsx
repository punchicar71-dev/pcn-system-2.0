'use client'

import { X, Mail, MessageSquare, CheckCircle, XCircle } from 'lucide-react'
import React from 'react'

interface SuccessModalProps {
  isOpen: boolean
  onClose: () => void
  userName: string
  emailSent?: boolean
  smsSent?: boolean
  requestedEmail?: boolean
  requestedSMS?: boolean
}

export default function SuccessModal({
  isOpen,
  onClose,
  userName,
  emailSent = false,
  smsSent = false,
  requestedEmail = false,
  requestedSMS = false
}: SuccessModalProps) {
  if (!isOpen) return null

  // Determine credential delivery status message
  const getCredentialStatusMessage = () => {
    const messages: string[] = []
    
    if (requestedEmail && emailSent) {
      messages.push('email')
    }
    if (requestedSMS && smsSent) {
      messages.push('SMS')
    }
    
    if (messages.length === 0) {
      return 'The user account has been created successfully.'
    }
    
    return `Login credentials have been sent via ${messages.join(' and ')}.`
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8 relative text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center">
            <svg
              className="w-12 h-12 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        {/* Success Message */}
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          User Added Successfully
        </h3>
        <p className="text-xl text-green-600 font-semibold">
          {userName}
        </p>

        <p className="text-gray-600 text-sm mt-4">
          {getCredentialStatusMessage()}
        </p>

        {/* Credential Delivery Status - Only show if something was requested */}
        {(requestedEmail || requestedSMS) && (
          <div className="mt-4 space-y-2">
            {requestedEmail && emailSent && (
              <div className="flex items-center justify-center gap-2 text-sm text-green-600">
                <CheckCircle className="w-4 h-4" />
                <Mail className="w-4 h-4" />
                <span>Email sent successfully</span>
              </div>
            )}
            {requestedEmail && !emailSent && (
              <div className="flex items-center justify-center gap-2 text-sm text-amber-500">
                <XCircle className="w-4 h-4" />
                <Mail className="w-4 h-4" />
                <span>Email delivery pending</span>
              </div>
            )}
            {requestedSMS && smsSent && (
              <div className="flex items-center justify-center gap-2 text-sm text-green-600">
                <CheckCircle className="w-4 h-4" />
                <MessageSquare className="w-4 h-4" />
                <span>SMS sent successfully</span>
              </div>
            )}
            {requestedSMS && !smsSent && (
              <div className="flex items-center justify-center gap-2 text-sm text-amber-500">
                <XCircle className="w-4 h-4" />
                <MessageSquare className="w-4 h-4" />
                <span>SMS delivery pending</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
