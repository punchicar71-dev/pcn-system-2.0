import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { existsSync } from 'fs'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const vehicleId = formData.get('vehicleId') as string
    const imageType = formData.get('imageType') as string // 'gallery' or 'cr_paper'
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    if (!vehicleId) {
      return NextResponse.json({ error: 'Vehicle ID is required' }, { status: 400 })
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create uploads directory structure
    const uploadBaseDir = path.join(process.cwd(), 'public', 'uploads', 'vehicles', vehicleId)
    const uploadDir = imageType === 'cr_paper' 
      ? path.join(uploadBaseDir, 'documents')
      : uploadBaseDir

    // Create directory if it doesn't exist
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Generate unique filename with timestamp
    const timestamp = Date.now()
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filename = `${timestamp}-${sanitizedFileName}`
    const filepath = path.join(uploadDir, filename)

    // Save file to local storage
    await writeFile(filepath, buffer)

    // Generate public URL (relative to public directory)
    const publicPath = imageType === 'cr_paper'
      ? `/uploads/vehicles/${vehicleId}/documents/${filename}`
      : `/uploads/vehicles/${vehicleId}/${filename}`
    
    return NextResponse.json({ 
      success: true, 
      url: publicPath,
      fileName: file.name,
      fileSize: file.size,
      storagePath: publicPath
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ 
      error: 'Upload failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
