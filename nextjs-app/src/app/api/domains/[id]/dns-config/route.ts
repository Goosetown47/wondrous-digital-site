import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { env } from '@/env.mjs';
import { checkDomainStatus, getDomainConfiguration } from '@/lib/services/domains.server';

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

    // Get additional configuration details from Vercel if available
    let domainConfig;
    try {
      if (vercelStatus && env.VERCEL_API_TOKEN) {
        domainConfig = await getDomainConfiguration(domain.domain);
      }
    } catch (error) {
      console.error('Error fetching domain configuration:', error);
      // Continue without config details
    }

    // Get the actual CNAME target from Vercel
    const cnameValue = vercelStatus?.cnames?.[0];
    
    // Extract the actual target from config or status
    const actualCnameTarget = domainConfig?.cname || cnameValue;

    if (isApex) {
      // Apex domain needs A record
      // Use actual A values from Vercel if available, otherwise use default
      const aRecordValue = vercelStatus?.aValues?.[0] || VERCEL_IPS.current;
      
      dnsConfig.records.push({
        type: 'A',
        name: '@',
        value: aRecordValue,
        ttl: 300,
        purpose: 'points_to_vercel'
      });
      
      // Only show www CNAME if include_www is true
      if (includeWWW) {
        dnsConfig.records.push({
          type: 'CNAME',
          name: 'www',
          value: 'cname.vercel-dns.com',
          ttl: 300,
          purpose: 'www_redirect',
          required: true,
          note: 'Configure this record to enable www.yourdomain.com'
        });
      }
    } else {
      // Subdomain needs CNAME
      const subdomain = parts[0];
      
      // Use actual CNAME target from Vercel if available
      // Vercel generates unique CNAME targets like "6b9153da6f4d3346.vercel-dns-017.com"
      const cnameTarget = actualCnameTarget || 'cname.vercel-dns.com';
      
      dnsConfig.records.push({
        type: 'CNAME',
        name: subdomain,
        value: cnameTarget,
        ttl: 300,
        purpose: 'points_to_vercel',
        note: actualCnameTarget ? 'Use this exact value provided by Vercel' : 'Default value - Vercel will provide specific target after initial setup'
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

    // Add configuration status based on Vercel response
    dnsConfig.status = {
      ownership: vercelStatus?.verified || domain.verified ? 'verified' : 'pending',
      // If domain is added but not configured properly, it's invalid
      configuration: vercelStatus?.configured ? 'valid' : 
                    (vercelStatus && !vercelStatus.configured) ? 'invalid' : 'pending',
      ssl: vercelStatus?.ssl?.state || domain.ssl_state || 'PENDING',
      configuredBy: vercelStatus?.configuredBy || null,
      error: vercelStatus?.error || null
    };

    // Add helpful messages based on actual status
    if (dnsConfig.status.configuration === 'invalid') {
      dnsConfig.message = 'Invalid DNS configuration. Please add the DNS records shown below to your domain provider.';
    } else if (!dnsConfig.status.ownership) {
      dnsConfig.message = 'Add the DNS records below to verify domain ownership and configure routing.';
    } else if (dnsConfig.status.ssl !== 'READY') {
      dnsConfig.message = 'Domain verified. SSL certificate is being provisioned.';
    } else {
      dnsConfig.message = 'Domain is fully configured and active.';
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