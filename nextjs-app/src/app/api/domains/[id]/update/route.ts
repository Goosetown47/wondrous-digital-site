import { NextRequest, NextResponse } from 'next/server';
import { updateDomainVerification } from '@/lib/services/domains.server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { ProjectDomain } from '@/types/database';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: domainId } = await params;
    const supabase = await createSupabaseServerClient();
    
    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the request body
    const body = await request.json();
    const { verified, ssl_state, verification_details } = body as Partial<Pick<ProjectDomain, 'verified' | 'ssl_state' | 'verification_details'>>;

    // Validate that at least one field is being updated
    if (verified === undefined && ssl_state === undefined && verification_details === undefined) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    // First get the domain to find its project
    const { data: domain, error: domainError } = await supabase
      .from('project_domains')
      .select('project_id')
      .eq('id', domainId)
      .single();

    if (domainError || !domain) {
      return NextResponse.json(
        { error: 'Domain not found' },
        { status: 404 }
      );
    }

    // Check if user has access to the project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', domain.project_id)
      .eq('account_id', user.id)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Unauthorized - you do not have access to this domain' },
        { status: 403 }
      );
    }

    // Build the updates object
    const updates: Partial<Pick<ProjectDomain, 'verified' | 'ssl_state' | 'verification_details'>> = {};
    if (verified !== undefined) updates.verified = verified;
    if (ssl_state !== undefined) updates.ssl_state = ssl_state;
    if (verification_details !== undefined) updates.verification_details = verification_details;

    // Update the domain using the server-side function
    const { error } = await updateDomainVerification(domainId, updates);

    if (error) {
      return NextResponse.json(
        { error },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] Error updating domain:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}