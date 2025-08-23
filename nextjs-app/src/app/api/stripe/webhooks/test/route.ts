import { NextRequest, NextResponse } from 'next/server';

// Simple test endpoint to verify webhook connectivity
export async function POST(request: NextRequest) {
  console.log('🚨 TEST WEBHOOK ENDPOINT HIT');
  console.log('Timestamp:', new Date().toISOString());
  
  // Log headers
  const headers = Object.fromEntries(request.headers.entries());
  console.log('Headers:', JSON.stringify(headers, null, 2));
  
  // Log body
  const body = await request.text();
  console.log('Body length:', body.length);
  console.log('Body preview:', body.substring(0, 200));
  
  return NextResponse.json({ 
    received: true, 
    timestamp: new Date().toISOString() 
  });
}

export async function GET() {
  console.log('🚨 TEST WEBHOOK GET REQUEST');
  return NextResponse.json({ 
    status: 'Webhook test endpoint is working',
    timestamp: new Date().toISOString() 
  });
}