import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { validateDomainFormat } from '@/lib/services/domains';
import { addDomainToVercel, removeDomainFromVercel, checkDomainStatus } from '@/lib/services/domains.server';
import { validateSlug } from '@/lib/services/slug-validation';
import { z } from 'zod';

/**
 * Helper to determine if a domain is an apex domain
 */
function isApexDomain(domain: string): boolean {
  const parts = domain.split('.');
  // Check for country-code TLDs like .co.uk
  const isCountryCodeTLD = /\.(co|com|net|org|gov|edu|ac)\.[a-z]{2}$/.test(domain);
  
  if (isCountryCodeTLD) {
    return parts.length === 3;
  }
  return parts.length === 2;
}

/**
 * Get the companion domain (apex <-> www)
 */
function getCompanionDomain(domain: string): string | null {
  const parts = domain.split('.');
  
  // If it's www.example.com, return example.com
  if (parts[0] === 'www' && parts.length >= 3) {
    return parts.slice(1).join('.');
  }
  
  // If it's example.com (apex), return www.example.com
  if (isApexDomain(domain)) {
    return `www.${domain}`;
  }
  
  // For other subdomains (app.example.com), no companion
  return null;
}

/**
 * Extract subdomain from a full domain
 * Returns null for apex domains
 */
function extractSubdomain(domain: string): string | null {
  const parts = domain.split('.');
  
  // Handle apex domains
  if (isApexDomain(domain)) {
    return null;
  }
  
  // For subdomains, return the first part
  // e.g., "app.example.com" returns "app"
  // e.g., "staging.app.example.com" returns "staging.app"
  const isCountryCodeTLD = /\.(co|com|net|org|gov|edu|ac)\.[a-z]{2}$/.test(domain);
  const apexLength = isCountryCodeTLD ? 3 : 2;
  
  if (parts.length > apexLength) {
    return parts.slice(0, parts.length - apexLength).join('.');
  }
  
  return null;
}

const addDomainSchema = z.object({
  domain: z.string().min(1),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const supabase = await createSupabaseServerClient();
    
    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const validationResult = addDomainSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { domain } = validationResult.data;

    // Validate domain format (but not permissions yet)
    const formatError = validateDomainFormat(domain);
    if (formatError) {
      // Skip the reserved domain check for now - we'll handle it properly below
      if (!formatError.includes('requires special permission')) {
        return NextResponse.json({ error: formatError }, { status: 400 });
      }
    }

    // First check if user is a platform admin/staff
    const { data: platformAccess } = await supabase
      .from('account_users')
      .select('role')
      .eq('account_id', '00000000-0000-0000-0000-000000000000')
      .eq('user_id', user.id)
      .in('role', ['admin', 'staff'])
      .single();

    let project;
    let projectError;

    if (platformAccess) {
      // Platform admin/staff - they have access to all projects
      const result = await supabase
        .from('projects')
        .select(`
          id,
          account_id
        `)
        .eq('id', projectId)
        .single();
      
      project = result.data;
      projectError = result.error;
    } else {
      // Regular user - check normal access
      const result = await supabase
        .from('projects')
        .select(`
          id,
          account_id,
          accounts!inner(
            id,
            account_users!inner(
              user_id,
              role
            )
          )
        `)
        .eq('id', projectId)
        .eq('accounts.account_users.user_id', user.id)
        .single();
      
      project = result.data;
      projectError = result.error;
    }

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found or access denied' }, { status: 404 });
    }

    // Check subdomain validation for reserved patterns
    const subdomain = extractSubdomain(domain);
    const isPlatformAdmin = !!platformAccess;
    
    // Check subdomain if it exists
    if (subdomain) {
      const subdomainValidation = validateSlug(subdomain, isPlatformAdmin);
      
      if (!subdomainValidation.isValid && !isPlatformAdmin) {
        return NextResponse.json(
          { error: subdomainValidation.message || 'This subdomain is reserved.' },
          { status: 403 }
        );
      }
      
      // Log admin override if applicable
      if (subdomainValidation.isReserved && subdomainValidation.requiresAdmin && isPlatformAdmin) {
        console.log('⚠️ Admin override: Adding domain with reserved subdomain:', domain);
      }
    }
    
    // Also check full domain against reserved list (for apex domains like wondrousdigital.com)
    const reservedDomains = ['wondrousdigital.com', 'www.wondrousdigital.com'];
    if (reservedDomains.includes(domain)) {
      // Check if this account has permission
      const { data: permission } = await supabase
        .from('reserved_domain_permissions')
        .select('id')
        .eq('account_id', project.account_id)
        .eq('domain', domain)
        .single();
        
      if (!permission && !isPlatformAdmin) {
        return NextResponse.json(
          { error: 'This name is reserved, please choose a different name. Reach out to support at hello@wondrousdigital.com if you need help.' },
          { status: 403 }
        );
      }
    }

    // Check if domain already exists for THIS project
    const { data: existingDomain } = await supabase
      .from('project_domains')
      .select('id, project_id')
      .eq('domain', domain)
      .single();

    if (existingDomain) {
      // If it exists for this project, that's okay - maybe they're re-adding
      if (existingDomain.project_id === projectId) {
        return NextResponse.json(
          { error: 'This domain is already configured for this project.' },
          { status: 409 }
        );
      }
      
      // If it exists for another project, check if this is a reserved domain
      if (reservedDomains.includes(domain)) {
        // For reserved domains with permission, we might want to allow moving between projects
        // For now, still block it to prevent accidental moves
        return NextResponse.json(
          { error: 'This domain is already in use by another project. Please remove it from the other project first.' },
          { status: 409 }
        );
      } else {
        return NextResponse.json(
          { error: 'This domain is already in use.' },
          { status: 409 }
        );
      }
    }

    // Check if this is the first domain for the project
    const { data: existingProjectDomains } = await supabase
      .from('project_domains')
      .select('id')
      .eq('project_id', projectId)
      .limit(1);
    
    const isFirstDomain = !existingProjectDomains || existingProjectDomains.length === 0;
    
    // Check if this domain has a companion (apex <-> www)
    const companionDomain = getCompanionDomain(domain);
    const domainsToAdd = [domain];
    if (companionDomain) {
      // Also validate the companion domain's subdomain
      const companionSubdomain = extractSubdomain(companionDomain);
      if (companionSubdomain) {
        const companionValidation = validateSlug(companionSubdomain, isPlatformAdmin);
        
        if (!companionValidation.isValid && !isPlatformAdmin) {
          return NextResponse.json(
            { error: companionValidation.message || 'The companion subdomain is reserved.' },
            { status: 403 }
          );
        }
      }
      
      domainsToAdd.push(companionDomain);
      console.log(`[DOMAIN] Will add both ${domain} and ${companionDomain}`);
    }

    // Store all successfully added domains for rollback if needed
    const addedDomains: Array<{ id: string; domain: string }> = [];
    
    // Add all domains (main + companion if applicable)
    for (const domainToAdd of domainsToAdd) {
        // Check if companion domain already exists for this project
        const { data: existingCompanion } = await supabase
          .from('project_domains')
          .select('id')
          .eq('domain', domainToAdd)
          .eq('project_id', projectId)
          .single();

        if (existingCompanion) {
          console.log(`[DOMAIN] ${domainToAdd} already exists for this project, skipping`);
          continue;
        }

        // Add domain to database
        // Set include_www to true for apex domains, false for all others
        const isMainDomain = domainToAdd === domain;
        const shouldIncludeWWW = isMainDomain && isApexDomain(domainToAdd);
        
        const { data, error } = await supabase
          .from('project_domains')
          .insert({
            project_id: projectId,
            domain: domainToAdd,
            verified: false,
            verified_at: null,
            include_www: shouldIncludeWWW,
            is_primary: isFirstDomain && isMainDomain, // Only set primary for the main domain on first addition
          })
          .select()
          .single();

        if (error) {
          console.error(`Error adding domain ${domainToAdd}:`, error);
          // Rollback previously added domains
          for (const added of addedDomains) {
            await supabase.from('project_domains').delete().eq('id', added.id);
          }
          return NextResponse.json(
            { error: `Failed to add domain ${domainToAdd}` },
            { status: 500 }
          );
        }

        addedDomains.push(data);

        // Add to Vercel
        try {
          await addDomainToVercel(domainToAdd);
          console.log(`[DOMAIN] Successfully added ${domainToAdd} to Vercel`);
          
          // Immediately check if domain is verified in Vercel
          try {
            const status = await checkDomainStatus(domainToAdd);
            if (status.verified) {
              console.log(`[DOMAIN] ${domainToAdd} is already verified in Vercel, updating database`);
              await supabase
                .from('project_domains')
                .update({ 
                  verified: true,
                  verified_at: new Date().toISOString()
                })
                .eq('id', data.id);
            }
          } catch (verifyError) {
            console.error(`[DOMAIN] Failed to check verification status for ${domainToAdd}:`, verifyError);
            // Non-fatal error, continue
          }
        } catch (vercelError) {
          const errorMessage = vercelError instanceof Error ? vercelError.message : String(vercelError);
          if (!errorMessage.includes('already exists')) {
            // Rollback all added domains
            for (const added of addedDomains) {
              await supabase.from('project_domains').delete().eq('id', added.id);
              try {
                await removeDomainFromVercel(added.domain);
              } catch (e) {
                console.error(`[DOMAIN] Failed to rollback ${added.domain} from Vercel:`, e);
              }
            }
            
            console.error(`[DOMAIN] Failed to add ${domainToAdd} to Vercel:`, vercelError);
            return NextResponse.json(
              { error: `Failed to add domain to Vercel: ${errorMessage}` },
              { status: 500 }
            );
          }
          console.log(`[DOMAIN] ${domainToAdd} already exists in Vercel, continuing`);
        }
      }

    // Return the primary domain that was requested (with full data including project_id)
    const primaryDomain = addedDomains.find(d => d.domain === domain);
    return NextResponse.json(primaryDomain || addedDomains[0]);
  } catch (error) {
    console.error('Error in domain addition:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const supabase = await createSupabaseServerClient();
    
    // Get domain ID from URL search params
    const url = new URL(request.url);
    const domainId = url.searchParams.get('domainId');
    
    if (!domainId) {
      return NextResponse.json(
        { error: 'Domain ID is required' },
        { status: 400 }
      );
    }
    
    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get domain details and verify project access
    const { data: domain, error: domainError } = await supabase
      .from('project_domains')
      .select(`
        id,
        domain,
        project_id,
        projects!inner(
          id,
          account_id
        )
      `)
      .eq('id', domainId)
      .eq('project_id', projectId)
      .single();

    if (domainError || !domain) {
      return NextResponse.json(
        { error: 'Domain not found or access denied' },
        { status: 404 }
      );
    }

    // Check if this domain has a companion (apex <-> www)
    const companionDomain = getCompanionDomain(domain.domain);
    const domainsToRemove = [{ id: domainId, domain: domain.domain }];
    
    // Find companion domain in database if it exists
    if (companionDomain) {
      const { data: companionData } = await supabase
        .from('project_domains')
        .select('id, domain')
        .eq('domain', companionDomain)
        .eq('project_id', projectId)
        .single();
      
      if (companionData) {
        domainsToRemove.push({ id: companionData.id, domain: companionData.domain });
        console.log(`[DOMAIN] Will remove both ${domain.domain} and ${companionDomain}`);
      }
    }

    // Remove all domains (main + companion if applicable)
    const removedDomains: string[] = [];
    for (const domainToRemove of domainsToRemove) {
      // Remove from Vercel first
      try {
        await removeDomainFromVercel(domainToRemove.domain);
        console.log(`[DOMAIN] Removed ${domainToRemove.domain} from Vercel`);
      } catch (vercelError) {
        console.warn(`[DOMAIN] Error removing ${domainToRemove.domain} from Vercel:`, vercelError);
        // Continue anyway - domain might not exist in Vercel
      }

      // Remove from database
      const { error: deleteError } = await supabase
        .from('project_domains')
        .delete()
        .eq('id', domainToRemove.id);

      if (deleteError) {
        console.error(`[DOMAIN] Failed to delete ${domainToRemove.domain} from database:`, deleteError);
        // Continue with other domains
      } else {
        removedDomains.push(domainToRemove.domain);
      }
    }

    return NextResponse.json({
      success: true,
      message: removedDomains.length > 1 
        ? `Removed ${removedDomains.join(' and ')}` 
        : 'Domain removed successfully'
    });
  } catch (error) {
    console.error('Error in domain deletion:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}