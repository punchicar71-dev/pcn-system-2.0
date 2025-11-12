'use client'

import { X } from 'lucide-react'
import React from 'react'

interface SuccessModalProps {
  isOpen: boolean
  onClose: () => void
  userName: string
}

export default function SuccessModal({
  isOpen,
  onClose,
  userName
}: SuccessModalProps) {
  if (!isOpen) return null

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
          User Adding Successfully
        </h3>
        <p className="text-xl text-green-600 font-semibold">
          {userName}
        </p>

        <p className="text-gray-600 text-sm mt-4">
          The user account has been created and login details have been sent to their email.
        </p>
      </div>
    </div>
  )
}
