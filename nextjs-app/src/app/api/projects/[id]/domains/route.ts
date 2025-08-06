import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { validateDomainFormat } from '@/lib/services/domains';
import { z } from 'zod';

const addDomainSchema = z.object({
  domain: z.string().min(1),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const supabase = await createSupabaseServerClient();
    
    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const validationResult = addDomainSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { domain } = validationResult.data;

    // Validate domain format (but not permissions yet)
    const formatError = validateDomainFormat(domain);
    if (formatError) {
      // Skip the reserved domain check for now - we'll handle it properly below
      if (!formatError.includes('requires special permission')) {
        return NextResponse.json({ error: formatError }, { status: 400 });
      }
    }

    // Check if user has access to this project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select(`
        id,
        account_id,
        accounts!inner(
          id,
          account_users!inner(
            user_id,
            role
          )
        )
      `)
      .eq('id', projectId)
      .eq('accounts.account_users.user_id', user.id)
      .single();

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found or access denied' }, { status: 404 });
    }

    // Check if domain is reserved and requires permission
    const reservedDomains = ['wondrousdigital.com', 'www.wondrousdigital.com'];
    if (reservedDomains.includes(domain)) {
      // Check if this account has permission
      const { data: permission } = await supabase
        .from('reserved_domain_permissions')
        .select('id')
        .eq('account_id', project.account_id)
        .eq('domain', domain)
        .single();
        
      if (!permission) {
        return NextResponse.json(
          { error: 'This domain is reserved and your account does not have permission to use it.' },
          { status: 403 }
        );
      }
    }

    // Check if domain already exists
    const { data: existingDomain } = await supabase
      .from('project_domains')
      .select('id')
      .eq('domain', domain)
      .single();

    if (existingDomain) {
      return NextResponse.json(
        { error: 'This domain is already in use.' },
        { status: 409 }
      );
    }

    // Add domain to database
    const { data, error } = await supabase
      .from('project_domains')
      .insert({
        project_id: projectId,
        domain,
        verified: false,
        verified_at: null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding domain:', error);
      return NextResponse.json(
        { error: 'Failed to add domain' },
        { status: 500 }
      );
    }

    // Add to Vercel (fire and forget)
    fetch(`/api/domains/${data.id}/add-to-vercel`, {
      method: 'POST',
    }).catch(err => {
      console.error('[DOMAIN] Failed to add domain to Vercel:', err);
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in domain addition:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}