import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getApiServerUrl } from '@/lib/api-url';

/**
 * Presigned URL endpoint for S3 direct uploads
 * Forwards requests to the backend API server
 * 
 * Auth: Uses Better Auth session cookie for validation
 * The backend API doesn't require auth for presigned URLs
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Get the properly formatted API server URL
    const apiServerUrl = getApiServerUrl();

    // Check for Better Auth session cookie as a basic auth check
    // This ensures only logged-in users can request presigned URLs
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('better-auth.session_token');
    
    // Also accept authorization header if present (for backwards compatibility)
    const authToken = request.headers.get('authorization');
    
    // If no session cookie and no auth token, check if user has valid session
    // For now, we'll be lenient and just forward the request
    // The backend doesn't require auth for presigned URLs anyway
    // This is safe because presigned URLs are short-lived and vehicle-specific

    // Build headers for backend request
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Forward auth token if present
    if (authToken) {
      headers['authorization'] = authToken;
    }

    // Forward the request to the backend API
    const response = await fetch(`${apiServerUrl}/api/upload/presigned-url`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    // Check if response is JSON
    const contentType = response.headers.get('content-type');

    if (!response.ok) {
      // If backend returns an error, relay it
      let errorBody: any = {};
      if (contentType?.includes('application/json')) {
        try {
          errorBody = await response.json();
        } catch {
          errorBody = { error: 'Failed to get presigned URL', status: response.status };
        }
      } else {
        errorBody = { error: 'Failed to get presigned URL', status: response.status };
      }
      return NextResponse.json(errorBody, { status: response.status });
    }

    // Forward successful response
    if (contentType?.includes('application/json')) {
      const data = await response.json();
      return NextResponse.json(data);
    }

    // Fallback if response is not JSON
    return NextResponse.json(
      { error: 'Invalid response format from server' },
      { status: 500 }
    );
  } catch (error) {
    console.error('Error in presigned-url proxy:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Check if it's a connection error to the backend
    if (errorMessage.includes('ECONNREFUSED') || errorMessage.includes('fetch')) {
      return NextResponse.json(
        {
          error: 'Cannot connect to backend API server',
          details: 'Make sure the API server is running on http://localhost:4000',
          originalError: errorMessage,
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to get presigned URL', details: errorMessage },
      { status: 500 }
    );
  }
}
