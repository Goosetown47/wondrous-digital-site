import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createInvitation, isEmailInvited, isUserMember } from '@/lib/services/invitations';
import { getAppUrl } from '@/lib/utils/app-url';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: accountId } = await params;
    const { email, role } = await request.json();

    // Validate input
    if (!email || !role) {
      return NextResponse.json(
        { error: 'Email and role are required' },
        { status: 400 }
      );
    }

    if (!['user', 'account_owner'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    // Get current user
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin (admins can invite to any account)
    const { data: adminCheck } = await supabase
      .from('account_users')
      .select('role')
      .eq('user_id', user.id)
      .in('role', ['admin', 'staff'])
      .limit(1)
      .single();
    
    const isAdminOrStaff = adminCheck?.role === 'admin' || adminCheck?.role === 'staff';
    
    // If not admin/staff, check if they're an account owner for this specific account
    if (!isAdminOrStaff) {
      const { data: accountUser, error: accountError } = await supabase
        .from('account_users')
        .select('role')
        .eq('account_id', accountId)
        .eq('user_id', user.id)
        .single();

      if (accountError || !accountUser) {
        return NextResponse.json(
          { error: 'Not a member of this account' },
          { status: 403 }
        );
      }

      if (accountUser.role !== 'account_owner') {
        return NextResponse.json(
          { error: 'Only account owners can send invitations' },
          { status: 403 }
        );
      }
    }

    // Check if user is already a member
    const isMember = await isUserMember(accountId, email);
    if (isMember) {
      return NextResponse.json(
        { error: 'User is already a member of this account' },
        { status: 400 }
      );
    }

    // Check if there's already a pending invitation
    const hasInvitation = await isEmailInvited(accountId, email);
    if (hasInvitation) {
      return NextResponse.json(
        { error: 'An invitation has already been sent to this email' },
        { status: 400 }
      );
    }

    // Create the invitation
    const invitation = await createInvitation({
      accountId,
      email: email.toLowerCase(),
      role,
      invitedBy: user.id,
    });

    // Log the invitation URL for testing (remove in production)
    console.log(`Invitation URL: ${getAppUrl()}/invitation?token=${invitation.token}`);

    return NextResponse.json(invitation);
  } catch (error) {
    console.error('Error creating invitation:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create invitation' },
      { status: 500 }
    );
  }
}