import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase/admin';
import { getBuildSafeCookieStore } from '@/lib/cookies/build-safe';
import { env } from '@/env.mjs';
import { isAdminServer, isStaffServer } from '@/lib/permissions/server-checks';
import { getCodeNameWithAutoNumber } from '@/lib/services/naming-service';
import { LocalComponentWriter } from '@/lib/local-files/component-writer';
import { analyzeJSXContent } from '@/lib/local-files/analyzers';
import type { CoreComponent } from '@/types/builder';

import type { CoreComponentSource } from '@/types/builder';

interface ComponentCreationRequest {
  name: string;
  type: string;
  type_id?: string;
  source: CoreComponentSource;
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
    { step: 'detecting_fields', status: 'pending' },
    { step: 'creating_files', status: 'pending' },
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

    // If type_id is provided, get the type name from database
    let typeName: string | undefined;
    if (body.type_id) {
      const { data: typeData } = await supabase
        .from('types')
        .select('name')
        .eq('id', body.type_id)
        .single();

      if (typeData) {
        typeName = typeData.name;
      }
    }

    // Generate code name, passing the explicit type name if available
    const codeName = await getCodeNameWithAutoNumber(body.name, supabase, typeName);
    steps[0].status = 'completed';
    steps[0].message = `Generated code name: ${codeName}`;

    // Step 2: Save to database
    steps[1].status = 'in_progress';
    const newComponent: Partial<CoreComponent> = {
      name: body.name,
      code_name: codeName,
      type: body.type as 'section' | 'component',
      type_id: body.type_id || undefined,
      source: body.source,
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

    // Step 2.5: Detect editable fields from JSX
    // NEW APPROACH (2025-09-30): No transformation - save original code + schema
    // Editing capabilities injected at runtime by EditableSectionWrapper
    steps[2].status = 'in_progress';

    try {
      console.log('🔍 Analyzing JSX content for editable fields...');
      const analysis = analyzeJSXContent(savedComponent.code);
      console.log('✅ Field detection complete:', {
        fieldsDetected: analysis.editableFields.length,
        contentKeys: Object.keys(analysis.defaultContent).length
      });

      // NEW (2025-09-30): Component Normalization
      // Transform hardcoded components to prop-based at import
      let finalCode = savedComponent.code;
      let normalizedChanges = 0;

      if (analysis.editableFields.length > 0) {
        const { shouldNormalize, normalizeComponent } = await import('@/lib/local-files/component-normalizer');
        const { detectMainComponentName } = await import('@/lib/local-files/analyzers');

        if (shouldNormalize(savedComponent.code)) {
          console.log('🔄 Component is hardcoded - normalizing to use props...');

          // Detect main component name for normalization
          const componentName = detectMainComponentName(savedComponent.code);
          if (!componentName) {
            console.warn('⚠️  Could not detect component name - skipping normalization');
          } else {
            try {
              const normalizeResult = normalizeComponent(
                savedComponent.code,
                componentName, // Pass the detected component name
                analysis.editableFields,
                analysis.defaultContent
              );

            finalCode = normalizeResult.normalizedCode;
            normalizedChanges = normalizeResult.changes.length;

              console.log('✅ Normalization complete:', {
                interfaceAdded: normalizeResult.interfaceAdded,
                propsAdded: normalizeResult.propsAdded,
                replacements: normalizedChanges
              });
            } catch (normalizeError) {
              console.warn('⚠️  Normalization failed, using original code:', normalizeError);
              // Fall back to original code if normalization fails
              finalCode = savedComponent.code;
            }
          }
        } else {
          console.log('✓ Component already uses props - no normalization needed');
        }
      }

      // Update component with detected fields + normalized code
      const { error: updateError } = await supabase
        .from('core_components')
        .update({
          code: finalCode, // CHANGED: Save normalized code (or original if no normalization needed)
          editable_fields: analysis.editableFields,
          default_content: analysis.defaultContent,
          updated_at: new Date().toISOString()
        })
        .eq('id', savedComponent.id);

      if (updateError) {
        console.warn('⚠️  Failed to save detected fields:', updateError);
        steps[2].status = 'completed';
        steps[2].message = 'Field detection skipped (will use empty config)';
      } else {
        // Update local component object for file generation
        savedComponent.code = finalCode; // Use normalized code (or original if no normalization)
        savedComponent.editable_fields = analysis.editableFields;
        savedComponent.default_content = analysis.defaultContent;

        steps[2].status = 'completed';
        const normalizedNote = normalizedChanges > 0 ? ` (normalized: ${normalizedChanges} replacements)` : '';
        steps[2].message = `Detected ${analysis.editableFields.length} editable fields${normalizedNote}`;
      }
    } catch (analysisError) {
      console.warn('⚠️  Field detection failed:', analysisError);
      steps[2].status = 'completed';
      steps[2].message = 'Field detection failed (will use empty config)';
      // Don't throw - component can still be created without editable fields
    }

    // Step 3: Create local component files
    steps[3].status = 'in_progress';
    try {
      console.log('📁 Initializing Local Component Writer...');
      const writer = new LocalComponentWriter();

      // Create component file
      console.log('📝 Creating component file for:', savedComponent.code_name);
      const fileResult = await writer.createComponentFile(savedComponent);
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

      steps[3].status = 'completed';
      steps[3].message = `Created file: ${fileResult.path}`;

      // Step 4: Update registry
      steps[4].status = 'in_progress';

      // Get all components for registry update
      const { data: allComponents } = await supabase
        .from('core_components')
        .select('*')
        .order('code_name');

      if (allComponents) {
        const registryResult = await writer.updateRegistryFile(allComponents);

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

        steps[4].status = 'completed';
        steps[4].message = registryResult.message || 'Registry updated successfully';
      }
    } catch (fileError) {
      console.error('❌ File operation failed:', fileError);
      console.error('Error details:', {
        message: fileError instanceof Error ? fileError.message : 'Unknown error',
        stack: fileError instanceof Error ? fileError.stack : undefined
      });
      steps[3].status = 'error';
      steps[3].message = fileError instanceof Error ? fileError.message : 'File creation failed';
      steps[4].status = 'error';
    }

    // Step 5: Finalize
    const hasErrors = steps.some(step => step.status === 'error');
    const allCompleted = steps.every(step => step.status === 'completed');

    if (allCompleted) {
      steps[5].status = 'completed';
      steps[5].message = 'Component creation completed successfully';
    } else if (hasErrors) {
      steps[5].status = 'completed';
      steps[5].message = 'Component saved to database (with some failures)';
    } else {
      steps[5].status = 'completed';
      steps[5].message = 'Component creation completed';
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