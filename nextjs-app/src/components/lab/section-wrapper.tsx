'use client';

import { cn } from '@/lib/utils';

interface SectionWrapperProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
  fullWidth?: boolean;
}

/**
 * SectionWrapper provides consistent wrapping for all Lab sections
 * Ensures proper responsive behavior with ResizablePreview
 * Uses container queries for responsive breakpoints
 */
export function SectionWrapper({
  children,
  className,
  noPadding = false,
  fullWidth = false,
}: SectionWrapperProps) {
  return (
    <section className={cn(
      "w-full flex justify-center relative",
      className
    )}>
      <div className={cn(
        "w-full",
        // Enable container queries
        "@container",
        // Add default padding unless disabled
        !noPadding && "py-4 @[768px]:py-8 @[1024px]:py-12",
        // Add container max-width unless full width
        !fullWidth && "container mx-auto"
      )}>
        {children}
      </div>
    </section>
  );
}