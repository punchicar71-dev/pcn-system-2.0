import React from 'react'
import { RotateCw, Eye, Grid3x3, Play, Maximize2, Info } from 'lucide-react'

/**
 * 360° Image Viewer - Feature Overview Component
 * 
 * This component demonstrates all the features of the 360° viewer
 * Use this as a visual reference or in documentation
 */
export default function Feature360Overview() {
  return (
    <div className="max-w-4xl mx-auto p-8 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
          <div className="flex items-center gap-3 mb-4">
            <RotateCw className="w-12 h-12" />
            <div>
              <h1 className="text-3xl font-bold">360° Image Viewer</h1>
              <p className="text-blue-100">Interactive Vehicle Viewing Experience</p>
            </div>
          </div>
        </div>

        {/* Main Features Grid */}
        <div className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Feature 1: Drag to Rotate */}
            <div className="border-2 border-blue-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <RotateCw className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Drag to Rotate</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Click and drag left or right to smoothly rotate through vehicle images. 
                Swipe on mobile for touch-friendly interaction.
              </p>
              <div className="mt-4 flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="w-1/3 h-full bg-blue-600"></div>
                </div>
                <span className="text-xs text-gray-500">Smooth</span>
              </div>
            </div>

            {/* Feature 2: Auto-Rotation */}
            <div className="border-2 border-green-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Play className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Auto-Rotation</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Enable automatic rotation to showcase the vehicle hands-free. 
                Adjustable speed from slow to fast.
              </p>
              <div className="mt-4 flex gap-2">
                <button className="px-3 py-1 bg-green-600 text-white rounded text-xs">
                  ▶ Play
                </button>
                <button className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-xs">
                  ⏸ Pause
                </button>
              </div>
            </div>

            {/* Feature 3: Mode Switcher */}
            <div className="border-2 border-purple-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Grid3x3 className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">View Mode Toggle</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Switch between traditional gallery carousel and immersive 360° view 
                with a single click.
              </p>
              <div className="mt-4 inline-flex bg-gray-100 rounded-lg p-1">
                <button className="px-3 py-1 bg-white text-gray-900 rounded shadow-sm text-xs">
                  Gallery
                </button>
                <button className="px-3 py-1 text-gray-600 text-xs">
                  360° View
                </button>
              </div>
            </div>

            {/* Feature 4: Fullscreen */}
            <div className="border-2 border-orange-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Maximize2 className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Fullscreen Mode</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Expand to fullscreen for an immersive viewing experience. 
                Perfect for detailed inspections.
              </p>
              <div className="mt-4">
                <div className="border-2 border-dashed border-orange-300 rounded p-2 text-center text-xs text-orange-600">
                  Click to expand ⛶
                </div>
              </div>
            </div>
          </div>

          {/* Additional Features */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-600" />
              Additional Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5"></div>
                <div>
                  <div className="font-medium text-gray-900 text-sm">Image Counter</div>
                  <div className="text-xs text-gray-600">Shows current frame / total</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5"></div>
                <div>
                  <div className="font-medium text-gray-900 text-sm">Progress Bar</div>
                  <div className="text-xs text-gray-600">Visual rotation position</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5"></div>
                <div>
                  <div className="font-medium text-gray-900 text-sm">Loading State</div>
                  <div className="text-xs text-gray-600">Shows image preload progress</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5"></div>
                <div>
                  <div className="font-medium text-gray-900 text-sm">Mobile Support</div>
                  <div className="text-xs text-gray-600">Touch gestures enabled</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5"></div>
                <div>
                  <div className="font-medium text-gray-900 text-sm">Help Overlay</div>
                  <div className="text-xs text-gray-600">Guides first-time users</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5"></div>
                <div>
                  <div className="font-medium text-gray-900 text-sm">Reset Button</div>
                  <div className="text-xs text-gray-600">Return to first frame</div>
                </div>
              </div>
            </div>
          </div>

          {/* Usage Example */}
          <div className="border-2 border-gray-200 rounded-xl p-6 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage Example</h3>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-xs overflow-x-auto">
              <div className="text-green-400">import</div> Image360Viewer <div className="text-green-400">from</div> <div className="text-yellow-400">'@/components/ui/360-viewer'</div>
              <br /><br />
              <div className="text-blue-400">&lt;Image360Viewer</div>
              <br />
              &nbsp;&nbsp;<div className="text-purple-400">images</div>={'{'}imageUrls{'}'}
              <br />
              &nbsp;&nbsp;<div className="text-purple-400">autoRotate</div>={'{'}false{'}'}
              <br />
              &nbsp;&nbsp;<div className="text-purple-400">sensitivity</div>={'{'}8{'}'}
              <br />
              &nbsp;&nbsp;<div className="text-purple-400">height</div>=<div className="text-yellow-400">"500px"</div>
              <br />
              <div className="text-blue-400">/&gt;</div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap gap-3 justify-center pt-4">
            <a 
              href="http://localhost:3001/test-360" 
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              🧪 Try Test Page
            </a>
            <a 
              href="http://localhost:3001/inventory" 
              className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
            >
              <Eye className="w-4 h-4 inline mr-2" />
              View Inventory
            </a>
            <a 
              href="/dashboard/360_QUICK_START.md" 
              className="px-6 py-3 bg-white text-gray-900 border-2 border-gray-300 rounded-lg hover:border-gray-400 transition-colors font-medium"
            >
              📖 Documentation
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-4 border-t">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>✅ Ready to use • No setup required</div>
            <div>Version 1.0.0</div>
          </div>
        </div>
      </div>
    </div>
  )
}
