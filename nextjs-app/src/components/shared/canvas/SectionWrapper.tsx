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
  isSelected,
  children,
  onSelect,
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

  // Handle click on the section
  const handleClick = (e: React.MouseEvent) => {
    // Don't trigger selection when clicking on controls
    if ((e.target as HTMLElement).closest('.section-controls')) {
      return;
    }
    onSelect?.();
  };

  return (
    <motion.div
      layout
      layoutId={id} // Prevent re-animation on re-renders
      initial={shouldAnimate ? { opacity: 0, y: 20 } : false}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "relative group min-h-[100px] cursor-pointer", // Add cursor-pointer
        isSelected && "ring-2 ring-primary ring-offset-2", // Visual feedback when selected
        className
      )}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...dragHandleProps}
    >
      {/* Background layer that ensures full wrapper is hoverable */}
      <div className="absolute inset-0 bg-transparent" aria-hidden="true" />

      {/* Section Controls - higher z-index to be above everything */}
      {(onMoveUp || onMoveDown || onDelete || onSettings) && (
        <div className="section-controls">
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
        </div>
      )}

      {/* Section Content - Wrapped to ensure centering */}
      <div className="relative w-full">
        {children}
      </div>
    </motion.div>
  );
}