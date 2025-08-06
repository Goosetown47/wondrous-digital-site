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
  
  console.log(`[VERCEL] Checking domain status for: ${domain}`);
  console.log(`[VERCEL] Using project ID: ${VERCEL_PROJECT_ID}`);
  console.log(`[VERCEL] API Token (first 10 chars): ${VERCEL_API_TOKEN?.substring(0, 10)}...`);

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
        console.log(`[VERCEL] 404 Response status:`, response.status);
        console.log(`[VERCEL] 404 Response headers:`, response.headers);
        
        // Try to get more info about the 404
        try {
          const errorBody = await response.json();
          console.log(`[VERCEL] 404 Error details:`, errorBody);
        } catch {
          console.log(`[VERCEL] Could not parse 404 response body`);
        }
        
        return { verified: false, error: 'Domain not found in Vercel. It may need to be added to the project first.' };
      }
      const error = await response.json();
      console.error(`[VERCEL] Error checking domain status:`, error);
      return { verified: false, error: error.error?.message || 'Unknown error' };
    }

    const data = await response.json();
    console.log(`[VERCEL] Domain status for ${domain}:`, {
      verified: data.verified,
      ssl: data.ssl?.state,
      verification: data.verification?.length || 0
    });
    
    return {
      verified: data.verified || false,
      verification: data.verification || [],
      ssl: data.ssl || { state: 'PENDING' },
    };
  } catch (error) {
    console.error('Error checking domain status:', error);
    return { verified: false, error: 'Failed to check domain status' };
  }
}

/**
 * Get DNS configuration for a domain
 */
export async function getDomainConfiguration(domain: string) {
  if (!VERCEL_API_TOKEN || !VERCEL_PROJECT_ID) {
    console.warn('Vercel integration not configured. Cannot get domain configuration.');
    throw new Error('Vercel integration not configured');
  }

  try {
    const response = await vercelRequest(
      `/v10/projects/${VERCEL_PROJECT_ID}/domains/${domain}/config`,
      {
        method: 'GET',
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to get domain configuration');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting domain configuration:', error);
    throw error;
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