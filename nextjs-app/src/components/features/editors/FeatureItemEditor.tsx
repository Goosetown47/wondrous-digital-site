'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { ItemEditorProps } from '@/lib/structural-editor/types';
import { FeatureItem, FEATURE_ICONS } from '../feature-types';

// Icon mapping for dropdown display
const iconComponents: Record<string, LucideIcon> = {
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

export function FeatureItemEditor({
  item,
  onSave,
  onCancel,
}: ItemEditorProps<FeatureItem>) {
  const [formData, setFormData] = useState<FeatureItem>(
    item || {
      id: '',
      icon: 'zap',
      title: '',
      description: '',
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      alert('Please enter a title');
      return;
    }
    if (!formData.description.trim()) {
      alert('Please enter a description');
      return;
    }

    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="icon">Icon</Label>
        <Select
          value={formData.icon}
          onValueChange={(value) =>
            setFormData({ ...formData, icon: value })
          }
        >
          <SelectTrigger id="icon">
            <SelectValue placeholder="Select an icon" />
          </SelectTrigger>
          <SelectContent>
            {FEATURE_ICONS.map((icon) => {
              const IconComponent = iconComponents[icon.value];
              return (
                <SelectItem key={icon.value} value={icon.value}>
                  <div className="flex items-center gap-2">
                    {IconComponent && <IconComponent className="h-4 w-4" />}
                    <span>{icon.label}</span>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) =>
            setFormData({ ...formData, title: e.target.value })
          }
          placeholder="Enter feature title"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="Enter feature description"
          rows={4}
          required
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save Feature</Button>
      </div>
    </form>
  );
}
