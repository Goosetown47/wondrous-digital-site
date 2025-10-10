'use client';

import {
  Zap,
  Shield,
  Rocket,
  Heart,
  Star,
  Award,
  Target,
  TrendingUp,
  Users,
  Globe,
  Lock,
  CheckCircle,
  Sparkles,
  Lightbulb,
  Settings,
  MessageCircle,
  Clock,
  BarChart,
  LucideIcon,
} from 'lucide-react';
import { ItemDisplayProps } from '@/lib/structural-editor/types';
import { FeatureItem } from '../feature-types';

// Icon mapping
const iconMap: Record<string, LucideIcon> = {
  zap: Zap,
  shield: Shield,
  rocket: Rocket,
  heart: Heart,
  star: Star,
  award: Award,
  target: Target,
  trendingUp: TrendingUp,
  users: Users,
  globe: Globe,
  lock: Lock,
  checkCircle: CheckCircle,
  sparkles: Sparkles,
  lightbulb: Lightbulb,
  settings: Settings,
  messageCircle: MessageCircle,
  clock: Clock,
  barChart: BarChart,
};

export function FeatureItemDisplay({ item }: ItemDisplayProps<FeatureItem>) {
  // Get the icon component from the map
  const IconComponent = item.icon ? iconMap[item.icon] || Zap : Zap;

  return (
    <div className="flex flex-col items-start space-y-3">
      {/* Icon */}
      {IconComponent && (
        <div className="rounded-lg bg-primary/10 p-3">
          <IconComponent className="h-6 w-6 text-primary" />
        </div>
      )}

      {/* Title */}
      <h3 className="text-lg font-semibold text-foreground">
        {item.title}
      </h3>

      {/* Description */}
      <p className="text-sm text-muted-foreground leading-relaxed">
        {item.description}
      </p>
    </div>
  );
}
