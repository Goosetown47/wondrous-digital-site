import { NextRequest, NextResponse } from 'next/server';
import { acceptInvitationAfterSignup } from '@/lib/services/invitations';

export async function POST(request: NextRequest) {
  try {
    const { token, email } = await request.json();
    
    if (!token || !email) {
      return NextResponse.json(
        { error: 'Token and email are required' },
        { status: 400 }
      );
    }
    
    // Accept the invitation after signup
    const result = await acceptInvitationAfterSignup(token, email);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to accept invitation' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      success: true,
      accountId: result.account_id,
      role: result.role,
    });
  } catch (error) {
    console.error('Error accepting invitation after signup:', error);
    return NextResponse.json(
      { error: 'Failed to accept invitation' },
      { status: 500 }
    );
  }
}