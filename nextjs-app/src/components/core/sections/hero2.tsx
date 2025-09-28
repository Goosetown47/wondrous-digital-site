import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/**
 * Hero2 - Logo Hero
 * Auto-generated component from Core Pipeline
 * Source: expansions
 */

const Hero2 = () => {
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

// Export configuration for the component registry
export const hero2Config = {
  name: 'Hero2',
  type: 'section',
  category: 'hero',
  description: 'Logo Hero with badges and partner logos',
  source: 'expansions'
};

export { Hero2 };