import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { cancelInvitation } from '@/lib/services/invitations';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get the invitation to check permissions
    const { data: invitation } = await supabase
      .from('account_invitations')
      .select('account_id')
      .eq('id', id)
      .single();
      
    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }
    
    // Check if user is admin/staff (can cancel invitations for any account)
    const { data: adminCheck } = await supabase
      .from('account_users')
      .select('role')
      .eq('user_id', user.id)
      .in('role', ['admin', 'staff'])
      .limit(1)
      .single();
    
    const isAdminOrStaff = adminCheck?.role === 'admin' || adminCheck?.role === 'staff';
    
    if (!isAdminOrStaff) {
      // Check if they're an account owner for this specific account
      const { data: accountUser } = await supabase
        .from('account_users')
        .select('role')
        .eq('account_id', invitation.account_id)
        .eq('user_id', user.id)
        .single();
        
      if (!accountUser || accountUser.role !== 'account_owner') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }
    
    await cancelInvitation(id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error canceling invitation:', error);
    return NextResponse.json(
      { error: 'Failed to cancel invitation' },
      { status: 500 }
    );
  }
}