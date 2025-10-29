import { NextRequest, NextResponse } from 'next/server'
import { rm } from 'fs/promises'
import path from 'path'

/**
 * DELETE /api/upload/cleanup
 * Deletes vehicle images from local storage when a vehicle is deleted
 * 
 * Body: { vehicleId: string }
 */
export async function DELETE(request: NextRequest) {
  try {
    const { vehicleId } = await request.json()
    
    if (!vehicleId) {
      return NextResponse.json({ error: 'Vehicle ID is required' }, { status: 400 })
    }

    // Optional: Verify user has permission to delete (add auth check here)
    
    // Delete the vehicle's directory
    const vehicleDir = path.join(process.cwd(), 'public', 'uploads', 'vehicles', vehicleId)
    
    try {
      await rm(vehicleDir, { recursive: true, force: true })
      console.log(`Deleted vehicle images for: ${vehicleId}`)
    } catch (error) {
      // Directory might not exist, that's okay
      console.log(`No images found for vehicle: ${vehicleId}`)
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Vehicle images deleted successfully',
      vehicleId 
    })
  } catch (error) {
    console.error('Cleanup error:', error)
    return NextResponse.json({ 
      error: 'Cleanup failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}

/**
 * GET /api/upload/stats
 * Get storage statistics
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    
    if (action === 'stats') {
      // In a real implementation, you'd calculate directory sizes
      // For now, return a simple response
      return NextResponse.json({
        success: true,
        message: 'Storage stats endpoint',
        uploadsPath: '/uploads/vehicles/',
      })
    }
    
    return NextResponse.json({ 
      success: true,
      endpoints: {
        upload: 'POST /api/upload',
        cleanup: 'DELETE /api/upload/cleanup',
        stats: 'GET /api/upload?action=stats'
      }
    })
  } catch (error) {
    console.error('Stats error:', error)
    return NextResponse.json({ 
      error: 'Failed to get stats',
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
