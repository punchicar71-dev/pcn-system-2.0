/**
 * Next.js API Route - Delete Vehicle Images from S3
 * Proxy endpoint that forwards delete requests to backend API
 */

import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { vehicleId: string } }
) {
  try {
    console.log('🗑️ [Next.js DELETE Proxy] Request received for vehicle:', params.vehicleId);
    
    // Get auth token from request header
    const authToken = request.headers.get('authorization');

    if (!authToken) {
      console.error('❌ [Next.js DELETE Proxy] No authorization token provided');
      return NextResponse.json(
        { success: false, error: 'Authorization token required' },
        { status: 401 }
      );
    }

    // Get request body (s3Keys array)
    const body = await request.json();
    const { s3Keys } = body;

    if (!s3Keys || !Array.isArray(s3Keys)) {
      console.error('❌ [Next.js DELETE Proxy] Invalid s3Keys:', s3Keys);
      return NextResponse.json(
        { success: false, error: 'Invalid request: s3Keys array is required' },
        { status: 400 }
      );
    }

    console.log(`📋 [Next.js DELETE Proxy] Forwarding ${s3Keys.length} keys to backend API`);
    console.log(`🔗 [Next.js DELETE Proxy] Backend URL: ${API_URL}/api/upload/delete-vehicle/${params.vehicleId}`);

    // Forward request to backend API
    const response = await fetch(`${API_URL}/api/upload/delete-vehicle/${params.vehicleId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authToken,
      },
      body: JSON.stringify({ s3Keys }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error('❌ [Next.js DELETE Proxy] Backend error:', responseData);
      console.error('❌ [Next.js DELETE Proxy] Response status:', response.status);
      return NextResponse.json(
        { success: false, error: responseData.error || 'Failed to delete images' },
        { status: response.status }
      );
    }

    console.log('✅ [Next.js DELETE Proxy] Success:', responseData);
    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error('❌ [Next.js DELETE Proxy] Exception:', error);
    console.error('Error message:', error?.message);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
