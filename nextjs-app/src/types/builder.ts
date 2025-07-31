// Type management system
export interface Type {
  id: string;
  name: string; // e.g., 'hero', 'navbar', 'footer'
  display_name: string; // e.g., 'Hero Section', 'Navigation Bar'
  category: 'section' | 'page' | 'site' | 'theme';
  description: string | null;
  icon: string | null; // optional icon identifier
  schema: Record<string, any> | null; // optional JSON schema
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// Core component types
export interface CoreComponent {
  id: string;
  name: string;
  type: 'component' | 'section';
  source: 'shadcn' | 'aceternity' | 'expansions' | 'custom';
  code: string;
  dependencies: string[];
  imports: string[];
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// Lab draft types
export interface LabDraft {
  id: string;
  name: string;
  type: 'section' | 'page' | 'site' | 'theme';
  type_id: string | null; // Reference to types table
  content: any; // Will be more specific based on type
  version: number;
  status: 'draft' | 'testing' | 'ready' | 'promoted';
  content_hash: string | null; // SHA-256 hash of content for change detection
  library_version: number | null; // Version of linked library item
  metadata: Record<string, any>;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// Theme types
export interface Theme {
  id: string;
  name: string;
  description: string | null;
  variables: ThemeVariables;
  metadata: Record<string, any>;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ThemeVariables {
  // Colors
  primary?: string;
  secondary?: string;
  accent?: string;
  background?: string;
  foreground?: string;
  muted?: string;
  mutedForeground?: string;
  card?: string;
  cardForeground?: string;
  popover?: string;
  popoverForeground?: string;
  border?: string;
  input?: string;
  ring?: string;
  
  // Typography
  fontFamily?: string;
  fontFamilyHeading?: string;
  fontSize?: {
    xs?: string;
    sm?: string;
    base?: string;
    lg?: string;
    xl?: string;
    '2xl'?: string;
    '3xl'?: string;
    '4xl'?: string;
  };
  
  // Spacing & Sizing
  radius?: string;
  buttonHeight?: string;
  inputHeight?: string;
  
  // Effects
  shadow?: {
    sm?: string;
    DEFAULT?: string;
    md?: string;
    lg?: string;
    xl?: string;
  };
  
  // Custom properties
  [key: string]: any;
}

// Library item types
export interface LibraryItem {
  id: string;
  name: string;
  type: 'section' | 'page' | 'site' | 'theme';
  type_id: string | null; // Reference to types table
  component_name: string | null; // React component name (e.g., 'HeroTwoColumn')
  category: string | null;
  content: any; // Will be more specific based on type
  published: boolean;
  version: number;
  source_draft_id: string | null;
  theme_id: string | null;
  usage_count: number;
  metadata: Record<string, any>;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// Library version types
export interface LibraryVersion {
  id: string;
  library_item_id: string;
  version: number;
  content: any;
  change_notes: string | null;
  created_by: string | null;
  created_at: string;
}

// Content types for different library item types
export interface SectionContent {
  components: Array<{
    component_id: string;
    props: Record<string, any>;
    children?: SectionContent['components'];
  }>;
  layout?: {
    container?: boolean;
    spacing?: string;
    className?: string;
  };
}

export interface PageContent {
  sections: Array<{
    section_id: string;
    order: number;
    props?: Record<string, any>;
  }>;
  metadata?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
}

export interface SiteContent {
  pages: Array<{
    page_id: string;
    path: string;
    is_home?: boolean;
  }>;
  navigation?: {
    header?: any;
    footer?: any;
  };
  global_settings?: Record<string, any>;
}

// Extended Project type with theme support
export interface ProjectWithTheme {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: 'active' | 'inactive' | 'archived';
  theme_id: string | null;
  theme?: Theme;
  theme_overrides: Partial<ThemeVariables>;
  created_at: string;
  updated_at: string;
}