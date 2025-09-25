import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase/admin';
import { getBuildSafeCookieStore } from '@/lib/cookies/build-safe';
import { env } from '@/env.mjs';
import { isAdminServer, isStaffServer } from '@/lib/permissions/server-checks';
import { deleteComponentCompletely } from '@/lib/services/component-delete-service';
import { getDetailedComponentUsage } from '@/lib/services/component-usage-service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  console.log('🔍 [API/CoreComponents/Id] Fetching core component:', id);

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
      console.log('❌ [API/CoreComponents/Id] Authentication failed');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    console.log('🔍 [API/CoreComponents/Id] Authenticated user:', user.email);

    // Check if user is admin or staff
    const [isAdmin, isStaff] = await Promise.all([
      isAdminServer(user.id),
      isStaffServer(user.id)
    ]);

    if (!isAdmin && !isStaff) {
      console.log('❌ [API/CoreComponents/Id] Access denied - user is not admin or staff');
      return NextResponse.json({ 
        error: 'Access denied. Admin or staff role required.' 
      }, { status: 403 });
    }

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
      console.log('❌ [API/CoreComponents/Id] Authentication failed');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Check if user is admin or staff
    const [isAdmin, isStaff] = await Promise.all([
      isAdminServer(user.id),
      isStaffServer(user.id)
    ]);

    if (!isAdmin && !isStaff) {
      console.log('❌ [API/CoreComponents/Id] Access denied - user is not admin or staff');
      return NextResponse.json({ 
        error: 'Access denied. Admin or staff role required.' 
      }, { status: 403 });
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
    const updates: Record<string, unknown> = {
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
      console.log('❌ [API/CoreComponents/Id] Authentication failed');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    console.log('🔍 [API/CoreComponents/Id] Deleting component with service role...');

    // Check if user is admin or staff
    const [isAdmin, isStaff] = await Promise.all([
      isAdminServer(user.id),
      isStaffServer(user.id)
    ]);

    if (!isAdmin && !isStaff) {
      console.log('❌ [API/CoreComponents/Id] Access denied - user is not admin or staff');
      return NextResponse.json({ 
        error: 'Access denied. Admin or staff role required.' 
      }, { status: 403 });
    }

    // Create service role client (bypasses RLS)
    const serviceClient = createAdminClient();

    // Get component info for logging and comprehensive deletion
    const { data: componentInfo } = await serviceClient
      .from('core_components')
      .select('name, type, source, code_name')
      .eq('id', id)
      .single();

    if (!componentInfo) {
      return NextResponse.json({ error: 'Component not found' }, { status: 404 });
    }

    // Check if component is in use before allowing deletion
    const codeName = componentInfo.code_name || componentInfo.name;
    const usage = await getDetailedComponentUsage(codeName);

    if (usage.isInUse) {
      console.log('❌ [API/CoreComponents/Id] Component is in use, cannot delete');
      return NextResponse.json({
        error: 'Component cannot be deleted because it is in use',
        usage: {
          totalUsage: usage.totalUsage,
          draftCount: usage.draftCount,
          libraryCount: usage.libraryCount,
          drafts: usage.drafts.map(d => ({ id: d.id, name: d.name, type: d.type })),
          libraryItems: usage.libraryItems.map(i => ({ id: i.id, name: i.name, type: i.type }))
        }
      }, { status: 409 }); // 409 Conflict
    }

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

    console.log('✅ [API/CoreComponents/Id] Component deleted from database:', id);

    // Comprehensive deletion from codebase (files, registry, mappings)
    // codeName was already defined above when checking usage
    const deleteResults = await deleteComponentCompletely(codeName);

    console.log('🗑️ [API/CoreComponents/Id] Comprehensive deletion results:', {
      componentName: codeName,
      source: componentInfo.source,
      results: deleteResults
    });

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
          component_name: componentInfo.name,
          component_code_name: codeName,
          component_type: componentInfo.type,
          source: componentInfo.source,
          deleted_via_api: true,
          comprehensive_deletion: deleteResults,
          deletion_errors: deleteResults.errors
        }
      });

    return NextResponse.json({
      success: true,
      deletionResults: deleteResults
    });
  } catch (error) {
    console.error('❌ [API/CoreComponents/Id] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}