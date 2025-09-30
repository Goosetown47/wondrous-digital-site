import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { checkAdminAuth } from '@/lib/auth/api-auth-helper';
import { parseCommands } from '@/lib/command-import/command-parser';
import { executeNpmInstall } from '@/lib/command-import/npm-wrapper';
import { executeShadcnAddComponent, executeShadcnAddRegistry } from '@/lib/command-import/shadcn-cli-wrapper';

interface ExecutionResult {
  success: boolean;
  originalCommand: string;
  commandType: string;
  output: string;
  errors: string[];
  warnings: string[];
  packagesInstalled?: string[];
  alreadyInstalled?: string[];
  filesCreated?: string[];
  dependenciesInstalled?: string[];
  component?: string; // Component name for shadcn commands
  duration?: number; // Execution time in milliseconds
}

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
    const results: ExecutionResult[] = [];

    // Get supabase client for database logging
    const supabase = await createSupabaseServerClient();

    // Execute each command sequentially
    for (const cmd of parsed.commands) {
      const startTime = Date.now();
      let result: ExecutionResult;

      if (cmd.type === 'npm' && cmd.packages && cmd.packages.length > 0) {
        // Execute npm install
        const npmResult = await executeNpmInstall(cmd.packages);
        const duration = Date.now() - startTime;

        result = {
          success: npmResult.success,
          originalCommand: cmd.originalCommand,
          commandType: 'npm',
          output: npmResult.output,
          errors: npmResult.errors,
          warnings: cmd.warnings,
          packagesInstalled: npmResult.packagesInstalled,
          alreadyInstalled: npmResult.alreadyInstalled,
          duration,
        };

        // Log to database
        await logCommandExecution(supabase, auth.userId!, cmd.originalCommand, 'npm', npmResult.success, npmResult.output, npmResult.errors);

      } else if (cmd.type === 'shadcn-component' && cmd.component) {
        // Execute shadcn add component
        const shadcnResult = await executeShadcnAddComponent(cmd.component);
        const duration = Date.now() - startTime;

        result = {
          success: shadcnResult.success,
          originalCommand: cmd.originalCommand,
          commandType: 'shadcn-component',
          output: shadcnResult.output,
          errors: shadcnResult.errors,
          warnings: cmd.warnings,
          filesCreated: shadcnResult.filesCreated,
          dependenciesInstalled: shadcnResult.dependenciesInstalled,
          component: shadcnResult.component,
          duration,
        };

        // Log to database
        await logCommandExecution(supabase, auth.userId!, cmd.originalCommand, 'shadcn-component', shadcnResult.success, shadcnResult.output, shadcnResult.errors);

      } else if (cmd.type === 'shadcn-registry' && cmd.registryUrl) {
        // Execute shadcn add registry
        const shadcnResult = await executeShadcnAddRegistry(cmd.registryUrl);
        const duration = Date.now() - startTime;

        result = {
          success: shadcnResult.success,
          originalCommand: cmd.originalCommand,
          commandType: 'shadcn-registry',
          output: shadcnResult.output,
          errors: shadcnResult.errors,
          warnings: cmd.warnings,
          filesCreated: shadcnResult.filesCreated,
          dependenciesInstalled: shadcnResult.dependenciesInstalled,
          component: shadcnResult.component,
          duration,
        };

        // Log to database
        await logCommandExecution(supabase, auth.userId!, cmd.originalCommand, 'shadcn-registry', shadcnResult.success, shadcnResult.output, shadcnResult.errors);

      } else {
        // Unknown command type - skip execution
        const duration = Date.now() - startTime;
        result = {
          success: false,
          originalCommand: cmd.originalCommand,
          commandType: cmd.type,
          output: '',
          errors: ['Unknown command type or missing required parameters'],
          warnings: cmd.warnings,
          duration,
        };

        // Log to database
        await logCommandExecution(supabase, auth.userId!, cmd.originalCommand, cmd.type, false, '', ['Unknown command type']);
      }

      results.push(result);
    }

    // Build summary
    const summary = {
      total: results.length,
      succeeded: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
    };

    return NextResponse.json({
      success: true,
      results,
      summary,
    });

  } catch (error) {
    console.error('Execute error:', error);
    return NextResponse.json({
      error: 'Failed to execute commands',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

/**
 * Log command execution to database
 */
async function logCommandExecution(
  supabase: any,
  userId: string,
  commandText: string,
  commandType: string,
  success: boolean,
  output: string,
  errors: string[]
): Promise<void> {
  try {
    await supabase
      .from('command_history')
      .insert({
        user_id: userId,
        command_text: commandText,
        command_type: commandType,
        success,
        output,
        errors: errors.length > 0 ? errors : null,
        executed_at: new Date().toISOString(),
      })
      .select();
  } catch (error) {
    // Log error but don't fail the request
    console.error('Failed to log command execution:', error);
  }
}