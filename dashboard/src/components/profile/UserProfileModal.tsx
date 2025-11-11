'use client'

import { X, User, Mail, Phone, Shield, UserCheck, Clock } from 'lucide-react'
import Image from 'next/image'
import { format } from 'date-fns'

interface UserProfileModalProps {
  isOpen: boolean
  onClose: () => void
  user: {
    profile_picture_url?: string
    first_name: string
    last_name: string
    email: string
    mobile_number?: string
    role?: string
    access_level?: string
    status?: string
    created_at?: string
    updated_at?: string
  } | null
}

export function UserProfileModal({ isOpen, onClose, user }: UserProfileModalProps) {
  if (!isOpen || !user) return null

  const formatLastLogin = (lastLogin?: string) => {
    if (!lastLogin) return 'Never'
    try {
      return format(new Date(lastLogin), 'MMM dd, yyyy - hh:mm a')
    } catch (error) {
      return 'Invalid date'
    }
  }

  const getAccessLevelColor = (level?: string) => {
    if (!level) return 'bg-gray-100 text-gray-800'
    const colors: Record<string, string> = {
      'admin': 'bg-purple-100 text-purple-800',
      'editor': 'bg-blue-100 text-blue-800',
    }
    return colors[level.toLowerCase()] || 'bg-gray-100 text-gray-800'
  }

  const getStatusColor = (status?: string) => {
    if (!status) return 'bg-gray-100 text-gray-800'
    const colors: Record<string, string> = {
      'active': 'bg-green-100 text-green-800',
      'inactive': 'bg-red-100 text-red-800',
      'suspended': 'bg-orange-100 text-orange-800',
    }
    return colors[status.toLowerCase()] || 'bg-gray-100 text-gray-800'
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        {/* Modal Content */}
        <div 
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 relative animate-in fade-in zoom-in duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-2xl p-6 pb-16">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold text-white">My Profile</h2>
          </div>

          {/* Profile Picture - Overlapping */}
          <div className="flex justify-center -mt-12 mb-4">
            {user.profile_picture_url ? (
              <Image
                src={user.profile_picture_url}
                alt={`${user.first_name} ${user.last_name}`}
                width={96}
                height={96}
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-3xl border-4 border-white shadow-lg">
                {user.first_name.charAt(0).toUpperCase()}{user.last_name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* User Details */}
          <div className="px-6 pb-6">
            {/* Full Name */}
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                {user.first_name} {user.last_name}
              </h3>
            </div>

            {/* Details Grid */}
            <div className="space-y-4">
              {/* Email */}
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <Mail className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Email</p>
                  <p className="text-sm text-gray-900 break-words">{user.email}</p>
                </div>
              </div>

              {/* Mobile Number */}
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <Phone className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Mobile Number</p>
                  <p className="text-sm text-gray-900">{user.mobile_number || 'Not provided'}</p>
                </div>
              </div>

              {/* Role */}
              {user.role && (
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Shield className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Role</p>
                    <p className="text-sm text-gray-900">{user.role}</p>
                  </div>
                </div>
              )}

              {/* Access Level */}
              {user.access_level && (
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <UserCheck className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Access Level</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getAccessLevelColor(user.access_level)}`}>
                      {user.access_level}
                    </span>
                  </div>
                </div>
              )}

              {/* Status */}
              {user.status && (
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Shield className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Status</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(user.status)}`}>
                      {user.status}
                    </span>
                  </div>
                </div>
              )}

              {/* Member Since */}
              {user.created_at && (
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Clock className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Member Since</p>
                    <p className="text-sm text-gray-900">{formatLastLogin(user.created_at)}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-full mt-6 px-6 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/30"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
