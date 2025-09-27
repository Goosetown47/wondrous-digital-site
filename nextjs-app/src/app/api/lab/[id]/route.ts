import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase/admin';
import { getBuildSafeCookieStore } from '@/lib/cookies/build-safe';
import { env } from '@/env.mjs';
import { ensureComponentName } from '@/lib/services/naming-service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  console.log('🔍 [API/Lab/Id] Fetching lab draft:', id);

  try {
    // Verify authentication
    const cookieStore = await getBuildSafeCookieStore();
    const authClient = createServerClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
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
    const cookieStore = await getBuildSafeCookieStore();
    const authClient = createServerClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
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
    const { name, type, type_id, content, version, status, metadata, changelog, library_version, content_hash } = body;

    console.log('🔍 [API/Lab/Id] Updating lab draft with service role...');

    // Create service role client (bypasses RLS)
    const serviceClient = createAdminClient();

    // Build update object with only provided fields
    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (name !== undefined) updates.name = name;
    if (type !== undefined) updates.type = type;
    if (type_id !== undefined) updates.type_id = type_id;
    if (content !== undefined) updates.content = content;
    if (version !== undefined) updates.version = version;
    if (status !== undefined) updates.status = status;
    if (changelog !== undefined) updates.changelog = changelog;
    if (library_version !== undefined) updates.library_version = library_version;
    if (content_hash !== undefined) updates.content_hash = content_hash;

    // Ensure component_name is properly set in metadata if content or metadata is being updated
    if (content !== undefined || metadata !== undefined) {
      // Get the type from the existing draft if not provided
      const { data: existingDraft } = await serviceClient
        .from('lab_drafts')
        .select('type')
        .eq('id', id)
        .single();

      const draftType = type || existingDraft?.type;
      updates.metadata = ensureComponentName(content || {}, metadata || {}, draftType);
    }

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
    const cookieStore = await getBuildSafeCookieStore();
    const authClient = createServerClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
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
      .select('name, type, status')
      .eq('id', id)
      .single();

    // Check if draft has been promoted to library AND library item still exists
    const { data: libraryItems } = await serviceClient
      .from('library_items')
      .select('id, name')
      .eq('source_draft_id', id)
      .limit(1);

    if (libraryItems && libraryItems.length > 0) {
      // Library item exists - check if it's in use
      // TODO: In the future, check if library item is used in projects
      // For now, we'll allow deletion with a warning that library item will be orphaned

      console.log(`⚠️ [API/Lab/Id] Draft has library item: ${libraryItems[0].name}`);

      // Only prevent deletion if we're in strict mode (which we're not for now)
      // This allows users to clean up drafts even if library items exist
      // return NextResponse.json({
      //   error: 'Cannot delete draft that has been promoted to library'
      // }, { status: 400 });
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