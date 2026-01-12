import { NextRequest, NextResponse } from 'next/server';
import { getApiServerUrl } from '@/lib/api-url';

/**
 * S3 Status endpoint - proxies to backend API
 */
export async function GET(request: NextRequest) {
  try {
    // Use helper to get properly formatted API URL
    const apiServerUrl = getApiServerUrl();

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
