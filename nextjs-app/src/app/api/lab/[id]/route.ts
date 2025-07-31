import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase/admin';
import { cookies } from 'next/headers';
import { env } from '@/env.mjs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  console.log('🔍 [API/Lab/Id] Fetching lab draft:', id);

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
      console.log('❌ [API/Lab/Id] Authentication failed');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    console.log('🔍 [API/Lab/Id] Authenticated user:', user.email);

    // Create service role client (bypasses RLS)
    const serviceClient = createAdminClient();

    console.log('🔍 [API/Lab/Id] Using service role to query specific lab draft...');

    // Get specific lab draft using service role
    const { data: draft, error } = await serviceClient
      .from('lab_drafts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('❌ [API/Lab/Id] Database error:', error);
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('✅ [API/Lab/Id] Draft found:', draft.name);

    // Ensure consistent date formatting
    const formattedDraft = {
      ...draft,
      created_at: draft.created_at ? new Date(draft.created_at).toISOString() : null,
      updated_at: draft.updated_at ? new Date(draft.updated_at).toISOString() : null,
    };

    return NextResponse.json(formattedDraft);

  } catch (error) {
    console.error('❌ [API/Lab/Id] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  console.log('🔍 [API/Lab/Id] Updating lab draft:', id);

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
      console.log('❌ [API/Lab/Id] Authentication failed');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { name, type, content, version, status, metadata } = body;

    console.log('🔍 [API/Lab/Id] Updating lab draft with service role...');

    // Create service role client (bypasses RLS)
    const serviceClient = createAdminClient();

    // Build update object with only provided fields
    const updates: any = {
      updated_at: new Date().toISOString(),
    };

    if (name !== undefined) updates.name = name;
    if (type !== undefined) updates.type = type;
    if (content !== undefined) updates.content = content;
    if (version !== undefined) updates.version = version;
    if (status !== undefined) updates.status = status;
    if (metadata !== undefined) updates.metadata = metadata;

    // Update the lab draft using service role
    const { data: updatedDraft, error: updateError } = await serviceClient
      .from('lab_drafts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ [API/Lab/Id] Update error:', updateError);
      if (updateError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
      }
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    console.log('✅ [API/Lab/Id] Lab draft updated:', updatedDraft.id);

    // Log the action
    await serviceClient
      .from('audit_logs')
      .insert({
        account_id: '00000000-0000-0000-0000-000000000000', // Platform account
        user_id: user.id,
        action: 'lab_draft.update',
        resource_type: 'lab_draft',
        resource_id: updatedDraft.id,
        metadata: {
          draft_name: updatedDraft.name,
          draft_type: updatedDraft.type,
          updated_via_api: true,
          changes: Object.keys(updates)
        }
      });

    // Ensure consistent date formatting
    const formattedDraft = {
      ...updatedDraft,
      created_at: updatedDraft.created_at ? new Date(updatedDraft.created_at).toISOString() : null,
      updated_at: updatedDraft.updated_at ? new Date(updatedDraft.updated_at).toISOString() : null,
    };

    return NextResponse.json(formattedDraft);

  } catch (error) {
    console.error('❌ [API/Lab/Id] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  console.log('🔍 [API/Lab/Id] Deleting lab draft:', id);

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
      console.log('❌ [API/Lab/Id] Authentication failed');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    console.log('🔍 [API/Lab/Id] Deleting lab draft with service role...');

    // Create service role client (bypasses RLS)
    const serviceClient = createAdminClient();

    // Get draft info for logging before deletion
    const { data: draftInfo } = await serviceClient
      .from('lab_drafts')
      .select('name, type')
      .eq('id', id)
      .single();

    // Check if draft has been promoted to library (prevent deletion if so)
    const { data: libraryItems } = await serviceClient
      .from('library_items')
      .select('id')
      .eq('source_draft_id', id)
      .limit(1);

    if (libraryItems && libraryItems.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete draft that has been promoted to library' 
      }, { status: 400 });
    }

    // Delete the lab draft using service role
    const { error: deleteError } = await serviceClient
      .from('lab_drafts')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('❌ [API/Lab/Id] Delete error:', deleteError);
      if (deleteError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
      }
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    console.log('✅ [API/Lab/Id] Lab draft deleted:', id);

    // Log the action
    await serviceClient
      .from('audit_logs')
      .insert({
        account_id: '00000000-0000-0000-0000-000000000000', // Platform account
        user_id: user.id,
        action: 'lab_draft.delete',
        resource_type: 'lab_draft',
        resource_id: id,
        metadata: {
          draft_name: draftInfo?.name || 'Unknown',
          draft_type: draftInfo?.type || 'Unknown',
          deleted_via_api: true
        }
      });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('❌ [API/Lab/Id] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}