import { Car, DollarSign, Package, TrendingUp } from 'lucide-react'

export default function DashboardPage() {
  const stats = [
    { name: 'Total Vehicles', value: '124', icon: Car, color: 'bg-blue-500' },
    { name: 'Total Sales', value: '$2.4M', icon: DollarSign, color: 'bg-green-500' },
    { name: 'In Stock', value: '89', icon: Package, color: 'bg-yellow-500' },
    { name: 'This Month', value: '+12%', icon: TrendingUp, color: 'bg-purple-500' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your business.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Sales</h3>
          <div className="space-y-4">
            <p className="text-sm text-gray-500">No recent sales to display</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors">
              Add New Vehicle
            </button>
            <button className="w-full text-left px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors">
              Record Sale
            </button>
            <button className="w-full text-left px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition-colors">
              View Reports
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
