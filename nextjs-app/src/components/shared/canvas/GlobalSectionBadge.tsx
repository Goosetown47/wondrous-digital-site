/**
 * GlobalSectionBadge Component
 *
 * Visual indicator that a section is global (appears on all pages)
 * Displays the placement type and provides visual distinction
 */

'use client';

import { Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProjectSection } from '@/stores/builderStore';

interface GlobalSectionBadgeProps {
  placement: ProjectSection['section_placement'];
  className?: string;
}

const PLACEMENT_LABELS: Record<ProjectSection['section_placement'], string> = {
  global_header: 'GLOBAL HEADER',
  global_footer: 'GLOBAL FOOTER',
  above_content: 'ABOVE CONTENT',
  below_content: 'BELOW CONTENT',
};

const PLACEMENT_COLORS: Record<ProjectSection['section_placement'], string> = {
  global_header: 'bg-purple-500/10 text-purple-700 border-purple-500/20',
  global_footer: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
  above_content: 'bg-green-500/10 text-green-700 border-green-500/20',
  below_content: 'bg-orange-500/10 text-orange-700 border-orange-500/20',
};

export function GlobalSectionBadge({ placement, className }: GlobalSectionBadgeProps) {
  return (
    <div
      className={cn(
        'absolute top-2 left-2 z-[60]', // Left side, above section controls (z-50)
        'flex items-center justify-center p-1.5',
        'rounded-md border',
        'shadow-sm',
        'pointer-events-none', // Don't interfere with clicks
        PLACEMENT_COLORS[placement],
        className
      )}
      title={PLACEMENT_LABELS[placement]} // Tooltip shows full label
    >
      <Globe className="h-3.5 w-3.5" />
    </div>
  );
}
