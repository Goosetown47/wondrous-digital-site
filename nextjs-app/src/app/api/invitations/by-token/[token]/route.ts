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
    
    // Return the invitation with status flags for the client to handle
    const response = {
      ...invitation,
      expired: expiresAt < now,
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching invitation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invitation' },
      { status: 500 }
    );
  }
}