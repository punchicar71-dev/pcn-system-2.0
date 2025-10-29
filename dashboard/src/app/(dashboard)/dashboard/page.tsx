'use client'

import { useState, useEffect } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { createClient } from '@supabase/supabase-js'
import Image from 'next/image'

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
  const [dateRange, setDateRange] = useState('Past Week')
  const [availableVehicles, setAvailableVehicles] = useState<VehicleStats>({ total: 0, sedan: 0, hatchback: 0, suv: 0, wagon: 0, coupe: 0 })
  const [pendingVehicles, setPendingVehicles] = useState<VehicleStats>({ total: 0, sedan: 0, hatchback: 0, suv: 0, wagon: 0, coupe: 0 })
  const [soldVehicles, setSoldVehicles] = useState<VehicleStats>({ total: 0, sedan: 0, hatchback: 0, suv: 0, wagon: 0, coupe: 0 })
  const [chartData, setChartData] = useState<SalesData[]>([])
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([])
  const [loading, setLoading] = useState(true)
  const [salesThisMonth, setSalesThisMonth] = useState(0)

  // Initialize Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
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
  }, [dateRange])

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
      const { data: soldSalesData, error: soldError } = await supabase
        .from('pending_vehicle_sales')
        .select(`
          id,
          vehicle_id,
          updated_at,
          vehicles (
            body_type
          )
        `)
        .eq('status', 'sold')

      console.log('All Sold Sales Data:', soldSalesData)
      console.log('Sold Sales Count:', soldSalesData?.length)
      console.log('Sold Sales Error:', soldError)

      if (!soldError && soldSalesData) {
        // Extract vehicles data and calculate stats
        const vehiclesData = soldSalesData
          .filter(sale => sale.vehicles)
          .map(sale => ({ body_type: (sale.vehicles as any).body_type }))
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
      let daysAgo = 7 // Default to past week
      if (dateRange === 'Past Month') daysAgo = 30
      if (dateRange === 'Past Year') daysAgo = 365

      const startDate = new Date()
      startDate.setDate(startDate.getDate() - daysAgo)
      startDate.setHours(0, 0, 0, 0)

      // Fetch sold vehicles from pending_vehicle_sales table
      const { data: salesData, error } = await supabase
        .from('pending_vehicle_sales')
        .select('updated_at')
        .eq('status', 'sold')
        .gte('updated_at', startDate.toISOString())
        .order('updated_at', { ascending: true })

      if (!error && salesData) {
        // Group sales by date
        const salesByDate: { [key: string]: number } = {}
        
        salesData.forEach((sale) => {
          const date = new Date(sale.updated_at)
          const dateKey = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          salesByDate[dateKey] = (salesByDate[dateKey] || 0) + 1
        })

        // Convert to chart data format
        const chartDataArray: SalesData[] = Object.entries(salesByDate).map(([date, vehicles]) => ({
          date,
          vehicles
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
      // Get current session to identify logged-in user
      const { data: { session } } = await supabase.auth.getSession()

      const { data: usersData, error } = await supabase
        .from('users')
        .select('id, first_name, last_name, email, profile_picture_url, auth_id')
        .order('first_name', { ascending: true })

      if (!error && usersData) {
        // Mark current logged-in user and recently active users as online
        const usersWithStatus = usersData.map((user) => ({
          ...user,
          is_online: session ? user.auth_id === session.user.id : false
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
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Total Sell</h3>
                <p className="text-sm text-gray-500">This chart displays the total sold-out vehicles for all categories.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Date Range</span>
                <select 
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option>Past Week</option>
                  <option>Past Month</option>
                  <option>Past Year</option>
                </select>
              </div>
            </div>
            
            <div className="h-[350px]">
              {loading || chartData.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  Loading chart data...
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorVehicles" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.05}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                      stroke="#9ca3af"
                    />
                    <YAxis 
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                      stroke="#9ca3af"
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#6366f1',
                        border: 'none',
                        borderRadius: '8px',
                        color: 'white',
                        padding: '8px 12px'
                      }}
                      labelStyle={{ color: 'white', fontWeight: 'bold' }}
                      formatter={(value) => [`${value} Vehicles`, 'Total Sell']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="vehicles" 
                      stroke="#8b5cf6" 
                      strokeWidth={2}
                      fill="url(#colorVehicles)"
                      activeDot={{ r: 6, fill: '#8b5cf6', strokeWidth: 2, stroke: '#fff' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
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
