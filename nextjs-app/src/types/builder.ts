// Type management system
export interface Type {
  id: string;
  name: string; // e.g., 'hero', 'navbar', 'footer'
  display_name: string; // e.g., 'Hero Section', 'Navigation Bar'
  category: 'section' | 'page' | 'site' | 'theme';
  description: string | null;
  icon: string | null; // optional icon identifier
  schema: Record<string, unknown> | null; // optional JSON schema
  tier_restrictions?: string[] | null; // Array of tier names that can access this type
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// Core component source types - includes both generic categories and specific URLs
export type CoreComponentSource =
  // Generic categories (legacy)
  | 'shadcn'
  | 'aceternity'
  | 'expansions'
  | 'custom'
  // Specific shadcn sources
  | 'ui.shadcn.com'
  | 'shadcnblocks.com'
  // Specific aceternity sources
  | 'ui.aceternity.com'
  | 'pro.aceternity.com'
  // Expansion sources
  | 'shadcnui-expansions.typeart.cc'
  | 'reactbits.dev'
  | 'tweakcn.com'
  // Other UI libraries
  | 'skiper-ui.com'
  | '21st.dev'
  | 'ai-sdk.dev'
  | 'motion-primitives.com';

// Core component types
export interface CoreComponent {
  id: string;
  name: string;
  type: 'component' | 'section';
  source: CoreComponentSource;
  code: string;
  dependencies: string[];
  imports: string[];
  description?: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  is_registered?: boolean;
  registered_at?: string;
  registered_by?: string;
  default_content?: Record<string, unknown>;
  type_id?: string;
  code_name?: string;
  editable_fields?: Array<{
    path: string;
    type: string;
    label: string;
    description?: string;
    required?: boolean;
    maxLength?: number;
    [key: string]: unknown;
  }>;
  usage?: {
    componentName: string;
    totalUsage: number;
    draftCount: number;
    libraryCount: number;
    isInUse: boolean;
  };
  // Pipeline tracking fields
  deployment_status?: {
    dev: boolean;
    staging: boolean;
    prod: boolean;
    files_created: boolean;
    registry_updated: boolean;
    github_pr?: string | null;
    last_deployment?: string | null;
  };
  pipeline_status?: 'created' | 'registered' | 'testing' | 'published' | 'deployed' | 'disabled' | 'error';
  auto_number?: number;
  base_type?: string;
}

// Lab draft types
export interface LabDraft {
  id: string;
  name: string;
  type: 'section' | 'page' | 'site' | 'theme';
  type_id: string | null; // Reference to types table
  content: SectionContent | PageContent | SiteContent | ThemeVariables; // Will be more specific based on type
  version: number;
  status: 'draft' | 'testing' | 'ready' | 'promoted';
  content_hash: string | null; // SHA-256 hash of content for change detection
  library_version: number | null; // REPURPOSED: Actually stores parent library item ID for lineage tracking (conceptually parent_library_id)
  changelog?: string | null; // Changelog/release notes for this draft version
  tier_restrictions?: string[] | null; // Array of tier names that can access this draft
  metadata: Record<string, unknown>;
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
  tier_restrictions?: string[] | null; // Array of tier names that can access this theme
  metadata: Record<string, unknown>;
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

  // Website-level colors (v0.1.8)
  websiteBackground?: string;  // Global page background

  // Section Style System (v0.1.8) - Pre-matched color palettes
  // Each theme can have 2-4 section styles with guaranteed contrast

  // Section Style 1
  section1Bg?: string;           // Section background color
  section1Fg?: string;           // Section text color (guaranteed contrast)
  section1Card?: string;         // Card background (guaranteed contrast with section)
  section1CardFg?: string;       // Card text color (guaranteed contrast with card)
  section1CardBorder?: string;   // Card border color (HSL)
  section1CardBorderWidth?: string; // Card border width (e.g., "1px")
  section1Name?: string;         // User-friendly name (e.g., "Light & Clean")
  section1Description?: string;  // Short description for UI

  // Section Style 2
  section2Bg?: string;
  section2Fg?: string;
  section2Card?: string;
  section2CardFg?: string;
  section2CardBorder?: string;
  section2CardBorderWidth?: string;
  section2Name?: string;
  section2Description?: string;

  // Section Style 3
  section3Bg?: string;
  section3Fg?: string;
  section3Card?: string;
  section3CardFg?: string;
  section3CardBorder?: string;
  section3CardBorderWidth?: string;
  section3Name?: string;
  section3Description?: string;

  // Section Style 4
  section4Bg?: string;
  section4Fg?: string;
  section4Card?: string;
  section4CardFg?: string;
  section4CardBorder?: string;
  section4CardBorderWidth?: string;
  section4Name?: string;
  section4Description?: string;

  // Typography
  fontFamily?: string;
  fontFamilyHeading?: string;
  fontHeading?: string;          // Google Font name for headings (v0.1.8)
  fontBody?: string;             // Google Font name for body text (v0.1.8)
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

  // Granular Typography System (v0.1.8)
  // Individual heading controls with inheritance from base fonts
  // H1
  h1Font?: string;           // Overrides fontHeading if set
  h1Size?: string;           // Default: "3rem"
  h1LineHeight?: string;     // Default: "1.2"
  h1Weight?: string;         // Default: "700"
  h1LetterSpacing?: string;  // Default: "-0.02em"

  // H2
  h2Font?: string;
  h2Size?: string;           // Default: "2.25rem"
  h2LineHeight?: string;     // Default: "1.3"
  h2Weight?: string;         // Default: "600"
  h2LetterSpacing?: string;  // Default: "-0.01em"

  // H3
  h3Font?: string;
  h3Size?: string;           // Default: "1.875rem"
  h3LineHeight?: string;     // Default: "1.4"
  h3Weight?: string;         // Default: "600"
  h3LetterSpacing?: string;  // Default: "0"

  // H4
  h4Font?: string;
  h4Size?: string;           // Default: "1.5rem"
  h4LineHeight?: string;     // Default: "1.4"
  h4Weight?: string;         // Default: "600"
  h4LetterSpacing?: string;

  // H5
  h5Font?: string;
  h5Size?: string;           // Default: "1.25rem"
  h5LineHeight?: string;     // Default: "1.5"
  h5Weight?: string;         // Default: "500"
  h5LetterSpacing?: string;

  // H6
  h6Font?: string;
  h6Size?: string;           // Default: "1rem"
  h6LineHeight?: string;     // Default: "1.5"
  h6Weight?: string;         // Default: "500"
  h6LetterSpacing?: string;

  // Body text controls
  bodySize?: string;         // Default: "1rem"
  bodyLineHeight?: string;   // Default: "1.6"
  bodyWeight?: string;       // Default: "400"
  bodyLetterSpacing?: string; // Default: "0"

  // Small text controls
  smallSize?: string;        // Default: "0.875rem"
  smallLineHeight?: string;  // Default: "1.5"
  smallLetterSpacing?: string; // Default: "0"

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
  [key: string]: string | Record<string, string> | undefined;
}

// Library item types
export type LibraryItemType = 'section' | 'page' | 'site' | 'theme';
export interface LibraryItem {
  id: string;
  name: string;
  type: 'section' | 'page' | 'site' | 'theme';
  type_id: string | null; // Reference to types table
  component_name: string | null; // React component name (e.g., 'HeroTwoColumn')
  category: string | null;
  content: SectionContent | PageContent | SiteContent | ThemeVariables; // Will be more specific based on type
  published: boolean;
  version: number;
  source_draft_id: string | null;
  source_component_id?: string | null; // Reference to core_components for tracking origin
  theme_id: string | null;
  tier_restrictions?: string[] | null; // Array of tier names that can access this item
  usage_count: number;
  metadata: Record<string, unknown>;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// Library version types
export interface LibraryVersion {
  id: string;
  library_item_id: string;
  version: number;
  content: SectionContent | PageContent | SiteContent | ThemeVariables;
  change_notes: string | null;
  created_by: string | null;
  created_at: string;
}

// Content types for different library item types
export interface SectionContent {
  components: Array<{
    component_id: string;
    props: Record<string, unknown>;
    children?: SectionContent['components'];
  }>;
  layout?: {
    container?: boolean;
    spacing?: string;
    className?: string;
  };
  design?: {
    sectionStyle?: 1 | 2 | 3 | 4;  // Which section style to use (v0.1.8)
  };
}

export interface PageContent {
  sections: Array<{
    section_id: string;
    order: number;
    props?: Record<string, unknown>;
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
    header?: Record<string, unknown>;
    footer?: Record<string, unknown>;
  };
  global_settings?: Record<string, unknown>;
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