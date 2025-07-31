import { NextRequest, NextResponse } from 'next/server';
import { getInvitationByToken } from '@/lib/services/invitations';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const invitation = await getInvitationByToken(token);
    
    if (!invitation) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      );
    }
    
    // Check if invitation is valid
    const now = new Date();
    const expiresAt = new Date(invitation.expires_at);
    
    if (invitation.accepted_at) {
      return NextResponse.json(
        { error: 'Invitation has already been accepted' },
        { status: 400 }
      );
    }
    
    if (invitation.declined_at) {
      return NextResponse.json(
        { error: 'Invitation has been declined' },
        { status: 400 }
      );
    }
    
    if (invitation.cancelled_at) {
      return NextResponse.json(
        { error: 'Invitation has been cancelled' },
        { status: 400 }
      );
    }
    
    if (expiresAt < now) {
      return NextResponse.json(
        { error: 'Invitation has expired' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(invitation);
  } catch (error) {
    console.error('Error fetching invitation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invitation' },
      { status: 500 }
    );
  }
}