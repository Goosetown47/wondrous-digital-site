import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { env } from '@/env.mjs';

// Debug endpoint for domain configuration diagnostics
// Redeployed: 2025-08-07

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
        vercelUrl: process.env.VERCEL_URL,
        hasVercelToken: !!env.VERCEL_API_TOKEN,
        vercelProjectId: env.VERCEL_PROJECT_ID ? {
          first8: env.VERCEL_PROJECT_ID.substring(0, 8),
          last4: env.VERCEL_PROJECT_ID.slice(-4),
          length: env.VERCEL_PROJECT_ID.length,
          full: env.VERCEL_PROJECT_ID // Show full ID in debug mode
        } : null,
        hasTeamId: !!env.VERCEL_TEAM_ID,
        teamId: env.VERCEL_TEAM_ID ? {
          first4: env.VERCEL_TEAM_ID.substring(0, 4),
          last4: env.VERCEL_TEAM_ID.slice(-4),
        } : null,
      },
      testDomain: domain,
      timestamp: new Date().toISOString(),
      requestUrl: request.url,
      headers: {
        host: request.headers.get('host'),
        origin: request.headers.get('origin'),
        referer: request.headers.get('referer'),
      }
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

        const v10Data = v10Response.ok ? await v10Response.json() : null;
        const v6Data = v6Response.ok ? await v6Response.json() : null;
        
        vercelTest = {
          v10: {
            status: v10Response.status,
            statusText: v10Response.statusText,
            data: v10Data,
            headers: {
              cacheControl: v10Response.headers.get('cache-control'),
              cfCacheStatus: v10Response.headers.get('cf-cache-status'),
            }
          },
          v6: {
            status: v6Response.status,
            statusText: v6Response.statusText,
            data: v6Data,
            headers: {
              cacheControl: v6Response.headers.get('cache-control'),
              cfCacheStatus: v6Response.headers.get('cf-cache-status'),
            }
          },
          analysis: {
            domainVerified: v10Data?.verified || false,
            domainConfigured: v6Data ? !v6Data.misconfigured : false,
            configuredByProject: v6Data?.projectId,
            configuredByCurrentProject: v6Data?.projectId === env.VERCEL_PROJECT_ID,
            projectMismatch: v6Data?.projectId && v6Data.projectId !== env.VERCEL_PROJECT_ID,
            sslState: v10Data?.ssl?.state,
            dnsRecords: {
              aValues: v6Data?.aValues || v10Data?.aValues || [],
              cnames: v6Data?.cnames || v10Data?.cnames || [],
            }
          }
        };
      } catch (error) {
        vercelTest = {
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }

    // Generate summary and recommendations
    const summary = {
      issue: null as string | null,
      recommendation: null as string | null,
    };

    if (vercelTest?.analysis?.projectMismatch) {
      summary.issue = `Domain is configured by a different Vercel project (${vercelTest.analysis.configuredByProject})`;
      summary.recommendation = 'This domain is pointing to a different Vercel project. To use it with this project, you need to remove it from the other project first.';
    } else if (vercelTest?.v6?.status === 404) {
      summary.issue = 'Domain not found in any Vercel project';
      summary.recommendation = 'Add this domain to your Vercel project to begin configuration.';
    } else if (vercelTest?.analysis?.domainConfigured === false) {
      summary.issue = 'Domain added to Vercel but DNS not configured';
      summary.recommendation = 'Update your DNS records to point to Vercel as shown in the domain settings.';
    }

    return NextResponse.json({
      config,
      vercelTest,
      summary,
      debug: {
        message: 'Domain configuration diagnostic report',
        usage: '/api/debug/domain-config?domain=yourdomain.com',
        timestamp: new Date().toISOString()
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