import { NextRequest, NextResponse } from 'next/server';
import { declineInvitation } from '@/lib/services/invitations';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();
    
    if (!token) {
      return NextResponse.json(
        { error: 'Invitation token is required' },
        { status: 400 }
      );
    }
    
    // Decline the invitation (no authentication required)
    const result = await declineInvitation(token);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to decline invitation' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error('Error declining invitation:', error);
    return NextResponse.json(
      { error: 'Failed to decline invitation' },
      { status: 500 }
    );
  }
}