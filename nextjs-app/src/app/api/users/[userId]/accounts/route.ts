import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isAdminServer, isStaffServer } from '@/lib/permissions/server-checks';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const supabase = createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check permissions
    const canManageAccounts = await isAdminServer(user.id) || await isStaffServer(user.id);
    if (!canManageAccounts) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { accounts, action = 'set' } = body;

    if (!Array.isArray(accounts)) {
      return NextResponse.json(
        { error: 'accounts must be an array' },
        { status: 400 }
      );
    }

    const adminClient = createAdminClient();

    if (action === 'set') {
      // Remove all existing account relationships
      const { error: deleteError } = await adminClient
        .from('account_users')
        .delete()
        .eq('user_id', userId);

      if (deleteError) throw deleteError;

      // Add new account relationships
      if (accounts.length > 0) {
        const accountRelations = accounts.map(acc => ({
          user_id: userId,
          account_id: acc.account_id,
          role: acc.role || 'user',
          invited_by: user.id,
        }));

        const { error: insertError } = await adminClient
          .from('account_users')
          .insert(accountRelations);

        if (insertError) throw insertError;
      }
    } else if (action === 'add') {
      // Add accounts without removing existing ones
      const accountRelations = accounts.map(acc => ({
        user_id: params.userId,
        account_id: acc.account_id,
        role: acc.role || 'user',
        invited_by: user.id,
      }));

      const { error: insertError } = await adminClient
        .from('account_users')
        .insert(accountRelations);

      if (insertError) throw insertError;
    } else if (action === 'remove') {
      // Remove specific accounts
      const accountIds = accounts.map(acc => acc.account_id);
      
      const { error: deleteError } = await adminClient
        .from('account_users')
        .delete()
        .eq('user_id', params.userId)
        .in('account_id', accountIds);

      if (deleteError) throw deleteError;
    }

    // Log the action
    await adminClient
      .from('audit_logs')
      .insert({
        user_id: user.id,
        action: `user.accounts_${action}`,
        resource_type: 'user',
        resource_id: params.userId,
        metadata: {
          target_user_id: params.userId,
          accounts,
          action,
        },
      });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating user accounts:', error);
    return NextResponse.json(
      { error: 'Failed to update user accounts' },
      { status: 500 }
    );
  }
}