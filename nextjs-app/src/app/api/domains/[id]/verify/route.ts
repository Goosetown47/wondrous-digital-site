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
    
    // If domain was verified, also check and verify companion domains
    if (result.verified) {
      // Determine companion domain
      let companionDomain: string | null = null;
      if (domain.domain.startsWith('www.')) {
        // If verifying www, also verify apex
        companionDomain = domain.domain.substring(4);
      } else if (!domain.domain.includes('www.')) {
        // If verifying apex, also verify www
        companionDomain = `www.${domain.domain}`;
      }
      
      if (companionDomain) {
        console.log(`[DOMAIN] Checking companion domain ${companionDomain} for verification`);
        
        // Find companion domain in database
        const { data: companionData } = await supabaseAdmin
          .from('project_domains')
          .select('*')
          .eq('domain', companionDomain)
          .eq('project_id', domain.project_id)
          .single();
          
        if (companionData && !companionData.verified) {
          console.log(`[DOMAIN] Verifying companion domain ${companionDomain}`);
          
          // Check if companion is also verified in Vercel
          try {
            const companionStatus = await checkDomainStatus(companionDomain);
            if (companionStatus.verified) {
              // Update companion domain as verified
              await supabaseAdmin
                .from('project_domains')
                .update({ 
                  verified: true,
                  verified_at: new Date().toISOString(),
                  ssl_state: companionStatus.ssl?.state || 'PENDING'
                })
                .eq('id', companionData.id);
                
              console.log(`[DOMAIN] Successfully verified companion domain ${companionDomain}`);
            }
          } catch (error) {
            console.error(`[DOMAIN] Failed to verify companion domain ${companionDomain}:`, error);
            // Non-fatal, continue
          }
        }
      }
    }

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