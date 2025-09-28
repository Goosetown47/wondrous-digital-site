import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase/admin';
import { getBuildSafeCookieStore } from '@/lib/cookies/build-safe';
import { env } from '@/env.mjs';
import { isAdminServer, isStaffServer } from '@/lib/permissions/server-checks';
import { getCodeNameWithAutoNumber } from '@/lib/services/naming-service';
import { GitHubComponentService } from '@/lib/github/component-files';
import type { CoreComponent } from '@/types/builder';

interface ComponentCreationRequest {
  name: string;
  type: string;
  source: string;
  code: string;
  dependencies?: string[];
  imports?: string[];
  metadata?: Record<string, unknown>;
}

interface ProgressUpdate {
  step: string;
  status: 'pending' | 'in_progress' | 'completed' | 'error';
  message?: string;
}

export async function POST(request: NextRequest) {
  const steps: ProgressUpdate[] = [
    { step: 'generating_name', status: 'pending' },
    { step: 'saving_to_database', status: 'pending' },
    { step: 'creating_github_files', status: 'pending' },
    { step: 'updating_registry', status: 'pending' },
    { step: 'finalizing', status: 'pending' }
  ];

  try {
    // Verify authentication
    const cookieStore = await getBuildSafeCookieStore();
    const authClient = createServerClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    const { data: { user }, error: userError } = await authClient.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({
        error: 'Not authenticated',
        progress: steps
      }, { status: 401 });
    }

    // Check if user is admin or staff
    const [isAdmin, isStaff] = await Promise.all([
      isAdminServer(user.id),
      isStaffServer(user.id)
    ]);

    if (!isAdmin && !isStaff) {
      return NextResponse.json({
        error: 'Access denied. Admin or staff role required.',
        progress: steps
      }, { status: 403 });
    }

    const body: ComponentCreationRequest = await request.json();

    // Use admin client to bypass RLS
    const supabase = createAdminClient();

    // Step 1: Generate auto-numbered code name
    steps[0].status = 'in_progress';
    const codeName = await getCodeNameWithAutoNumber(body.name, supabase);
    steps[0].status = 'completed';
    steps[0].message = `Generated code name: ${codeName}`;

    // Step 2: Save to database
    steps[1].status = 'in_progress';
    const newComponent: Partial<CoreComponent> = {
      name: body.name,
      code_name: codeName,
      type: body.type as 'section' | 'component',
      source: body.source as 'shadcn' | 'aceternity' | 'expansions' | 'custom',
      code: body.code,
      dependencies: body.dependencies || [],
      imports: body.imports || [],
      metadata: body.metadata || {},
      deployment_status: {
        dev: false,
        staging: false,
        prod: false,
        files_created: false,
        registry_updated: false,
        github_pr: null,
        last_deployment: null
      },
      pipeline_status: 'created',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: savedComponent, error: saveError } = await supabase
      .from('core_components')
      .insert(newComponent)
      .select()
      .single();

    if (saveError) {
      steps[1].status = 'error';
      steps[1].message = 'Failed to save to database';
      throw new Error(`Database save failed: ${saveError.message}`);
    }

    steps[1].status = 'completed';
    steps[1].message = 'Saved to database successfully';

    // Step 3: Create GitHub files (if enabled)
    const githubEnabled = env.GITHUB_TOKEN && env.GITHUB_ENABLED !== 'false';

    console.log('🔍 GitHub Integration Check:', {
      hasToken: !!env.GITHUB_TOKEN,
      tokenStart: env.GITHUB_TOKEN?.substring(0, 10) + '...',
      owner: env.GITHUB_OWNER,
      repo: env.GITHUB_REPO,
      branch: env.GITHUB_DEFAULT_BRANCH,
      enabled: env.GITHUB_ENABLED !== 'false'
    });

    if (githubEnabled) {
      steps[2].status = 'in_progress';
      try {
        console.log('📁 Initializing GitHub Component Service...');
        const github = new GitHubComponentService();

        // Create component file
        console.log('📝 Creating component file for:', savedComponent.code_name);
        const fileResult = await github.createComponentFile(savedComponent);
        console.log('✅ Component file created:', fileResult);

        // Update deployment status
        await supabase
          .from('core_components')
          .update({
            'deployment_status': {
              ...savedComponent.deployment_status,
              files_created: true
            },
            'pipeline_status': 'files_created'
          })
          .eq('id', savedComponent.id);

        steps[2].status = 'completed';
        steps[2].message = `Created file: ${fileResult.path}`;

        // Step 4: Update registry
        steps[3].status = 'in_progress';

        // Get all components for registry update
        const { data: allComponents } = await supabase
          .from('core_components')
          .select('*')
          .order('code_name');

        if (allComponents) {
          await github.updateRegistryFile(allComponents);

          // Update deployment status
          await supabase
            .from('core_components')
            .update({
              'deployment_status': {
                ...savedComponent.deployment_status,
                files_created: true,
                registry_updated: true
              },
              'pipeline_status': 'registry_updated'
            })
            .eq('id', savedComponent.id);

          steps[3].status = 'completed';
          steps[3].message = 'Registry updated successfully';
        }
      } catch (githubError) {
        console.error('❌ GitHub operation failed:', githubError);
        console.error('Error details:', {
          message: githubError instanceof Error ? githubError.message : 'Unknown error',
          stack: githubError instanceof Error ? githubError.stack : undefined
        });
        steps[2].status = 'error';
        steps[2].message = githubError instanceof Error ? githubError.message : 'GitHub file creation failed';
        steps[3].status = 'error';
      }
    } else {
      steps[2].status = 'completed';
      steps[2].message = 'GitHub integration disabled';
      steps[3].status = 'completed';
      steps[3].message = 'Registry update skipped';
    }

    // Step 5: Finalize
    const hasErrors = steps.some(step => step.status === 'error');
    const allCompleted = steps.every(step => step.status === 'completed');

    if (allCompleted) {
      steps[4].status = 'completed';
      steps[4].message = 'Component creation completed successfully';
    } else if (hasErrors) {
      steps[4].status = 'completed';
      steps[4].message = 'Component saved to database (with some failures)';
    } else {
      steps[4].status = 'completed';
      steps[4].message = 'Component creation completed';
    }

    // Determine overall success (component was saved, even if GitHub failed)
    const overallSuccess = savedComponent !== null;

    return NextResponse.json({
      success: overallSuccess && !hasErrors,
      partialSuccess: overallSuccess && hasErrors,
      component: {
        id: savedComponent.id,
        name: savedComponent.name,
        code_name: savedComponent.code_name,
        pipeline_status: savedComponent.pipeline_status
      },
      progress: steps,
      message: hasErrors
        ? `Component "${body.name}" created as "${codeName}" (with some failures)`
        : `Component "${body.name}" created successfully as "${codeName}"`
    });

  } catch (error: unknown) {
    console.error('Component creation error:', error);

    // Mark any pending steps as error
    steps.forEach(step => {
      if (step.status === 'pending' || step.status === 'in_progress') {
        step.status = 'error';
      }
    });

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      progress: steps
    }, { status: 500 });
  }
}

// GET endpoint for testing/documentation
export async function GET() {
  return NextResponse.json({
    message: 'Core Component Creation API',
    endpoint: 'POST /api/core-components/create',
    requiredFields: {
      name: 'Display name of the component',
      type: 'Component type (section, element, etc.)',
      source: 'Source of component (custom, shadcn, etc.)',
      code: 'React component code'
    },
    optionalFields: {
      dependencies: 'Array of npm dependencies',
      imports: 'Array of import statements',
      metadata: 'Additional metadata object'
    },
    features: [
      'Auto-numbered code name generation',
      'Database persistence',
      'GitHub file creation (if enabled)',
      'Registry auto-update',
      'Progress tracking'
    ]
  });
}