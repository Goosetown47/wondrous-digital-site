import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function POST(
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

    // Get the domain and verify user has access to its project
    const { data: domain, error: domainError } = await supabase
      .from('project_domains')
      .select(`
        id,
        domain,
        project_id,
        is_primary,
        projects!inner(
          id,
          account_id,
          accounts!inner(
            id,
            account_users!inner(
              user_id,
              role
            )
          )
        )
      `)
      .eq('id', domainId)
      .eq('projects.accounts.account_users.user_id', user.id)
      .single();

    if (domainError || !domain) {
      return NextResponse.json(
        { error: 'Domain not found or access denied' },
        { status: 404 }
      );
    }

    // Check if it's already primary
    if (domain.is_primary) {
      return NextResponse.json(
        { error: 'This domain is already the primary domain' },
        { status: 400 }
      );
    }

    // Begin transaction: remove primary from other domains, then set this one as primary
    // First, unset primary on all other domains for this project
    const { error: unsetError } = await supabase
      .from('project_domains')
      .update({ is_primary: false })
      .eq('project_id', domain.project_id)
      .eq('is_primary', true);

    if (unsetError) {
      console.error('Error unsetting primary domain:', unsetError);
      return NextResponse.json(
        { error: 'Failed to update primary domain' },
        { status: 500 }
      );
    }

    // Now set this domain as primary
    const { data: updatedDomain, error: updateError } = await supabase
      .from('project_domains')
      .update({ is_primary: true })
      .eq('id', domainId)
      .select()
      .single();

    if (updateError) {
      console.error('Error setting primary domain:', updateError);
      return NextResponse.json(
        { error: 'Failed to set primary domain' },
        { status: 500 }
      );
    }

    console.log(`[DOMAIN] Set ${domain.domain} as primary for project ${domain.project_id}`);
    return NextResponse.json(updatedDomain);
  } catch (error) {
    console.error('Error in make primary:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}