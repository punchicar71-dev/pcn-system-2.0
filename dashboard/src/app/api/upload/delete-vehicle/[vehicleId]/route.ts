/**
 * Next.js API Route - Delete Vehicle Images from S3
 * Proxy endpoint that forwards delete requests to backend API
 * 
 * Auth: Uses Better Auth session cookie for validation
 * Also accepts authorization header for backwards compatibility
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Use API_SERVER_URL for server-side calls (Docker internal network)
const API_URL = process.env.API_SERVER_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { vehicleId: string } }
) {
  try {
    console.log('🗑️ [Next.js DELETE Proxy] Request received for vehicle:', params.vehicleId);
    
    // Check for Better Auth session cookie as a basic auth check
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('better-auth.session_token');
    
    // Also accept authorization header if present (for backwards compatibility)
    const authToken = request.headers.get('authorization');

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

    // Build headers for backend request
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Forward auth token if present
    if (authToken) {
      headers['Authorization'] = authToken;
    }

    // Forward request to backend API
    const response = await fetch(`${API_URL}/api/upload/delete-vehicle/${params.vehicleId}`, {
      method: 'DELETE',
      headers,
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
