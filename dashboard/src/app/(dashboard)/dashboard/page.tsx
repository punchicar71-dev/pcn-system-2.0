/**
 * MIGRATING: Supabase Auth has been removed.
 * This file will be updated to work with Better Auth in Step 2.
 * Currently uses localStorage for user data during migration.
 * TODO: Replace with Better Auth session in Step 2.
 */
'use client'

import { useState, useEffect, Suspense } from 'react'
import { createClient } from '@supabase/supabase-js'
import Image from 'next/image'
import { ChartAreaInteractive } from '@/components/charts/ChartAreaInteractive'
import { AccessDeniedHandler } from '@/components/auth/AccessDeniedHandler'

interface VehicleStats {
  total: number
  sedan: number
  hatchback: number
  suv: number
  wagon: number
  coupe: number
}

interface SalesData {
  date: string
  vehicles: number
  inventory: number
}

interface ActiveUser {
  id: string
  first_name: string
  last_name: string
  email: string
  profile_picture_url: string | null
  is_online: boolean
}

export default function DashboardPage() {
  const [availableVehicles, setAvailableVehicles] = useState<VehicleStats>({ total: 0, sedan: 0, hatchback: 0, suv: 0, wagon: 0, coupe: 0 })
  const [pendingVehicles, setPendingVehicles] = useState<VehicleStats>({ total: 0, sedan: 0, hatchback: 0, suv: 0, wagon: 0, coupe: 0 })
  const [soldVehicles, setSoldVehicles] = useState<VehicleStats>({ total: 0, sedan: 0, hatchback: 0, suv: 0, wagon: 0, coupe: 0 })
  const [chartData, setChartData] = useState<SalesData[]>([])
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([])
  const [loading, setLoading] = useState(true)
  const [salesThisMonth, setSalesThisMonth] = useState(0)

  // Initialize Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
  )

  useEffect(() => {
    fetchDashboardData()
    fetchActiveUsers()

    // Set up real-time subscription for active users
    const usersChannel = supabase
      .channel('dashboard-users')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'users' },
        () => {
          fetchActiveUsers()
        }
      )
      .subscribe()

    // Set up real-time subscription for vehicles
    const vehiclesChannel = supabase
      .channel('dashboard-vehicles')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'vehicles' },
        () => {
          fetchDashboardData()
        }
      )
      .subscribe()

    // Set up real-time subscription for sales transactions
    const salesChannel = supabase
      .channel('dashboard-sales')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'pending_vehicle_sales' },
        () => {
          fetchDashboardData()
        }
      )
      .subscribe()

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchActiveUsers()
      fetchDashboardData()
    }, 30000)

    return () => {
      supabase.removeChannel(usersChannel)
      supabase.removeChannel(vehiclesChannel)
      supabase.removeChannel(salesChannel)
      clearInterval(interval)
    }
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch Available Vehicles (status: 'In Sale')
      const { data: availableData, error: availableError } = await supabase
        .from('vehicles')
        .select('body_type')
        .eq('status', 'In Sale')

      if (!availableError && availableData) {
        const stats = calculateBodyTypeStats(availableData)
        setAvailableVehicles(stats)
      }

      // Fetch Pending Vehicles from pending_vehicle_sales table (status: 'pending')
      const { data: pendingSalesData, error: pendingError } = await supabase
        .from('pending_vehicle_sales')
        .select(`
          id,
          vehicle_id,
          vehicles (
            body_type
          )
        `)
        .eq('status', 'pending')

      if (!pendingError && pendingSalesData) {
        // Extract vehicles data and calculate stats
        const vehiclesData = pendingSalesData
          .filter(sale => sale.vehicles)
          .map(sale => ({ body_type: (sale.vehicles as any).body_type }))
        const stats = calculateBodyTypeStats(vehiclesData)
        setPendingVehicles(stats)
      }

      // Fetch Sold-Out Vehicles from pending_vehicle_sales (status: 'sold') - ALL TIME
      // OPTIMIZED: Use body_type snapshot column directly (no join needed)
      // This works even when vehicle_id is NULL (vehicle re-added after sale)
      const { data: soldSalesData, error: soldError } = await supabase
        .from('pending_vehicle_sales')
        .select('id, body_type, updated_at')
        .eq('status', 'sold')

      console.log('All Sold Sales Data:', soldSalesData)
      console.log('Sold Sales Count:', soldSalesData?.length)
      console.log('Sold Sales Error:', soldError)

      if (!soldError && soldSalesData) {
        // Use body_type directly from snapshot column
        const vehiclesData = soldSalesData
          .filter(sale => sale.body_type)
          .map(sale => ({ body_type: sale.body_type }))
        console.log('Sold Vehicles Data:', vehiclesData)
        const stats = calculateBodyTypeStats(vehiclesData)
        console.log('Sold Vehicle Stats:', stats)
        setSoldVehicles(stats)
      } else if (soldError) {
        console.error('Error fetching sold vehicles:', soldError)
        // Set to zero if error
        setSoldVehicles({ total: 0, sedan: 0, hatchback: 0, suv: 0, wagon: 0, coupe: 0 })
      }

      // Fetch Sales Chart Data based on date range
      await fetchChartData()

      setLoading(false)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setLoading(false)
    }
  }

  const fetchChartData = async () => {
    try {
      // Fetch all sold vehicles (we'll filter by date range in the component)
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - 365) // Get last year of data
      startDate.setHours(0, 0, 0, 0)

      // Fetch sold vehicles from pending_vehicle_sales table
      const { data: salesData, error } = await supabase
        .from('pending_vehicle_sales')
        .select('updated_at, created_at')
        .eq('status', 'sold')
        .gte('updated_at', startDate.toISOString())
        .order('updated_at', { ascending: true })

      // Fetch ALL vehicles (not filtered by date) to calculate true inventory
      const { data: allVehicles, error: inventoryError } = await supabase
        .from('vehicles')
        .select('created_at, status, id')
        .order('created_at', { ascending: true })

      // Fetch ALL historical sales with vehicle_id (not filtered by date) 
      const { data: allSales, error: allSalesError } = await supabase
        .from('pending_vehicle_sales')
        .select('updated_at, vehicle_id, created_at')
        .eq('status', 'sold')
        .order('updated_at', { ascending: true })

      if (!error && salesData && !inventoryError && allVehicles && !allSalesError && allSales) {
        console.log('Total vehicles in DB:', allVehicles.length)
        console.log('Total sales (all time):', allSales.length)
        console.log('Vehicles by status:', {
          'In Sale': allVehicles.filter(v => v.status === 'In Sale').length,
          'Other': allVehicles.filter(v => v.status !== 'In Sale').length
        })

        // Group sales by date for the chart display
        const salesByDate: { [key: string]: number } = {}
        
        salesData.forEach((sale) => {
          const date = new Date(sale.updated_at)
          // Use ISO date format (YYYY-MM-DD) for better sorting and filtering
          const dateKey = date.toISOString().split('T')[0]
          salesByDate[dateKey] = (salesByDate[dateKey] || 0) + 1
        })

        // Calculate actual inventory for each day
        const inventoryByDate: { [key: string]: number } = {}
        
        // Generate all dates in range
        const allDates = new Set<string>()
        const currentDate = new Date(startDate)
        const today = new Date()
        today.setHours(23, 59, 59, 999)
        
        while (currentDate <= today) {
          const dateKey = currentDate.toISOString().split('T')[0]
          allDates.add(dateKey)
          currentDate.setDate(currentDate.getDate() + 1)
        }

        // Build a set of sold vehicle IDs with their sale dates for quick lookup
        const soldVehiclesByDate: { [key: string]: Set<string> } = {}
        allSales.forEach(sale => {
          const saleDate = new Date(sale.updated_at).toISOString().split('T')[0]
          if (!soldVehiclesByDate[saleDate]) {
            soldVehiclesByDate[saleDate] = new Set()
          }
          soldVehiclesByDate[saleDate].add(sale.vehicle_id)
        })

        // Calculate inventory for each date
        const sortedDates = Array.from(allDates).sort()
        const soldVehiclesTracking = new Set<string>()
        
        sortedDates.forEach((date) => {
          const dateObj = new Date(date + 'T23:59:59.999Z')
          
          // Count vehicles added up to and including this date
          const totalVehiclesAdded = allVehicles.filter(v => 
            new Date(v.created_at) <= dateObj
          ).length
          
          // Track vehicles sold up to and including this date
          if (soldVehiclesByDate[date]) {
            soldVehiclesByDate[date].forEach(vehicleId => {
              soldVehiclesTracking.add(vehicleId)
            })
          }
          
          // Available inventory = total added - total sold
          const availableInventory = Math.max(0, totalVehiclesAdded - soldVehiclesTracking.size)
          inventoryByDate[date] = availableInventory
        })

        // Get today's date for logging
        const todayKey = new Date().toISOString().split('T')[0]
        console.log('Inventory calculation check:', {
          today: todayKey,
          todayInventory: inventoryByDate[todayKey],
          totalVehicles: allVehicles.length,
          totalSold: allSales.length,
          calculatedInventory: allVehicles.length - allSales.length,
          inSaleStatus: allVehicles.filter(v => v.status === 'In Sale').length
        })

        // Convert to chart data format - sorted by date
        const chartDataArray: SalesData[] = Array.from(allDates)
          .sort()
          .map((date) => ({
            date,
            vehicles: salesByDate[date] || 0,
            inventory: inventoryByDate[date] || 0
          }))

        setChartData(chartDataArray)

        // Calculate sales this month
        const currentMonth = new Date().getMonth()
        const currentYear = new Date().getFullYear()
        const monthSales = salesData.filter((sale) => {
          const saleDate = new Date(sale.updated_at)
          return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear
        })
        setSalesThisMonth(monthSales.length)
      }
    } catch (error) {
      console.error('Error fetching chart data:', error)
    }
  }

  const fetchActiveUsers = async () => {
    try {
      // MIGRATION: Get current user from localStorage to identify logged-in user
      const storedUser = localStorage.getItem('pcn-user')
      const currentUserData = storedUser ? JSON.parse(storedUser) : null

      const { data: usersData, error } = await supabase
        .from('users')
        .select('id, first_name, last_name, email, profile_picture_url, auth_id')
        .order('first_name', { ascending: true })

      if (!error && usersData) {
        // Mark current logged-in user and recently active users as online
        const usersWithStatus = usersData.map((user) => ({
          ...user,
          is_online: currentUserData ? (user.auth_id === currentUserData.auth_id || user.id === currentUserData.id) : false
        }))

        // Filter only online users
        const onlineUsers = usersWithStatus.filter(user => user.is_online)
        setActiveUsers(onlineUsers)
      }
    } catch (error) {
      console.error('Error fetching active users:', error)
    }
  }

  const calculateBodyTypeStats = (vehicles: any[]): VehicleStats => {
    const stats = {
      total: vehicles.length,
      sedan: 0,
      hatchback: 0,
      suv: 0,
      wagon: 0,
      coupe: 0
    }

    vehicles.forEach((vehicle) => {
      const bodyType = vehicle.body_type?.toLowerCase() || ''
      if (bodyType.includes('sedan')) {
        stats.sedan++
      } else if (bodyType.includes('hatchback')) {
        stats.hatchback++
      } else if (bodyType.includes('suv')) {
        stats.suv++
      } else if (bodyType.includes('wagon')) {
        stats.wagon++
      } else if (bodyType.includes('coupe')) {
        stats.coupe++
      }
    })

    return stats
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const getAvatarColor = (index: number) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-orange-500',
      'bg-red-500',
      'bg-yellow-500',
      'bg-indigo-500'
    ]
    return colors[index % colors.length]
  }

  return (
    <div className="p-6 space-y-6">
      {/* Access Denied Handler - shows toast if redirected from restricted page */}
      <Suspense fallback={null}>
        <AccessDeniedHandler />
      </Suspense>
      
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      </div>

      {/* Main Layout - Two Columns */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-6">
        {/* Left Section - Stats & Chart */}
        <div className="space-y-6">
          {/* Stats Cards - 3 Cards in a Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Available Vehicles Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Available Vehicles</h3>
              {loading ? (
                <p className="text-4xl font-bold text-gray-900">...</p>
              ) : (
                <>
                  <p className="text-5xl font-bold text-gray-900 mb-4">{availableVehicles.total}</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sedan:</span>
                      <span className="font-semibold text-gray-900">{availableVehicles.sedan}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Hatchback:</span>
                      <span className="font-semibold text-gray-900">{availableVehicles.hatchback}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">SUV:</span>
                      <span className="font-semibold text-gray-900">{availableVehicles.suv}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Wagon:</span>
                      <span className="font-semibold text-gray-900">{availableVehicles.wagon}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Coupe:</span>
                      <span className="font-semibold text-gray-900">{availableVehicles.coupe}</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Pending Selling Vehicles Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Pending Selling Vehicles</h3>
              {loading ? (
                <p className="text-4xl font-bold text-gray-900">...</p>
              ) : (
                <>
                  <p className="text-5xl font-bold text-gray-900 mb-4">{pendingVehicles.total}</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sedan:</span>
                      <span className="font-semibold text-gray-900">{pendingVehicles.sedan}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Hatchback:</span>
                      <span className="font-semibold text-gray-900">{pendingVehicles.hatchback}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">SUV:</span>
                      <span className="font-semibold text-gray-900">{pendingVehicles.suv}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Wagon:</span>
                      <span className="font-semibold text-gray-900">{pendingVehicles.wagon}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Coupe:</span>
                      <span className="font-semibold text-gray-900">{pendingVehicles.coupe}</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Sold-Out Vehicles Today Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Sold-Out Vehicles (Total)</h3>
              {loading ? (
                <p className="text-4xl font-bold text-gray-900">...</p>
              ) : (
                <>
                  <p className="text-5xl font-bold text-gray-900 mb-4">{soldVehicles.total}</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sedan:</span>
                      <span className="font-semibold text-gray-900">{soldVehicles.sedan}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Hatchback:</span>
                      <span className="font-semibold text-gray-900">{soldVehicles.hatchback}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">SUV:</span>
                      <span className="font-semibold text-gray-900">{soldVehicles.suv}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Wagon:</span>
                      <span className="font-semibold text-gray-900">{soldVehicles.wagon}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Coupe:</span>
                      <span className="font-semibold text-gray-900">{soldVehicles.coupe}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Total Sell Chart */}
          <ChartAreaInteractive data={chartData} loading={loading} />
        </div>

        {/* Right Section - Active Users */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Active Users</h3>
          <p className="text-sm text-gray-500 mb-6">You made {salesThisMonth} sales this month.</p>
          
          <div className="space-y-4">
            {loading ? (
              <div className="text-sm text-gray-500">Loading active users...</div>
            ) : activeUsers.length === 0 ? (
              <div className="text-sm text-gray-500">No users currently online</div>
            ) : (
              activeUsers.map((user, index) => (
                <div key={user.id} className="flex items-center gap-3">
                  <div className="relative flex-shrink-0">
                    {user.profile_picture_url ? (
                      <Image
                        src={user.profile_picture_url}
                        alt={`${user.first_name} ${user.last_name}`}
                        width={40}
                        height={40}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className={`w-10 h-10 rounded-full ${getAvatarColor(index)} flex items-center justify-center text-white text-sm font-semibold`}>
                        {getInitials(user.first_name, user.last_name)}
                      </div>
                    )}
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{user.first_name} {user.last_name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
