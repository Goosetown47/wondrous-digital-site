'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { GripVertical } from 'lucide-react';

interface ResizablePreviewProps {
  children: React.ReactNode;
  className?: string;
  minWidth?: number;
  maxWidth?: number;
  defaultWidth?: number;
  presetWidth?: number | null;
  isDarkMode?: boolean;
  deviceView?: 'desktop' | 'tablet' | 'mobile';
}

export function ResizablePreview({
  children,
  className,
  minWidth = 320,
  maxWidth = 1400,
  defaultWidth,
  presetWidth,
  isDarkMode = false,
  deviceView = 'desktop',
}: ResizablePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [width, setWidth] = useState<number | null>(presetWidth || null);
  const [isResizing, setIsResizing] = useState(false);
  const [dragWidth, setDragWidth] = useState<number>(0);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  // Track container width for resize constraints
  useEffect(() => {
    const updateContainerWidth = () => {
      if (containerRef.current?.parentElement) {
        const parentWidth = containerRef.current.parentElement.offsetWidth;
        setContainerWidth(parentWidth);
        
        // If current width is larger than container, constrain it
        if (width && width > parentWidth) {
          setWidth(parentWidth);
        }
      }
    };

    updateContainerWidth();
    window.addEventListener('resize', updateContainerWidth);
    
    // Also observe for DOM changes (e.g., sidebar collapse)
    const observer = new MutationObserver(updateContainerWidth);
    if (containerRef.current?.parentElement) {
      observer.observe(containerRef.current.parentElement, {
        attributes: true,
        childList: true,
        subtree: true,
      });
    }
    
    return () => {
      window.removeEventListener('resize', updateContainerWidth);
      observer.disconnect();
    };
  }, [width]);

  // Update width when preset changes
  useEffect(() => {
    // Always update width when presetWidth changes (including to null)
    setWidth(presetWidth);
  }, [presetWidth]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      const diff = e.clientX - startXRef.current;
      const newWidth = startWidthRef.current + diff;
      
      // Constrain to container width and minimum width
      const maxAllowedWidth = containerWidth || maxWidth;
      setDragWidth(Math.min(Math.max(newWidth, minWidth), maxAllowedWidth));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = '';
      
      // Save the final dragged width
      setWidth(dragWidth);
    };

    if (isResizing) {
      document.body.style.cursor = 'ew-resize';
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, minWidth, maxWidth, containerWidth, dragWidth]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Get the actual current width from the DOM
    if (containerRef.current) {
      const currentWidth = containerRef.current.offsetWidth;
      
      setIsResizing(true);
      setDragWidth(currentWidth);
      startXRef.current = e.clientX;
      startWidthRef.current = currentWidth;
    }
  };


  return (
    // Canvas div - full viewport size with gray background
    <div className="h-[calc(100vh-120px)] w-full bg-muted/30 overflow-hidden flex">
      {/* Resizing Container - this is what we resize */}
      <div
        ref={containerRef}
        className={cn(
          "relative h-full transition-all container-type-inline-size",
          isResizing && "transition-none",
          isDarkMode && "dark"
        )}
        style={{ 
          width: isResizing 
            ? `${dragWidth}px`
            : width !== null
              ? `${width}px`
              : '100%',
        }}
      >
        {/* Inner Container with scroll */}
        <div className="h-full w-full overflow-y-auto overflow-x-hidden">
          {children}
        </div>
        
        {/* Resize handle - inside the container, full height */}
        <div
          className="absolute right-0 top-0 h-full w-4 cursor-ew-resize bg-border/50 hover:bg-border transition-colors flex items-center justify-center group z-50"
          onMouseDown={handleMouseDown}
        >
          <div className="w-1 h-16 rounded-full bg-border transition-colors" />
        </div>
        
        {/* Width indicator */}
        {isResizing && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-foreground text-background px-3 py-1 rounded-md text-sm font-mono z-30 pointer-events-none">
            {Math.round(dragWidth)}px
          </div>
        )}
      </div>
    </div>
  );
}