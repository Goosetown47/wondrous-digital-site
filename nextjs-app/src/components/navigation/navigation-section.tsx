'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface NavigationSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  isCollapsed?: boolean;
}

export function NavigationSection({
  title,
  children,
  defaultOpen = true,
  isCollapsed = false,
}: NavigationSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (isCollapsed) {
    return <div className="space-y-1">{children}</div>;
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="w-full">
        <div className="flex items-center justify-between px-3 py-2 text-sm font-semibold text-[#818181] hover:text-gray-700 transition-colors">
          <span>{title}</span>
          <ChevronDown
            className={cn(
              'w-4 h-4 transition-transform duration-200',
              isOpen && 'rotate-180'
            )}
          />
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-1">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}