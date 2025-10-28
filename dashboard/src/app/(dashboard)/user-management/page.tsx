'use client'

import { Plus, MoreVertical } from 'lucide-react'
import { useState } from 'react'
import Image from 'next/image'
import AddUserModal from './components/AddUserModal'
import SuccessModal from './components/SuccessModal'

// Sample user data
const usersData = [
  {
    id: '00471',
    name: 'Rashmina Yapa',
    email: 'rashmina.yapa.2000@gmail.com',
    level: 'Admin',
    status: 'Active',
    levelColor: 'bg-green-100 text-green-700',
    statusColor: 'bg-green-500'
  },
  {
    id: '00453',
    name: 'Ralph Edwards',
    email: 'michelle.rivera@example.com',
    level: 'Editor',
    status: 'Inactive',
    levelColor: 'bg-blue-100 text-blue-700',
    statusColor: 'bg-yellow-500'
  },
  {
    id: '00423',
    name: 'Jenny Wilson',
    email: 'debra.holt@example.com',
    level: 'Editor',
    status: 'Active',
    levelColor: 'bg-blue-100 text-blue-700',
    statusColor: 'bg-green-500'
  },
  {
    id: '00413',
    name: 'Kathryn Murphy',
    email: 'debbie.baker@example.com',
    level: 'Admin',
    status: 'Active',
    levelColor: 'bg-green-100 text-green-700',
    statusColor: 'bg-green-500'
  },
]

export default function UserManagementPage() {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [showAddUserModal, setShowAddUserModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    accessLevel: 'Editor',
    email: '',
    mobileNumber: '',
    role: 'Sales Agent',
    password: '',
    reEnterPassword: '',
    sendEmail: true,
    profilePicture: ''
  })
  const [loading, setLoading] = useState(false)
  const [successUserName, setSuccessUserName] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const toggleMenu = (userId: string) => {
    setOpenMenuId(openMenuId === userId ? null : userId)
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required'
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required'
    if (!formData.username.trim()) newErrors.username = 'Username is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    if (!formData.email.includes('@')) newErrors.email = 'Invalid email'
    if (!formData.password) newErrors.password = 'Password is required'
    if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters'
    if (formData.password !== formData.reEnterPassword) {
      newErrors.reEnterPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: (e.target as HTMLInputElement).checked
      })
    } else {
      setFormData({
        ...formData,
        [name]: value
      })
    }
    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      })
    }
  }

  const handleProfilePictureUpload = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData({
          ...formData,
          profilePicture: reader.result as string
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          username: formData.username,
          email: formData.email,
          mobileNumber: formData.mobileNumber,
          accessLevel: formData.accessLevel,
          role: formData.role,
          password: formData.password,
          profilePicture: formData.profilePicture,
          sendEmail: formData.sendEmail
        })
      })

      if (!response.ok) {
        const error = await response.json()
        setErrors({ submit: error.error || 'Failed to create user' })
        setLoading(false)
        return
      }

      const data = await response.json()

      // Show success modal
      setSuccessUserName(`${formData.firstName} ${formData.lastName}`)
      setShowAddUserModal(false)
      setShowSuccessModal(true)

      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        username: '',
        accessLevel: 'Editor',
        email: '',
        mobileNumber: '',
        role: 'Sales Agent',
        password: '',
        reEnterPassword: '',
        sendEmail: true,
        profilePicture: ''
      })

      // Close success modal after 3 seconds
      setTimeout(() => {
        setShowSuccessModal(false)
        // Refresh users list
        window.location.reload()
      }, 3000)
    } catch (error) {
      console.error('Error adding user:', error)
      setErrors({ submit: 'An error occurred. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        
        <button 
          onClick={() => setShowAddUserModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add User
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                  User ID
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                  Level
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {usersData.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {user.id}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {user.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {user.email}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${user.levelColor}`}>
                      {user.level}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${user.statusColor}`}></div>
                      <span className="text-sm text-gray-900">{user.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <button className="text-sm text-gray-700 hover:text-gray-900 font-medium">
                        View Detail
                      </button>
                      <div className="relative">
                        <button 
                          onClick={() => toggleMenu(user.id)}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                        >
                          <MoreVertical className="w-4 h-4 text-gray-600" />
                        </button>
                        
                        {openMenuId === user.id && (
                          <>
                            <div 
                              className="fixed inset-0 z-10" 
                              onClick={() => setOpenMenuId(null)}
                            ></div>
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                              <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50">
                                Edit User
                              </button>
                              <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50">
                                Change Password
                              </button>
                              <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50">
                                {user.status === 'Active' ? 'Deactivate' : 'Activate'}
                              </button>
                              <hr className="my-1 border-gray-200" />
                              <button className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50">
                                Delete User
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal Component */}
      <AddUserModal
        isOpen={showAddUserModal}
        onClose={() => setShowAddUserModal(false)}
        onSubmit={handleAddUser}
        formData={formData}
        onInputChange={handleInputChange}
        onProfilePictureUpload={handleProfilePictureUpload}
        errors={errors}
        loading={loading}
      />

      {/* Success Modal Component */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        userName={successUserName}
      />
    </div>
  )
}
