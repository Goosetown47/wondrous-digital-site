import { supabase } from '@/lib/supabase/client';
import type { ProjectDomain } from '@/types/database';

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
 * Update domain verification status in database
 */
export async function updateDomainVerification(
  domainId: string,
  verified: boolean
): Promise<void> {
  const updates: Partial<ProjectDomain> = {
    verified,
    verified_at: verified ? new Date().toISOString() : undefined,
  };

  // Could add ssl_state to database if needed
  const { error } = await supabase
    .from('project_domains')
    .update(updates)
    .eq('id', domainId);

  if (error) throw error;
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
  
  // Special reserved domains that require permissions
  const permissionRequired = ['wondrousdigital.com', 'www.wondrousdigital.com'];
  if (permissionRequired.includes(domain)) {
    return 'This domain requires special permission. Please contact support if you own this domain.';
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