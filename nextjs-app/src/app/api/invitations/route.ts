import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getAccountInvitations } from '@/lib/services/invitations';
import { isAdmin } from '@/lib/permissions';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const searchParams = request.nextUrl.searchParams;
    const accountId = searchParams.get('accountId');
    const status = searchParams.get('status') || 'all';
    
    if (!accountId) {
      return NextResponse.json({ error: 'Account ID required' }, { status: 400 });
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
    
    const invitations = await getAccountInvitations(accountId, status as 'pending' | 'accepted' | 'declined' | 'expired' | 'all');
    
    return NextResponse.json(invitations);
  } catch (error) {
    console.error('Error fetching invitations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invitations' },
      { status: 500 }
    );
  }
}