'use client';

import { Button } from '@/components/ui/button';
import {
  ChevronUp,
  ChevronDown,
  Trash2,
  GripVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SectionControlsProps {
  sectionId: string;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  onSettings?: () => void;
  isVisible: boolean;
}

export function SectionControls({
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  onDelete,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onSettings: _onSettings, // Reserved for future use
  isVisible
}: SectionControlsProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2 }}
          className="absolute -left-12 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-1 bg-background/95 backdrop-blur-sm border rounded-lg shadow-lg p-1"
        >
          {/* Drag Handle */}
          <div className="px-1 py-1 cursor-move text-muted-foreground hover:text-foreground">
            <GripVertical className="h-4 w-4" />
          </div>

          {/* Move Up */}
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={(e) => {
              e.stopPropagation();
              onMoveUp();
            }}
            disabled={!canMoveUp}
            aria-label="Move section up"
          >
            <ChevronUp className="h-4 w-4" />
          </Button>

          {/* Move Down */}
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={(e) => {
              e.stopPropagation();
              onMoveDown();
            }}
            disabled={!canMoveDown}
            aria-label="Move section down"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>

          {/* Settings - Hidden until we have actual settings to configure */}
          {/* TODO: Re-enable when section-specific settings are implemented
          {onSettings && (
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              onClick={(e) => {
                e.stopPropagation();
                onSettings();
              }}
              aria-label="Section settings"
            >
              <Settings className="h-4 w-4" />
            </Button>
          )}
          */}

          {/* Delete */}
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 text-destructive hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            aria-label="Delete section"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}