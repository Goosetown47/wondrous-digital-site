/**
 * Maps database display names to actual component code names
 * This bridges the gap between human-readable names in the database
 * and the actual component class names in the code
 */

// Mapping of display names (from database) to code names (in ComponentRegistry)
const COMPONENT_NAME_MAP: Record<string, string> = {
  // Navigation components
  'Nav Bar 1': 'Navbar2',
  'Navigation Bar 1': 'Navbar2',
  'Navbar 1': 'Navbar2',
  'Footer 1': 'Footer2',
  'Footer Two': 'Footer2',

  // Hero sections
  'Hero Two Column': 'HeroTwoColumn',
  'Hero 2 Column': 'HeroTwoColumn',
  'Hero Section': 'HeroTwoColumn',
  'Nav Bar 3': 'NavBar3',
  'Services1': 'Services1',

  // Add more mappings as components are imported
};

/**
 * Get the code name for a component from its display name
 * @param displayName - The human-readable name from the database
 * @returns The component code name for the registry, or the original name if no mapping exists
 */
export function getComponentCodeName(displayName: string): string {
  // First check if there's a direct mapping (safe property access)
  if (Object.prototype.hasOwnProperty.call(COMPONENT_NAME_MAP, displayName)) {
    // Use Object.entries to safely access the value
    const entry = Object.entries(COMPONENT_NAME_MAP).find(([key]) => key === displayName);
    if (entry) {
      return entry[1];
    }
  }

  // Check if already in PascalCase format (no spaces/hyphens and has uppercase letters)
  const isPascalCase = /^[A-Z][a-zA-Z0-9]*$/.test(displayName) && /[A-Z]/.test(displayName.slice(1));
  if (isPascalCase || /^[A-Z][a-z0-9]*$/.test(displayName)) {
    return displayName; // Already in correct format
  }

  // Try to extract from metadata if it's stored there
  // This will be used for future components that store the code name

  // If no mapping found, try to convert the display name to code format
  // This is a fallback for components that follow a naming convention
  // "Hero Two Column" -> "HeroTwoColumn"
  const codeName = displayName
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');

  return codeName;
}

/**
 * Check if a component code name exists in our mapping
 * @param codeName - The component code name
 * @returns true if the component is known
 */
export function isKnownComponent(codeName: string): boolean {
  const knownComponents = new Set(Object.values(COMPONENT_NAME_MAP));
  return knownComponents.has(codeName);
}