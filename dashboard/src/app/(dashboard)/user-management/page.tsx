'use client'

import { Plus, MoreVertical, Eye, Trash2, Pencil } from 'lucide-react'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import AddUserModal from './components/AddUserModal'
import SuccessModal from './components/SuccessModal'
import DeleteUserModal from './components/DeleteUserModal'
import UserDetailsModal from './components/UserDetailsModal'
import { supabase } from '@/lib/supabase-client'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

interface User {
  id: string
  auth_id: string
  first_name: string
  last_name: string
  email: string
  access_level: string
  status: string
  created_at: string
  last_sign_in_at?: string
  is_online?: boolean
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [showAddUserModal, setShowAddUserModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
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
    sendSMS: true,
    profilePicture: ''
  })
  const [formLoading, setFormLoading] = useState(false)
  const [successUserName, setSuccessUserName] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Fetch current user on mount (only once)
  useEffect(() => {
    fetchCurrentUser()
  }, [])

  // Fetch users on component mount and when page changes
  useEffect(() => {
    fetchUsers()
    
    // Set up real-time subscription for user changes
    const usersChannel = supabase
      .channel('users-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'users' },
        (payload: any) => {
          console.log('User change detected:', payload)
          fetchUsers()
        }
      )
      .subscribe()

    // Auto-refresh every 30 seconds to update status
    const intervalId = setInterval(() => {
      fetchUsers()
    }, 30000) // 30 seconds

    return () => {
      supabase.removeChannel(usersChannel)
      clearInterval(intervalId)
    }
  }, [currentPage])

  const fetchCurrentUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      console.log('Current session:', session?.user?.id)
      if (session) {
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('auth_id', session.user.id)
          .single()
        
        console.log('Current user data:', userData)
        if (userData) {
          // Normalize access_level by trimming whitespace
          if (userData.access_level) {
            userData.access_level = userData.access_level.trim()
          }
          setCurrentUser(userData)
          console.log('Current user access level:', userData.access_level)
          console.log('Is admin?', userData.access_level?.toLowerCase() === 'admin')
        }
      }
    } catch (error) {
      console.error('Error fetching current user:', error)
    }
  }

  const fetchUsers = async () => {
    try {
      setLoading(true)
      console.log('Fetching users from /api/users...')
      const response = await fetch('/api/users')
      console.log('Response status:', response.status)
      const data = await response.json()
      console.log('Response data:', data)
      
      if (response.ok && data.users) {
        console.log('Users fetched successfully:', data.users.length, 'users')
        
        // Get current session to identify logged-in user
        const { data: { session } } = await supabase.auth.getSession()
        
        // Mark the current logged-in user as active
        const usersWithCurrentStatus = data.users.map((user: User) => {
          if (session && user.auth_id === session.user.id) {
            return { ...user, is_online: true }
          }
          return user
        })
        
        setUsers(usersWithCurrentStatus)
        setTotalPages(Math.ceil(usersWithCurrentStatus.length / itemsPerPage))
      } else {
        console.error('Failed to fetch users:', data.error)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const getLevelColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'admin':
        return 'bg-green-100 text-green-700'
      case 'editor':
        return 'bg-blue-100 text-blue-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusColor = (isOnline?: boolean) => {
    return isOnline ? 'bg-green-500' : 'bg-gray-400'
  }

  const getStatusText = (isOnline?: boolean) => {
    return isOnline ? 'Active' : 'Inactive'
  }

  // Get paginated users
  const getPaginatedUsers = () => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return users.slice(startIndex, endIndex)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value)
    setCurrentPage(1) // Reset to first page when changing items per page
    setTotalPages(Math.ceil(users.length / value))
  }

  const toggleMenu = (userId: string) => {
    setOpenMenuId(openMenuId === userId ? null : userId)
  }

  const handleViewDetail = (userId: string) => {
    const isAdmin = currentUser?.access_level?.toLowerCase() === 'admin'
    console.log(`View detail for user: ${userId} (${isAdmin ? 'Admin' : 'Editor'} - ${isAdmin ? 'Can edit' : 'View only'})`)
    setSelectedUserId(userId)
    setShowUserDetailsModal(true)
  }

  const handleEditUser = (userId: string) => {
    // Check if current user is admin
    if (!currentUser || currentUser.access_level?.toLowerCase() !== 'admin') {
      alert('Access Denied: Only administrators can edit user details.')
      return
    }
    console.log('Edit user:', userId)
    setSelectedUserId(userId)
    setShowUserDetailsModal(true)
  }

  const handleDeleteUser = async (userId: string) => {
    // Check if current user is admin
    if (!currentUser || currentUser.access_level?.toLowerCase() !== 'admin') {
      alert('Access Denied: Only administrators can delete users.')
      return
    }

    // Prevent self-deletion
    if (currentUser.id === userId) {
      alert('Error: You cannot delete your own account.')
      return
    }

    // Find the user to delete
    const user = users.find(u => u.id === userId)
    if (!user) {
      alert('User not found')
      return
    }

    // Show delete confirmation modal
    setUserToDelete(user)
    setShowDeleteModal(true)
  }

  const confirmDeleteUser = async () => {
    if (!userToDelete) return

    setDeleteLoading(true)
    
    try {
      const response = await fetch(`/api/users/${userToDelete.id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (response.ok) {
        // Success
        setShowDeleteModal(false)
        setUserToDelete(null)
        alert(`User ${userToDelete.first_name} ${userToDelete.last_name} has been permanently deleted.`)
        fetchUsers() // Refresh the list
      } else {
        // Error
        alert(`Failed to delete user: ${data.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('An error occurred while deleting the user. Please try again.')
    } finally {
      setDeleteLoading(false)
    }
  }

  const cancelDeleteUser = () => {
    setShowDeleteModal(false)
    setUserToDelete(null)
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

    setFormLoading(true)

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
          sendEmail: formData.sendEmail,
          sendSMS: formData.sendSMS
        })
      })

      if (!response.ok) {
        const error = await response.json()
        setErrors({ submit: error.error || 'Failed to create user' })
        setFormLoading(false)
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
        sendSMS: true,
        profilePicture: ''
      })

      // Close success modal after 3 seconds and refresh users list
      setTimeout(() => {
        setShowSuccessModal(false)
        fetchUsers()
      }, 3000)
    } catch (error) {
      console.error('Error adding user:', error)
      setErrors({ submit: 'An error occurred. Please try again.' })
    } finally {
      setFormLoading(false)
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
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                User ID
              </TableHead>
              <TableHead className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                Name
              </TableHead>
              <TableHead className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                Email
              </TableHead>
              <TableHead className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                Level
              </TableHead>
              <TableHead className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                Status
              </TableHead>
              <TableHead className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  Loading users...
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  No users found. Click "Add User" to create a new user.
                </TableCell>
              </TableRow>
            ) : (
              getPaginatedUsers().map((user) => {
                // Debug logging
                console.log('Rendering user row:', user.id, 'Current user:', currentUser?.id, 'Access level:', currentUser?.access_level, 'Is admin:', currentUser?.access_level?.toLowerCase() === 'admin')
                
                return (
                <TableRow key={user.id} className="hover:bg-gray-50 transition-colors">
                  <TableCell className="px-6 py-4 text-sm text-gray-900">
                    {user.id.substring(0, 8)}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-sm font-medium text-gray-900">
                    {user.first_name} {user.last_name}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-sm text-gray-600">
                    {user.email}
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getLevelColor(user.access_level)}`}>
                      {user.access_level}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(user.is_online)}`}></div>
                      <span className="text-sm text-gray-900 capitalize">{getStatusText(user.is_online)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleViewDetail(user.id)}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:text-gray-900 font-medium bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View Detail
                      </button>
                      {/* Only show edit and delete buttons for admins */}
                      {currentUser && currentUser.access_level && currentUser.access_level.toLowerCase() === 'admin' && (
                        <>
                          <button 
                            onClick={() => handleEditUser(user.id)}
                            className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit User"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          {/* Prevent self-deletion */}
                          {currentUser.id !== user.id && (
                            <button 
                              onClick={() => handleDeleteUser(user.id)}
                              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete User"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination and Rows Per Page */}
      {!loading && users.length > 0 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, users.length)} of {users.length} users
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="itemsPerPage" className="text-sm text-gray-600">
                Rows per page:
              </label>
              <select
                id="itemsPerPage"
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    if (currentPage > 1) handlePageChange(currentPage - 1)
                  }}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                // Show first page, last page, current page, and pages around current page
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          handlePageChange(page)
                        }}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  )
                } else if (page === currentPage - 2 || page === currentPage + 2) {
                  return (
                    <PaginationItem key={page}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )
                }
                return null
              })}
              
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    if (currentPage < totalPages) handlePageChange(currentPage + 1)
                  }}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
          )}
        </div>
      )}

      {/* Add User Modal Component */}
      <AddUserModal
        isOpen={showAddUserModal}
        onClose={() => setShowAddUserModal(false)}
        onSubmit={handleAddUser}
        formData={formData}
        onInputChange={handleInputChange}
        onProfilePictureUpload={handleProfilePictureUpload}
        errors={errors}
        loading={formLoading}
      />

      {/* Success Modal Component */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        userName={successUserName}
      />

      {/* Delete User Modal Component */}
      <DeleteUserModal
        isOpen={showDeleteModal}
        onClose={cancelDeleteUser}
        onConfirm={confirmDeleteUser}
        userName={userToDelete ? `${userToDelete.first_name} ${userToDelete.last_name}` : ''}
        loading={deleteLoading}
      />

      {/* User Details Modal Component */}
      <UserDetailsModal
        isOpen={showUserDetailsModal}
        onClose={() => {
          setShowUserDetailsModal(false)
          setSelectedUserId(null)
        }}
        userId={selectedUserId}
        onUserUpdated={fetchUsers}
        currentUserAccessLevel={currentUser?.access_level || ''}
        onDeleteUser={handleDeleteUser}
      />
    </div>
  )
}
