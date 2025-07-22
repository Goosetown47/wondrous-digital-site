import { NextRequest, NextResponse } from 'next/server';
import { generateStaticHTML } from '@/lib/staticExport';
import { deployToNetlify } from '@/lib/netlifyDeploy';
import type { Section } from '@/stores/builderStore';

export async function POST(request: NextRequest) {
  try {
    const { projectId, sections } = await request.json();

    if (!projectId || !sections || !Array.isArray(sections)) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate static HTML
    const html = generateStaticHTML(sections as Section[]);

    // Deploy to Netlify
    const siteName = `nextjs-test-${projectId}`;
    const customDomain = 'nextjs-test-1.wondrousdigital.com';

    const deployment = await deployToNetlify({
      siteName,
      customDomain,
      html,
    });

    return NextResponse.json({
      success: true,
      deployment,
    });
  } catch (error) {
    console.error('Deploy API error:', error);
    return NextResponse.json(
      { error: 'Deployment failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}