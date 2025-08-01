import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { env } from '@/env.mjs';
import { isAdmin, isStaff } from '@/lib/permissions';

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id: projectId } = await context.params;

  try {
    const body = await request.json();
    const { account_id, reason } = body;

    // Validate required fields
    if (!account_id) {
      return NextResponse.json({ error: 'account_id is required' }, { status: 400 });
    }

    // Create server-side Supabase client
    const cookieStore = await cookies();
    const supabase = createServerClient(
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
              // Ignore cookie setting errors in server components
            }
          },
        },
      }
    );

    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Check permissions - only admins and staff can reassign projects
    const canReassign = await isAdmin(user.id, supabase) || await isStaff(user.id, supabase);
    if (!canReassign) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Verify the target account exists
    const { data: targetAccount, error: accountError } = await supabase
      .from('accounts')
      .select('id, name')
      .eq('id', account_id)
      .single();

    if (accountError || !targetAccount) {
      return NextResponse.json({ error: 'Invalid account_id' }, { status: 400 });
    }

    // Get current project details for audit log
    const { data: currentProject, error: projectError } = await supabase
      .from('projects')
      .select(`
        id,
        name,
        account_id,
        accounts(id, name)
      `)
      .eq('id', projectId)
      .single();

    if (projectError || !currentProject) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Check if account is actually changing
    if (currentProject.account_id === account_id) {
      return NextResponse.json({ 
        message: 'Project is already assigned to this account',
        project: currentProject 
      });
    }

    // Update the project's account assignment
    const { data: updatedProject, error: updateError } = await supabase
      .from('projects')
      .update({ 
        account_id,
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId)
      .select(`
        *,
        accounts(
          id,
          name,
          slug,
          plan
        )
      `)
      .single();

    if (updateError) {
      console.error('Error updating project account:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Log the account reassignment action
    try {
      await supabase
        .from('audit_logs')
        .insert({
          account_id: account_id, // Log under new account
          user_id: user.id,
          action: 'project:account_reassigned',
          resource_type: 'project',
          resource_id: projectId,
          metadata: {
            project_name: currentProject.name,
            previous_account: {
              id: currentProject.account_id,
              name: (currentProject.accounts as Record<string, unknown>)?.name as string || 'Unknown'
            },
            new_account: {
              id: targetAccount.id,
              name: targetAccount.name
            },
            reason: reason || 'No reason provided',
            reassigned_by: user.email
          }
        });
    } catch (logError) {
      console.error('Failed to log account reassignment:', logError);
      // Continue despite logging failure
    }

    console.log(`✅ Project "${currentProject.name}" reassigned from account "${(currentProject.accounts as Record<string, unknown>)?.name as string}" to "${targetAccount.name}"`);

    return NextResponse.json({
      message: 'Project account updated successfully',
      project: updatedProject
    });

  } catch (error) {
    console.error('Account reassignment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}