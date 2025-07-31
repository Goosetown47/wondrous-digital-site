import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { removeDomainFromVercel } from '@/lib/services/domains.server';
import { env } from '@/env.mjs';

export async function DELETE(
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

    // Remove domain from Vercel
    try {
      await removeDomainFromVercel(domain.domain);
    } catch (vercelError: any) {
      // If domain doesn't exist in Vercel, that's okay
      console.warn('Error removing domain from Vercel:', vercelError);
    }

    return NextResponse.json({
      success: true,
      domain: domain.domain,
    });
  } catch (error: any) {
    console.error('Error removing domain from Vercel:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to remove domain from Vercel' },
      { status: 500 }
    );
  }
}