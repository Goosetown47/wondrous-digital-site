'use client';

import { useState, ReactNode, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { SectionControls } from './SectionControls';
import { cn } from '@/lib/utils';

interface SectionWrapperProps {
  id: string;
  index: number;
  totalSections: number;
  isSelected?: boolean;
  children: ReactNode;
  onSelect?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onDelete?: () => void;
  onSettings?: () => void;
  className?: string;
  dragHandleProps?: Record<string, unknown>;
}

export function SectionWrapper({
  id,
  index,
  totalSections,
  isSelected: _isSelected = false, // eslint-disable-line @typescript-eslint/no-unused-vars
  children,
  onSelect: _onSelect, // eslint-disable-line @typescript-eslint/no-unused-vars
  onMoveUp,
  onMoveDown,
  onDelete,
  onSettings,
  className,
  dragHandleProps
}: SectionWrapperProps) {
  const [isHovered, setIsHovered] = useState(false);
  const hasAnimatedRef = useRef(false);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  const canMoveUp = index > 0;
  const canMoveDown = index < totalSections - 1;

  // Only animate on first mount
  useEffect(() => {
    if (!hasAnimatedRef.current) {
      setShouldAnimate(true);
      hasAnimatedRef.current = true;
    }
  }, []);

  return (
    <motion.div
      layout
      layoutId={id} // Prevent re-animation on re-renders
      initial={shouldAnimate ? { opacity: 0, y: 20 } : false}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "relative group min-h-[100px]", // Add min-height for absolutely positioned content
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...dragHandleProps}
    >
      {/* Background layer that ensures full wrapper is hoverable */}
      <div className="absolute inset-0 bg-transparent" aria-hidden="true" />

      {/* Section Controls - higher z-index to be above everything */}
      {(onMoveUp || onMoveDown || onDelete || onSettings) && (
        <SectionControls
          sectionId={id}
          canMoveUp={canMoveUp}
          canMoveDown={canMoveDown}
          onMoveUp={onMoveUp || (() => {})}
          onMoveDown={onMoveDown || (() => {})}
          onDelete={onDelete || (() => {})}
          onSettings={onSettings}
          isVisible={isHovered} // Only show on hover, not on selected
        />
      )}

      {/* Section Content */}
      <div className="relative">
        {children}
      </div>
    </motion.div>
  );
}