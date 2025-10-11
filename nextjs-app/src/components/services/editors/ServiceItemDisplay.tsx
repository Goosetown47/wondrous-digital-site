'use client';

import { useState } from 'react';
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import {
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
import { ItemDisplayProps } from '@/lib/structural-editor/types';
import { ServiceItem } from '../service-types';
import { ItemControls } from '@/components/shared/structural-editor/ItemControls';

// Icon mapping
const iconMap: Record<string, LucideIcon> = {
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

interface ServiceItemDisplayProps extends ItemDisplayProps<ServiceItem> {
  inAccordion?: boolean;
  showControls?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function ServiceItemDisplay({
  item,
  inAccordion = true,
  showControls = false,
  onEdit,
  onDelete,
}: ServiceItemDisplayProps) {
  // Validate icon and warn if invalid
  const IconComponent = (() => {
    if (!item.icon) return Settings;

    const icon = iconMap[item.icon];
    if (!icon) {
      console.warn(
        `[ServiceItemDisplay] Invalid icon name "${item.icon}" for service "${item.title}". ` +
        `Available icons: ${Object.keys(iconMap).join(', ')}. Falling back to Settings icon.`
      );
      return Settings;
    }

    return icon;
  })();

  const [isHovered, setIsHovered] = useState(false);

  // Render as simple card when not in Accordion (for EditableArray)
  if (!inAccordion) {
    return (
      <div className="border border-border rounded-lg overflow-hidden bg-background p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <IconComponent className="h-5 w-5 text-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-base font-semibold text-foreground mb-1">
              {item.title}
            </h4>
            {item.subtitle && (
              <p className="text-sm text-muted-foreground truncate">{item.subtitle}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Full accordion item for production
  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Hover Controls (only when showControls is true AND item is hovered) */}
      {showControls && onEdit && onDelete && isHovered && (
        <div
          className="absolute -top-10 left-1/2 -translate-x-1/2 z-50 bg-background border border-border rounded-module-md shadow-md p-1"
          role="toolbar"
          aria-label={`Actions for ${item.title}`}
        >
          <ItemControls onEdit={onEdit} onDelete={onDelete} />
        </div>
      )}

      <AccordionItem
        value={item.id}
        className="border border-border rounded-lg overflow-hidden"
      >

      <AccordionTrigger className="hover:no-underline py-6 px-6 bg-background">
        <div className="flex items-start gap-4 text-left w-full">
          <div className="flex-shrink-0 mt-1">
            <IconComponent className="h-5 w-5 text-foreground" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground mb-1">
              {item.title}
            </h3>
            {item.subtitle && (
              <p className="text-sm text-muted-foreground">{item.subtitle}</p>
            )}
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="border-t border-border bg-muted/30 px-6 py-6">
        <div className="pl-9 space-y-6">
          {/* Description */}
          {item.description && (
            <p className="text-base text-muted-foreground leading-relaxed">
              {item.description}
            </p>
          )}

          {/* Two Column Grid */}
          {(item.servicesInclude.length > 0 ||
            item.deliverables.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Column (Services Include) */}
              {item.servicesInclude.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-3">
                    {item.servicesIncludeLabel || 'Services Include:'}
                  </h4>
                  <ul className="space-y-2">
                    {item.servicesInclude.map((service, index) => (
                      <li
                        key={`${item.id}-service-${index}-${service.slice(0, 20)}`}
                        className="text-sm text-muted-foreground flex items-start gap-2"
                      >
                        <span className="text-foreground">•</span>
                        <span>{service}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Second Column (Deliverables) */}
              {item.deliverables.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-3">
                    {item.deliverablesLabel || 'Deliverables:'}
                  </h4>
                  <ul className="space-y-2">
                    {item.deliverables.map((deliverable, index) => (
                      <li
                        key={`${item.id}-deliverable-${index}-${deliverable.slice(0, 20)}`}
                        className="text-sm text-muted-foreground flex items-start gap-2"
                      >
                        <span className="text-foreground">•</span>
                        <span>{deliverable}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
    </div>
  );
}
