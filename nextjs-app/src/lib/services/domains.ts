import { supabase } from '@/lib/supabase/client';

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

// Note: Vercel API functions have been moved to server-side only
// They are now implemented directly in the API routes to avoid client-side module issues

/**
 * Update domain verification status via API route
 * This function now calls the server-side API to bypass RLS restrictions
 */
export async function updateDomainVerification(
  domainId: string,
  updates: {
    verified?: boolean;
    ssl_state?: string;
    verification_details?: Record<string, unknown>;
  }
): Promise<{ error: string | null }> {
  try {
    const response = await fetch(`/api/domains/${domainId}/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const data = await response.json();
      return { error: data.error || 'Failed to update domain verification' };
    }

    return { error: null };
  } catch (error) {
    console.error('Error updating domain verification:', error);
    return { 
      error: error instanceof Error ? error.message : 'Failed to update domain verification' 
    };
  }
}

/**
 * Validate domain format
 */
export function validateDomainFormat(domain: string): string | null {
  // Remove protocol if present
  domain = domain.replace(/^https?:\/\//, '');
  
  // Remove trailing slash
  domain = domain.replace(/\/$/, '');
  
  // Basic domain validation
  const domainRegex = /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
  
  if (!domainRegex.test(domain)) {
    return 'Invalid domain format';
  }
  
  // Check for reserved domains
  const reserved = ['localhost', 'example.com', 'test.com'];
  if (reserved.includes(domain)) {
    return 'This domain is reserved';
  }
  
  // Check domain length
  if (domain.length > 253) {
    return 'Domain is too long';
  }
  
  return null;
}

/**
 * Check if domain is already in use
 */
export async function isDomainInUse(domain: string): Promise<boolean> {
  const { data } = await supabase
    .from('project_domains')
    .select('id')
    .eq('domain', domain)
    .single();
    
  return !!data;
}