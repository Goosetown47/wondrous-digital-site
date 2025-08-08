import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { verifyDomainWithRetry, scheduleDomainVerificationRetry, logDomainOperation } from '@/lib/services/domain-verification';
import { checkDomainStatus } from '@/lib/services/domains.server';
import { env } from '@/env.mjs';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: domainId } = await params;
    
    // Create admin client that bypasses RLS
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

    // Log the verification request
    await logDomainOperation(domainId, 'VERIFY_REQUEST', 'info', {
      domain: domain.domain,
      currentStatus: domain.verified
    });

    // Verify domain with retry logic
    const result = await verifyDomainWithRetry(
      domainId,
      domain.domain,
      1 // First attempt
    );

    // Schedule retry if needed
    if (!result.verified && result.shouldRetry && result.nextRetryDelay) {
      await scheduleDomainVerificationRetry(
        domainId,
        domain.domain,
        2, // Next attempt number
        result.nextRetryDelay
      );
    }

    // Get fresh status to include configuration info
    const status = await checkDomainStatus(domain.domain);
    
    // Override SSL status if DNS is configured
    let sslInfo = result.ssl;
    if (status.configured === true && sslInfo) {
      sslInfo = {
        ...sslInfo,
        configured: true,
        status: 'READY',
        state: 'READY'
      };
    }
    
    return NextResponse.json({
      verified: result.verified,  // This now reflects DNS configuration status
      verification: result.verification, // Include DNS instructions
      ssl: sslInfo,
      configured: status.configured, // Include configuration status
      error: result.error,
      retryScheduled: result.shouldRetry,
      nextRetryIn: result.nextRetryDelay
    });
  } catch (error) {
    console.error('Error verifying domain:', error);
    return NextResponse.json(
      { error: 'Failed to verify domain' },
      { status: 500 }
    );
  }
}