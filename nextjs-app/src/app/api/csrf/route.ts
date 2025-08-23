import { NextResponse } from 'next/server';
import { setCSRFCookie } from '@/lib/security/csrf';

export async function GET() {
  try {
    const token = await setCSRFCookie();
    
    return NextResponse.json({ token }, { status: 200 });
  } catch (error) {
    console.error('Error generating CSRF token:', error);
    return NextResponse.json(
      { error: 'Failed to generate CSRF token' },
      { status: 500 }
    );
  }
}