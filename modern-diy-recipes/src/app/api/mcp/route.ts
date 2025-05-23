/**
 * Placeholder MCP API Route
 * TODO: Implement proper server-side MCP integration
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    return NextResponse.json(
      { 
        error: 'MCP integration temporarily disabled during build optimization',
        message: 'This API will be restored with a proper server-side implementation'
      },
      { status: 501 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'disabled',
    message: 'MCP integration temporarily disabled during build optimization',
    available: []
  });
}