import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isAdminServer } from '@/lib/permissions/server-checks';

export async function GET(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  
  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  // Get query parameters
  const searchParams = req.nextUrl.searchParams;
  const action = searchParams.get('action');
  const resourceType = searchParams.get('resource_type');
  const limit = parseInt(searchParams.get('limit') || '50');
  const offset = parseInt(searchParams.get('offset') || '0');

  try {
    // Check if user is admin
    const isAdmin = await isAdminServer(user.id);
    
    // Build query
    const adminClient = createAdminClient();
    let query = adminClient
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // If not admin, filter by user's account(s)
    if (!isAdmin) {
      // Get user's accounts
      const { data: userAccounts } = await supabase
        .from('account_users')
        .select('account_id')
        .eq('user_id', user.id);

      if (!userAccounts || userAccounts.length === 0) {
        return NextResponse.json([]);
      }

      const accountIds = userAccounts.map(ua => ua.account_id);
      query = query.in('account_id', accountIds);
    }

    // Apply filters
    if (action) {
      query = query.eq('action', action);
    }
    if (resourceType) {
      query = query.eq('resource_type', resourceType);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching audit logs:', error);
      return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error in audit logs endpoint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}