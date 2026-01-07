import { NextRequest, NextResponse } from 'next/server';

/**
 * Server-side upload endpoint - proxies file uploads to backend API
 * This is more reliable than presigned URLs as the server handles the S3 upload
 */
export async function POST(request: NextRequest) {
  try {
    // Get the API server URL
    const apiServerUrl = process.env.API_SERVER_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

    // Get form data from request
    const formData = await request.formData();
    
    // Log what we received
    console.log('📤 Proxying upload to backend:', {
      apiServerUrl,
      hasFile: formData.has('file'),
      vehicleId: formData.get('vehicleId'),
      imageType: formData.get('imageType'),
    });

    // Forward the form data to the backend API
    const response = await fetch(`${apiServerUrl}/api/upload/upload`, {
      method: 'POST',
      body: formData,
    });

    const responseText = await response.text();
    console.log('📥 Backend response status:', response.status);
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      console.error('❌ Failed to parse backend response:', responseText);
      return NextResponse.json(
        { success: false, error: 'Invalid response from backend' },
        { status: 500 }
      );
    }

    if (!response.ok) {
      console.error('❌ Backend upload failed:', data);
      return NextResponse.json(data, { status: response.status });
    }

    console.log('✅ Upload successful:', data);
    return NextResponse.json(data);

  } catch (error) {
    console.error('❌ Server upload error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Upload failed'
      },
      { status: 500 }
    );
  }
}
