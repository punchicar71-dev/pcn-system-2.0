'use client'

import { useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

// Sample data for the chart
const chartData = [
  { date: '8 Sun Aug', vehicles: 8 },
  { date: '9 Mon Aug', vehicles: 10 },
  { date: '10 Tue Aug', vehicles: 14 },
  { date: '11 Wed Aug', vehicles: 12 },
  { date: '12 Thu Aug', vehicles: 9 },
  { date: '13 Fri Aug', vehicles: 15 },
  { date: '12 Sat Aug', vehicles: 12 },
]

// Active users data
const activeUsers = [
  { name: 'Olivia Martin', email: 'olivia.martin@email.com', initials: 'OM', color: 'bg-orange-500' },
  { name: 'Jackson Lee', email: 'jackson.lee@email.com', initials: 'JL', color: 'bg-blue-500' },
  { name: 'Isabella Nguyen', email: 'isabella.nguyen@email.com', initials: 'IN', color: 'bg-pink-500' },
  { name: 'William Kim', email: 'will@email.com', initials: 'WK', color: 'bg-yellow-500' },
  { name: 'Sofia Davis', email: 'sofia.davis@email.com', initials: 'SD', color: 'bg-green-500' },
  { name: 'Isabella Nguyen', email: 'isabella.nguyen@email.com', initials: 'IN', color: 'bg-purple-500' },
  { name: 'Jackson Lee', email: 'jackson.lee@email.com', initials: 'JL', color: 'bg-red-500' },
]

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState('Past Week')
  
  // Get current hour for greeting
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning!'
    if (hour < 18) return 'Good Afternoon!'
    return 'Good Evening!'
  }

  return (
    <div className="p-6 space-y-6">
      {/* Greeting */}
      <div>
        <h2 className="text-xl text-gray-600 font-normal">
          {getGreeting()} <span className="font-semibold text-gray-900">Rashmina</span>
        </h2>
        <h1 className="text-3xl font-bold text-gray-900 mt-1">Dashboard</h1>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Available Vehicles Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-3">Available Vehicles</h3>
          <p className="text-4xl font-bold text-gray-900 mb-4">288</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Sedan:</span>
              <span className="font-semibold text-gray-900">120</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Hatchback:</span>
              <span className="font-semibold text-gray-900">60</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">SUV:</span>
              <span className="font-semibold text-gray-900">25</span>
            </div>
          </div>
        </div>

        {/* Pending Selling Vehicles Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-3">Pending Selling Vehicles</h3>
          <p className="text-4xl font-bold text-gray-900 mb-4">12</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Sedan:</span>
              <span className="font-semibold text-gray-900">6</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Hatchback:</span>
              <span className="font-semibold text-gray-900">3</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">SUV:</span>
              <span className="font-semibold text-gray-900">1</span>
            </div>
          </div>
        </div>

        {/* Sold-Out Vehicles Today Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-3">Sold-Out Vehicles Today</h3>
          <p className="text-4xl font-bold text-gray-900 mb-4">3</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Sedan:</span>
              <span className="font-semibold text-gray-900">3</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Hatchback:</span>
              <span className="font-semibold text-gray-900">0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">SUV:</span>
              <span className="font-semibold text-gray-900">0</span>
            </div>
          </div>
        </div>

        {/* Active Users Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Active Users</h3>
          <p className="text-sm text-gray-600 mb-4">You made 265 sales this month.</p>
          <div className="space-y-3">
            {activeUsers.slice(0, 4).map((user, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="relative">
                  <div className={`w-9 h-9 rounded-full ${user.color} flex items-center justify-center text-white text-xs font-semibold`}>
                    {user.initials}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chart and Active Users Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Total Sell Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Total Sell</h3>
              <p className="text-sm text-gray-500">This chart displays the total sold-out vehicles for all categories.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Date Range</span>
              <select 
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>Past Week</option>
                <option>Past Month</option>
                <option>Past Year</option>
              </select>
            </div>
          </div>
          
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorVehicles" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  stroke="#9ca3af"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  stroke="#9ca3af"
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                  labelStyle={{ color: '#9ca3af' }}
                  formatter={(value) => [`${value} Vehicles`, 'Total Sell']}
                />
                <Area 
                  type="monotone" 
                  dataKey="vehicles" 
                  stroke="#6366f1" 
                  strokeWidth={2}
                  fill="url(#colorVehicles)"
                  activeDot={{ r: 6, fill: '#6366f1' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Active Users Panel */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Users</h3>
          <p className="text-sm text-gray-600 mb-6">You made 265 sales this month.</p>
          
          <div className="space-y-4">
            {activeUsers.map((user, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="relative">
                  <div className={`w-10 h-10 rounded-full ${user.color} flex items-center justify-center text-white text-sm font-semibold`}>
                    {user.initials}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
