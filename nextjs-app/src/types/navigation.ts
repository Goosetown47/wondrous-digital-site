// Navigation menu types
export interface NavigationMenu {
  id: string;
  project_id: string;
  type: 'header' | 'footer' | 'sidebar';
  library_item_id: string | null; // Reference to library component
  items: NavigationItem[]; // JSON tree structure
  settings: NavigationSettings; // Component-specific settings
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Navigation item types
export type NavigationItemType = 'link' | 'category' | 'divider';

export interface NavigationItem {
  id: string;
  type: NavigationItemType;
  label?: string; // Required for link and category, optional for divider
  url?: string; // For links (internal or external)
  page_id?: string; // Reference to internal page
  icon?: string; // Icon identifier (e.g., Lucide icon name)
  badge?: string; // Badge text (e.g., "New", "Beta")
  description?: string; // For mega menu items
  image_url?: string; // For mega menu items with images
  styling?: {
    bold?: boolean;
    color?: string;
    className?: string;
  };
  children?: NavigationItem[]; // Nested items
}

// Component-specific settings
export interface NavigationSettings {
  sticky?: boolean;
  transparent?: boolean;
  showOnMobile?: boolean;
  showOnDesktop?: boolean;
  maxDepth?: number;
  animations?: boolean;
  className?: string;
  [key: string]: unknown; // Allow component-specific settings
}

// Navigation component capabilities
export interface NavigationComponentCapabilities {
  maxDepth: number;
  supportsIcons: boolean;
  supportsImages: boolean;
  supportsMegaMenu: boolean;
  supportsBadges: boolean;
  supportsDescriptions: boolean;
  supportsDividers: boolean;
  responsiveBreakpoint?: string;
}

// Navigation component registry
export interface NavigationComponent {
  id: string;
  library_item_id: string;
  name: string;
  type: 'header' | 'footer' | 'sidebar';
  capabilities: NavigationComponentCapabilities;
  preview_image?: string;
  created_at: string;
}

// Editor state types
export interface NavigationEditorState {
  selectedMenuId?: string;
  selectedItemId?: string;
  isDragging: boolean;
  previewMode: 'interactive' | 'edit';
  expandedItems: string[];
  unsavedChanges: boolean;
}

// Drag and drop types
export interface DragItem {
  id: string;
  type: NavigationItemType;
  parentId?: string;
  index: number;
}

export interface DropTarget {
  parentId?: string;
  index: number;
}

// Validation types
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  path: string;
  message: string;
  field?: string;
}

// API response types
export interface NavigationMenuWithComponent extends NavigationMenu {
  component?: NavigationComponent;
}

// Tree manipulation helper types
export interface TreeOperation {
  type: 'add' | 'remove' | 'move' | 'update';
  itemId: string;
  parentId?: string;
  targetIndex?: number;
  updates?: Partial<NavigationItem>;
}