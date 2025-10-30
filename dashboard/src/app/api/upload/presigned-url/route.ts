import { NextRequest, NextResponse } from 'next/server';

/**
 * Presigned URL endpoint for S3 direct uploads
 * Forwards requests to the backend API server
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Get the API server URL from environment variables
    const apiServerUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

    // Get auth token from request header
    const authToken = request.headers.get('authorization');

    if (!authToken) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    // Forward the request to the backend API
    const response = await fetch(`${apiServerUrl}/api/upload/presigned-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'authorization': authToken,
      },
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
