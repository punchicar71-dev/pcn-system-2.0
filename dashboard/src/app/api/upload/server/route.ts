import { NextRequest, NextResponse } from 'next/server';
import { getApiServerUrl } from '@/lib/api-url';

/**
 * Server-side upload endpoint - proxies file uploads to backend API
 * This is more reliable than presigned URLs as the server handles the S3 upload
 */
export async function POST(request: NextRequest) {
  try {
    // Get the properly formatted API server URL
    const apiServerUrl = getApiServerUrl();

    // Get form data from request
    const formData = await request.formData();
    
    const file = formData.get('file');
    const fileName = file instanceof File ? file.name : 'unknown';
    
    // Log what we received
    console.log('📤 [UPLOAD SERVER] Proxying upload to backend:', {
      apiServerUrl,
      fileName,
      fileSize: file instanceof File ? file.size : 0,
      hasFile: formData.has('file'),
      vehicleId: formData.get('vehicleId'),
      imageType: formData.get('imageType'),
    });

    // Forward the form data to the backend API
    const uploadUrl = `${apiServerUrl}/api/upload/upload`;
    console.log('🔗 [UPLOAD SERVER] Calling:', uploadUrl);
    
    const response = await fetch(uploadUrl, {
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
    console.error('❌ [UPLOAD SERVER] Error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Upload failed';
    const errorDetails = error instanceof Error ? error.stack : undefined;
    
    console.error('❌ [UPLOAD SERVER] Details:', {
      message: errorMessage,
      stack: errorDetails,
    });
    
    return NextResponse.json(
      { 
        success: false, 
        error: `Server upload failed: ${errorMessage}`,
        details: errorDetails
      },
      { status: 500 }
    );
  }
}
