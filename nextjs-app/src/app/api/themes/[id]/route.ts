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
  console.log('🔍 [API/Themes/Id] Fetching theme:', id);

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
      console.log('❌ [API/Themes/Id] Authentication failed');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    console.log('🔍 [API/Themes/Id] Authenticated user:', user.email);

    // Create service role client (bypasses RLS)
    const serviceClient = createAdminClient();

    console.log('🔍 [API/Themes/Id] Using service role to query specific theme...');

    // Get specific theme from library_items (themes are stored as library items with type='theme')
    const { data: themeItem, error } = await serviceClient
      .from('library_items')
      .select('*')
      .eq('id', id)
      .eq('type', 'theme')
      .single();

    if (error) {
      console.error('❌ [API/Themes/Id] Database error:', error);
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Theme not found' }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('✅ [API/Themes/Id] Theme found:', themeItem.name);

    // Transform library item to theme format for backwards compatibility
    const theme = {
      id: themeItem.id,
      name: themeItem.name,
      variables: themeItem.content?.variables || {},
      metadata: themeItem.metadata || {},
      created_at: themeItem.created_at,
      updated_at: themeItem.updated_at,
      published: themeItem.published,
      usage_count: themeItem.usage_count || 0
    };

    return NextResponse.json(theme);

  } catch (error) {
    console.error('❌ [API/Themes/Id] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  console.log('🔍 [API/Themes/Id] Updating theme:', id);

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
      console.log('❌ [API/Themes/Id] Authentication failed');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { name, variables, metadata, published } = body;

    console.log('🔍 [API/Themes/Id] Updating theme with service role...');

    // Create service role client (bypasses RLS)
    const serviceClient = createAdminClient();

    // Build update object with only provided fields
    const updates: any = {
      updated_at: new Date().toISOString(),
    };

    if (name !== undefined) updates.name = name;
    if (variables !== undefined) updates.content = { variables };
    if (metadata !== undefined) updates.metadata = metadata;
    if (published !== undefined) updates.published = published;

    // Update the theme (stored as library item) using service role
    const { data: updatedTheme, error: updateError } = await serviceClient
      .from('library_items')
      .update(updates)
      .eq('id', id)
      .eq('type', 'theme')
      .select()
      .single();

    if (updateError) {
      console.error('❌ [API/Themes/Id] Update error:', updateError);
      if (updateError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Theme not found' }, { status: 404 });
      }
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    console.log('✅ [API/Themes/Id] Theme updated:', updatedTheme.id);

    // Log the action
    await serviceClient
      .from('audit_logs')
      .insert({
        account_id: '00000000-0000-0000-0000-000000000000', // Platform account
        user_id: user.id,
        action: 'theme.update',
        resource_type: 'theme',
        resource_id: updatedTheme.id,
        metadata: {
          theme_name: updatedTheme.name,
          updated_via_api: true,
          changes: Object.keys(updates)
        }
      });

    // Transform back to theme format for response
    const themeResponse = {
      id: updatedTheme.id,
      name: updatedTheme.name,
      variables: updatedTheme.content?.variables || {},
      metadata: updatedTheme.metadata || {},
      created_at: updatedTheme.created_at,
      updated_at: updatedTheme.updated_at,
      published: updatedTheme.published,
      usage_count: updatedTheme.usage_count || 0
    };

    return NextResponse.json(themeResponse);

  } catch (error) {
    console.error('❌ [API/Themes/Id] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  console.log('🔍 [API/Themes/Id] Deleting theme:', id);

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
      console.log('❌ [API/Themes/Id] Authentication failed');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    console.log('🔍 [API/Themes/Id] Deleting theme with service role...');

    // Create service role client (bypasses RLS)
    const serviceClient = createAdminClient();

    // Get theme info for logging before deletion
    const { data: themeInfo } = await serviceClient
      .from('library_items')
      .select('name')
      .eq('id', id)
      .eq('type', 'theme')
      .single();

    // Check if theme is being used by any projects
    const { data: projectsUsingTheme } = await serviceClient
      .from('projects')
      .select('id')
      .eq('theme_id', id)
      .limit(1);

    if (projectsUsingTheme && projectsUsingTheme.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete theme that is being used by projects' 
      }, { status: 400 });
    }

    // Delete the theme (stored as library item) using service role
    const { error: deleteError } = await serviceClient
      .from('library_items')
      .delete()
      .eq('id', id)
      .eq('type', 'theme');

    if (deleteError) {
      console.error('❌ [API/Themes/Id] Delete error:', deleteError);
      if (deleteError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Theme not found' }, { status: 404 });
      }
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    console.log('✅ [API/Themes/Id] Theme deleted:', id);

    // Log the action
    await serviceClient
      .from('audit_logs')
      .insert({
        account_id: '00000000-0000-0000-0000-000000000000', // Platform account
        user_id: user.id,
        action: 'theme.delete',
        resource_type: 'theme',
        resource_id: id,
        metadata: {
          theme_name: themeInfo?.name || 'Unknown',
          deleted_via_api: true
        }
      });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('❌ [API/Themes/Id] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}