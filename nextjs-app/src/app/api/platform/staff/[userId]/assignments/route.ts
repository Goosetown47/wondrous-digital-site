import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isAdminServer, isStaffServer } from '@/lib/permissions/server-checks';

export async function GET(
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

    // Admins can view any staff assignments, staff can view their own
    const isUserAdmin = await isAdminServer(user.id);
    const isUserStaff = await isStaffServer(user.id);
    
    if (!isUserAdmin && (!isUserStaff || user.id !== userId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const adminClient = createAdminClient();
    
    // Get assignments for this staff member
    const { data: assignments, error } = await adminClient
      .from('staff_account_assignments')
      .select(`
        id,
        account_id,
        assigned_at,
        assigned_by,
        accounts!inner(
          id,
          name,
          slug
        )
      `)
      .eq('staff_user_id', userId);

    if (error) throw error;

    return NextResponse.json({ assignments });
  } catch (error) {
    console.error('Error fetching staff assignments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch staff assignments' },
      { status: 500 }
    );
  }
}

export async function POST(
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

    // Only admins can assign staff to accounts
    const isUserAdmin = await isAdminServer(user.id);
    if (!isUserAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { account_ids } = body;

    if (!Array.isArray(account_ids)) {
      return NextResponse.json(
        { error: 'account_ids must be an array' },
        { status: 400 }
      );
    }

    const adminClient = createAdminClient();

    // Verify user is staff
    const { data: staffCheck } = await adminClient
      .from('account_users')
      .select('role')
      .match({
        user_id: userId,
        account_id: '00000000-0000-0000-0000-000000000000',
        role: 'staff'
      })
      .single();

    if (!staffCheck) {
      return NextResponse.json(
        { error: 'User is not a staff member' },
        { status: 400 }
      );
    }

    // Clear existing assignments
    await adminClient
      .from('staff_account_assignments')
      .delete()
      .eq('staff_user_id', userId);

    // Create new assignments
    if (account_ids.length > 0) {
      const assignments = account_ids.map(account_id => ({
        staff_user_id: params.userId,
        account_id,
        assigned_by: user.id,
      }));

      const { data, error } = await adminClient
        .from('staff_account_assignments')
        .insert(assignments)
        .select();

      if (error) throw error;

      // Log the action
      await adminClient
        .from('audit_logs')
        .insert({
          account_id: '00000000-0000-0000-0000-000000000000',
          user_id: user.id,
          action: 'staff.assignments_updated',
          resource_type: 'user',
          resource_id: params.userId,
          metadata: {
            staff_user_id: params.userId,
            assigned_accounts: account_ids,
            assigned_by: user.id,
          },
        });

      return NextResponse.json({ success: true, assignments: data });
    }

    return NextResponse.json({ success: true, assignments: [] });
  } catch (error) {
    console.error('Error updating staff assignments:', error);
    return NextResponse.json(
      { error: 'Failed to update staff assignments' },
      { status: 500 }
    );
  }
}