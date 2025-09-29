import fs from 'fs/promises';
import path from 'path';

export interface DiscoveredComponent {
  name: string;
  filePath: string;
  source: 'shadcn' | 'aceternity' | 'skiper' | 'tweakcn' | 'custom';
  dependencies: string[];
  transformations: string[];
  createdAt: Date;
  modifiedAt: Date;
  content: string;
}

/**
 * Discover and analyze existing components in the ui folder
 */
export async function discoverExistingComponents(): Promise<DiscoveredComponent[]> {
  const componentsDir = path.join(process.cwd(), 'src', 'components', 'ui');
  const components: DiscoveredComponent[] = [];

  try {
    const files = await fs.readdir(componentsDir);
    const componentFiles = files.filter(file =>
      (file.endsWith('.tsx') || file.endsWith('.ts')) &&
      !file.endsWith('.test.tsx') &&
      !file.endsWith('.test.ts') &&
      !file.startsWith('__')
    );

    for (const file of componentFiles) {
      const filePath = path.join(componentsDir, file);
      const component = await analyzeComponent(filePath);
      if (component) {
        components.push(component);
      }
    }

    return components;
  } catch (error) {
    console.error('Error discovering components:', error);
    return [];
  }
}

/**
 * Analyze a single component file to extract metadata
 */
async function analyzeComponent(filePath: string): Promise<DiscoveredComponent | null> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const stats = await fs.stat(filePath);
    const fileName = path.basename(filePath, path.extname(filePath));

    // Extract dependencies from imports
    const dependencies = extractDependencies(content);

    // Determine source based on content analysis
    const source = detectComponentSource(content, fileName);

    // Detect any transformations that were applied
    const transformations = detectTransformations(content);

    return {
      name: fileName,
      filePath,
      source,
      dependencies,
      transformations,
      createdAt: stats.birthtime,
      modifiedAt: stats.mtime,
      content
    };
  } catch (error) {
    console.error(`Error analyzing component ${filePath}:`, error);
    return null;
  }
}

/**
 * Extract NPM dependencies from import statements
 */
function extractDependencies(content: string): string[] {
  const dependencies = new Set<string>();

  // Match import statements
  const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
  let match;

  while ((match = importRegex.exec(content)) !== null) {
    const importPath = match[1];

    // Skip relative imports and internal paths
    if (importPath.startsWith('.') || importPath.startsWith('@/')) {
      continue;
    }

    // Extract package name (handle scoped packages)
    let packageName = importPath;
    if (importPath.startsWith('@')) {
      // Scoped package like @radix-ui/react-dialog
      const parts = importPath.split('/');
      packageName = `${parts[0]}/${parts[1]}`;
    } else {
      // Regular package like react or framer-motion
      packageName = importPath.split('/')[0];
    }

    // Skip Node.js built-ins
    const builtins = ['fs', 'path', 'crypto', 'os', 'util', 'events', 'stream'];
    if (!builtins.includes(packageName)) {
      dependencies.add(packageName);
    }
  }

  return Array.from(dependencies).sort();
}

/**
 * Detect the source/library of a component based on its content
 */
function detectComponentSource(content: string, fileName: string): 'shadcn' | 'aceternity' | 'skiper' | 'tweakcn' | 'custom' {
  // Check for Aceternity-specific patterns
  if (
    content.includes('framer-motion') ||
    content.includes('motion.') ||
    content.includes('useMotionValue') ||
    content.includes('AnimatePresence') ||
    fileName.includes('flip') ||
    fileName.includes('sparkles') ||
    fileName.includes('text-generate') ||
    fileName.includes('container-text')
  ) {
    return 'aceternity';
  }

  // Check for shadcn-specific patterns
  if (
    content.includes('@radix-ui') ||
    content.includes('class-variance-authority') ||
    content.includes('cva') ||
    content.includes('@/lib/utils') ||
    content.includes('cn(') ||
    // Check for common shadcn component patterns
    /(button|card|dialog|input|label|select|table|tabs|toast|alert|avatar|badge|checkbox|dropdown|form|navigation|popover|radio|scroll|separator|sheet|slider|switch|textarea|tooltip)\.tsx?$/.test(fileName)
  ) {
    return 'shadcn';
  }

  // Check for Skiper UI patterns
  if (
    content.includes('skiper') ||
    content.includes('@skiper-ui') ||
    fileName.includes('skiper')
  ) {
    return 'skiper';
  }

  // Check for TweakCN patterns
  if (
    content.includes('tweakcn') ||
    content.includes('@tweakcn') ||
    fileName.includes('tweakcn')
  ) {
    return 'tweakcn';
  }

  // Default to custom if no specific patterns found
  return 'custom';
}

/**
 * Detect transformations that were applied to the component
 */
function detectTransformations(content: string): string[] {
  const transformations: string[] = [];

  // Check for common import path transformations
  if (content.includes('@/lib/utils') && !content.includes('@/utils/cn')) {
    transformations.push('Standardized utils import path');
  }

  if (content.includes('framer-motion') && content.includes('motion.')) {
    transformations.push('Framer Motion integration');
  }

  if (content.includes('class-variance-authority')) {
    transformations.push('CVA integration for component variants');
  }

  if (content.includes('clsx') || content.includes('cn(')) {
    transformations.push('Class name utilities integration');
  }

  return transformations;
}

/**
 * Get component metadata for database insertion
 */
export function getComponentMetadata(component: DiscoveredComponent) {
  return {
    name: component.name,
    source: component.source,
    source_url: null, // Historical components don't have source URLs
    dependencies: component.dependencies,
    transformations: component.transformations,
    import_date: component.createdAt.toISOString(),
    imported_by: null, // Historical imports don't have a specific user
    metadata: {
      isHistorical: true,
      filePath: component.filePath,
      modifiedAt: component.modifiedAt.toISOString(),
      autoDiscovered: true
    }
  };
}