import { NextRequest, NextResponse } from 'next/server';

/**
 * Delete single S3 object - proxies to backend API
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { key } = body;

    if (!key) {
      return NextResponse.json(
        { success: false, error: 'S3 key is required' },
        { status: 400 }
      );
    }

    // Use API_SERVER_URL for server-side calls (Docker internal network)
    const apiServerUrl = process.env.API_SERVER_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

    // Get auth token from request header
    const authToken = request.headers.get('authorization');

    const response = await fetch(`${apiServerUrl}/api/upload/delete`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { 'Authorization': authToken } : {}),
      },
      body: JSON.stringify({ key }),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error deleting from S3:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
