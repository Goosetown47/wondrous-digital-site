'use client';

import { useState, ReactNode } from 'react';
import { motion } from 'framer-motion';
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
        "relative group min-h-[60px]",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background layer that ensures full wrapper is hoverable */}
      <div className="absolute inset-0 bg-transparent" aria-hidden="true" />

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
