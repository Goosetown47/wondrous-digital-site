import { EditableItem } from '@/lib/structural-editor/types';

/**
 * Feature item for feature grid sections
 */
export interface FeatureItem extends EditableItem {
  id: string;
  icon: string;
  title: string;
  description: string;
}

/**
 * Available Lucide icons for features (lowercase names)
 */
export const FEATURE_ICONS = [
  { value: 'zap', label: 'Zap' },
  { value: 'shield', label: 'Shield' },
  { value: 'rocket', label: 'Rocket' },
  { value: 'heart', label: 'Heart' },
  { value: 'star', label: 'Star' },
  { value: 'award', label: 'Award' },
  { value: 'target', label: 'Target' },
  { value: 'trendingUp', label: 'TrendingUp' },
  { value: 'users', label: 'Users' },
  { value: 'globe', label: 'Globe' },
  { value: 'lock', label: 'Lock' },
  { value: 'checkCircle', label: 'CheckCircle' },
  { value: 'sparkles', label: 'Sparkles' },
  { value: 'lightbulb', label: 'Lightbulb' },
  { value: 'settings', label: 'Settings' },
  { value: 'messageCircle', label: 'MessageCircle' },
  { value: 'clock', label: 'Clock' },
  { value: 'barChart', label: 'BarChart' },
] as const;
