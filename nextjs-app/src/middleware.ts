import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase/middleware';
import { createClient as createSupabaseAdminClient } from '@supabase/supabase-js';
import { env } from '@/env.mjs';

// Domains that should NOT be treated as customer domains
const RESERVED_DOMAINS = [
  'localhost', // Only plain localhost, not subdomains
  'app.wondrousdigital.com', // Your main app domain
  'vercel.app',
];

// Public routes that don't require authentication
const PUBLIC_ROUTES = ['/login', '/signup', '/auth/callback', '/auth/verify-email', '/auth/confirm'];

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const url = request.nextUrl;
  
  // Extract domain without port
  const domain = hostname.split(':')[0];
  
  // Skip middleware for API routes and static files
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/_next/') ||
    url.pathname.startsWith('/static/') ||
    url.pathname.startsWith('/favicon.ico') ||
    url.pathname.startsWith('/images/') ||
    url.pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|webp)$/i)
  ) {
    return NextResponse.next();
  }
  
  // Check if this is a reserved domain
  // For localhost, only exact match (to allow subdomains like veterinary-one.localhost)
  const isReservedDomain = domain === 'localhost' || 
    RESERVED_DOMAINS.filter(r => r !== 'localhost').some(reserved => 
      domain === reserved || domain.endsWith(`.${reserved}`)
    );
  
  if (isReservedDomain) {
    // Handle authentication for reserved domains
    const isPublicRoute = PUBLIC_ROUTES.some(route => url.pathname.startsWith(route));
    
    // Check for authentication on protected routes
    if (!isPublicRoute) {
      const { supabase, response } = createSupabaseClient(request);
      
      // Try to refresh the session to ensure it's valid
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        // Redirect to login if not authenticated or session invalid
        const redirectUrl = new URL('/login', request.url);
        redirectUrl.searchParams.set('redirectTo', url.pathname);
        return NextResponse.redirect(redirectUrl);
      }
      
      // Return the response with updated cookies
      return response;
    }
    
    return NextResponse.next();
  }

  // Handle customer domains and preview domains
  try {
    // Log domain routing attempt
    console.log(`[DOMAIN-ROUTING] Processing domain: ${domain}, path: ${url.pathname}`);
    
    // Create Supabase admin client for domain lookups (bypasses RLS)
    const supabaseAdmin = createSupabaseAdminClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    // Check if this is a preview domain
    if (domain.endsWith('.sites.wondrousdigital.com')) {
      const subdomain = domain.replace('.sites.wondrousdigital.com', '');
      console.log(`[DOMAIN-ROUTING] Preview domain detected, slug: ${subdomain}`);
      
      // Look up project by slug
      const { data: projectData } = await supabaseAdmin
        .from('projects')
        .select('id')
        .eq('slug', subdomain)
        .single();
        
      if (projectData) {
        // Rewrite to the dynamic site route
        url.pathname = `/sites/${projectData.id}${url.pathname}`;
        console.log(`[DOMAIN-ROUTING] Preview domain routed to project: ${projectData.id}`);
        return NextResponse.rewrite(url);
      } else {
        console.log(`[DOMAIN-ROUTING] Preview domain not found for slug: ${subdomain}`);
      }
    } else {
      // Look up custom domain
      console.log(`[DOMAIN-ROUTING] Checking custom domain: ${domain}`);
      
      // Try exact match first
      let { data: domainData } = await supabaseAdmin
        .from('project_domains')
        .select('project_id')
        .eq('domain', domain)
        .eq('verified', true)
        .single();

      // If no exact match and domain starts with www, try without www
      if (!domainData && domain.startsWith('www.')) {
        const domainWithoutWww = domain.substring(4);
        console.log(`[DOMAIN-ROUTING] Trying without www: ${domainWithoutWww}`);
        
        const result = await supabaseAdmin
          .from('project_domains')
          .select('project_id')
          .eq('domain', domainWithoutWww)
          .eq('verified', true)
          .single();
          
        domainData = result.data;
      }
      
      // If no match and domain doesn't have www, try with www
      if (!domainData && !domain.startsWith('www.')) {
        const domainWithWww = `www.${domain}`;
        console.log(`[DOMAIN-ROUTING] Trying with www: ${domainWithWww}`);
        
        const result = await supabaseAdmin
          .from('project_domains')
          .select('project_id')
          .eq('domain', domainWithWww)
          .eq('verified', true)
          .single();
          
        domainData = result.data;
      }

      if (domainData) {
        // Rewrite to the dynamic site route
        url.pathname = `/sites/${domainData.project_id}${url.pathname}`;
        console.log(`[DOMAIN-ROUTING] Custom domain routed to project: ${domainData.project_id}`);
        return NextResponse.rewrite(url);
      } else {
        console.log(`[DOMAIN-ROUTING] Custom domain not found or not verified: ${domain}`);
      }
    }
  } catch (error) {
    console.error('[DOMAIN-ROUTING] Error:', error);
  }

  // If no domain match, return 404
  console.log(`[DOMAIN-ROUTING] No match found for domain: ${domain}`);
  return new NextResponse('Not Found', { status: 404 });
}

export const config = {
  // Run middleware on all routes except static files and API
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (public images)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images|public).*)',
  ],
};