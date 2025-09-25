import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase/admin';
import { getBuildSafeCookieStore } from '@/lib/cookies/build-safe';
import { env } from '@/env.mjs';
import { isAdminServer, isStaffServer } from '@/lib/permissions/server-checks';
import { promises as fs } from 'fs';
import path from 'path';
import { getMultipleComponentUsage } from '@/lib/services/component-usage-service';
import { getCodeName, getFileName, isValidComponentName } from '@/lib/services/naming-service';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const source = searchParams.get('source');
  const search = searchParams.get('search');

  console.log('🔍 [API/CoreComponents] Fetching core components with filters:', {
    type, source, search
  });

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
      console.log('❌ [API/CoreComponents] Authentication failed');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    console.log('🔍 [API/CoreComponents] Authenticated user:', user.email);

    // Check if user is admin or staff
    const [isAdmin, isStaff] = await Promise.all([
      isAdminServer(user.id),
      isStaffServer(user.id)
    ]);

    if (!isAdmin && !isStaff) {
      console.log('❌ [API/CoreComponents] Access denied - user is not admin or staff');
      return NextResponse.json({ 
        error: 'Access denied. Admin or staff role required.' 
      }, { status: 403 });
    }

    // Create service role client (bypasses RLS)
    const serviceClient = createAdminClient();

    console.log('🔍 [API/CoreComponents] Using service role to query core components...');

    // Build query with filters
    let query = serviceClient
      .from('core_components')
      .select('*')
      .order('name');

    // Apply filters
    if (type) {
      query = query.eq('type', type);
    }

    if (source) {
      query = query.eq('source', source);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data: components, error } = await query;

    if (error) {
      console.error('❌ [API/CoreComponents] Database error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('✅ [API/CoreComponents] Service role query successful!');
    console.log('📊 [API/CoreComponents] Found components:', components?.length || 0);

    // Get usage statistics for all components
    if (components && components.length > 0) {
      console.log('📊 [API/CoreComponents] Fetching usage statistics for components...');

      // Use display names for querying (the usage service will handle variations)
      const componentNames = components.map(c => c.name);
      const usageMap = await getMultipleComponentUsage(componentNames);

      // Add usage data to each component
      const componentsWithUsage = components.map(component => {
        const usage = usageMap.get(component.name);

        if (usage && usage.totalUsage > 0) {
          console.log(`✅ [API/CoreComponents] ${component.name} has usage:`, usage);
        }

        return {
          ...component,
          usage: usage || {
            componentName: component.name,
            totalUsage: 0,
            draftCount: 0,
            libraryCount: 0,
            isInUse: false
          }
        };
      });

      return NextResponse.json(componentsWithUsage);
    }

    return NextResponse.json(components || []);
  } catch (error) {
    console.error('❌ [API/CoreComponents] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Validate component code
 */
function validateComponentCode(code: string): { valid: boolean; error?: string } {
  // Basic validation checks
  if (!code || code.trim().length === 0) {
    return { valid: false, error: 'Component code cannot be empty' };
  }

  // Check for basic React component structure using regex patterns
  const exportPatterns = [
    /export\s+function\s+\w+/,           // export function ComponentName
    /export\s+const\s+\w+\s*=/,          // export const ComponentName =
    /export\s+default\s+function/,       // export default function
    /export\s+default\s+\w+/,            // export default ComponentName
    /export\s+default\s*\(/,             // export default () =>
    /export\s+default\s*{/,              // export default {
    /export\s*{\s*\w+/,                  // export { ComponentName }
    /function\s+\w+[\s\S]*export\s*{/,   // function at top, export at bottom
    /const\s+\w+\s*=[\s\S]*export\s*{/   // const at top, export at bottom
  ];

  const hasExportedComponent = exportPatterns.some(pattern => pattern.test(code));

  if (!hasExportedComponent) {
    return {
      valid: false,
      error: 'Component code must include an exported function or const'
    };
  }

  // Check for return statement (basic React component requirement)
  // Also check for JSX-like patterns in case of implicit returns
  const hasReturnOrJSX =
    code.includes('return') ||
    code.includes('return(') ||
    /<[A-Z]\w*/.test(code) || // JSX component tag
    /<div|<span|<button|<section|<nav|<header|<footer/.test(code); // HTML tags

  if (!hasReturnOrJSX) {
    return {
      valid: false,
      error: 'Component must have a return statement with JSX'
    };
  }

  return { valid: true };
}

/**
 * Helper function to convert component name to file name
 * Now uses naming service for consistency
 */
function componentNameToFileName(name: string): string {
  // Use naming service to get the file name without extension
  const fileName = getFileName(name);
  return fileName.replace('.tsx', '');
}

/**
 * Helper function to convert component name to class name
 * Now uses naming service for consistency
 */
function componentNameToClassName(name: string): string {
  // Use naming service to get the code name
  return getCodeName(name);
}

/**
 * Create the physical component file
 */
async function createComponentFile(
  name: string,
  type: string,
  code: string
): Promise<string> {
  const fileName = componentNameToFileName(name);
  const className = componentNameToClassName(name);

  // Determine the directory based on type
  const typeDir = type === 'navigation' ? 'navigation' : 'sections';
  const componentDir = path.join(process.cwd(), 'src', 'components', 'core', typeDir);
  const filePath = path.join(componentDir, `${fileName}.tsx`);

  // Ensure directory exists
  await fs.mkdir(componentDir, { recursive: true });

  // Process the code to ensure it has the right exports
  let fileContent = code;

  // If the code doesn't start with imports, add default imports
  if (!code.includes('import') && !code.includes('use client')) {
    const defaultImports = `"use client";
import React from "react";
import { SectionWrapper } from "@/components/lab/section-wrapper";

`;
    fileContent = defaultImports + code;
  }

  // Find all component names in the code
  const componentNames: string[] = [];

  // Match various component patterns
  const patterns = [
    /export\s+function\s+([A-Za-z][A-Za-z0-9_]*)/g,
    /export\s+const\s+([A-Za-z][A-Za-z0-9_]*)\s*=/g,
    /export\s+default\s+function\s+([A-Za-z][A-Za-z0-9_]*)/g,
    /const\s+([A-Za-z][A-Za-z0-9_]*)\s*=\s*\([^)]*\)\s*=>/g,
    /const\s+([A-Za-z][A-Za-z0-9_]*)\s*=\s*function/g,
    /function\s+([A-Za-z][A-Za-z0-9_]*)\s*\(/g,
    /export\s*{\s*([A-Za-z][A-Za-z0-9_]*)\s*}/g
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(fileContent)) !== null) {
      if (match[1] && !componentNames.includes(match[1])) {
        componentNames.push(match[1]);
      }
    }
  }

  // Find the most likely main component (usually the one that matches the file name or is exported)
  let actualComponentName: string | null = null;

  // Priority: exported components first
  for (const name of componentNames) {
    if (fileContent.includes(`export { ${name}`) ||
        fileContent.includes(`export function ${name}`) ||
        fileContent.includes(`export const ${name}`) ||
        fileContent.includes(`export default ${name}`)) {
      actualComponentName = name;
      break;
    }
  }

  // If no exported component found, use the first one
  if (!actualComponentName && componentNames.length > 0) {
    actualComponentName = componentNames[0];
  }

  if (actualComponentName && actualComponentName !== className) {
    // Always add an export with our expected name
    if (!fileContent.includes(`export { ${actualComponentName} as ${className} }`)) {
      fileContent += `\n\n// Export with expected name for registry
export { ${actualComponentName} as ${className} };`;
    }
  } else if (!actualComponentName) {
    // If we couldn't find a component name, assume the code uses the className we want
    console.log(`⚠️ Could not detect component name in code, assuming it uses ${className}`);
  }

  // Write the file
  await fs.writeFile(filePath, fileContent, 'utf-8');

  return className;
}

/**
 * Update component-name-mapping.ts to include the new component
 */
async function updateComponentNameMapping(
  name: string,
  className: string
): Promise<void> {
  const mappingPath = path.join(process.cwd(), 'src', 'lib', 'component-name-mapping.ts');

  // Read the current file
  const currentContent = await fs.readFile(mappingPath, 'utf-8');

  // Check if mapping already exists
  if (currentContent.includes(`'${name}': '${className}'`)) {
    return; // Already mapped
  }

  // Find the appropriate section based on component type
  const mappingEntry = `  '${name}': '${className}',`;

  // Find where to insert (after the last mapping before the closing brace)
  const mapEndIndex = currentContent.indexOf('};');
  const lastCommaIndex = currentContent.lastIndexOf(',', mapEndIndex);
  const insertPosition = currentContent.indexOf('\n', lastCommaIndex) + 1;

  const updatedContent =
    currentContent.slice(0, insertPosition) +
    mappingEntry + '\n' +
    currentContent.slice(insertPosition);

  // Write the updated file
  await fs.writeFile(mappingPath, updatedContent, 'utf-8');
}

/**
 * Update register-components.ts to include the new component
 */
async function updateComponentRegistry(
  className: string,
  name: string,
  type: string,
  source: string,
  description?: string
): Promise<void> {
  const registryPath = path.join(process.cwd(), 'src', 'lib', 'register-components.ts');

  // Read the current file
  const currentContent = await fs.readFile(registryPath, 'utf-8');

  // Determine the import path based on type
  const typeDir = type === 'navigation' ? 'navigation' : 'sections';
  const fileName = componentNameToFileName(name);
  const importPath = `@/components/core/${typeDir}/${fileName}`;

  // Add import statement if not already present
  const importStatement = `import { ${className} } from '${importPath}';`;

  let updatedContent = currentContent;

  // Find the imports section and add the new import
  if (!currentContent.includes(importStatement)) {
    // Find the last import line
    const importLines = currentContent.split('\n').filter(line => line.startsWith('import'));
    const lastImportIndex = currentContent.lastIndexOf(importLines[importLines.length - 1]);
    const insertPosition = currentContent.indexOf('\n', lastImportIndex) + 1;

    updatedContent =
      currentContent.slice(0, insertPosition) +
      importStatement + '\n' +
      currentContent.slice(insertPosition);
  }

  // Add registration if not already present
  const registrationCode = `  ComponentRegistry.register('${className}', {
    component: ${className},
    type: '${type}',
    category: undefined,
    defaultContent: ${type === 'navigation' ? 'defaultNavigationContent' : 'defaultHeroContent'},
    description: '${description || name}',
    source: '${source}'
  });`;

  if (!updatedContent.includes(`ComponentRegistry.register('${className}'`)) {
    // Find the end of registerAllComponents function
    const functionEnd = updatedContent.lastIndexOf('}', updatedContent.lastIndexOf('export'));

    updatedContent =
      updatedContent.slice(0, functionEnd) +
      '\n' + registrationCode + '\n' +
      updatedContent.slice(functionEnd);
  }

  // Write the updated file
  await fs.writeFile(registryPath, updatedContent, 'utf-8');
}

export async function POST(request: NextRequest) {
  console.log('🔍 [API/CoreComponents] Creating new core component...');

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
      console.log('❌ [API/CoreComponents] Authentication failed');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    console.log('🔍 [API/CoreComponents] Authenticated user:', user.email);

    // Check if user is admin or staff
    const [isAdmin, isStaff] = await Promise.all([
      isAdminServer(user.id),
      isStaffServer(user.id)
    ]);

    if (!isAdmin && !isStaff) {
      console.log('❌ [API/CoreComponents] Access denied - user is not admin or staff');
      return NextResponse.json({ 
        error: 'Access denied. Admin or staff role required.' 
      }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    const {
      name,
      type,
      source,
      code,
      dependencies = [],
      imports = {},
      description,
      metadata = {}
    } = body;

    // Extract editable_fields and default_content from metadata if provided
    const editableFields = metadata.editable_fields || [];
    const defaultContent = metadata.default_content || {};

    // Clean metadata to remove these fields (they have their own columns)
    const cleanMetadata = { ...metadata };
    delete cleanMetadata.editable_fields;
    delete cleanMetadata.default_content;

    if (!name || !type || !source || !code) {
      return NextResponse.json({
        error: 'name, type, source, and code are required'
      }, { status: 400 });
    }

    // Validate component code
    const validation = validateComponentCode(code);
    if (!validation.valid) {
      return NextResponse.json({
        error: validation.error
      }, { status: 400 });
    }

    // Create service role client (bypasses RLS)
    const serviceClient = createAdminClient();

    console.log('🔍 [API/CoreComponents] Creating core component with service role...');

    // Validate component name
    if (!isValidComponentName(name)) {
      return NextResponse.json({
        error: 'Invalid component name. Must start with a letter and contain only letters, numbers, spaces, hyphens, or underscores.'
      }, { status: 400 });
    }

    // Generate code name using naming service
    const codeName = getCodeName(name);
    console.log(`📝 [API/CoreComponents] Generated code name: ${name} -> ${codeName}`);

    // Create the core component using service role
    const { data: newComponent, error: createError } = await serviceClient
      .from('core_components')
      .insert({
        name,
        code_name: codeName,  // Set the code_name field
        type,
        source,
        code,
        dependencies,
        imports,
        description,
        metadata: cleanMetadata,
        editable_fields: editableFields,  // Save parsed editable fields
        default_content: defaultContent,   // Save extracted default content
        is_registered: true // Mark as registered since we're creating all necessary files
      })
      .select()
      .single();

    if (createError) {
      console.error('❌ [API/CoreComponents] Creation error:', createError);
      return NextResponse.json({ error: createError.message }, { status: 500 });
    }

    console.log('✅ [API/CoreComponents] Core component created:', newComponent.id);

    try {
      // Create the physical component file
      const className = await createComponentFile(name, type, code);
      console.log('✅ [API/CoreComponents] Component file created:', className);

      // Update the component name mapping
      await updateComponentNameMapping(name, className);
      console.log('✅ [API/CoreComponents] Component name mapping updated');

      // Update the component registry
      await updateComponentRegistry(className, name, type, source, description);
      console.log('✅ [API/CoreComponents] Component registry updated');

      // Update the component in database with the class name in metadata
      await serviceClient
        .from('core_components')
        .update({
          metadata: {
            ...cleanMetadata,
            component_code: className
          }
        })
        .eq('id', newComponent.id);
  } catch (fileError) {
      console.error('⚠️ [API/CoreComponents] File creation warning:', fileError);
      // Don't fail the entire operation if file creation fails
      // The component is already in the database and can be fixed manually
    }

    // Log the action
    await serviceClient
      .from('audit_logs')
      .insert({
        account_id: '00000000-0000-0000-0000-000000000000', // Platform account
        user_id: user.id,
        action: 'core_component.create',
        resource_type: 'core_component',
        resource_id: newComponent.id,
        metadata: {
          component_name: name,
          component_type: type,
          source,
          created_via_api: true
        }
      });

    return NextResponse.json(newComponent);
  } catch (error) {
    console.error('❌ [API/CoreComponents] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}