import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase/admin';
import { cookies } from 'next/headers';
import { env } from '@/env.mjs';
import { isAdminServer, isStaffServer } from '@/lib/permissions/server-checks';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const status = searchParams.get('status');

  console.log('🔍 [API/Lab] Fetching lab drafts with filters:', { type, status });

  try {
    // Verify authentication
    const cookieStore = await cookies();
    const authClient = createServerClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Ignore cookie setting errors
            }
          },
        },
      }
    );

    const { data: { user }, error: userError } = await authClient.auth.getUser();
    
    if (userError || !user) {
      console.log('❌ [API/Lab] Authentication failed');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    console.log('🔍 [API/Lab] Authenticated user:', user.email);

    // Check if user is admin or staff
    const [isAdmin, isStaff] = await Promise.all([
      isAdminServer(user.id),
      isStaffServer(user.id)
    ]);

    if (!isAdmin && !isStaff) {
      console.log('❌ [API/Lab] Access denied - user is not admin or staff');
      return NextResponse.json({ 
        error: 'Access denied. Admin or staff role required.' 
      }, { status: 403 });
    }

    // Create service role client (bypasses RLS)
    const serviceClient = createAdminClient();

    console.log('🔍 [API/Lab] Using service role to query lab drafts...');

    // Build query with filters
    let query = serviceClient
      .from('lab_drafts')
      .select('*')
      .order('updated_at', { ascending: false });

    // Apply filters
    if (type) {
      query = query.eq('type', type);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data: drafts, error } = await query;

    if (error) {
      console.error('❌ [API/Lab] Database error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('✅ [API/Lab] Service role query successful!');
    console.log('📊 [API/Lab] Found drafts:', drafts?.length || 0);

    return NextResponse.json(drafts || []);

  } catch (error) {
    console.error('❌ [API/Lab] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  console.log('🔍 [API/Lab] Creating new lab draft...');

  try {
    // Verify authentication
    const cookieStore = await cookies();
    const authClient = createServerClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Ignore cookie setting errors
            }
          },
        },
      }
    );

    const { data: { user }, error: userError } = await authClient.auth.getUser();
    
    if (userError || !user) {
      console.log('❌ [API/Lab] Authentication failed');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    console.log('🔍 [API/Lab] Authenticated user:', user.email);

    // Check if user is admin or staff
    const [isAdmin, isStaff] = await Promise.all([
      isAdminServer(user.id),
      isStaffServer(user.id)
    ]);

    if (!isAdmin && !isStaff) {
      console.log('❌ [API/Lab] Access denied - user is not admin or staff');
      return NextResponse.json({ 
        error: 'Access denied. Admin or staff role required.' 
      }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    const { name, type, content, version = 1, status = 'draft', metadata = {} } = body;

    if (!name || !type || !content) {
      return NextResponse.json({ 
        error: 'name, type, and content are required' 
      }, { status: 400 });
    }

    // Create service role client (bypasses RLS)
    const serviceClient = createAdminClient();

    console.log('🔍 [API/Lab] Creating lab draft with service role...');

    // Create the lab draft using service role
    const { data: newDraft, error: createError } = await serviceClient
      .from('lab_drafts')
      .insert({
        name,
        type,
        content,
        version,
        status,
        metadata,
        created_by: user.id
      })
      .select()
      .single();

    if (createError) {
      console.error('❌ [API/Lab] Creation error:', createError);
      return NextResponse.json({ error: createError.message }, { status: 500 });
    }

    console.log('✅ [API/Lab] Lab draft created:', newDraft.id);

    // Log the action
    await serviceClient
      .from('audit_logs')
      .insert({
        account_id: '00000000-0000-0000-0000-000000000000', // Platform account
        user_id: user.id,
        action: 'lab_draft.create',
        resource_type: 'lab_draft',
        resource_id: newDraft.id,
        metadata: {
          draft_name: name,
          draft_type: type,
          created_via_api: true
        }
      });

    return NextResponse.json(newDraft);

  } catch (error) {
    console.error('❌ [API/Lab] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}