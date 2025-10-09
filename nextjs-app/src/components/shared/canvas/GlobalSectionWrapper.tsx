'use client';

import { useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlobalSectionControls } from './GlobalSectionControls';
import { cn } from '@/lib/utils';
import type { ProjectSection } from '@/stores/builderStore';

interface GlobalSectionWrapperProps {
  id: string;
  placement: ProjectSection['section_placement'];
  children: ReactNode;
  onDelete?: () => void;
  onSettings?: () => void;
  className?: string;
}

export function GlobalSectionWrapper({
  id,
  placement,
  children,
  onDelete,
  onSettings,
  className
}: GlobalSectionWrapperProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      className={cn(
        "relative group",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Hover Lines - Top and Bottom Dashed Borders */}
      <AnimatePresence>
        {isHovered && (
          <>
            {/* Top line */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute top-0 left-0 right-0 border-t-2 border-dashed border-gray-400 pointer-events-none"
              style={{ zIndex: 1 }}
            />
            {/* Bottom line */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-0 left-0 right-0 border-t-2 border-dashed border-gray-400 pointer-events-none"
              style={{ zIndex: 1 }}
            />
          </>
        )}
      </AnimatePresence>

      {/* Global Section Controls - only show on hover */}
      {(onDelete || onSettings) && (
        <div
          className="absolute inset-y-0 left-0 pointer-events-none"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <GlobalSectionControls
            sectionId={id}
            placement={placement}
            onDelete={onDelete || (() => {})}
            onSettings={onSettings}
            isVisible={isHovered}
          />
        </div>
      )}

      {/* Section Content */}
      <div className="relative w-full">
        {children}
      </div>
    </motion.div>
  );
}
