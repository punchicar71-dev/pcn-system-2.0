'use client'

import { X } from 'lucide-react'

interface DeleteUserModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  userName: string
  loading?: boolean
}

export default function DeleteUserModal({
  isOpen,
  onClose,
  onConfirm,
  userName,
  loading = false
}: DeleteUserModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6 z-10">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          disabled={loading}
        >
          <X className="w-6 h-6" />
        </button>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Delete User
        </h2>

        {/* Message */}
        <div className="bg-gray-100 rounded-lg p-4 mb-6">
          <p className="text-gray-700">
            Are you certain you want to delete <span className="font-semibold">{userName}</span>? This action cannot be undone.
          </p>
        </div>

        {/* Warning */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
          <p className="text-sm text-red-800">
            <strong>Warning:</strong> This will permanently delete all user data from the database, including authentication records.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}
