'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import { CheckCircle, XCircle, Database, AlertCircle } from 'lucide-react'

interface TestResult {
  test: string
  status: 'success' | 'error' | 'warning'
  message: string
  data?: any
}

export default function DatabaseTestPage() {
  const [testing, setTesting] = useState(false)
  const [results, setResults] = useState<TestResult[]>([])

  const runTests = async () => {
    setTesting(true)
    setResults([])
    const testResults: TestResult[] = []

    const supabase = createClient()

    // Test 1: Connection
    try {
      const { data, error } = await supabase.from('vehicles').select('count').limit(1)
      if (error) throw error
      testResults.push({
        test: 'Database Connection',
        status: 'success',
        message: 'Successfully connected to Supabase'
      })
    } catch (error: any) {
      testResults.push({
        test: 'Database Connection',
        status: 'error',
        message: error.message
      })
    }

    // Test 2: Check vehicles table
    try {
      const { data, error } = await supabase.from('vehicles').select('*').limit(1)
      if (error) throw error
      testResults.push({
        test: 'Vehicles Table',
        status: 'success',
        message: `Table exists (${data.length} records found)`
      })
    } catch (error: any) {
      testResults.push({
        test: 'Vehicles Table',
        status: 'error',
        message: error.message
      })
    }

    // Test 3: Check vehicle_brands table
    try {
      const { data, error } = await supabase.from('vehicle_brands').select('*')
      if (error) throw error
      testResults.push({
        test: 'Vehicle Brands',
        status: 'success',
        message: `${data.length} brands found`,
        data: data.map((b: any) => b.name).join(', ')
      })
    } catch (error: any) {
      testResults.push({
        test: 'Vehicle Brands',
        status: 'error',
        message: error.message
      })
    }

    // Test 4: Check vehicle_models table
    try {
      const { data, error } = await supabase.from('vehicle_models').select('*')
      if (error) throw error
      testResults.push({
        test: 'Vehicle Models',
        status: 'success',
        message: `${data.length} models found`,
        data: data.slice(0, 5).map((m: any) => m.name).join(', ') + '...'
      })
    } catch (error: any) {
      testResults.push({
        test: 'Vehicle Models',
        status: 'error',
        message: error.message
      })
    }

    // Test 5: Check countries table
    try {
      const { data, error } = await supabase.from('countries').select('*')
      if (error) throw error
      testResults.push({
        test: 'Countries',
        status: 'success',
        message: `${data.length} countries found`,
        data: data.map((c: any) => c.name).join(', ')
      })
    } catch (error: any) {
      testResults.push({
        test: 'Countries',
        status: 'error',
        message: error.message
      })
    }

    // Test 6: Check vehicle_options_master table
    try {
      const { data, error } = await supabase.from('vehicle_options_master').select('*')
      if (error) throw error
      testResults.push({
        test: 'Vehicle Options',
        status: 'success',
        message: `${data.length} options found`
      })
    } catch (error: any) {
      testResults.push({
        test: 'Vehicle Options',
        status: 'error',
        message: error.message
      })
    }

    // Test 7: Check sellers table
    try {
      const { data, error } = await supabase.from('sellers').select('*').limit(1)
      if (error) throw error
      testResults.push({
        test: 'Sellers Table',
        status: 'success',
        message: 'Table exists'
      })
    } catch (error: any) {
      testResults.push({
        test: 'Sellers Table',
        status: 'error',
        message: error.message
      })
    }

    // Test 8: Check vehicle_images table
    try {
      const { data, error } = await supabase.from('vehicle_images').select('*').limit(1)
      if (error) throw error
      testResults.push({
        test: 'Vehicle Images Table',
        status: 'success',
        message: 'Table exists'
      })
    } catch (error: any) {
      testResults.push({
        test: 'Vehicle Images Table',
        status: 'error',
        message: error.message
      })
    }

    // Test 9: Check vehicle_inventory_view
    try {
      const { data, error } = await supabase.from('vehicle_inventory_view').select('*').limit(1)
      if (error) throw error
      testResults.push({
        test: 'Inventory View',
        status: 'success',
        message: 'View exists and queryable'
      })
    } catch (error: any) {
      testResults.push({
        test: 'Inventory View',
        status: 'error',
        message: error.message
      })
    }

    setResults(testResults)
    setTesting(false)
  }

  const getIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />
      default:
        return null
    }
  }

  const successCount = results.filter(r => r.status === 'success').length
  const errorCount = results.filter(r => r.status === 'error').length

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Database className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Database Connection Test</h1>
              <p className="text-gray-600">Verify Supabase database setup</p>
            </div>
          </div>

          <button
            onClick={runTests}
            disabled={testing}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {testing ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Running Tests...
              </span>
            ) : (
              'Run Database Tests'
            )}
          </button>
        </div>

        {/* Results Summary */}
        {results.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-2xl font-bold text-gray-900">{results.length}</div>
              <div className="text-sm text-gray-600">Total Tests</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-2xl font-bold text-green-600">{successCount}</div>
              <div className="text-sm text-gray-600">Passed</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-2xl font-bold text-red-600">{errorCount}</div>
              <div className="text-sm text-gray-600">Failed</div>
            </div>
          </div>
        )}

        {/* Test Results */}
        {results.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Test Results</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`p-6 ${
                    result.status === 'success'
                      ? 'bg-green-50'
                      : result.status === 'error'
                      ? 'bg-red-50'
                      : 'bg-yellow-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">{getIcon(result.status)}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{result.test}</h3>
                      <p className="text-sm text-gray-700 mb-2">{result.message}</p>
                      {result.data && (
                        <div className="mt-2 p-3 bg-white rounded border border-gray-200">
                          <code className="text-xs text-gray-600">{result.data}</code>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Overall Status */}
        {results.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
            {errorCount === 0 ? (
              <div className="flex items-center gap-3 text-green-600">
                <CheckCircle className="w-6 h-6" />
                <div>
                  <h3 className="font-bold text-lg">✅ All Tests Passed!</h3>
                  <p className="text-sm text-gray-600">
                    Your database is fully configured and ready to use. You can now add vehicles!
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 text-red-600">
                <XCircle className="w-6 h-6" />
                <div>
                  <h3 className="font-bold text-lg">❌ Some Tests Failed</h3>
                  <p className="text-sm text-gray-600">
                    Please run the SQL setup script again or check the error messages above.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quick Links */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <a
            href="/add-vehicle"
            className="block p-4 bg-white rounded-lg shadow hover:shadow-lg transition-shadow text-center"
          >
            <div className="text-blue-600 font-semibold">Add Vehicle</div>
            <div className="text-sm text-gray-600">Test the full flow</div>
          </a>
          <a
            href="/inventory"
            className="block p-4 bg-white rounded-lg shadow hover:shadow-lg transition-shadow text-center"
          >
            <div className="text-blue-600 font-semibold">View Inventory</div>
            <div className="text-sm text-gray-600">See all vehicles</div>
          </a>
        </div>
      </div>
    </div>
  )
}
