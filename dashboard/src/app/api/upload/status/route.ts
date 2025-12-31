import { NextRequest, NextResponse } from 'next/server';

/**
 * S3 Status endpoint - proxies to backend API
 */
export async function GET(request: NextRequest) {
  try {
    // Use API_SERVER_URL for server-side calls (Docker internal network)
    const apiServerUrl = process.env.API_SERVER_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

    const response = await fetch(`${apiServerUrl}/api/upload/status`);

    if (!response.ok) {
      return NextResponse.json(
        { s3Configured: false, error: 'Failed to check S3 status' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error checking S3 status:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    if (errorMessage.includes('ECONNREFUSED')) {
      return NextResponse.json(
        { s3Configured: false, error: 'Cannot connect to API server' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { s3Configured: false, error: 'Failed to check S3 status' },
      { status: 500 }
    );
  }
}
