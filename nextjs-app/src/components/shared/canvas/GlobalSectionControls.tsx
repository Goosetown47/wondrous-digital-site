'use client';

import { AppButton } from '@/components/ui/app-button';
import { Trash2, Settings, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ProjectSection } from '@/stores/builderStore';
import { cn } from '@/lib/utils';

interface GlobalSectionControlsProps {
  sectionId: string;
  placement: ProjectSection['section_placement'];
  onDelete: () => void;
  onSettings?: () => void;
  isVisible: boolean;
}

const PLACEMENT_COLORS: Record<ProjectSection['section_placement'], string> = {
  global_header: 'text-purple-700',
  global_footer: 'text-blue-700',
  above_content: 'text-green-700',
  below_content: 'text-orange-700',
};

const PLACEMENT_LABELS: Record<ProjectSection['section_placement'], string> = {
  global_header: 'Global Header',
  global_footer: 'Global Footer',
  above_content: 'Above Content',
  below_content: 'Below Content',
};

export function GlobalSectionControls({
  placement,
  onDelete,
  onSettings,
  isVisible
}: GlobalSectionControlsProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <div className="absolute -left-1 top-1/2 -translate-y-1/2 z-50">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-auto flex flex-col items-center gap-0 bg-background/95 backdrop-blur-sm border rounded-module-lg shadow-lg overflow-hidden"
          >
          {/* Globe Icon - Top of stack */}
          <div
            className={cn(
              "px-2 py-2 w-full flex items-center justify-center border-b",
              PLACEMENT_COLORS[placement]
            )}
            title={PLACEMENT_LABELS[placement]}
          >
            <Globe className="h-4 w-4" />
          </div>

          {/* Settings */}
          {onSettings && (
            <AppButton
              size="icon"
              variant="ghost"
              className="h-9 w-9 rounded-none"
              onClick={(e) => {
                e.stopPropagation();
                onSettings();
              }}
              aria-label="Section settings"
            >
              <Settings className="h-4 w-4" />
            </AppButton>
          )}

          {/* Delete */}
          <AppButton
            size="icon"
            variant="ghost"
            className="h-9 w-9 text-destructive hover:text-destructive rounded-none"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            aria-label="Delete section"
          >
            <Trash2 className="h-4 w-4" />
          </AppButton>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
