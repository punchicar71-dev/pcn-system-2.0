'use client'

import { X } from 'lucide-react'
import Image from 'next/image'
import { useEffect } from 'react'

interface SuccessPopupProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
  autoCloseDuration?: number // in milliseconds, default 3000
}

export default function SuccessPopup({
  isOpen,
  onClose,
  title,
  message,
  autoCloseDuration = 3000
}: SuccessPopupProps) {
  
  useEffect(() => {
    if (isOpen && autoCloseDuration > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, autoCloseDuration)

      return () => clearTimeout(timer)
    }
  }, [isOpen, autoCloseDuration, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      
      {/* Popup Content */}
      <div className="relative bg-white rounded-lg shadow-2xl p-8 max-w-md w-full mx-4 animate-in fade-in zoom-in duration-300">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Content */}
        <div className="flex flex-col items-center text-center">
          {/* Success Icon */}
          <div className="mb-6">
            <Image
              src="/done_animation.png"
              alt="Success"
              width={120}
              height={120}
              className="w-30 h-30"
            />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            {title}
          </h2>

          {/* Message */}
          <p className="text-gray-600 text-base">
            {message}
          </p>
        </div>
      </div>
    </div>
  )
}
