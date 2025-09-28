// Auto-generated component: Large Header Hero 
// Generated at: 2025-09-28T19:34:57.554Z
// Do not edit directly - edit in Core UI instead

'use client';

import { EditableSectionWrapper } from '@/components/shared/content-editor';
import type { EditableFieldConfig } from '@/lib/component-registry';

// Original component code
import { Bell, PlayCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const Hero13 = () => {
  return (
    <section className="py-32">
      <div className="container">
        <Badge
          variant="outline"
          className="mb-4 max-w-full text-sm font-normal lg:mb-10 lg:py-2 lg:pr-5 lg:pl-2"
        >
          <span className="mr-2 flex size-8 shrink-0 items-center justify-center rounded-full bg-accent">
            <Bell className="size-4" />
          </span>
          <p className="truncate whitespace-nowrap">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Commodi
            eaque distinctio iusto voluptas voluptatum sed!
          </p>
        </Badge>
        <h1 className="mb-6 text-4xl leading-none font-bold tracking-tighter md:text-[7vw] lg:text-8xl">
          Streamline your workflow experience.
        </h1>
        <p className="max-w-2xl text-muted-foreground md:text-[2vw] lg:text-xl">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Nostrum dolor
          assumenda voluptatem nemo magni a maiores aspernatur.
        </p>
        <div className="mt-6 flex flex-col gap-4 sm:flex-row lg:mt-10">
          <Button size="lg" className="w-full md:w-auto">
            Get a demo
          </Button>
          <Button size="lg" variant="outline" className="w-full md:w-auto">
            <PlayCircle className="mr-2 size-4" />
            Watch video
          </Button>
        </div>
      </div>
    </section>
  );
};

export { Hero13 };


// Base component (renamed for wrapping)
const Hero3Base = Hero13;

// Editable wrapper for LAB/BUILDER
export function Hero3(props: Record<string, unknown>) {
  const { editable = false, onContentUpdate, ...content } = props as {
    editable?: boolean;
    onContentUpdate?: (updates: Record<string, unknown>) => void;
    [key: string]: unknown;
  };

  // Production mode - return static component
  if (!editable) {
    return <Hero3Base {...content} />;
  }

  // Edit mode - wrap with editing capabilities
  return (
    <EditableSectionWrapper
      componentName="Hero3"
      content={content}
      editable={true}
      onContentUpdate={onContentUpdate || (() => {})}
    >
      <Hero3Base {...content} />
    </EditableSectionWrapper>
  );
}

// Export configuration for registry
export const hero3Config = {
  editableFields: [] as EditableFieldConfig[],
  defaultContent: {}
};
