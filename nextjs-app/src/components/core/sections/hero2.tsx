// Auto-generated component: Logo Hero
// Generated at: 2025-09-28T19:34:57.554Z
// Do not edit directly - edit in Core UI instead

'use client';

import { EditableSectionWrapper } from '@/components/shared/content-editor';
import type { EditableFieldConfig } from '@/lib/component-registry';

// Original component code
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const Hero2Original = () => {
  return (
    <section className="relative p-0">
      <div className="absolute h-full w-full bg-[url('https://deifkwefumgah.cloudfront.net/shadcnblocks/block/patterns/grid1.svg')] bg-contain bg-repeat opacity-100 [mask-image:linear-gradient(to_right,theme(colors.border),transparent,transparent,theme(colors.border))] lg:block"></div>
      <div className="container py-28 md:py-32">
        <div className="mx-auto flex max-w-5xl flex-col items-center">
          <div className="z-10 mx-auto flex max-w-5xl flex-col items-center gap-6 text-center">
            <Badge
              variant="outline"
              className="hover:bg-secondary/20 transition-colors"
            >
              New Release
            </Badge>
            <div>
              <h1 className="mb-6 text-pretty text-4xl font-bold tracking-tight md:text-5xl lg:text-7xl">
                This is a heading for your new project
              </h1>
              <p className="text-muted-foreground mx-auto max-w-2xl md:text-lg lg:text-xl">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Elig
                doloremque mollitia fugiat omnis! Porro facilis quo animi
                consequatur.
              </p>
            </div>

            <div className="mt-6 flex items-center gap-4">
              <Button>Get Started</Button>
              <Button variant="outline">Learn More</Button>
            </div>

            <div className="mt-12 flex flex-col items-center gap-4 lg:mt-16">
              <p className="text-muted-foreground text-center text-sm">
                Powering the next generation of digital products
              </p>
              <div className="grid grid-cols-2 place-items-center items-center justify-center gap-6 opacity-80 sm:grid-cols-4 sm:gap-4">
                <img
                  src="https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/shadcn-ui-wordmark.svg"
                  alt="ShadCN UI"
                  className="h-6 dark:invert"
                />
                <img
                  src="https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/vercel-wordmark.svg"
                  alt="Vercel"
                  className="h-5 dark:invert"
                />
                <img
                  src="https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/supabase-wordmark.svg"
                  alt="Supabase"
                  className="h-6 dark:hidden"
                />
                <img
                  src="https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/supabase-wordmark-dark.svg"
                  alt="Supabase"
                  className="hidden h-6 dark:block"
                />
                <img
                  src="https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/tailwind-wordmark-light.svg"
                  alt="Tailwind CSS"
                  className="h-5 dark:hidden"
                />
                <img
                  src="https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/tailwind-wordmark-dark.svg"
                  alt="Tailwind CSS"
                  className="hidden h-5 dark:block"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export { Hero2Original };

// Base component (renamed for wrapping)
const Hero2Base = Hero2Original;

// Editable wrapper for LAB/BUILDER
export function Hero2(props: Record<string, unknown>) {
  const { editable = false, onContentUpdate, ...content } = props as {
    editable?: boolean;
    onContentUpdate?: (updates: Record<string, unknown>) => void;
    [key: string]: unknown;
  };

  // Production mode - return static component
  if (!editable) {
    return <Hero2Base {...content} />;
  }

  // Edit mode - wrap with editing capabilities
  return (
    <EditableSectionWrapper
      componentName="Hero2"
      content={content}
      editable={true}
      onContentUpdate={onContentUpdate || (() => {})}
    >
      <Hero2Base {...content} />
    </EditableSectionWrapper>
  );
}

// Export configuration for registry
export const hero2Config = {
  editableFields: [] as EditableFieldConfig[],
  defaultContent: {}
};