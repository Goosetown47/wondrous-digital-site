import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { env } from '@/env.mjs';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get domain parameter
    const searchParams = request.nextUrl.searchParams;
    const domain = searchParams.get('domain');

    if (!domain) {
      return NextResponse.json({ error: 'Domain parameter required' }, { status: 400 });
    }

    // Safely show environment configuration
    const config = {
      environment: {
        nodeEnv: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV,
        hasVercelToken: !!env.VERCEL_API_TOKEN,
        vercelProjectId: env.VERCEL_PROJECT_ID ? {
          first8: env.VERCEL_PROJECT_ID.substring(0, 8),
          last4: env.VERCEL_PROJECT_ID.slice(-4),
          length: env.VERCEL_PROJECT_ID.length
        } : null,
        hasTeamId: !!env.VERCEL_TEAM_ID,
      },
      testDomain: domain,
      timestamp: new Date().toISOString()
    };

    // Test Vercel API directly
    let vercelTest = null;
    if (env.VERCEL_API_TOKEN && env.VERCEL_PROJECT_ID) {
      try {
        // Test v10 endpoint (domain status)
        const v10Response = await fetch(
          `https://api.vercel.com/v10/projects/${env.VERCEL_PROJECT_ID}/domains/${domain}`,
          {
            headers: {
              'Authorization': `Bearer ${env.VERCEL_API_TOKEN}`,
              'Content-Type': 'application/json',
            },
          }
        );

        // Test v6 endpoint (configuration)
        const v6Response = await fetch(
          `https://api.vercel.com/v6/domains/${domain}/config`,
          {
            headers: {
              'Authorization': `Bearer ${env.VERCEL_API_TOKEN}`,
              'Content-Type': 'application/json',
            },
          }
        );

        vercelTest = {
          v10: {
            status: v10Response.status,
            statusText: v10Response.statusText,
            data: v10Response.ok ? await v10Response.json() : null
          },
          v6: {
            status: v6Response.status,
            statusText: v6Response.statusText,
            data: v6Response.ok ? await v6Response.json() : null
          }
        };
      } catch (error) {
        vercelTest = {
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }

    return NextResponse.json({
      config,
      vercelTest,
      debug: {
        message: 'Use this endpoint to debug domain configuration issues',
        usage: '/api/debug/domain-config?domain=yourdomain.com'
      }
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}