import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { env } from '@/env.mjs';
import { checkDomainStatus } from '@/lib/services/domains.server';

// Vercel's current IPs for A records
const VERCEL_IPS = {
  current: '216.198.79.1',  // Current Vercel IP (as shown in Vercel UI)
  legacy: '76.76.21.21',    // Older IP that might still be in use
};

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

    // Check if www is included (default to true for existing domains)
    const includeWWW = domain.include_www ?? true;

    // Fetch actual domain status from Vercel
    let vercelStatus;
    try {
      vercelStatus = await checkDomainStatus(domain.domain);
    } catch (error) {
      console.error('Error fetching domain status from Vercel:', error);
      // Continue with basic config if Vercel check fails
    }

    // Parse domain to determine if it's apex or subdomain
    const parts = domain.domain.split('.');
    const isApex = parts.length === 2 || 
      (parts.length === 3 && /^(co|com|net|org|gov|edu|ac)\.[a-z]{2}$/.test(parts.slice(-2).join('.')));
    
    // Determine DNS configuration based on domain type and Vercel response
    const dnsConfig: {
      domain: string;
      isApex: boolean;
      verified: boolean;
      records: Array<{
        type: string;
        name: string;
        value: string;
        ttl: number;
        purpose: string;
        optional?: boolean;
        required?: boolean;
        note?: string;
        reason?: string;
      }>;
      status?: {
        ownership: string;
        configuration: string;
        ssl: string;
        configuredBy: string | null;
        error: string | null;
      };
      message?: string;
    } = {
      domain: domain.domain,
      isApex,
      verified: vercelStatus?.verified || domain.verified,
      records: []
    };

    // The v6 config endpoint can be used if needed, but status data usually has everything
    // We've already checked configuration status in checkDomainStatus

    // DNS values are STANDARD for all Vercel projects
    // No need to fetch dynamic values - they're always the same!

    if (isApex) {
      // Apex domain needs A record - ALWAYS the same for all Vercel projects
      dnsConfig.records.push({
        type: 'A',
        name: '@',
        value: VERCEL_IPS.current, // 216.198.79.1
        ttl: 300,
        purpose: 'points_to_vercel',
        note: 'Point your apex domain to Vercel'
      });
      
      // Only show www CNAME if include_www is true
      if (includeWWW) {
        dnsConfig.records.push({
          type: 'CNAME',
          name: 'www',
          value: 'cname.vercel-dns.com', // Standard for ALL Vercel projects
          ttl: 300,
          purpose: 'www_redirect',
          required: true,
          note: 'Configure this record to enable www.yourdomain.com'
        });
      }
    } else {
      // Subdomain needs CNAME - ALWAYS the same for all Vercel projects
      const subdomain = parts[0];
      
      dnsConfig.records.push({
        type: 'CNAME',
        name: subdomain,
        value: 'cname.vercel-dns.com', // Standard for ALL Vercel projects
        ttl: 300,
        purpose: 'points_to_vercel',
        note: 'Point your subdomain to Vercel'
      });
    }

    // Add verification records from Vercel response
    if (vercelStatus?.verification && Array.isArray(vercelStatus.verification)) {
      vercelStatus.verification.forEach((v: { type?: string; domain?: string; value: string; reason?: string }) => {
        dnsConfig.records.push({
          type: v.type || 'TXT',
          name: v.domain || '_vercel',
          value: v.value,
          ttl: 300,
          purpose: 'ownership_verification',
          reason: v.reason
        });
      });
    } else if (!domain.verified && domain.verification_details) {
      // Fallback to stored verification details if Vercel check failed
      const verificationData = domain.verification_details as { verification?: Array<{ type?: string; domain?: string; value: string; reason?: string }> };
      if (verificationData.verification && Array.isArray(verificationData.verification)) {
        verificationData.verification.forEach((v: { type?: string; domain?: string; value: string; reason?: string }) => {
          dnsConfig.records.push({
            type: v.type || 'TXT',
            name: v.domain || '_vercel',
            value: v.value,
            ttl: 300,
            purpose: 'ownership_verification',
            reason: v.reason
          });
        });
      }
    }

    // Determine configuration status using Vercel's source of truth
    // The "configured" field from checkDomainStatus uses the v6 endpoint's misconfigured field
    
    let configurationStatus: string;
    
    // Trust the configured field from checkDomainStatus
    // It's based on the v6 endpoint's misconfigured field
    if (vercelStatus?.configured === true) {
      // DNS is properly configured (misconfigured: false)
      configurationStatus = 'valid';
    } else if (vercelStatus?.verified === true) {
      // Domain is in Vercel but DNS not configured (misconfigured: true)
      configurationStatus = 'invalid';
    } else if (vercelStatus?.error) {
      // Error checking status
      configurationStatus = 'pending';
    } else {
      // Domain not found or not verified
      configurationStatus = 'pending';
    }
    
    // Determine SSL status based on configuration
    // If DNS is configured, SSL is automatically provisioned by Vercel
    let sslStatus: string;
    if (vercelStatus?.configured === true) {
      // DNS is properly configured, Vercel automatically provisions SSL
      sslStatus = 'READY';
    } else if (vercelStatus?.verified === true) {
      // Domain added to Vercel but DNS not configured yet
      sslStatus = 'PENDING';
    } else {
      // Domain not added or error
      sslStatus = 'PENDING';
    }
    
    dnsConfig.status = {
      ownership: vercelStatus?.verified ? 'verified' : 'pending',
      configuration: configurationStatus,
      ssl: sslStatus,
      configuredBy: vercelStatus?.configuredBy || null,
      error: vercelStatus?.error || null
    };
    
    // Log for debugging
    console.log('[DNS-CONFIG] Status determination:', {
      domain: domain.domain,
      isApex,
      configured: vercelStatus?.configured,
      configurationStatus,
      aValues: vercelStatus?.aValues,
      cnames: vercelStatus?.cnames,
      ssl: sslStatus,
      finalStatus: dnsConfig.status
    });

    // Add helpful messages based on actual status
    if (dnsConfig.status.configuration === 'invalid') {
      dnsConfig.message = 'Invalid DNS configuration. Please update the DNS records to match those shown below.';
    } else if (dnsConfig.status.ownership !== 'verified') {
      dnsConfig.message = 'Add the DNS records below to verify domain ownership and configure routing.';
    } else if (dnsConfig.status.configuration === 'valid' && dnsConfig.status.ssl !== 'READY') {
      dnsConfig.message = 'Domain verified and configured. SSL certificate is being provisioned.';
    } else if (dnsConfig.status.configuration === 'valid' && dnsConfig.status.ssl === 'READY') {
      dnsConfig.message = 'Domain is fully configured and active.';
    } else {
      dnsConfig.message = 'Domain verification in progress.';
    }

    return NextResponse.json(dnsConfig);
  } catch (error) {
    console.error('Error fetching DNS config:', error);
    return NextResponse.json(
      { error: 'Failed to fetch DNS configuration' },
      { status: 500 }
    );
  }
}