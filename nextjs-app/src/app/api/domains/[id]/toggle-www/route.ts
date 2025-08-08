import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { env } from '@/env.mjs';
import { addDomainToVercel, removeDomainFromVercel } from '@/lib/services/domains.server';
import { z } from 'zod';

const toggleWWWSchema = z.object({
  domain: z.string().min(1),
  includeWWW: z.boolean(),
  projectId: z.string().uuid(),
});

/**
 * Helper to determine if a domain is an apex domain
 */
function isApexDomain(domain: string): boolean {
  const parts = domain.split('.');
  const isCountryCodeTLD = /\.(co|com|net|org|gov|edu|ac)\.[a-z]{2}$/.test(domain);
  
  if (isCountryCodeTLD) {
    return parts.length === 3;
  }
  return parts.length === 2;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: domainId } = await params;
    
    // Parse request body
    const body = await request.json();
    const validationResult = toggleWWWSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { domain, includeWWW, projectId } = validationResult.data;

    // Verify this is an apex domain
    if (!isApexDomain(domain)) {
      return NextResponse.json(
        { error: 'WWW toggle only applies to apex domains' },
        { status: 400 }
      );
    }

    // Create admin client
    const supabaseAdmin = createSupabaseClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Verify domain exists and belongs to the project
    const { data: domainRecord, error: domainError } = await supabaseAdmin
      .from('project_domains')
      .select('*')
      .eq('id', domainId)
      .eq('project_id', projectId)
      .single();

    if (domainError || !domainRecord) {
      return NextResponse.json(
        { error: 'Domain not found or access denied' },
        { status: 404 }
      );
    }

    const wwwDomain = `www.${domain}`;

    if (includeWWW) {
      // Add www subdomain
      console.log(`[WWW Toggle] Adding ${wwwDomain} for ${domain}`);
      
      // Check if www domain already exists in database
      const { data: existingWWW } = await supabaseAdmin
        .from('project_domains')
        .select('id')
        .eq('domain', wwwDomain)
        .eq('project_id', projectId)
        .single();

      if (!existingWWW) {
        // Add www domain to database
        const { error: insertError } = await supabaseAdmin
          .from('project_domains')
          .insert({
            project_id: projectId,
            domain: wwwDomain,
            verified: false,
            verified_at: null,
            include_www: false, // www domains themselves don't include www
          });

        if (insertError) {
          console.error(`[WWW Toggle] Failed to add ${wwwDomain} to database:`, insertError);
          return NextResponse.json(
            { error: 'Failed to add www subdomain to database' },
            { status: 500 }
          );
        }
      }

      // Add to Vercel
      try {
        await addDomainToVercel(wwwDomain);
        console.log(`[WWW Toggle] Successfully added ${wwwDomain} to Vercel`);
      } catch (vercelError) {
        const errorMessage = vercelError instanceof Error ? vercelError.message : String(vercelError);
        if (!errorMessage.includes('already exists')) {
          // If we added to database but failed Vercel, remove from database
          if (!existingWWW) {
            await supabaseAdmin
              .from('project_domains')
              .delete()
              .eq('domain', wwwDomain)
              .eq('project_id', projectId);
          }
          
          console.error(`[WWW Toggle] Failed to add ${wwwDomain} to Vercel:`, vercelError);
          return NextResponse.json(
            { error: `Failed to add www subdomain to Vercel: ${errorMessage}` },
            { status: 500 }
          );
        }
        console.log(`[WWW Toggle] ${wwwDomain} already exists in Vercel`);
      }
    } else {
      // Remove www subdomain
      console.log(`[WWW Toggle] Removing ${wwwDomain} for ${domain}`);
      
      // Find www domain in database
      const { data: wwwRecord } = await supabaseAdmin
        .from('project_domains')
        .select('id')
        .eq('domain', wwwDomain)
        .eq('project_id', projectId)
        .single();

      if (wwwRecord) {
        // Remove from Vercel first
        try {
          await removeDomainFromVercel(wwwDomain);
          console.log(`[WWW Toggle] Removed ${wwwDomain} from Vercel`);
        } catch (vercelError) {
          console.warn(`[WWW Toggle] Error removing ${wwwDomain} from Vercel:`, vercelError);
          // Continue anyway - domain might not exist in Vercel
        }

        // Remove from database
        const { error: deleteError } = await supabaseAdmin
          .from('project_domains')
          .delete()
          .eq('id', wwwRecord.id);

        if (deleteError) {
          console.error(`[WWW Toggle] Failed to delete ${wwwDomain} from database:`, deleteError);
          return NextResponse.json(
            { error: 'Failed to remove www subdomain from database' },
            { status: 500 }
          );
        }
      }
    }

    // Update the include_www field on the apex domain
    const { error: updateError } = await supabaseAdmin
      .from('project_domains')
      .update({ include_www: includeWWW })
      .eq('id', domainId);

    if (updateError) {
      console.error(`[WWW Toggle] Failed to update include_www field:`, updateError);
      return NextResponse.json(
        { error: 'Failed to update domain settings' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      domain,
      includeWWW,
      message: includeWWW 
        ? `Added www.${domain} to your site` 
        : `Removed www.${domain} from your site`
    });
  } catch (error) {
    console.error('[WWW Toggle] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}