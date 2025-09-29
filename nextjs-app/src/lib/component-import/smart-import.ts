/**
 * Smart Import System for UI Component Libraries
 * Handles component imports from various sources with automatic transformations
 */

import { builtinModules } from 'module';

// Type definitions
export type ComponentSource = 'shadcn' | 'aceternity' | 'skiper' | 'tweakcn' | 'custom';

export interface ImportOptions {
  url: string;
  autoFix?: boolean;
  installDeps?: boolean;
  targetDir?: string;
}

export interface ComponentMetadata {
  name: string;
  source: ComponentSource;
  sourceUrl: string;
  dependencies: string[];
  transformations: string[];
  importDate: Date;
  originalCode?: string;
}

export interface TransformRule {
  from: string;
  to: string;
}

export interface ProcessedComponent {
  name: string;
  source: ComponentSource;
  sourceUrl: string;
  dependencies: string[];
  missingDependencies?: string[];
  transformations: string[];
  files: ProcessedFile[];
}

export interface ProcessedFile {
  name: string;
  originalContent: string;
  transformedContent: string;
  targetPath: string;
}

export interface RegistryComponent {
  name: string;
  type: string;
  files: Array<{
    name: string;
    content: string;
  }>;
  dependencies?: string[];
}

// Transformation rules for each source
const TRANSFORM_RULES: Record<string, TransformRule[]> = {
  aceternity: [
    { from: '@/components/aceternity', to: '@/components/ui' },
    { from: 'motion/react', to: 'framer-motion' },
    { from: '@/utils/cn', to: '@/lib/utils' }
  ],
  skiper: [
    { from: '@/components/skiper', to: '@/components/ui' },
    { from: '@/lib/cn', to: '@/lib/utils' }
  ],
  tweakcn: [
    { from: '@/components/tweakcn', to: '@/components/ui' }
  ]
};

// Whitelisted domains for security
const WHITELISTED_DOMAINS = [
  'ui.shadcn.com',
  'ui.aceternity.com',
  'skiper-ui.com',
  'tweakcn.com'
];

/**
 * Parse registry command to extract URL and metadata
 */
export function parseRegistryCommand(command: string): {
  url: string;
  source: ComponentSource;
  componentName: string;
} {
  // Extract URL from command
  // Check if it's a full npx command or just a URL
  const urlMatch = command.match(/https?:\/\/[^\s]+\.json/);

  if (!urlMatch) {
    throw new Error('Invalid registry URL');
  }

  const url = urlMatch[0];

  // Detect source from URL
  const source = detectComponentSource(url);

  // Extract component name from URL
  const componentNameMatch = url.match(/\/([^/]+)\.json$/);
  if (!componentNameMatch) {
    throw new Error('Could not extract component name from URL');
  }

  const componentName = componentNameMatch[1];

  return {
    url,
    source,
    componentName
  };
}

/**
 * Detect component source from registry URL
 */
export function detectComponentSource(url: string): ComponentSource {
  if (url.includes('ui.shadcn.com')) return 'shadcn';
  if (url.includes('ui.aceternity.com')) return 'aceternity';
  if (url.includes('skiper-ui.com')) return 'skiper';
  if (url.includes('tweakcn.com')) return 'tweakcn';
  return 'custom';
}

/**
 * Transform import paths based on source
 */
export function transformImportPaths(code: string, source: ComponentSource): string {
  const rules = TRANSFORM_RULES[source];

  if (!rules || rules.length === 0) {
    return code;
  }

  let transformedCode = code;

  for (const rule of rules) {
    // Transform exact matches first
    const exactRegex = new RegExp(
      `(import\\s+.*?from\\s+['"])${escapeRegExp(rule.from)}(['"])`,
      'g'
    );
    transformedCode = transformedCode.replace(exactRegex, `$1${rule.to}$2`);

    // Transform path extensions (e.g., @/components/aceternity/button -> @/components/ui/button)
    const pathRegex = new RegExp(
      `(import\\s+.*?from\\s+['"])${escapeRegExp(rule.from)}/([^'"]+)(['"])`,
      'g'
    );
    transformedCode = transformedCode.replace(pathRegex, `$1${rule.to}/$2$3`);
  }

  return transformedCode;
}

/**
 * Extract npm dependencies from code
 */
export function extractDependencies(code: string): string[] {
  const dependencies = new Set<string>();

  // Match import statements
  const importRegex = /import\s+(?:[\w\s{},*]+\s+from\s+)?['"]([^'"]+)['"]/g;
  let match;

  while ((match = importRegex.exec(code)) !== null) {
    const dep = match[1];
    if (isNpmPackage(dep)) {
      // Extract package name (handle scoped packages)
      const packageName = dep.startsWith('@')
        ? dep.split('/').slice(0, 2).join('/')
        : dep.split('/')[0];
      dependencies.add(packageName);
    }
  }

  // Match require statements
  const requireRegex = /require\(['"]([^'"]+)['"]\)/g;

  while ((match = requireRegex.exec(code)) !== null) {
    const dep = match[1];
    if (isNpmPackage(dep)) {
      const packageName = dep.startsWith('@')
        ? dep.split('/').slice(0, 2).join('/')
        : dep.split('/')[0];
      dependencies.add(packageName);
    }
  }

  return Array.from(dependencies);
}

/**
 * Check if import is an npm package (not relative or absolute path)
 */
function isNpmPackage(importPath: string): boolean {
  // Skip relative paths
  if (importPath.startsWith('.') || importPath.startsWith('/')) {
    return false;
  }

  // Skip alias paths
  if (importPath.startsWith('@/')) {
    return false;
  }

  // Extract module name (handle scoped packages)
  const moduleName = importPath.startsWith('@')
    ? importPath.split('/').slice(0, 2).join('/')
    : importPath.split('/')[0];

  // Check against Node.js built-in modules
  // Note: some built-ins like 'path' might not be in builtinModules in all environments
  const nodeBuiltins = [
    'assert', 'buffer', 'child_process', 'cluster', 'crypto', 'dgram', 'dns',
    'events', 'fs', 'http', 'https', 'net', 'os', 'path', 'querystring',
    'readline', 'stream', 'string_decoder', 'timers', 'tls', 'tty', 'url',
    'util', 'v8', 'vm', 'zlib', 'constants', 'domain', 'inspector', 'module',
    'perf_hooks', 'process', 'punycode', 'repl', 'trace_events', 'worker_threads'
  ];

  if (nodeBuiltins.includes(moduleName) || builtinModules.includes(moduleName)) {
    return false;
  }

  return true;
}

/**
 * Fetch component from registry URL
 */
export async function fetchComponentFromRegistry(url: string): Promise<RegistryComponent> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch component: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}

/**
 * Process component import with all transformations
 */
export async function processComponentImport(options: ImportOptions): Promise<ProcessedComponent> {
  const { url, autoFix = false, installDeps = false, targetDir = '/components/ui/' } = options;

  // Parse URL to get metadata
  const { source } = parseRegistryCommand(url);

  // Fetch component from registry
  const registryData = await fetchComponentFromRegistry(url);

  // Process each file
  const processedFiles: ProcessedFile[] = [];
  const transformations: string[] = [];

  for (const file of registryData.files) {
    let transformedContent = file.content;

    // Apply transformations if autoFix is enabled
    if (autoFix && source !== 'shadcn') {
      const originalContent = file.content;
      transformedContent = transformImportPaths(originalContent, source);

      // Track transformations
      const rules = TRANSFORM_RULES[source] || [];
      for (const rule of rules) {
        if (originalContent.includes(rule.from)) {
          transformations.push(`${rule.from} -> ${rule.to}`);
        }
      }
    }

    processedFiles.push({
      name: file.name,
      originalContent: file.content,
      transformedContent,
      targetPath: `${targetDir}${file.name}`
    });
  }

  // Extract dependencies from all files
  const allCode = processedFiles.map(f => f.transformedContent).join('\n');
  const extractedDeps = extractDependencies(allCode);

  // Combine with registry dependencies
  const allDependencies = Array.from(new Set([
    ...(registryData.dependencies || []),
    ...extractedDeps
  ]));

  // Check for missing dependencies if installDeps is enabled
  let missingDependencies: string[] = [];
  if (installDeps) {
    // This would check against package.json
    // For now, we'll include all dependencies as potentially missing
    missingDependencies = allDependencies;
  }

  return {
    name: registryData.name,
    source,
    sourceUrl: url,
    dependencies: allDependencies,
    missingDependencies: installDeps ? missingDependencies : undefined,
    transformations: Array.from(new Set(transformations)),
    files: processedFiles
  };
}

/**
 * Validate registry URL for security
 */
export function validateRegistryUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return WHITELISTED_DOMAINS.some(domain => urlObj.hostname === domain);
  } catch {
    return false;
  }
}

/**
 * Helper function to escape regex special characters
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}