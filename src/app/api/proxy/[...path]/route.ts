/**
 * API Proxy Route
 * Proxies requests to the Azure API to bypass CORS restrictions in development
 * 
 * This route forwards all API requests from the frontend to the Azure API backend.
 * Since this runs on the server-side, CORS restrictions don't apply.
 * 
 * Usage: /api/proxy/api/v1/booking/?building_id=...
 */

import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://pconnect-api-gcdce6eagcfyavgr.southafricanorth-01.azurewebsites.net';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path, 'GET');
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path, 'POST');
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path, 'PUT');
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path, 'DELETE');
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path, 'PATCH');
}

export async function OPTIONS() {
  // Handle CORS preflight requests
  return NextResponse.json({}, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}

async function proxyRequest(
  request: NextRequest,
  pathSegments: string[],
  method: string
) {
  try {
    // Reconstruct the path
    const path = `/${pathSegments.join('/')}`;
    
    // Get query string from original request
    const searchParams = request.nextUrl.searchParams;
    const queryString = searchParams.toString();
    const url = `${API_BASE_URL}${path}${queryString ? `?${queryString}` : ''}`;

    // Get authorization header from request
    const authHeader = request.headers.get('Authorization');
    
    // Debug logging in development
    if (process.env.NODE_ENV === 'development') {
      const authPreview = authHeader 
        ? (authHeader.startsWith('Bearer ') 
            ? `Bearer ${authHeader.substring(7, 20)}...` 
            : `${authHeader.substring(0, 20)}...`)
        : 'Missing';
      console.log('[API Proxy] Request:', {
        authorization: authPreview,
        url,
        method,
      });
    }
    
    // Prepare headers
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    
    if (authHeader) {
      headers['Authorization'] = authHeader;
    } else if (process.env.NODE_ENV === 'development') {
      console.warn('[API Proxy] No Authorization header found in request');
    }

    // Get request body for non-GET requests
    let body: string | undefined;
    if (method !== 'GET' && method !== 'DELETE') {
      try {
        const requestBody = await request.text();
        body = requestBody || undefined;
      } catch {
        // No body
      }
    }

    // Make request to Azure API
    const response = await fetch(url, {
      method,
      headers,
      body,
    });

    // Log 401 errors with more detail
    if (response.status === 401 && process.env.NODE_ENV === 'development') {
      console.error('[API Proxy] 401 Unauthorized:', {
        url,
        method,
        hasAuthHeader: !!authHeader,
        authHeaderFormat: authHeader ? (authHeader.startsWith('Bearer ') ? 'Bearer <token>' : 'Invalid format') : 'None',
        responseStatus: response.status,
      });
    }

    // Get response data
    const contentType = response.headers.get('content-type');
    let data: any;
    
    if (contentType?.includes('application/json')) {
      try {
        data = await response.json();
      } catch {
        data = {};
      }
    } else {
      data = await response.text();
    }

    // Return response with CORS headers
    return NextResponse.json(data, {
      status: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error: any) {
    console.error('[API Proxy Error]', error);
    return NextResponse.json(
      { 
        error: 'Proxy request failed',
        message: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}

