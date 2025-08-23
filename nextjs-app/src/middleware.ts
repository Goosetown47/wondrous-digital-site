import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase/middleware';
import { createClient as createSupabaseAdminClient } from '@supabase/supabase-js';
import { env } from '@/env.mjs';
import { applySecurityHeaders } from '@/lib/security-headers';
import { validateCSRFRequest } from '@/lib/security/csrf';
import { checkRateLimit, rateLimiters, createRateLimitResponse } from '@/lib/security/rate-limit';

// Domains that should NOT be treated as customer domains
const RESERVED_DOMAINS = [
  'localhost', // Only plain localhost, not subdomains
  'app.wondrousdigital.com', // Your main app domain
  'vercel.app',
];

// Subdomains that are reserved and should not be treated as preview domains
const RESERVED_SUBDOMAINS = [
  'app',      // Main application
  'www',      // Marketing site
  'staging',  // Staging environment
  'sites',    // CNAME target for custom domains
  'api',      // API endpoints
  'admin',    // Admin panel
  'docs',     // Documentation
  'blog',     // Blog
  'support',  // Support portal
];

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/login', 
  '/signup', 
  '/forgot-password',
  '/auth/callback', 
  '/auth/verify-email', 
  '/auth/confirm',
  '/auth/update-password',
  '/auth/verify-email-pending',
  '/invitation',
  '/profile/setup',
  '/pricing',  // Allow cold visitors to see pricing
  '/payment/success',  // Allow redirect after successful payment
  '/payment/cancel'   // Allow redirect after cancelled payment
];

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const url = request.nextUrl;
  
  // Extract domain without port
  const domain = hostname.split(':')[0];
  
  // Handle API routes with CSRF protection and rate limiting
  if (url.pathname.startsWith('/api/')) {
    // Apply rate limiting based on endpoint
    let rateLimitConfig = rateLimiters.api;
    
    if (url.pathname.startsWith('/api/signup')) {
      rateLimitConfig = rateLimiters.signup;
    } else if (url.pathname.startsWith('/api/auth/login')) {
      rateLimitConfig = rateLimiters.login;
    } else if (url.pathname.startsWith('/api/auth/reset-password')) {
      rateLimitConfig = rateLimiters.passwordReset;
    }
    
    const { allowed, resetAt } = await checkRateLimit(request, rateLimitConfig);
    if (!allowed) {
      return createRateLimitResponse(resetAt);
    }
    
    // Skip CSRF for specific endpoints
    const csrfExemptPaths = ['/api/csrf', '/api/auth/callback', '/api/stripe/webhook'];
    const isExempt = csrfExemptPaths.some(path => url.pathname.startsWith(path));
    
    if (!isExempt && request.method !== 'GET') {
      const isValid = await validateCSRFRequest(request);
      if (!isValid) {
        return new NextResponse(
          JSON.stringify({ error: 'Invalid CSRF token' }),
          { 
            status: 403,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
    }
    
    const response = NextResponse.next();
    return applySecurityHeaders(response);
  }
  
  // Skip middleware for static files
  if (
    url.pathname.startsWith('/_next/') ||
    url.pathname.startsWith('/static/') ||
    url.pathname.startsWith('/favicon.ico') ||
    url.pathname.startsWith('/images/') ||
    url.pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|webp)$/i)
  ) {
    const response = NextResponse.next();
    // Apply security headers even to static files
    return applySecurityHeaders(response);
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
        const response = NextResponse.redirect(redirectUrl);
        return applySecurityHeaders(response);
      }
      
      // Return the response with updated cookies and security headers
      return applySecurityHeaders(response);
    }
    
    const response = NextResponse.next();
    return applySecurityHeaders(response);
  }

  // Handle customer domains and preview domains
  try {
    // Log domain routing attempt
    console.log(`[DOMAIN-ROUTING] Processing domain: ${domain}, path: ${url.pathname}`);
    
    // Create Supabase admin client for domain lookups (bypasses RLS)
    const supabaseAdmin = createSupabaseAdminClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
        db: {
          schema: 'public',
        },
        global: {
          headers: {
            'x-my-custom-header': 'nextjs-middleware',
          },
        },
      }
    );
    
    // Check if this is a subdomain of wondrousdigital.com (potential preview domain)
    // Exclude www.wondrousdigital.com as it should be handled as a reserved domain
    if (domain.endsWith('.wondrousdigital.com') && domain !== 'www.wondrousdigital.com' && !domain.endsWith('.vercel.app')) {
      // Extract subdomain
      const subdomain = domain.replace('.wondrousdigital.com', '').split('.').pop() || '';
      
      // Check if it's a reserved subdomain
      if (RESERVED_SUBDOMAINS.includes(subdomain)) {
        console.log(`[DOMAIN-ROUTING] Reserved subdomain detected: ${subdomain}`);
        // Reserved subdomains should route to the main app, not look for projects
        // Handle authentication for reserved subdomains
        const isPublicRoute = PUBLIC_ROUTES.some(route => url.pathname.startsWith(route));
        
        if (!isPublicRoute) {
          const { supabase, response } = createSupabaseClient(request);
          const { data: { user }, error } = await supabase.auth.getUser();
          
          if (error || !user) {
            const redirectUrl = new URL('/login', request.url);
            redirectUrl.searchParams.set('redirectTo', url.pathname);
            const redirectResponse = NextResponse.redirect(redirectUrl);
            return applySecurityHeaders(redirectResponse);
          }
          
          return applySecurityHeaders(response);
        }
        
        const response = NextResponse.next();
        return applySecurityHeaders(response);
      } else {
        // It's a project preview domain
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
          const response = NextResponse.rewrite(url);
          return applySecurityHeaders(response);
        } else {
          console.log(`[DOMAIN-ROUTING] Preview domain not found for slug: ${subdomain}`);
        }
      }
    } else {
      // Check for reserved domains with account-specific permissions
      if (domain === 'wondrousdigital.com' || domain === 'www.wondrousdigital.com') {
        console.log(`[DOMAIN-ROUTING] Checking reserved domain permissions: ${domain}`);
        
        // First check if any account has permission for this domain
        const { data: permission } = await supabaseAdmin
          .from('reserved_domain_permissions')
          .select('account_id')
          .eq('domain', domain)
          .single();
          
        if (!permission) {
          console.log(`[DOMAIN-ROUTING] No permissions exist for reserved domain: ${domain}`);
          // Continue to normal flow (will 404)
        } else {
          // Check if there's a verified domain for the permitted account
          const { data: domainData } = await supabaseAdmin
            .from('project_domains')
            .select(`
              project_id,
              projects!inner(account_id)
            `)
            .eq('domain', domain)
            .eq('verified', true)
            .eq('projects.account_id', permission.account_id)
            .single();
            
          if (domainData) {
            url.pathname = `/sites/${domainData.project_id}${url.pathname}`;
            console.log(`[DOMAIN-ROUTING] Reserved domain routed to project: ${domainData.project_id}`);
            const response = NextResponse.rewrite(url);
          return applySecurityHeaders(response);
          } else {
            console.log(`[DOMAIN-ROUTING] No verified domain found for permitted account`);
          }
        }
      }
      
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
        const response = NextResponse.rewrite(url);
        return applySecurityHeaders(response);
      } else {
        console.log(`[DOMAIN-ROUTING] Custom domain not found or not verified: ${domain}`);
      }
    }
  } catch (error) {
    console.error('[DOMAIN-ROUTING] Error:', error);
  }

  // If no domain match, return 404
  console.log(`[DOMAIN-ROUTING] No match found for domain: ${domain}`);
  const response = new NextResponse('Not Found', { status: 404 });
  return applySecurityHeaders(response);
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