import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { acceptInvitation } from '@/lib/services/invitations';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();
    
    if (!token) {
      return NextResponse.json(
        { error: 'Invitation token is required' },
        { status: 400 }
      );
    }
    
    // Get current user (if any)
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'You must be logged in to accept an invitation' },
        { status: 401 }
      );
    }
    
    // Get the invitation details first
    const { data: invitation } = await supabase
      .from('account_invitations')
      .select('email')
      .eq('token', token)
      .single();
      
    if (!invitation) {
      return NextResponse.json(
        { error: 'Invalid invitation token' },
        { status: 404 }
      );
    }
    
    // Check if the logged-in user's email matches the invitation email
    if (user.email?.toLowerCase() !== invitation.email.toLowerCase()) {
      return NextResponse.json(
        { error: `This invitation is for ${invitation.email}. Please log in with that email address.` },
        { status: 403 }
      );
    }
    
    // Accept the invitation
    const result = await acceptInvitation(token);
    
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
    console.error('Error accepting invitation:', error);
    return NextResponse.json(
      { error: 'Failed to accept invitation' },
      { status: 500 }
    );
  }
}