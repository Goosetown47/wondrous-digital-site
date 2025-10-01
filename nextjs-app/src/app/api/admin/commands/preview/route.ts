import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAuth } from '@/lib/auth/api-auth-helper';
import { parseCommands } from '@/lib/command-import/command-parser';
import { checkInstalledPackages } from '@/lib/command-import/npm-wrapper';

export async function POST(request: NextRequest) {
  try {
    // Check authentication and admin access
    const auth = await checkAdminAuth(request);
    if (auth.error) return auth.error;

    // Parse request body
    const body = await request.json();
    const { commands } = body;

    // Validate input
    if (typeof commands !== 'string') {
      return NextResponse.json({ error: 'Invalid commands parameter' }, { status: 400 });
    }

    // Parse commands
    const parsed = parseCommands(commands);

    // Extract all npm packages from commands
    const allNpmPackages: string[] = [];
    for (const cmd of parsed.commands) {
      if (cmd.type === 'npm' && cmd.packages) {
        allNpmPackages.push(...cmd.packages);
      }
    }

    // Check which packages are already installed
    let npmPackageStatus: Array<{ name: string; alreadyInstalled: boolean; version?: string }> = [];
    if (allNpmPackages.length > 0) {
      const packageCheck = await checkInstalledPackages(allNpmPackages);
      npmPackageStatus = allNpmPackages.map(pkg => ({
        name: pkg,
        alreadyInstalled: packageCheck.installed.includes(pkg),
        version: packageCheck.versions[pkg],
      }));
    }

    // Extract all shadcn components
    const shadcnComponents: Array<{ name: string; type: 'component' | 'registry' }> = [];
    for (const cmd of parsed.commands) {
      if (cmd.type === 'shadcn-component' && cmd.component) {
        shadcnComponents.push({ name: cmd.component, type: 'component' });
      } else if (cmd.type === 'shadcn-registry' && cmd.registryUrl) {
        shadcnComponents.push({ name: cmd.registryUrl, type: 'registry' });
      }
    }

    return NextResponse.json({
      success: true,
      parsed,
      preview: {
        npmPackages: npmPackageStatus,
        shadcnComponents,
      },
    });

  } catch (error) {
    console.error('Preview error:', error);
    return NextResponse.json({
      error: 'Failed to parse commands',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}