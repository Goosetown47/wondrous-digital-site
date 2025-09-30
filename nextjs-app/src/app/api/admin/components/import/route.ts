import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { isAdminServer } from '@/lib/permissions/server-checks';
import * as smartImport from '@/lib/component-import/smart-import';
import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin role
    const isUserAdmin = await isAdminServer(user.id);
    if (!isUserAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    const { url, autoFix = true, installDeps = true } = body;

    // Validate URL format
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Invalid registry URL' }, { status: 400 });
    }

    // Validate whitelisted domain
    if (!smartImport.validateRegistryUrl(url)) {
      return NextResponse.json({
        error: 'Registry domain not whitelisted',
        allowedDomains: [
          'ui.shadcn.com',
          'ui.aceternity.com',
          'pro.aceternity.com',
          'skiper-ui.com',
          'tweakcn.com',
          'shadcnblocks.com',
          'reactbits.dev',
          'shadcnui-expansions.typeart.cc'
        ]
      }, { status: 400 });
    }

    // Process component import
    const result = await smartImport.processComponentImport({
      url,
      autoFix,
      installDeps
    });

    // Get the absolute path to the components directory
    const componentsDir = path.join(process.cwd(), 'src', 'components', 'ui');

    // Ensure directory exists
    await fs.mkdir(componentsDir, { recursive: true });

    // Check for existing files to prevent overwrite
    const existingFiles: string[] = [];
    for (const file of result.files) {
      const filePath = path.join(componentsDir, file.name);
      try {
        await fs.access(filePath);
        existingFiles.push(file.name);
      } catch {
        // File doesn't exist, which is good
      }
    }

    if (existingFiles.length > 0) {
      return NextResponse.json({
        error: 'Component already exists',
        existingFile: existingFiles[0],
        allExistingFiles: existingFiles
      }, { status: 409 });
    }

    // Write files to disk
    for (const file of result.files) {
      const filePath = path.join(componentsDir, file.name);
      await fs.writeFile(filePath, file.transformedContent, 'utf-8');
    }

    // Check package.json for existing dependencies BEFORE installing
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
    const existingDeps = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies
    };

    // Filter out dependencies that are already installed
    const actuallyMissingDeps = result.dependencies.filter(dep => !existingDeps[dep]);

    // Install missing dependencies if requested
    let dependenciesInstalled: string[] = [];
    if (installDeps && actuallyMissingDeps.length > 0) {
      try {
        const installCommand = `npm install ${actuallyMissingDeps.join(' ')}`;
        console.log(`Installing missing dependencies: ${actuallyMissingDeps.join(', ')}`);

        execSync(installCommand, {
          encoding: 'utf8',
          cwd: process.cwd(),
          stdio: 'pipe' // Capture output
        });

        dependenciesInstalled = actuallyMissingDeps;
        console.log(`Successfully installed: ${dependenciesInstalled.join(', ')}`);
      } catch (error) {
        console.error('Failed to install dependencies:', error);
        // Return error to user instead of continuing silently
        return NextResponse.json({
          error: 'Component imported but dependency installation failed',
          details: error instanceof Error ? error.message : 'Unknown error',
          component: result.name,
          missingDependencies: actuallyMissingDeps
        }, { status: 207 }); // 207 Multi-Status: partial success
      }
    }

    // Store import metadata in database
    const { error: dbError } = await supabase
      .from('component_imports')
      .insert({
        name: result.name,
        source: result.source,
        source_url: result.sourceUrl,
        dependencies: result.dependencies,
        transformations: result.transformations,
        imported_by: user.id,
        metadata: {
          autoFix,
          installDeps,
          filesWritten: result.files.length,
          dependenciesInstalled
        }
      })
      .select()
      .single();

    if (dbError) {
      console.error('Failed to store import metadata:', dbError);
      // Continue even if database insert fails
    }

    return NextResponse.json({
      success: true,
      component: {
        name: result.name,
        source: result.source,
        dependencies: result.dependencies,
        transformations: result.transformations,
        filesWritten: result.files.length,
        dependenciesInstalled,
        dependenciesAlreadyInstalled: result.dependencies.filter(dep => existingDeps[dep]),
        totalDependencies: result.dependencies.length
      }
    });

  } catch (error) {
    console.error('Component import error:', error);
    return NextResponse.json({
      error: 'Failed to import component',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}