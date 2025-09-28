/**
 * Naming Abstraction Service
 *
 * Note: Object injection warnings are disabled for this file as all dynamic
 * property access uses internally controlled keys, not user input.
 *
 * Provides a single source of truth for component naming throughout the system.
 * Handles conversions between display names, code names, and normalized names.
 * Ensures consistency across Core Components, Lab Drafts, Library Items, and Registry.
 */

// Import the existing mappings (we'll migrate these into the service)
import { getComponentCodeName } from '@/lib/component-name-mapping';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Normalize a component name to a consistent format for comparison
 * Examples:
 * - "Nav Bar 1" -> "navbar1"
 * - "HeroTwoColumn" -> "herotwocolumn"
 * - "hero-two-column" -> "herotwocolumn"
 */
export function normalizeComponentName(name: string): string {
  if (!name) return '';

  return name
    .toLowerCase()
    .replace(/[\s\-_]+/g, '') // Remove spaces, hyphens, underscores
    .replace(/[^a-z0-9]/g, ''); // Remove any other special characters
}

/**
 * Convert a display name to its code/registry name
 * Examples:
 * - "Nav Bar 1" -> "Navbar2"
 * - "Footer 1" -> "Footer2"
 * - "Hero Two Column" -> "HeroTwoColumn"
 */
export function getCodeName(displayName: string): string {
  // First check if we have an explicit mapping
  const mappedName = getComponentCodeName(displayName);

  // If we found a mapping and it's different from the input, use it
  if (mappedName && mappedName !== convertToCodeFormat(displayName)) {
    return mappedName;
  }

  // Otherwise, convert to code format
  return convertToCodeFormat(displayName);
}

/**
 * Convert a code/registry name to its display name
 * This is the reverse of getCodeName
 * Examples:
 * - "Navbar2" -> "Nav Bar 1"
 * - "Footer2" -> "Footer 1"
 * - "HeroTwoColumn" -> "Hero Two Column"
 */
export function getDisplayName(codeName: string): string {
  // For now, we need to search through the mappings to find the display name
  // In the future, we should maintain a reverse mapping

  // Check hardcoded mappings first
  const reverseMap: Record<string, string> = {
    'Navbar2': 'Nav Bar 1',
    'Footer2': 'Footer 1',
    'HeroTwoColumn': 'Hero Two Column',
    'NavBar3': 'Nav Bar 3',
    'Services1': 'Services1',
    // Add more as needed
  };

  if (reverseMap[codeName]) {
    return reverseMap[codeName];
  }

  // Otherwise, convert from code format to display format
  return convertToDisplayFormat(codeName);
}

/**
 * Get all possible variations of a component name for matching
 * This helps with query flexibility
 */
export function getAllVariations(name: string): string[] {
  const variations = new Set<string>();

  // Add the original
  variations.add(name);

  // Add normalized version
  variations.add(normalizeComponentName(name));

  // Add code name version
  variations.add(getCodeName(name));

  // Add display name version (might be same as original)
  variations.add(getDisplayName(name));

  // Add common variations
  variations.add(convertToCodeFormat(name));
  variations.add(convertToDisplayFormat(name));
  variations.add(convertToKebabCase(name));

  // Add hyphenated variations with different separators
  variations.add(convertToHyphenatedFormat(name));
  variations.add(convertToHyphenatedFormat(name).replace(/-/g, '_'));

  // Special case for known mismatches
  if (name === 'HeroTwoColumn' || normalizeComponentName(name) === 'herotwocolumn') {
    variations.add('Hero-Two-Col-Image');
    variations.add('Hero_Two_Col_Image');
    variations.add('HeroTwoColImage');
  }

  // Handle numbered components
  const numberMatch = name.match(/(\d+)$/);
  if (numberMatch) {
    const baseName = name.slice(0, -numberMatch[0].length);
    variations.add(baseName); // Without number
    variations.add(`${baseName}_${numberMatch[0]}`); // With underscore
    variations.add(`${baseName}-${numberMatch[0]}`); // With hyphen
  }

  return Array.from(variations);
}

/**
 * Generate a unique code name for a new component
 * Handles conflicts by appending numbers
 * Examples:
 * - "Services" -> "Services1" (if Services doesn't exist)
 * - "Services" -> "Services6" (if Services1-5 exist)
 */
export function generateUniqueCodeName(baseName: string, existingNames: string[]): string {
  const baseCodeName = convertToCodeFormat(baseName);

  // If the base name doesn't exist, use it
  if (!existingNames.includes(baseCodeName)) {
    return baseCodeName;
  }

  // Otherwise, find the next available number
  let counter = 1;
  while (existingNames.includes(`${baseCodeName}${counter}`)) {
    counter++;
  }

  return `${baseCodeName}${counter}`;
}

/**
 * Check if two component names refer to the same component
 * This is useful for matching across different naming conventions
 */
export function isSameComponent(name1: string, name2: string): boolean {
  // Quick exact match
  if (name1 === name2) return true;

  // Check normalized versions
  if (normalizeComponentName(name1) === normalizeComponentName(name2)) return true;

  // Check if they have the same code name
  if (getCodeName(name1) === getCodeName(name2)) return true;

  return false;
}

/**
 * Convert any name to code format (PascalCase, no spaces)
 * Examples:
 * - "nav bar 1" -> "NavBar1"
 * - "hero-two-column" -> "HeroTwoColumn"
 * - "Test Hero Banner" -> "TestHeroBanner"
 * - "SuperHeroBanner" -> "SuperHeroBanner" (already in PascalCase)
 */
function convertToCodeFormat(name: string): string {
  if (!name) return '';

  // Check if already in PascalCase (starts with uppercase, has no spaces/hyphens/underscores,
  // and has at least one more uppercase letter after the first character)
  const isPascalCase = /^[A-Z][a-zA-Z0-9]*[A-Z]/.test(name) && !/[\s\-_]/.test(name);
  if (isPascalCase) {
    return name; // Already in correct format
  }

  // Check if it's a single word that starts with uppercase (like "Services1")
  const isSinglePascalWord = /^[A-Z][a-z0-9]*$/.test(name);
  if (isSinglePascalWord) {
    return name; // Already in correct format
  }

  return name
    .split(/[\s\-_]+/) // Split on spaces, hyphens, underscores
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

/**
 * Convert code format to display format (Title Case with spaces)
 * Examples:
 * - "NavBar1" -> "Nav Bar 1"
 * - "HeroTwoColumn" -> "Hero Two Column"
 */
function convertToDisplayFormat(name: string): string {
  if (!name) return '';

  // Add spaces before capital letters (except the first one)
  // Also handle numbers
  return name
    .replace(/([A-Z])/g, ' $1')
    .replace(/(\d+)/g, ' $1')
    .trim()
    .replace(/\s+/g, ' '); // Normalize multiple spaces to single space
}

/**
 * Convert to kebab-case for file names
 * Examples:
 * - "Nav Bar 1" -> "nav-bar-1"
 * - "HeroTwoColumn" -> "hero-two-column"
 */
function convertToKebabCase(name: string): string {
  if (!name) return '';

  return name
    .replace(/([A-Z])/g, '-$1')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+/g, '-')
    .toLowerCase();
}

/**
 * Convert to hyphenated format with proper word boundaries
 * Examples:
 * - "HeroTwoColumn" -> "Hero-Two-Column"
 * - "NavBar1" -> "Nav-Bar-1"
 */
function convertToHyphenatedFormat(name: string): string {
  if (!name) return '';

  return name
    .replace(/([A-Z])/g, '-$1')  // Add hyphen before capitals
    .replace(/(\d+)/g, '-$1')     // Add hyphen before numbers
    .replace(/[\s_]+/g, '-')      // Convert spaces/underscores to hyphens
    .replace(/^-+/, '')           // Remove leading hyphens
    .replace(/-+/g, '-')          // Collapse multiple hyphens
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('-');
}

/**
 * Validate if a name is acceptable for use as a component name
 */
export function isValidComponentName(name: string): boolean {
  if (!name || name.trim().length === 0) return false;

  // Must start with a letter
  if (!/^[a-zA-Z]/.test(name)) return false;

  // Can only contain letters, numbers, spaces, hyphens, underscores
  if (!/^[a-zA-Z0-9\s\-_]+$/.test(name)) return false;

  // Must not be a reserved word
  const reserved = ['return', 'function', 'class', 'const', 'let', 'var', 'if', 'else'];
  if (reserved.includes(name.toLowerCase())) return false;

  return true;
}

/**
 * Get file name from component name
 * Examples:
 * - "Nav Bar 1" -> "nav-bar-1.tsx"
 * - "HeroTwoColumn" -> "hero-two-column.tsx"
 */
export function getFileName(componentName: string): string {
  return `${convertToKebabCase(componentName)}.tsx`;
}

/**
 * Ensure component_name is properly set in metadata
 * This helper ensures consistency when saving drafts and library items
 */
export function ensureComponentName(
  content: unknown,
  metadata: Record<string, unknown> = {},
  type?: string
): Record<string, unknown> {
  // Only process section types
  if (type && type !== 'section') {
    return metadata;
  }

  let componentName: string | undefined;

  // Extract component_name from content
  if (content && typeof content === 'object' && content !== null) {
    // Check if content has sections (multi-section format)
    if ('sections' in content) {
      const sections = (content as { sections: Array<{ component_name?: string; metadata?: { component_name?: string } }> }).sections;
      if (sections && sections.length > 0) {
        // Get component_name from first section
        componentName = sections[0].component_name || sections[0].metadata?.component_name;
      }
    } else {
      // Single section format - check for component_name in content
      const contentObj = content as Record<string, unknown>;
      componentName = contentObj.component_name as string ||
                      (contentObj.metadata as Record<string, unknown>)?.component_name as string;
    }
  }

  // If no component_name found in content, check metadata
  if (!componentName && metadata.component_name) {
    componentName = metadata.component_name as string;
  }

  // Ensure component_name is in metadata using code name format
  if (componentName) {
    const codeName = getCodeName(componentName);
    return {
      ...metadata,
      component_name: codeName
    };
  }

  return metadata;
}

/**
 * Extract component type from name (if present)
 * Examples:
 * - "Nav Bar 1" -> "navigation"
 * - "Footer 2" -> "navigation"
 * - "Hero Section" -> "section"
 */
export function inferComponentType(name: string): 'navigation' | 'section' | null {
  const lowerName = name.toLowerCase();

  if (lowerName.includes('nav') || lowerName.includes('header') || lowerName.includes('footer')) {
    return 'navigation';
  }

  if (lowerName.includes('hero') || lowerName.includes('section') || lowerName.includes('service')) {
    return 'section';
  }

  return null;
}

/**
 * Extract the base component type from a display name using database types
 * This is used for auto-numbering components
 * Examples:
 * - "Epic Hero" with types table -> "Hero"
 * - "Dark Footer" with types table -> "Footer"
 * - "Bento Box Layout" with types table -> "Bentobox"
 *
 * @param displayName - The display name of the component
 * @param types - Array of types from the database
 */
export function extractComponentType(
  displayName: string,
  types?: Array<{ name: string; display_name: string }>
): string {
  const lowerDisplayName = displayName.toLowerCase();

  // If we have types from the database, use them
  if (types && types.length > 0) {
    // First, try exact match on display_name
    const exactMatch = types.find(
      type => type.display_name.toLowerCase() === lowerDisplayName
    );
    if (exactMatch) {
      return formatTypeName(exactMatch.name);
    }

    // Then, try to find if display name contains any type name or display_name
    // Sort by length descending to match longer names first (e.g., "call to action" before "action")
    const sortedTypes = [...types].sort((a, b) => {
      const aLength = Math.max(a.name.length, a.display_name.length);
      const bLength = Math.max(b.name.length, b.display_name.length);
      return bLength - aLength;
    });

    for (const type of sortedTypes) {
      const typeNameLower = type.name.toLowerCase();
      const typeDisplayLower = type.display_name.toLowerCase();

      // Check if display name contains the type's display_name first (more specific)
      if (lowerDisplayName.includes(typeDisplayLower)) {
        return formatTypeName(type.name);
      }

      // Then check if it contains the type's name
      if (lowerDisplayName.includes(typeNameLower)) {
        return formatTypeName(type.name);
      }

      // Special handling for common variations
      // If type name has hyphen/underscore, also check without it
      const cleanTypeName = typeNameLower.replace(/[-_\s]/g, '');
      if (cleanTypeName !== typeNameLower && lowerDisplayName.replace(/[-_\s]/g, '').includes(cleanTypeName)) {
        return formatTypeName(type.name);
      }
    }
  }

  // Fallback to some common hardcoded types if no database types provided
  // This ensures backward compatibility
  if (lowerDisplayName.includes('hero')) return 'Hero';
  if (lowerDisplayName.includes('footer')) return 'Footer';
  if (lowerDisplayName.includes('nav')) return 'Navigation';
  if (lowerDisplayName.includes('header')) return 'Header';
  if (lowerDisplayName.includes('service')) return 'Services';

  // Default to generic Section
  return 'Section';
}

/**
 * Format a type name from database to PascalCase for code names
 * Examples:
 * - "hero" -> "Hero"
 * - "bentobox" -> "Bentobox"
 * - "signup_form" -> "SignupForm"
 * - "nav-bar" -> "NavBar"
 */
function formatTypeName(typeName: string): string {
  return typeName
    .split(/[-_\s]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

/**
 * Extract existing numbers from component names for a given base type
 * Examples:
 * - Components: ["Hero1", "Hero2", "Hero10"], BaseType: "Hero" -> [1, 2, 10]
 * - Components: ["Footer1", "Hero1"], BaseType: "Hero" -> [1]
 */
export function extractExistingNumbers(
  components: Array<{ code_name: string }>,
  baseType: string
): number[] {
  const numbers: number[] = [];
  const baseTypeLower = baseType.toLowerCase();

  for (const component of components) {
    const codeNameLower = component.code_name.toLowerCase();

    // Check if this component matches our base type
    if (codeNameLower.startsWith(baseTypeLower)) {
      // Extract the number part
      const remaining = component.code_name.slice(baseType.length);
      const numberMatch = remaining.match(/^(\d+)$/);

      if (numberMatch) {
        numbers.push(parseInt(numberMatch[1], 10));
      }
    }
  }

  return numbers;
}

/**
 * Generate a unique code name with auto-numbering
 * Queries the database to find existing components and assigns the next available number
 * Uses the types table to properly categorize components
 * Examples:
 * - "Epic Hero" -> "Hero12" (if Hero1-11 exist)
 * - "Dark Footer" -> "Footer1" (if no footers exist)
 * - "Awesome Bento Box" -> "Bentobox1" (using types table)
 */
export async function getCodeNameWithAutoNumber(
  displayName: string,
  supabase: SupabaseClient
): Promise<string> {
  // First, query the types table to get all available component types
  const { data: types, error: typesError } = await supabase
    .from('types')
    .select('name, display_name')
    .eq('category', 'section'); // Focus on section types for components

  if (typesError) {
    console.error('Failed to query types table:', typesError);
    // Continue with fallback behavior
  }

  // Extract the base component type using database types
  const baseType = extractComponentType(displayName, types || undefined);

  // Query existing components of this type
  // We need to check for variations: Hero, hero, HERO
  const { data, error } = await supabase
    .from('core_components')
    .select('code_name')
    .or(`code_name.ilike.${baseType}%,code_name.ilike.${baseType.toLowerCase()}%,code_name.ilike.${baseType.toUpperCase()}%`);

  if (error) {
    throw new Error(`Failed to query existing components: ${error.message}`);
  }

  const existingComponents = data || [];

  // Extract all existing numbers for this base type
  const existingNumbers = extractExistingNumbers(existingComponents, baseType);

  // Find the next available number
  let nextNumber = 1;
  if (existingNumbers.length > 0) {
    // Get the highest number and add 1
    nextNumber = Math.max(...existingNumbers) + 1;
  }

  // Store the base type in the database for future reference
  // This helps maintain consistency between the display name and generated code name
  const result = {
    code_name: `${baseType}${nextNumber}`,
    base_type: baseType,
    auto_number: nextNumber
  };

  return result.code_name;
}