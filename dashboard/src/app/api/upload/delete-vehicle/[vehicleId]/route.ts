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
    // Get auth token from request header
    const authToken = request.headers.get('authorization');

    if (!authToken) {
      return NextResponse.json(
        { success: false, error: 'Authorization token required' },
        { status: 401 }
      );
    }

    // Get request body (s3Keys array)
    const body = await request.json();
    const { s3Keys } = body;

    if (!s3Keys || !Array.isArray(s3Keys)) {
      return NextResponse.json(
        { success: false, error: 'Invalid request: s3Keys array is required' },
        { status: 400 }
      );
    }

    console.log(`[DELETE Vehicle Images] Vehicle ID: ${params.vehicleId}, Keys: ${s3Keys.length}`);

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
      console.error('[DELETE Vehicle Images] Backend error:', responseData);
      return NextResponse.json(
        { success: false, error: responseData.error || 'Failed to delete images' },
        { status: response.status }
      );
    }

    console.log('[DELETE Vehicle Images] Success:', responseData);
    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error('[DELETE Vehicle Images] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
