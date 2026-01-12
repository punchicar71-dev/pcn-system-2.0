import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getApiServerUrl } from '@/lib/api-url';

/**
 * Proxy endpoint for uploading files to S3 through the backend API
 * This endpoint forwards requests to the backend API server with authentication
 */
export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // Get the properly formatted API server URL
    const apiServerUrl = getApiServerUrl();
    
    // Get auth token from request header
    let authToken = request.headers.get('authorization');
    
    // If no auth header, try to get the token from Supabase session cookie
    if (!authToken) {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        
        if (supabaseUrl && supabaseAnonKey) {
          const cookies = request.headers.get('cookie') || '';
          if (cookies) {
            authToken = `Bearer ${cookies}`;
          }
        }
      } catch (e) {
        console.warn('Could not extract auth token:', e);
      }
    }

    // Determine which endpoint to call based on content-type
    const contentType = request.headers.get('content-type') || '';
    let backendEndpoint = '/api/upload/upload';

    if (contentType.includes('application/json')) {
      // JSON request - likely presigned URL request
      backendEndpoint = '/api/upload/presigned-url';
    }
    
    // Prepare request body
    let forwardBody: any;
    if (contentType.includes('multipart/form-data')) {
      forwardBody = await request.blob();
    } else if (contentType.includes('application/json')) {
      forwardBody = await request.text();
    } else {
      forwardBody = await request.blob();
    }

    // Forward the request to the backend API
    const response = await fetch(`${apiServerUrl}${backendEndpoint}`, {
      method: 'POST',
      body: forwardBody,
      headers: {
        // Forward the authorization header if present
        ...(authToken && {
          'authorization': authToken,
        }),
        // Forward content-type
        ...(contentType && {
          'content-type': contentType,
        }),
      },
    });

    // Check if response is JSON
    const responseContentType = response.headers.get('content-type');
    
    if (!response.ok) {
      // If backend returns an error, relay it
      let errorBody: any = {};
      if (responseContentType?.includes('application/json')) {
        try {
          errorBody = await response.json();
        } catch {
          errorBody = { error: 'Upload failed', status: response.status };
        }
      } else {
        errorBody = { error: 'Upload failed', status: response.status };
      }
      return NextResponse.json(errorBody, { status: response.status });
    }

    // Forward successful response
    if (responseContentType?.includes('application/json')) {
      const data = await response.json();
      return NextResponse.json(data);
    }

    // Fallback if response is not JSON
    return NextResponse.json(
      { error: 'Invalid response format from server' },
      { status: 500 }
    );
  } catch (error) {
    console.error('Error in upload proxy:', error);
    
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
      { error: 'Upload failed', details: errorMessage },
      { status: 500 }
    );
  }
}
