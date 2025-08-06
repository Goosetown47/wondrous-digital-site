import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/env.mjs';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const checkSpecific = searchParams.get('domain');
  
  const VERCEL_API_TOKEN = env.VERCEL_API_TOKEN;
  const VERCEL_PROJECT_ID = env.VERCEL_PROJECT_ID;
  const VERCEL_TEAM_ID = env.VERCEL_TEAM_ID;

  if (!VERCEL_API_TOKEN || !VERCEL_PROJECT_ID) {
    return NextResponse.json({
      error: 'Vercel integration not configured',
      token: VERCEL_API_TOKEN ? 'Set' : 'Missing',
      projectId: VERCEL_PROJECT_ID ? 'Set' : 'Missing',
      teamId: VERCEL_TEAM_ID || 'Not set'
    });
  }

  try {
    // First, let's verify the project exists and we have access
    const projectUrl = `https://api.vercel.com/v9/projects/${VERCEL_PROJECT_ID}${VERCEL_TEAM_ID ? `?teamId=${VERCEL_TEAM_ID}` : ''}`;
    console.log(`[DEBUG] Checking project at: ${projectUrl}`);
    
    const projectResponse = await fetch(projectUrl, {
      headers: {
        'Authorization': `Bearer ${VERCEL_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!projectResponse.ok) {
      const error = await projectResponse.json();
      return NextResponse.json({
        error: 'Failed to access Vercel project',
        projectId: VERCEL_PROJECT_ID,
        status: projectResponse.status,
        details: error
      });
    }

    const projectData = await projectResponse.json();

    // Now check domains
    const domainsUrl = `https://api.vercel.com/v10/projects/${VERCEL_PROJECT_ID}/domains${VERCEL_TEAM_ID ? `?teamId=${VERCEL_TEAM_ID}` : ''}`;
    console.log(`[DEBUG] Fetching domains from: ${domainsUrl}`);
    
    const domainsResponse = await fetch(domainsUrl, {
      headers: {
        'Authorization': `Bearer ${VERCEL_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!domainsResponse.ok) {
      const error = await domainsResponse.json();
      return NextResponse.json({
        error: 'Failed to fetch domains',
        status: domainsResponse.status,
        details: error
      });
    }

    const domainsData = await domainsResponse.json();

    // If checking specific domain
    let specificDomainData = null;
    if (checkSpecific) {
      const specificUrl = `https://api.vercel.com/v10/projects/${VERCEL_PROJECT_ID}/domains/${checkSpecific}${VERCEL_TEAM_ID ? `?teamId=${VERCEL_TEAM_ID}` : ''}`;
      console.log(`[DEBUG] Checking specific domain at: ${specificUrl}`);
      
      const specificResponse = await fetch(specificUrl, {
        headers: {
          'Authorization': `Bearer ${VERCEL_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
      });

      if (specificResponse.ok) {
        specificDomainData = await specificResponse.json();
      } else {
        const error = await specificResponse.json();
        specificDomainData = {
          error: 'Domain not found',
          status: specificResponse.status,
          details: error
        };
      }
    }

    return NextResponse.json({
      success: true,
      project: {
        id: projectData.id,
        name: projectData.name,
        framework: projectData.framework,
      },
      domains: {
        count: domainsData.domains?.length || 0,
        list: domainsData.domains?.map((d: { name: string; verified: boolean; ssl?: { state: string }; createdAt: string }) => ({
          domain: d.name,
          verified: d.verified,
          ssl: d.ssl?.state,
          createdAt: d.createdAt
        })) || []
      },
      specificDomain: specificDomainData,
      config: {
        projectId: VERCEL_PROJECT_ID,
        teamId: VERCEL_TEAM_ID || 'Not set',
        tokenFirst10: VERCEL_API_TOKEN.substring(0, 10) + '...'
      }
    });

  } catch (error) {
    console.error('[DEBUG] Error:', error);
    return NextResponse.json({
      error: 'Failed to check Vercel domains',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}