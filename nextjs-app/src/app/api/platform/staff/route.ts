import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isAdminServer } from '@/lib/permissions/server-checks';

const PLATFORM_ACCOUNT_ID = '00000000-0000-0000-0000-000000000000';

export async function GET() {
  try {
    const supabase = createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admins can view all staff
    const isUserAdmin = await isAdminServer(user.id);
    if (!isUserAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const adminClient = createAdminClient();
    
    // Get all platform staff
    const { data: staff, error } = await adminClient
      .from('account_users')
      .select(`
        user_id,
        role,
        joined_at,
        users!inner(
          id,
          email,
          created_at,
          last_sign_in_at,
          email_confirmed_at
        )
      `)
      .eq('account_id', PLATFORM_ACCOUNT_ID)
      .eq('role', 'staff');

    if (error) throw error;

    // Get staff account assignments
    const staffUserIds = staff?.map(s => s.user_id) || [];
    const { data: assignments } = await adminClient
      .from('staff_account_assignments')
      .select(`
        staff_user_id,
        account_id,
        assigned_at,
        accounts!inner(
          id,
          name,
          slug
        )
      `)
      .in('staff_user_id', staffUserIds);

    // Merge assignments with staff data
    const staffWithAssignments = staff?.map(s => ({
      ...s,
      assignments: assignments?.filter(a => a.staff_user_id === s.user_id) || []
    }));

    return NextResponse.json({ staff: staffWithAssignments });
  } catch (error) {
    console.error('Error fetching platform staff:', error);
    return NextResponse.json(
      { error: 'Failed to fetch platform staff' },
      { status: 500 }
    );
  }
}