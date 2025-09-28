import { NextRequest, NextResponse } from 'next/server';
import { GitHubComponentService } from '@/lib/github/component-files';
import type { CoreComponent } from '@/types/builder';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Create a test component
    const testComponent: CoreComponent = {
      id: 'test-' + Date.now(),
      name: body.name || 'Test Component',
      code_name: body.code_name || 'TestComponent1',
      type: 'section',
      source: 'custom',
      code: body.code || `export function TestComponent1() {
        return <div className="p-4">Test Component Works!</div>;
      }`,
      dependencies: [],
      imports: [],
      metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deployment_status: {
        dev: false,
        staging: false,
        prod: false,
        files_created: false,
        registry_updated: false,
        github_pr: null,
        last_deployment: null
      },
      pipeline_status: 'created'
    };

    // Initialize GitHub service
    const github = new GitHubComponentService();

    // Test file creation
    const fileResult = await github.createComponentFile(testComponent);

    // Test registry update (with just this component for now)
    const registryResult = await github.updateRegistryFile([testComponent]);

    return NextResponse.json({
      success: true,
      component: {
        name: testComponent.name,
        code_name: testComponent.code_name,
        file: fileResult
      },
      registry: registryResult,
      message: 'GitHub API test successful! Check your repo for the new files.'
    });

  } catch (error) {
    console.error('GitHub API test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'GitHub API Test Endpoint',
    usage: 'POST /api/test/github with { name, code_name, code }',
    example: {
      name: 'Test Hero',
      code_name: 'TestHero1',
      code: 'export function TestHero1() { return <div>Test</div>; }'
    }
  });
}