import { NextResponse } from 'next/server';
import { isVercelConfigured } from '@/lib/services/domains.server';

export async function GET() {
  try {
    const configured = isVercelConfigured();
    
    return NextResponse.json({
      configured,
      message: configured 
        ? 'Vercel integration is configured' 
        : 'Vercel integration not configured. Domain verification will run in mock mode.',
    });
  } catch (error: any) {
    console.error('Error checking Vercel status:', error);
    return NextResponse.json(
      { error: 'Failed to check Vercel status' },
      { status: 500 }
    );
  }
}