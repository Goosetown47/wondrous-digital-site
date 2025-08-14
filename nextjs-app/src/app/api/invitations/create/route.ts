import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createInvitation, isEmailInvited, isUserMember } from '@/lib/services/invitations';
import { isAdmin } from '@/lib/permissions';
import { buildAppUrl } from '@/lib/utils/app-url';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { email, role, accountId, invitedBy } = body;
    
    if (!email || !role || !accountId) {
      return NextResponse.json(
        { error: 'Email, role, and accountId are required' },
        { status: 400 }
      );
    }
    
    // Validate role
    if (!['account_owner', 'user'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }
    
    // Check if user is admin or account owner
    const userIsAdmin = await isAdmin(user.id);
    
    if (!userIsAdmin) {
      // Check if user is account owner
      const { data: accountUser } = await supabase
        .from('account_users')
        .select('role')
        .eq('account_id', accountId)
        .eq('user_id', user.id)
        .single();
        
      if (!accountUser || accountUser.role !== 'account_owner') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }
    
    // Check if email is already a member
    const isMember = await isUserMember(accountId, email);
    if (isMember) {
      return NextResponse.json(
        { error: 'User is already a member of this account' },
        { status: 400 }
      );
    }
    
    // Check if email is already invited
    const isInvited = await isEmailInvited(accountId, email);
    if (isInvited) {
      return NextResponse.json(
        { error: 'User has already been invited to this account' },
        { status: 400 }
      );
    }
    
    // Create the invitation
    const invitation = await createInvitation({
      accountId,
      email,
      role,
      invitedBy: invitedBy || user.id,
    });
    
    // TODO: Send invitation email
    // For now, we'll just return the invitation with the token
    
    return NextResponse.json({
      ...invitation,
      inviteUrl: buildAppUrl(`/invitation/${invitation.token}`),
    });
  } catch (error) {
    console.error('Error creating invitation:', error);
    return NextResponse.json(
      { error: 'Failed to create invitation' },
      { status: 500 }
    );
  }
}