'use client'

import { X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
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
  if (!user) return null

  const formatMemberSince = (createdAt?: string) => {
    if (!createdAt) return 'Unknown'
    try {
      return format(new Date(createdAt), 'yyyy/MM/dd, h.mma')
    } catch (error) {
      return 'Invalid date'
    }
  }

  const getInitials = () => {
    return user.first_name.charAt(0).toUpperCase()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-8 pt-8 pb-6">
          <DialogTitle className="text-3xl font-bold">My Profile</DialogTitle>
        </DialogHeader>

        {/* Content */}
        <div className="px-8 pb-8">
          {/* Avatar and Name Section */}
          <div className="flex items-start gap-6 mb-8">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
              <span className="text-4xl font-bold text-gray-600">{getInitials()}</span>
            </div>

            {/* Name and Member Since */}
            <div className="flex-1 pt-2">
              <h2 className="text-3xl font-bold mb-2">{user.first_name} {user.last_name}</h2>
              <p className="text-gray-500 text-sm">
                <span className="font-medium">Member Since:</span> {formatMemberSince(user.created_at)}
              </p>
            </div>
          </div>

          {/* User Details in Light Gray Background */}
          <div className="bg-gray-50 rounded-lg p-6 space-y-4">
            {/* Email */}
            <div className="flex items-start">
              <span className="text-gray-600 font-medium w-36 flex-shrink-0">Email</span>
              <span className="text-gray-600 mr-4">:</span>
              <span className="text-black font-semibold break-all">{user.email}</span>
            </div>

            {/* Mobile */}
            <div className="flex items-start">
              <span className="text-gray-600 font-medium w-36 flex-shrink-0">Mobile</span>
              <span className="text-gray-600 mr-4">:</span>
              <span className="text-black font-semibold">{user.mobile_number || 'Not provided'}</span>
            </div>

            {/* Role */}
            {user.role && (
              <div className="flex items-start">
                <span className="text-gray-600 font-medium w-36 flex-shrink-0">Role</span>
                <span className="text-gray-600 mr-4">:</span>
                <span className="text-black font-semibold capitalize">{user.role}</span>
              </div>
            )}

            {/* Access Level */}
            {user.access_level && (
              <div className="flex items-start">
                <span className="text-gray-600 font-medium w-36 flex-shrink-0">Access Level</span>
                <span className="text-gray-600 mr-4">:</span>
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-0 font-semibold capitalize">
                  {user.access_level}
                </Badge>
              </div>
            )}

            {/* Status */}
            {user.status && (
              <div className="flex items-start">
                <span className="text-gray-600 font-medium w-36 flex-shrink-0">Status</span>
                <span className="text-gray-600 mr-4">:</span>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  <span className="text-black font-semibold capitalize">{user.status}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
