'use client'

import { X, Upload, Lock } from 'lucide-react'
import { useState, useEffect } from 'react'
import Image from 'next/image'

interface UserDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string | null
  onUserUpdated: () => void
  currentUserAccessLevel: string
  onDeleteUser?: (userId: string) => void
}

interface UserDetails {
  id: string
  auth_id: string
  first_name: string
  last_name: string
  username: string
  email: string
  mobile_number: string | null
  phone_verified: boolean
  phone_verified_at: string | null
  access_level: string
  role: string
  profile_picture_url: string | null
  status: string
  created_at: string
}

export default function UserDetailsModal({
  isOpen,
  onClose,
  userId,
  onUserUpdated,
  currentUserAccessLevel,
  onDeleteUser
}: UserDetailsModalProps) {
  const [user, setUser] = useState<UserDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [error, setError] = useState('')
  const [profileImage, setProfileImage] = useState<string | null>(null)

  // Check if current user is admin
  const isAdmin = currentUserAccessLevel?.toLowerCase() === 'admin'

  // Form data
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    mobile_number: '',
    access_level: 'Editor',
    role: 'Sales Agent',
    profile_picture_url: ''
  })

  useEffect(() => {
    if (isOpen && userId) {
      fetchUserDetails()
    } else {
      resetModal()
    }
  }, [isOpen, userId])

  const fetchUserDetails = async () => {
    if (!userId) return

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/users/${userId}`)
      const data = await response.json()

      if (response.ok && data.user) {
        setUser(data.user)
        setFormData({
          first_name: data.user.first_name || '',
          last_name: data.user.last_name || '',
          username: data.user.username || '',
          email: data.user.email || '',
          mobile_number: data.user.mobile_number || '',
          access_level: data.user.access_level || 'Editor',
          role: data.user.role || 'Sales Agent',
          profile_picture_url: data.user.profile_picture_url || ''
        })
        setProfileImage(data.user.profile_picture_url)
      } else {
        setError(data.error || 'Failed to load user details')
      }
    } catch (err) {
      console.error('Error fetching user details:', err)
      setError('Failed to load user details')
    } finally {
      setLoading(false)
    }
  }

  const resetModal = () => {
    setUser(null)
    setIsEditing(false)
    setError('')
    setProfileImage(null)
    setFormData({
      first_name: '',
      last_name: '',
      username: '',
      email: '',
      mobile_number: '',
      access_level: 'Editor',
      role: 'Sales Agent',
      profile_picture_url: ''
    })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleProfilePictureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setError('Image size should be less than 2MB')
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setProfileImage(result)
        setFormData(prev => ({
          ...prev,
          profile_picture_url: result
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    if (!userId) return

    setSaving(true)
    setError('')

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        setIsEditing(false)
        onUserUpdated()
        // Refresh user details
        await fetchUserDetails()
      } else {
        setError(data.error || 'Failed to update user')
      }
    } catch (err) {
      console.error('Error updating user:', err)
      setError('Failed to update user. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        username: user.username || '',
        email: user.email || '',
        mobile_number: user.mobile_number || '',
        access_level: user.access_level || 'Editor',
        role: user.role || 'Sales Agent',
        profile_picture_url: user.profile_picture_url || ''
      })
      setProfileImage(user.profile_picture_url)
    }
    setIsEditing(false)
    setError('')
  }

  const handleDelete = () => {
    if (!userId || !onDeleteUser) return
    onDeleteUser(userId)
    onClose()
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">User Details</h2>
              {!isAdmin && (
                <p className="text-sm text-gray-500 mt-1">View Only - Admin access required to edit</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500">Loading user details...</div>
            </div>
          ) : error && !user ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
              {error}
            </div>
          ) : user ? (
            <div className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
                  {error}
                </div>
              )}

              {/* View-Only Info Banner for Non-Admins */}
              {!isAdmin && !isEditing && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                  <Lock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-semibold text-blue-900 mb-1">View-Only Mode</h4>
                    <p className="text-sm text-blue-700">
                      You are viewing user details in read-only mode. Only administrators can edit user information.
                    </p>
                  </div>
                </div>
              )}

              {/* Form Fields */}
              <div className="grid grid-cols-2 gap-4">
                {/* First Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-600"
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-600"
                  />
                </div>

                {/* User Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    User Name
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-600"
                  />
                </div>

                {/* Access Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Access Level
                  </label>
                  <select
                    name="access_level"
                    value={formData.access_level}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-600"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Editor">Editor</option>
                    <option value="Viewer">Viewer</option>
                  </select>
                </div>

                {/* Email */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-600"
                  />
                </div>

                {/* Mobile Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mobile Number
                  </label>
                  <input
                    type="text"
                    name="mobile_number"
                    value={formData.mobile_number}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-600"
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <input
                    type="text"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-600"
                  />
                </div>
              </div>



              {/* Profile Picture */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Set Profile Picture
                </label>
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {profileImage ? (
                      <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl font-semibold text-gray-600">
                        {getInitials(formData.first_name, formData.last_name)}
                      </span>
                    )}
                  </div>

                  {/* Upload Button */}
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Select your photo up to 2MB</p>
                    {isEditing && (
                      <label className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                        <Upload className="w-4 h-4" />
                        <span className="text-sm font-medium">Upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleProfilePictureUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleCancel}
                      disabled={saving}
                      className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="px-6 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                  </>
                ) : (
                  <>
                    {/* Always show Close button */}
                    <button
                      onClick={onClose}
                      className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                    >
                      Close
                    </button>
                    {/* Only show Edit button for admins */}
                    {isAdmin && (
                      <>
                        <button
                          onClick={handleDelete}
                          className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                        >
                          Delete User
                        </button>
                        <button
                          onClick={() => setIsEditing(true)}
                          className="px-6 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
                        >
                          Edit Details
                        </button>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
