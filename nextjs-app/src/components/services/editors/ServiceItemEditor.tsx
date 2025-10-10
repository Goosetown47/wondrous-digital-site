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
  X,
  Plus,
  Settings,
  Palette,
  Code,
  Target,
  Users,
  Briefcase,
  Rocket,
  Zap,
  Shield,
  Globe,
  Cpu,
  Database,
  Layout,
  Smartphone,
  TrendingUp,
  Heart,
  Star,
  Award,
  LucideIcon,
} from 'lucide-react';
import { ItemEditorProps } from '@/lib/structural-editor/types';
import { ServiceItem, AVAILABLE_ICONS } from '../service-types';
import { generateId } from '@/lib/structural-editor/utils';

// Icon mapping for displaying icons in dropdown
const iconComponents: Record<string, LucideIcon> = {
  settings: Settings,
  palette: Palette,
  code: Code,
  target: Target,
  users: Users,
  briefcase: Briefcase,
  rocket: Rocket,
  zap: Zap,
  shield: Shield,
  globe: Globe,
  cpu: Cpu,
  database: Database,
  layout: Layout,
  smartphone: Smartphone,
  trendingUp: TrendingUp,
  heart: Heart,
  star: Star,
  award: Award,
};

export function ServiceItemEditor({
  item,
  onSave,
  onCancel,
}: ItemEditorProps<ServiceItem>) {
  const [formData, setFormData] = useState<ServiceItem>(
    item || {
      id: generateId(),
      icon: 'settings',
      title: '',
      subtitle: '',
      description: '',
      servicesInclude: [''],
      servicesIncludeLabel: 'Services Include:',
      deliverables: [''],
      deliverablesLabel: 'Deliverables:',
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Filter out empty strings from arrays
    const cleanedData = {
      ...formData,
      servicesInclude: formData.servicesInclude.filter((s) => s.trim() !== ''),
      deliverables: formData.deliverables.filter((d) => d.trim() !== ''),
    };

    // Validate required fields
    if (!cleanedData.title.trim()) {
      alert('Please enter a service title');
      return;
    }

    onSave(cleanedData);
  };

  // Array field handlers
  const addServiceInclude = () => {
    setFormData({
      ...formData,
      servicesInclude: [...formData.servicesInclude, ''],
    });
  };

  const removeServiceInclude = (index: number) => {
    setFormData({
      ...formData,
      servicesInclude: formData.servicesInclude.filter((_, i) => i !== index),
    });
  };

  const updateServiceInclude = (index: number, value: string) => {
    const updated = [...formData.servicesInclude];
    updated[index] = value;
    setFormData({ ...formData, servicesInclude: updated });
  };

  const addDeliverable = () => {
    setFormData({
      ...formData,
      deliverables: [...formData.deliverables, ''],
    });
  };

  const removeDeliverable = (index: number) => {
    setFormData({
      ...formData,
      deliverables: formData.deliverables.filter((_, i) => i !== index),
    });
  };

  const updateDeliverable = (index: number, value: string) => {
    const updated = [...formData.deliverables];
    updated[index] = value;
    setFormData({ ...formData, deliverables: updated });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Icon Selection */}
      <div className="space-y-2">
        <Label htmlFor="icon">Icon</Label>
        <Select
          value={formData.icon || 'settings'}
          onValueChange={(value) => setFormData({ ...formData, icon: value })}
        >
          <SelectTrigger id="icon">
            <SelectValue placeholder="Select an icon" />
          </SelectTrigger>
          <SelectContent>
            {AVAILABLE_ICONS.map((icon) => {
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

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">
          Title <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="e.g., Product Strategy"
          required
        />
      </div>

      {/* Subtitle */}
      <div className="space-y-2">
        <Label htmlFor="subtitle">Subtitle</Label>
        <Input
          id="subtitle"
          value={formData.subtitle}
          onChange={(e) =>
            setFormData({ ...formData, subtitle: e.target.value })
          }
          placeholder="e.g., Strategic planning and market positioning"
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="Full description..."
          rows={4}
          className="resize-none"
        />
      </div>

      {/* First Column Header */}
      <div className="space-y-2">
        <Label htmlFor="servicesIncludeLabel">First Column Header</Label>
        <Input
          id="servicesIncludeLabel"
          value={formData.servicesIncludeLabel || 'Services Include:'}
          onChange={(e) =>
            setFormData({ ...formData, servicesIncludeLabel: e.target.value })
          }
          placeholder="e.g., Services Include:"
        />
      </div>

      {/* Services Include */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>First Column Items</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addServiceInclude}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Item
          </Button>
        </div>
        <div className="space-y-2">
          {formData.servicesInclude.map((service, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={service}
                onChange={(e) => updateServiceInclude(index, e.target.value)}
                placeholder="e.g., Market Research"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeServiceInclude(index)}
                disabled={formData.servicesInclude.length === 1}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Second Column Header */}
      <div className="space-y-2">
        <Label htmlFor="deliverablesLabel">Second Column Header</Label>
        <Input
          id="deliverablesLabel"
          value={formData.deliverablesLabel || 'Deliverables:'}
          onChange={(e) =>
            setFormData({ ...formData, deliverablesLabel: e.target.value })
          }
          placeholder="e.g., Deliverables:"
        />
      </div>

      {/* Deliverables */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Second Column Items</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addDeliverable}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Item
          </Button>
        </div>
        <div className="space-y-2">
          {formData.deliverables.map((deliverable, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={deliverable}
                onChange={(e) => updateDeliverable(index, e.target.value)}
                placeholder="e.g., Strategy Document"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeDeliverable(index)}
                disabled={formData.deliverables.length === 1}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex gap-2 justify-end pt-4 border-t border-border">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save Service</Button>
      </div>
    </form>
  );
}
