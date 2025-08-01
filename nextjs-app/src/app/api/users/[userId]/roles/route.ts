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
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check permissions - only admin or staff can update roles
    const canUpdateRoles = await isAdminServer(user.id) || await isStaffServer(user.id);
    if (!canUpdateRoles) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { account_id, role } = body;

    if (!account_id || !role) {
      return NextResponse.json(
        { error: 'account_id and role are required' },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ['admin', 'staff', 'account_owner', 'user'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    // Update role using admin client
    const adminClient = createAdminClient();
    const { data: updatedRelation, error: updateError } = await adminClient
      .from('account_users')
      .update({ role })
      .match({ user_id: userId, account_id })
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    // Log the action
    await adminClient
      .from('audit_logs')
      .insert({
        account_id,
        user_id: user.id,
        action: 'user.role_update',
        resource_type: 'user',
        resource_id: userId,
        metadata: {
          target_user_id: userId,
          new_role: role,
          account_id,
        },
      });

    return NextResponse.json({ success: true, data: updatedRelation });
  } catch (error) {
    console.error('Error updating user role:', error);
    return NextResponse.json(
      { error: 'Failed to update user role' },
      { status: 500 }
    );
  }
}