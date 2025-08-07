import { env } from '@/env.mjs';
import { createClient } from '@supabase/supabase-js';
import type { ProjectDomain } from '@/types/database';

// Vercel API configuration
const VERCEL_API_TOKEN = env.VERCEL_API_TOKEN;
const VERCEL_PROJECT_ID = env.VERCEL_PROJECT_ID;
const VERCEL_TEAM_ID = env.VERCEL_TEAM_ID;
const VERCEL_API_BASE = 'https://api.vercel.com';

// Create Supabase admin client for server-side operations
const supabaseAdmin = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

// Helper function for Vercel API requests
async function vercelRequest(path: string, options: RequestInit = {}) {
  if (!VERCEL_API_TOKEN) {
    throw new Error('Vercel API token not configured');
  }

  const url = new URL(path, VERCEL_API_BASE);
  if (VERCEL_TEAM_ID) {
    url.searchParams.set('teamId', VERCEL_TEAM_ID);
  }

  const response = await fetch(url.toString(), {
    ...options,
    headers: {
      'Authorization': `Bearer ${VERCEL_API_TOKEN}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  return response;
}

/**
 * Check if Vercel integration is configured
 */
export function isVercelConfigured(): boolean {
  return !!(VERCEL_API_TOKEN && VERCEL_PROJECT_ID);
}

export interface VercelDomainConfig {
  name: string;
  apexName?: string;
  projectId?: string;
  redirect?: string;
  redirectStatusCode?: number;
  gitBranch?: string | null;
}

export interface VercelDomainStatus {
  verified: boolean;
  verification?: {
    type: string;
    domain: string;
    value: string;
    reason?: string;
  }[];
  ssl?: {
    state: 'PENDING' | 'INITIALIZING' | 'ERROR' | 'READY';
    error?: string;
  };
  error?: string;
  configuredBy?: string | null;
  cnames?: string[];
  aValues?: string[];
  configured?: boolean;
  apexName?: string | null;
}

/**
 * Add a domain to Vercel project
 */
export async function addDomainToVercel(domain: string): Promise<void> {
  if (!VERCEL_API_TOKEN || !VERCEL_PROJECT_ID) {
    console.warn('[VERCEL] Integration not configured. Skipping domain addition.');
    return;
  }

  console.log(`[VERCEL] Adding domain ${domain} to project ${VERCEL_PROJECT_ID}`);
  
  try {
    const response = await vercelRequest(`/v10/projects/${VERCEL_PROJECT_ID}/domains`, {
      method: 'POST',
      body: JSON.stringify({ name: domain }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error(`[VERCEL] Failed to add domain:`, error);
      
      // Check for specific error cases
      if (error.error?.code === 'domain_already_in_use') {
        throw new Error(`Domain ${domain} is already in use by another Vercel project`);
      } else if (error.error?.code === 'domain_already_exists') {
        console.log(`[VERCEL] Domain ${domain} already exists in this project`);
        return; // This is OK, domain is already added
      }
      
      throw new Error(error.error?.message || 'Failed to add domain to Vercel');
    }
    
    console.log(`[VERCEL] Successfully added domain ${domain} to project`);
  } catch (error) {
    console.error('[VERCEL] Error adding domain to Vercel:', error);
    throw error;
  }
}

/**
 * Remove a domain from Vercel project
 */
export async function removeDomainFromVercel(domain: string): Promise<void> {
  if (!VERCEL_API_TOKEN || !VERCEL_PROJECT_ID) {
    console.warn('Vercel integration not configured. Skipping domain removal.');
    return;
  }

  try {
    const response = await vercelRequest(
      `/v10/projects/${VERCEL_PROJECT_ID}/domains/${domain}`,
      {
        method: 'DELETE',
      }
    );

    if (!response.ok && response.status !== 404) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to remove domain from Vercel');
    }
  } catch (error) {
    console.error('Error removing domain from Vercel:', error);
    throw error;
  }
}

/**
 * Check domain verification and SSL status
 */
export async function checkDomainStatus(domain: string): Promise<VercelDomainStatus> {
  if (!VERCEL_API_TOKEN || !VERCEL_PROJECT_ID) {
    console.warn('[VERCEL] Integration not configured. Cannot check domain status.');
    console.warn(`[VERCEL] Token: ${VERCEL_API_TOKEN ? 'Set' : 'Missing'}, Project: ${VERCEL_PROJECT_ID ? 'Set' : 'Missing'}`);
    return { verified: false, error: 'Vercel integration not configured. Please check environment variables.' };
  }
  
  const timestamp = new Date().toISOString();
  console.log(`[VERCEL] Checking domain status for: ${domain} at ${timestamp}`);
  console.log(`[VERCEL] Environment: ${process.env.VERCEL_ENV || 'development'}, Node: ${process.env.NODE_ENV}`);
  console.log(`[VERCEL] Using project ID: ${VERCEL_PROJECT_ID} (full)`);
  console.log(`[VERCEL] Using team ID: ${VERCEL_TEAM_ID || 'none'}`);
  console.log(`[VERCEL] API Token: ${VERCEL_API_TOKEN.substring(0, 10)}...`);

  try {
    const url = `/v10/projects/${VERCEL_PROJECT_ID}/domains/${domain}`;
    console.log(`[VERCEL] Making request to: ${url}`);
    
    const response = await vercelRequest(
      url,
      {
        method: 'GET',
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        console.log(`[VERCEL] Domain ${domain} not found in Vercel project`);
        return { verified: false, error: 'Domain not found in Vercel. It may need to be added to the project first.' };
      }
      const error = await response.json();
      console.error(`[VERCEL] Error checking domain status:`, error);
      return { verified: false, error: error.error?.message || 'Unknown error' };
    }

    const data = await response.json();
    
    // Log the FULL response for debugging
    console.log(`[VERCEL] Full API response for ${domain}:`, JSON.stringify(data, null, 2));
    
    // Log the specific fields we care about
    console.log(`[VERCEL] API response for ${domain}:`, {
      verified: data.verified,
      aValues: data.aValues,
      cnames: data.cnames,
      ssl: data.ssl?.state
    });
    
    // Determine if DNS is properly configured
    const parts = domain.split('.');
    const isApex = parts.length === 2 || 
      (parts.length === 3 && /^(co|com|net|org|gov|edu|ac)\.[a-z]{2}$/.test(parts.slice(-2).join('.')));
    
    // Use the v6 config endpoint to determine if DNS is properly configured
    // This is the industry standard approach - Vercel's misconfigured field is the source of truth
    let isConfigured = false;
    let configData = null;
    
    try {
      console.log(`[VERCEL] Checking domain configuration via v6 endpoint`);
      console.log(`[VERCEL] Domain is verified, checking configuration with v6 endpoint...`);
      configData = await getDomainConfiguration(domain);
      
      // If misconfigured is false, the domain IS configured
      isConfigured = configData && !configData.misconfigured;
      
      console.log(`[VERCEL] v6 config endpoint full response:`, { 
        domain,
        timestamp: new Date().toISOString(),
        currentProjectId: VERCEL_PROJECT_ID,
        configuredByProjectId: configData?.projectId,
        projectMismatch: configData?.projectId && configData.projectId !== VERCEL_PROJECT_ID,
        rawResponse: configData,
        misconfigured: configData?.misconfigured, 
        configured: isConfigured,
        configuredBy: configData?.configuredBy,
        error: configData?.error,
        aValues: configData?.aValues,
        cnames: configData?.cnames,
        acceptedChallenges: configData?.acceptedChallenges
      });
      
      // Update data with actual DNS values from config if available
      if (configData?.aValues) {
        data.aValues = configData.aValues;
      }
      if (configData?.cnames) {
        data.cnames = configData.cnames;
      }
    } catch (configError) {
      console.log(`[VERCEL] Could not check v6 config:`, configError);
      // If we can't check config, assume not configured
      isConfigured = false;
    }
    
    console.log(`[VERCEL] Domain ${domain} final status:`, {
      isApex,
      configured: isConfigured,
      aValues: data.aValues,
      cnames: data.cnames
    });
    
    // Determine SSL status based on configuration
    // Vercel automatically provisions SSL for configured domains
    let sslState: 'READY' | 'PENDING' | 'ERROR' = 'PENDING';
    if (isConfigured) {
      // DNS is properly configured, SSL is automatically provisioned
      sslState = 'READY';
    } else if (data.verified) {
      // Domain added but not configured
      sslState = 'PENDING';
    }
    
    return {
      verified: data.verified || false,  // This just means "added to Vercel"
      verification: data.verification || [],
      ssl: { state: sslState },  // SSL status based on configuration
      configuredBy: configData?.configuredBy || data.configuredBy || null,
      cnames: data.cnames || [],
      aValues: data.aValues || [],
      configured: isConfigured,  // This is the REAL configuration status
      apexName: data.apexName || null
    };
  } catch (error) {
    console.error('Error checking domain status:', error);
    return { verified: false, error: 'Failed to check domain status' };
  }
}

/**
 * Get DNS configuration for a domain
 * Uses the v6 endpoint which is the industry standard approach
 */
export async function getDomainConfiguration(domain: string) {
  if (!VERCEL_API_TOKEN) {
    console.warn('Vercel integration not configured. Cannot get domain configuration.');
    return { misconfigured: true, error: 'Vercel integration not configured' };
  }

  try {
    // Use v6 endpoint - this is the correct industry standard endpoint
    // It returns a misconfigured boolean field that tells us if DNS is properly configured
    const response = await vercelRequest(
      `/v6/domains/${domain}/config`,
      {
        method: 'GET',
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        // Domain not found means it's not added to any Vercel project
        console.log(`[VERCEL] Domain ${domain} not found in Vercel (404 from /v6/domains/${domain}/config)`);
        return { misconfigured: true, error: 'Domain not found' };
      }
      const error = await response.json();
      console.error(`[VERCEL] Error getting domain config:`, error);
      // Return misconfigured: true when there's an error
      return { misconfigured: true, error: error.error?.message || 'Failed to get domain configuration' };
    }

    const data = await response.json();
    
    // Enhanced logging for debugging
    console.log(`[VERCEL] v6 Domain configuration for ${domain}:`, {
      misconfigured: data.misconfigured,
      configuredBy: data.configuredBy,
      configuredByProjectId: data.projectId,
      aValues: data.aValues,
      cnames: data.cnames,
      acceptedChallenges: data.acceptedChallenges,
      responseHeaders: {
        cacheControl: response.headers.get('cache-control'),
        cfCacheStatus: response.headers.get('cf-cache-status'),
        age: response.headers.get('age'),
      },
      fullResponse: process.env.VERCEL_ENV === 'preview' ? data : '(hidden in production)'
    });
    
    // If domain is configured by a different project, log that clearly
    if (data.configuredBy && data.projectId && data.projectId !== VERCEL_PROJECT_ID) {
      console.warn(`[VERCEL] IMPORTANT: Domain ${domain} is configured by a different project!`);
      console.warn(`[VERCEL] Current project: ${VERCEL_PROJECT_ID}`);
      console.warn(`[VERCEL] Domain owned by: ${data.projectId}`);
    }
    
    return data;
  } catch (error) {
    console.error('Error getting domain configuration:', error);
    // Return misconfigured: true on errors
    return { 
      misconfigured: true, 
      error: error instanceof Error ? error.message : 'Failed to get domain configuration' 
    };
  }
}

/**
 * Update domain verification status in the database
 * This function uses the admin client to bypass RLS restrictions
 */
export async function updateDomainVerification(
  domainId: string, 
  updates: Partial<Pick<ProjectDomain, 'verified' | 'ssl_state' | 'verification_details'>>
): Promise<{ error: string | null }> {
  console.log(`[DOMAIN] Updating domain verification for ${domainId}:`, updates);
  
  try {
    // Build the updates object
    const safeUpdates: Record<string, unknown> = {};
    
    if (updates.verified !== undefined) {
      safeUpdates.verified = updates.verified;
      // Add verified_at timestamp when domain is verified
      if (updates.verified === true) {
        safeUpdates.verified_at = new Date().toISOString();
      }
    }
    
    if (updates.ssl_state !== undefined) {
      safeUpdates.ssl_state = updates.ssl_state;
    }
    
    if (updates.verification_details !== undefined) {
      safeUpdates.verification_details = updates.verification_details;
    }
    
    // Only proceed if there are updates to make
    if (Object.keys(safeUpdates).length === 0) {
      console.log('[DOMAIN] No updates to apply');
      return { error: null };
    }
    
    const { error } = await supabaseAdmin
      .from('project_domains')
      .update(safeUpdates)
      .eq('id', domainId);

    if (error) {
      console.error('[DOMAIN] Failed to update domain verification:', error);
      return { error: error.message };
    }

    console.log('[DOMAIN] Successfully updated domain verification');
    return { error: null };
  } catch (error) {
    console.error('[DOMAIN] Error updating domain verification:', error);
    return { 
      error: error instanceof Error ? error.message : 'Failed to update domain verification' 
    };
  }
}