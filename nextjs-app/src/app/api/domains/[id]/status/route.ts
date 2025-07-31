import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { checkDomainStatus } from '@/lib/services/domains.server';
import { env } from '@/env.mjs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: domainId } = await params;
    
    // Create admin client
    const supabaseAdmin = createSupabaseClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Get domain details
    const { data: domain, error } = await supabaseAdmin
      .from('project_domains')
      .select('*')
      .eq('id', domainId)
      .single();

    if (error || !domain) {
      return NextResponse.json(
        { error: 'Domain not found' },
        { status: 404 }
      );
    }

    // Check domain status with Vercel
    const status = await checkDomainStatus(domain.domain);

    return NextResponse.json({
      domain: domain.domain,
      verified: status.verified,
      ssl: status.ssl,
      verification: status.verification,
      error: status.error,
    });
  } catch (error) {
    console.error('Error checking domain status:', error);
    return NextResponse.json(
      { error: 'Failed to check domain status' },
      { status: 500 }
    );
  }
}