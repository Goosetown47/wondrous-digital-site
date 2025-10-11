// Service Item Type for ServicesAccordion component
import { EditableItem } from '@/lib/structural-editor/types';

export interface ServiceItem extends EditableItem {
  id: string;
  icon?: string; // Icon name like "Settings", "Palette", "Code", etc.
  title: string;
  subtitle: string;
  description: string;
  servicesInclude: string[];
  servicesIncludeLabel?: string; // Editable column header for services list
  deliverables: string[];
  deliverablesLabel?: string; // Editable column header for deliverables list
}

// Available icons for services
export const AVAILABLE_ICONS = [
  { value: 'settings', label: 'Settings (Gear)' },
  { value: 'palette', label: 'Palette (Design)' },
  { value: 'code', label: 'Code (Development)' },
  { value: 'target', label: 'Target (Marketing)' },
  { value: 'users', label: 'Users (Team)' },
  { value: 'briefcase', label: 'Briefcase (Business)' },
  { value: 'rocket', label: 'Rocket (Launch)' },
  { value: 'zap', label: 'Zap (Speed)' },
  { value: 'shield', label: 'Shield (Security)' },
  { value: 'globe', label: 'Globe (Global)' },
  { value: 'cpu', label: 'CPU (Technology)' },
  { value: 'database', label: 'Database (Data)' },
  { value: 'layout', label: 'Layout (Design)' },
  { value: 'smartphone', label: 'Smartphone (Mobile)' },
  { value: 'trendingUp', label: 'Trending Up (Growth)' },
  { value: 'heart', label: 'Heart (Care)' },
  { value: 'star', label: 'Star (Quality)' },
  { value: 'award', label: 'Award (Excellence)' },
] as const;
