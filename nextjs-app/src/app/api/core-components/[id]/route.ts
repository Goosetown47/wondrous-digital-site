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
  console.log('🔍 [API/CoreComponents/Id] Fetching core component:', id);

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
      console.log('❌ [API/CoreComponents/Id] Authentication failed');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    console.log('🔍 [API/CoreComponents/Id] Authenticated user:', user.email);

    // Create service role client (bypasses RLS)
    const serviceClient = createAdminClient();

    console.log('🔍 [API/CoreComponents/Id] Using service role to query specific component...');

    // Get specific component using service role
    const { data: component, error } = await serviceClient
      .from('core_components')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('❌ [API/CoreComponents/Id] Database error:', error);
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Component not found' }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('✅ [API/CoreComponents/Id] Component found:', component.name);

    return NextResponse.json(component);

  } catch (error) {
    console.error('❌ [API/CoreComponents/Id] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  console.log('🔍 [API/CoreComponents/Id] Updating core component:', id);

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
      console.log('❌ [API/CoreComponents/Id] Authentication failed');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { 
      name, 
      type, 
      source, 
      code, 
      dependencies, 
      imports, 
      description,
      metadata 
    } = body;

    console.log('🔍 [API/CoreComponents/Id] Updating component with service role...');

    // Create service role client (bypasses RLS)
    const serviceClient = createAdminClient();

    // Build update object with only provided fields
    const updates: any = {
      updated_at: new Date().toISOString(),
    };

    if (name !== undefined) updates.name = name;
    if (type !== undefined) updates.type = type;
    if (source !== undefined) updates.source = source;
    if (code !== undefined) updates.code = code;
    if (dependencies !== undefined) updates.dependencies = dependencies;
    if (imports !== undefined) updates.imports = imports;
    if (description !== undefined) updates.description = description;
    if (metadata !== undefined) updates.metadata = metadata;

    // Update the core component using service role
    const { data: updatedComponent, error: updateError } = await serviceClient
      .from('core_components')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ [API/CoreComponents/Id] Update error:', updateError);
      if (updateError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Component not found' }, { status: 404 });
      }
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    console.log('✅ [API/CoreComponents/Id] Component updated:', updatedComponent.id);

    // Log the action
    await serviceClient
      .from('audit_logs')
      .insert({
        account_id: '00000000-0000-0000-0000-000000000000', // Platform account
        user_id: user.id,
        action: 'core_component.update',
        resource_type: 'core_component',
        resource_id: updatedComponent.id,
        metadata: {
          component_name: updatedComponent.name,
          component_type: updatedComponent.type,
          source: updatedComponent.source,
          updated_via_api: true,
          changes: Object.keys(updates)
        }
      });

    return NextResponse.json(updatedComponent);

  } catch (error) {
    console.error('❌ [API/CoreComponents/Id] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  console.log('🔍 [API/CoreComponents/Id] Deleting core component:', id);

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
      console.log('❌ [API/CoreComponents/Id] Authentication failed');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    console.log('🔍 [API/CoreComponents/Id] Deleting component with service role...');

    // Create service role client (bypasses RLS)
    const serviceClient = createAdminClient();

    // Get component info for logging before deletion
    const { data: componentInfo } = await serviceClient
      .from('core_components')
      .select('name, type, source')
      .eq('id', id)
      .single();

    // Delete the core component using service role
    const { error: deleteError } = await serviceClient
      .from('core_components')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('❌ [API/CoreComponents/Id] Delete error:', deleteError);
      if (deleteError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Component not found' }, { status: 404 });
      }
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    console.log('✅ [API/CoreComponents/Id] Component deleted:', id);

    // Log the action
    await serviceClient
      .from('audit_logs')
      .insert({
        account_id: '00000000-0000-0000-0000-000000000000', // Platform account
        user_id: user.id,
        action: 'core_component.delete',
        resource_type: 'core_component',
        resource_id: id,
        metadata: {
          component_name: componentInfo?.name || 'Unknown',
          component_type: componentInfo?.type || 'Unknown',
          source: componentInfo?.source || 'Unknown',
          deleted_via_api: true
        }
      });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('❌ [API/CoreComponents/Id] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}