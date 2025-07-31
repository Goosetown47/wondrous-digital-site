import { env } from '@/env.mjs';

// Vercel API configuration
const VERCEL_API_TOKEN = env.VERCEL_API_TOKEN;
const VERCEL_PROJECT_ID = env.VERCEL_PROJECT_ID;
const VERCEL_TEAM_ID = env.VERCEL_TEAM_ID;
const VERCEL_API_BASE = 'https://api.vercel.com';

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
    console.warn('Vercel integration not configured. Skipping domain addition.');
    return;
  }

  try {
    const response = await vercelRequest(`/v10/projects/${VERCEL_PROJECT_ID}/domains`, {
      method: 'POST',
      body: JSON.stringify({ name: domain }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to add domain to Vercel');
    }
  } catch (error) {
    console.error('Error adding domain to Vercel:', error);
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
    console.warn('Vercel integration not configured. Cannot check domain status.');
    return { verified: false, error: 'Vercel integration not configured' };
  }

  try {
    const response = await vercelRequest(
      `/v10/projects/${VERCEL_PROJECT_ID}/domains/${domain}`,
      {
        method: 'GET',
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return { verified: false, error: 'Domain not found in Vercel' };
      }
      const error = await response.json();
      return { verified: false, error: error.error?.message || 'Unknown error' };
    }

    const data = await response.json();
    
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