// Auto-generated component: Awesome Hero
// Generated at: 2025-09-28T16:27:37.622Z
// Do not edit directly - edit in Core UI instead

'use client';

import { EditableSectionWrapper } from '@/components/shared/content-editor';
import type { EditableFieldConfig } from '@/lib/component-registry';

// Original component code
import { ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

const Hero6 = () => {
  return (
    <section className="py-32">
      <div className="container">
        <div className="mx-auto flex max-w-5xl flex-col items-center">
          <div className="z-10 flex flex-col items-center gap-8 text-center">
            <div className="max-w-3xl">
              <h1 className="mb-4 text-pretty text-4xl font-semibold lg:text-6xl">
                Build your next project with Blocks
              </h1>
              <p className="text-muted-foreground lg:text-xl">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Elig
                doloremque mollitia fugiat omnis! Porro facilis quo animi
                consequatur. Explicabo.
              </p>
            </div>
            <div className="flex w-full flex-col justify-center gap-2 sm:flex-row">
              <Button>
                Get started now
                <ChevronRight className="h-4" />
              </Button>
              <Button variant="ghost">
                Learn more
                <ChevronRight className="h-4" />
              </Button>
            </div>
          </div>
        </div>
        <div className="bg-border mx-auto mt-20 grid max-w-7xl gap-px p-px md:grid-cols-5">
          <img
            src="https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-1.svg"
            alt="placeholder"
            className="h-full max-h-[500px] w-full object-cover md:col-span-3 dark:invert"
          />
          <div className="relative md:col-span-2">
            <img
              src="https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-2.svg"
              alt="placeholder"
              className="h-full max-h-[500px] w-full object-cover dark:invert"
            />
            <Button variant="outline" className="absolute bottom-5 right-5">
              Learn more
              <ChevronRight className="h-4" />
            </Button>
          </div>
        </div>
        <div className="mx-auto mt-12 grid max-w-7xl grid-cols-2 place-items-center gap-6 md:grid-cols-4">
          <img
            src="https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/shadcn-ui-wordmark.svg"
            alt="logo"
            className="h-5 sm:h-7 dark:invert"
          />
          <img
            src="https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/nextjs-wordmark.svg"
            alt="logo"
            className="h-9 sm:h-11 dark:invert"
          />
          <img
            src="https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/tailwind-wordmark-light.svg"
            alt="logo"
            className="h-4 sm:h-6 dark:hidden"
          />
          <img
            src="https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/tailwind-wordmark-dark.svg"
            alt="logo"
            className="hidden h-4 sm:h-6 dark:block"
          />
          <img
            src="https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/vercel-wordmark.svg"
            alt="logo"
            className="h-6 sm:h-7 dark:invert"
          />
        </div>
      </div>
    </section>
  );
};

export { Hero6 };


// Base component (renamed for wrapping)
const Hero1Base = Hero1;

// Editable wrapper for LAB/BUILDER
export function Hero1(props: any) {
  const { editable = false, onContentUpdate, ...content } = props;

  // Production mode - return static component
  if (!editable) {
    return <Hero1Base {...content} />;
  }

  // Edit mode - wrap with editing capabilities
  return (
    <EditableSectionWrapper
      componentName="Hero1"
      content={content}
      editable={true}
      onContentUpdate={onContentUpdate}
    >
      <Hero1Base {...content} />
    </EditableSectionWrapper>
  );
}

// Export configuration for registry
export const hero1Config = {
  editableFields: [] as EditableFieldConfig[],
  defaultContent: {}
};
