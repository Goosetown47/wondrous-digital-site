import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Domains that should NOT be treated as customer domains
const RESERVED_DOMAINS = [
  'localhost', // Only plain localhost, not subdomains
  'app.wondrousdigital.com', // Your main app domain
  'wondrousdigital.com',
  'vercel.app',
];

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
    url.pathname.startsWith('/favicon.ico')
  ) {
    return NextResponse.next();
  }
  
  // Check if this is a reserved domain
  // For localhost, only exact match (to allow subdomains like coffee-shop.localhost)
  const isReservedDomain = domain === 'localhost' || 
    RESERVED_DOMAINS.filter(r => r !== 'localhost').some(reserved => 
      domain === reserved || domain.endsWith(`.${reserved}`)
    );
  
  if (isReservedDomain) {
    return NextResponse.next();
  }

  try {
    // Create Supabase client for middleware
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    // Look up project by domain
    const { data: domainData } = await supabase
      .from('project_domains')
      .select('project_id')
      .eq('domain', domain)
      .eq('verified', true)
      .single();

    if (domainData) {
      // Rewrite to the dynamic site route
      url.pathname = `/sites/${domainData.project_id}${url.pathname}`;
      return NextResponse.rewrite(url);
    }
  } catch (error) {
    console.error('Domain lookup error:', error);
  }

  // If no domain match, return 404
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
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};