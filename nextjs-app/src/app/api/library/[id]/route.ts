import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase/admin';
import { getBuildSafeCookieStore } from '@/lib/cookies/build-safe';
import { env } from '@/env.mjs';
import { isAdminServer, isStaffServer } from '@/lib/permissions/server-checks';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  console.log('🔍 [API/Library] Fetching library item:', id);

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
      console.log('❌ [API/Library] Authentication failed');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Create service role client (bypasses RLS)
    const serviceClient = createAdminClient();
    
    // Fetch the library item using service role
    const { data: item, error } = await serviceClient
      .from('library_items')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('❌ [API/Library] Database error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    if (!item) {
      console.log('❌ [API/Library] Item not found:', id);
      return NextResponse.json({ error: 'Library item not found' }, { status: 404 });
    }

    console.log('✅ [API/Library] Item found:', item.name);

    // Increment usage count using service role
    const newUsageCount = (item.usage_count || 0) + 1;
    const { error: updateError } = await serviceClient
      .from('library_items')
      .update({ usage_count: newUsageCount })
      .eq('id', id);
    
    if (updateError) {
      console.error('⚠️ [API/Library] Error updating usage count:', updateError);
      // Don't fail the request if usage count update fails
    } else {
      console.log(`✅ [API/Library] Usage count incremented for ${item.name}: ${item.usage_count || 0} → ${newUsageCount}`);
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error('❌ [API/Library] Unexpected error:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch library item';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  console.log('🔍 [API/Library] Deleting library item:', id);

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
      console.log('❌ [API/Library] Authentication failed');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Check if user is admin or staff
    const [isAdmin, isStaff] = await Promise.all([
      isAdminServer(user.id),
      isStaffServer(user.id)
    ]);

    if (!isAdmin && !isStaff) {
      console.log('❌ [API/Library] Access denied - user is not admin or staff');
      return NextResponse.json({
        error: 'Access denied. Admin or staff role required.'
      }, { status: 403 });
    }

    // Create service role client (bypasses RLS)
    const serviceClient = createAdminClient();

    // First, get the library item to find its source_draft_id
    const { data: libraryItem, error: fetchError } = await serviceClient
      .from('library_items')
      .select('id, name, source_draft_id')
      .eq('id', id)
      .single();

    if (fetchError || !libraryItem) {
      console.log('❌ [API/Library] Item not found:', id);
      return NextResponse.json({ error: 'Library item not found' }, { status: 404 });
    }

    console.log('🔍 [API/Library] Found library item:', libraryItem.name);

    // Check if library item is in use (e.g., in projects)
    // TODO: Add checks for project usage when that's implemented

    // Delete the library item
    const { error: deleteError } = await serviceClient
      .from('library_items')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('❌ [API/Library] Delete error:', deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    console.log('✅ [API/Library] Library item deleted:', libraryItem.name);

    // If there's a source draft, update it to remove promoted status
    if (libraryItem.source_draft_id) {
      console.log('🔍 [API/Library] Updating source draft:', libraryItem.source_draft_id);

      // First get the current draft to update metadata
      const { data: currentDraft } = await serviceClient
        .from('lab_drafts')
        .select('metadata')
        .eq('id', libraryItem.source_draft_id)
        .single();

      // Remove promoted_at from metadata
      const updatedMetadata = currentDraft?.metadata || {};
      if ('promoted_at' in updatedMetadata) {
        delete updatedMetadata.promoted_at;
      }

      const { error: updateDraftError } = await serviceClient
        .from('lab_drafts')
        .update({
          status: 'draft',
          library_version: null,
          metadata: updatedMetadata
        })
        .eq('id', libraryItem.source_draft_id);

      if (updateDraftError) {
        console.error('⚠️ [API/Library] Error updating draft status:', updateDraftError);
        // Don't fail the deletion if draft update fails
        // but we could log this for monitoring
      } else {
        console.log('✅ [API/Library] Source draft updated to remove promoted status');
      }
    }

    // Log the deletion
    await serviceClient
      .from('audit_logs')
      .insert({
        account_id: '00000000-0000-0000-0000-000000000000', // Platform account
        user_id: user.id,
        action: 'library_item.delete',
        resource_type: 'library_item',
        resource_id: id,
        metadata: {
          item_name: libraryItem.name,
          source_draft_id: libraryItem.source_draft_id,
          deleted_via_api: true
        }
      });

    return NextResponse.json({
      message: 'Library item deleted successfully',
      updated_draft: libraryItem.source_draft_id ? true : false
    });
  } catch (error) {
    console.error('❌ [API/Library] Unexpected error:', error);
    const message = error instanceof Error ? error.message : 'Failed to delete library item';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}