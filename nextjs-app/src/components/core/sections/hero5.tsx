// Auto-generated component: Animated Text Hero
// Generated at: 2025-09-28T22:40:20.961Z
// Do not edit directly - edit in Core UI instead

'use client';

import { EditableSectionWrapper } from '@/components/shared/content-editor';
import type { EditableFieldConfig } from '@/lib/component-registry';

// Original component code
import { TrendingUp, Users, Zap } from "lucide-react";
import React from "react";

import { ContainerTextFlip } from "@/components/aceternity/container-text-flip";
import { Button } from "@/components/ui/button";

const Hero243 = () => {
  return (
    <section className="h-full w-screen overflow-hidden py-32">
      <div className="container border-b border-t border-dashed">
        <div className="relative flex w-full max-w-5xl flex-col justify-start border border-t-0 border-dashed px-5 py-12 md:items-center md:justify-center lg:mx-auto">
          <p className="text-muted-foreground flex items-center gap-2 gap-3 text-sm">
            <span className="inline-block size-2 rounded bg-green-500" />
            NEW BLOCKS IN 10 DAYS
          </p>
          <div className="mb-7 mt-3 w-full max-w-xl text-5xl font-medium font-semibold tracking-tighter md:mb-10 md:text-center md:text-6xl lg:relative lg:mb-0 lg:text-left lg:text-7xl">
            <h1 className="relative z-10 inline md:mr-3">
              A Smarter Way to <br className="block md:hidden" /> Build New{" "}
              <br className="block md:hidden" />
            </h1>
            <ContainerTextFlip
              className="absolute text-4xl font-medium font-semibold tracking-tighter md:bottom-4 md:left-1/2 md:-translate-x-1/2 md:text-5xl lg:-bottom-4 lg:left-auto lg:translate-x-0 lg:text-7xl"
              words={["Products", "Services", "Features", "Blocks"]}
            />
          </div>
        </div>
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-center border border-b-0 border-t-0 border-dashed py-20">
          <div className="w-full max-w-2xl space-y-5 md:text-center">
            <p className="text-muted-foreground px-5 lg:text-lg">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam,{" "}
            </p>
            <Button className="mx-5 h-12 rounded-lg">Get Started Now</Button>
          </div>
        </div>
        <ul className="md:h-34 mx-auto grid h-44 w-full max-w-5xl grid-cols-1 border border-b-0 border-dashed md:grid-cols-2 lg:h-24 lg:grid-cols-3">
          <li className="flex h-full items-center justify-between gap-10 px-5 md:gap-3 lg:justify-center">
            <div className="bg-muted flex size-12 items-center justify-center rounded-lg">
              <Zap className="text-muted-foreground size-6" />
            </div>
            <p className="text-muted-foreground text-lg">
              10x Faster Development
            </p>
          </li>
          <li className="flex h-full items-center justify-between gap-10 border-l border-t border-dashed px-5 md:gap-3 lg:justify-center lg:border-t-0">
            <div className="bg-muted flex size-12 items-center justify-center rounded-lg">
              <Users className="text-muted-foreground size-6" />
            </div>
            <p className="text-muted-foreground text-lg">10,000+ Developers</p>
          </li>
          <li className="col-span-1 flex h-full items-center justify-between gap-10 border-l border-t border-dashed px-5 md:col-span-2 md:justify-center md:gap-3 lg:col-span-1 lg:border-t-0">
            <div className="bg-muted flex size-12 items-center justify-center rounded-lg">
              <TrendingUp className="text-muted-foreground size-6" />
            </div>
            <p className="text-muted-foreground text-lg">
              25% Conversion Boost
            </p>
          </li>
        </ul>
      </div>
    </section>
  );
};

export { Hero243 };


// Base component (renamed for wrapping)
const Hero5Base = Hero243;

// Editable wrapper for LAB/BUILDER
export function Hero5(props: Record<string, unknown>) {
  const { editable = false, onContentUpdate, ...content } = props as {
    editable?: boolean;
    onContentUpdate?: (updates: Record<string, unknown>) => void;
    [key: string]: unknown;
  };

  // Production mode - return static component
  if (!editable) {
    return <Hero5Base {...content} />;
  }

  // Edit mode - wrap with editing capabilities
  return (
    <EditableSectionWrapper
      componentName="Hero5"
      content={content}
      editable={true}
      onContentUpdate={onContentUpdate || (() => {})}
    >
      <Hero5Base {...content} />
    </EditableSectionWrapper>
  );
}

// Export configuration for registry
export const hero5Config = {
  editableFields: [] as EditableFieldConfig[],
  defaultContent: {}
};
