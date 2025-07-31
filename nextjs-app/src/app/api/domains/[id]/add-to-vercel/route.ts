import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { addDomainToVercel } from '@/lib/services/domains.server';
import { logDomainOperation } from '@/lib/services/domain-verification';
import { env } from '@/env.mjs';

export async function POST(
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

    // Log the add operation
    await logDomainOperation(domainId, 'ADD_TO_VERCEL_REQUEST', 'info', {
      domain: domain.domain,
      projectId: domain.project_id
    });

    // Add domain to Vercel
    try {
      await addDomainToVercel(domain.domain);
      await logDomainOperation(domainId, 'ADD_TO_VERCEL_SUCCESS', 'success', {
        domain: domain.domain
      });
    } catch (vercelError: any) {
      // If domain already exists in Vercel, that's okay
      if (!vercelError.message?.includes('already exists')) {
        await logDomainOperation(domainId, 'ADD_TO_VERCEL_ERROR', 'error', {
          domain: domain.domain,
          error: vercelError.message
        });
        throw vercelError;
      } else {
        await logDomainOperation(domainId, 'ADD_TO_VERCEL_EXISTS', 'info', {
          domain: domain.domain
        });
      }
    }

    return NextResponse.json({
      success: true,
      domain: domain.domain,
    });
  } catch (error: any) {
    console.error('Error adding domain to Vercel:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to add domain to Vercel' },
      { status: 500 }
    );
  }
}