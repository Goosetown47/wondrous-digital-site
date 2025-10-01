-- Component Export Migration
-- Generated: 2025-09-30T18:30:24.197Z
-- Components: 6
--
-- INSTRUCTIONS:
-- 1. Review this SQL carefully before applying
-- 2. Apply to PROD database via Supabase Dashboard
-- 3. Go to SQL Editor and paste this entire file
-- 4. Click "Run" to execute
-- 5. Verify components appear in core_components table
--

-- Component: Bentobox with Images
INSERT INTO core_components (
  id,
  name,
  code_name,
  type,
  source,
  code,
  dependencies,
  imports,
  metadata,
  deployment_status,
  pipeline_status,
  auto_number,
  base_type,
  default_content,
  editable_fields,
  created_at,
  updated_at
) VALUES (
  '0837cbd7-effd-41fd-88ae-0172c93f92cc',
  'Bentobox with Images',
  'Bentobox1',
  'section',
  'shadcnblocks.com',
  'import { Clock, Zap } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const Feature261 = () => {
  return (
    <section className="py-32">
      <div className="container">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-6 lg:grid-cols-12">
          <div className="relative h-60 overflow-hidden rounded-3xl md:col-span-2 md:row-span-2 md:h-[400px] lg:col-span-4 lg:h-full">
            <img
              src="https://deifkwefumgah.cloudfront.net/shadcnblocks/block/photos/Minimalist Concrete Wall with Shadows.jpeg"
              alt="shadcn UI components showcase"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0" />
            <div className="absolute bottom-6 left-6 z-10 text-white">
              <p className="text-lg font-medium">
                Experience Design Excellence.
              </p>
            </div>
            <div className="absolute right-6 top-6 z-10">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                <Zap className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>

          <div className="relative h-60 overflow-hidden rounded-3xl border md:col-span-2 md:row-span-2 md:h-[400px] lg:col-span-4 lg:h-full">
            <img
              src="https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-1.svg"
              alt="shadcn UI component library"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute bottom-6 left-6 right-6 z-10">
              <h2 className="text-sm font-medium leading-tight md:text-base lg:text-xl">
                Build your interface with stunning components and modern design.
              </h2>
            </div>
          </div>

          <Card className="col-span-1 rounded-3xl md:col-span-2 md:row-span-1 md:h-[192px] lg:col-span-2">
            <CardContent className="flex h-full flex-col justify-center p-4 md:p-6">
              <div className="mb-2 text-4xl font-bold md:text-4xl lg:text-6xl">
                95
                <span className="align-top text-2xl md:text-xl lg:text-3xl">
                  %
                </span>
              </div>
              <p className="text-sm leading-tight md:text-sm">
                Developers choose us
                <br />
                for our exceptional quality
              </p>
            </CardContent>
          </Card>

          <div className="relative col-span-1 h-60 overflow-hidden rounded-3xl border md:col-span-2 md:row-span-1 md:h-[192px] lg:col-span-2">
            <img
              src="https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-2.svg"
              alt="shadcn UI components"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>

          <Card className="bg-muted col-span-1 rounded-3xl md:col-span-4 md:row-span-1 md:h-[300px] lg:col-span-4">
            <CardContent className="h-full p-4 md:p-5">
              <div className="flex h-full flex-col justify-end">
                <div className="space-y-2">
                  <div className="text-4xl font-normal md:text-5xl lg:text-6xl">
                    $299
                  </div>
                  <div className="text-muted-foreground">
                    Premium Component Library
                  </div>
                  <Button>Buy Now</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-1 rounded-3xl md:col-span-2 md:row-span-1 md:h-[300px] lg:col-span-3">
            <CardContent className="flex h-full flex-col justify-center p-4 md:p-5">
              <div className="mb-3">
                <span className="text-4xl font-bold md:text-3xl lg:text-6xl">
                  300
                </span>
                <span className="align-top text-2xl font-bold md:text-xl lg:text-3xl">
                  +
                </span>
              </div>
              <p className="mb-4 text-sm md:text-sm">Delighted developers</p>
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Avatar
                    key={i}
                    className="border-border h-8 w-8 border-2 md:h-8 md:w-8 lg:h-10 lg:w-10"
                  >
                    <AvatarImage src={`/images/block/avatar-${i + 1}.webp`} />
                    <AvatarFallback>DEV{i}</AvatarFallback>
                  </Avatar>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="relative col-span-1 h-60 overflow-hidden rounded-3xl md:col-span-3 md:row-span-1 md:h-[300px] lg:col-span-5">
            <img
              src="https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-3.svg"
              alt="shadcn UI components"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </Card>

          <Card className="relative col-span-1 h-60 overflow-hidden rounded-3xl md:col-span-3 md:row-span-1 md:h-[300px] lg:col-span-4">
            <img
              src="https://deifkwefumgah.cloudfront.net/shadcnblocks/block/photos/Geometric Staircase and Concrete Wall.jpeg"
              alt="shadcn UI development"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
            <div className="absolute inset-0 z-10 flex items-center justify-start p-4 md:p-6">
              <div className="text-white">
                <div className="mb-2 flex items-center gap-2 md:gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 md:h-7 md:w-7">
                    <Clock className="h-3 w-3 md:h-4 md:w-4" />
                  </div>
                  <span className="text-base font-semibold md:text-lg">
                    Rapid Development
                  </span>
                </div>
                <p className="text-sm opacity-90 md:text-sm">
                  Build your interface faster
                  <br />
                  <span className="text-sm font-semibold md:text-sm">
                    with ready-to-use components
                  </span>
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export { Feature261 };
',
  '[]',
  '[]',
  '{}',
  '{"dev":false,"prod":false,"staging":false,"github_pr":null,"files_created":false,"last_deployment":null,"registry_updated":false}',
  'created',
  NULL,
  NULL,
  NULL,
  '[]',
  '2025-09-30T18:09:50.635+00:00',
  '2025-09-30T18:09:50.635+00:00'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  code_name = EXCLUDED.code_name,
  type = EXCLUDED.type,
  source = EXCLUDED.source,
  code = EXCLUDED.code,
  dependencies = EXCLUDED.dependencies,
  imports = EXCLUDED.imports,
  metadata = EXCLUDED.metadata,
  deployment_status = EXCLUDED.deployment_status,
  pipeline_status = EXCLUDED.pipeline_status,
  auto_number = EXCLUDED.auto_number,
  base_type = EXCLUDED.base_type,
  default_content = EXCLUDED.default_content,
  editable_fields = EXCLUDED.editable_fields,
  updated_at = EXCLUDED.updated_at;


-- Component: Wondrous Hero
INSERT INTO core_components (
  id,
  name,
  code_name,
  type,
  source,
  code,
  dependencies,
  imports,
  metadata,
  deployment_status,
  pipeline_status,
  auto_number,
  base_type,
  default_content,
  editable_fields,
  created_at,
  updated_at
) VALUES (
  'c5a7a3e0-65db-41f6-8100-df483dad7433',
  'Wondrous Hero',
  'Hero1',
  'section',
  'expansions',
  'import { ChevronRight } from "lucide-react";

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
',
  '["npm install lucide-react","npx shadcn@latest add button"]',
  '[]',
  '{}',
  '{"dev":false,"prod":false,"staging":false,"github_pr":null,"files_created":false,"last_deployment":null,"registry_updated":false}',
  'created',
  NULL,
  NULL,
  NULL,
  '[]',
  '2025-09-28T17:18:16.471+00:00',
  '2025-09-28T17:18:16.471+00:00'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  code_name = EXCLUDED.code_name,
  type = EXCLUDED.type,
  source = EXCLUDED.source,
  code = EXCLUDED.code,
  dependencies = EXCLUDED.dependencies,
  imports = EXCLUDED.imports,
  metadata = EXCLUDED.metadata,
  deployment_status = EXCLUDED.deployment_status,
  pipeline_status = EXCLUDED.pipeline_status,
  auto_number = EXCLUDED.auto_number,
  base_type = EXCLUDED.base_type,
  default_content = EXCLUDED.default_content,
  editable_fields = EXCLUDED.editable_fields,
  updated_at = EXCLUDED.updated_at;


-- Component: Logo Hero
INSERT INTO core_components (
  id,
  name,
  code_name,
  type,
  source,
  code,
  dependencies,
  imports,
  metadata,
  deployment_status,
  pipeline_status,
  auto_number,
  base_type,
  default_content,
  editable_fields,
  created_at,
  updated_at
) VALUES (
  '2405d786-1d1d-420d-9477-2e1ae234255a',
  'Logo Hero',
  'Hero2',
  'section',
  'expansions',
  'import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/*
 * pattern generated at https://www.fffuel.co/ooorganize/
 */

const Hero10 = () => {
  return (
    <section className="relative p-0">
      <div className="absolute h-full w-full bg-[url(''https://deifkwefumgah.cloudfront.net/shadcnblocks/block/patterns/grid1.svg'')] bg-contain bg-repeat opacity-100 [mask-image:linear-gradient(to_right,theme(colors.border),transparent,transparent,theme(colors.border))] lg:block"></div>
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

export { Hero10 };
',
  '["npx shadcn@latest add badge","npx shadcn@latest add button"]',
  '[]',
  '{}',
  '{"dev":false,"prod":false,"staging":false,"github_pr":null,"files_created":false,"last_deployment":null,"registry_updated":false}',
  'created',
  NULL,
  NULL,
  NULL,
  '[]',
  '2025-09-28T19:04:57.978+00:00',
  '2025-09-28T19:04:57.978+00:00'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  code_name = EXCLUDED.code_name,
  type = EXCLUDED.type,
  source = EXCLUDED.source,
  code = EXCLUDED.code,
  dependencies = EXCLUDED.dependencies,
  imports = EXCLUDED.imports,
  metadata = EXCLUDED.metadata,
  deployment_status = EXCLUDED.deployment_status,
  pipeline_status = EXCLUDED.pipeline_status,
  auto_number = EXCLUDED.auto_number,
  base_type = EXCLUDED.base_type,
  default_content = EXCLUDED.default_content,
  editable_fields = EXCLUDED.editable_fields,
  updated_at = EXCLUDED.updated_at;


-- Component: Large Header Hero 
INSERT INTO core_components (
  id,
  name,
  code_name,
  type,
  source,
  code,
  dependencies,
  imports,
  metadata,
  deployment_status,
  pipeline_status,
  auto_number,
  base_type,
  default_content,
  editable_fields,
  created_at,
  updated_at
) VALUES (
  '7f455547-83ea-48e8-81f7-3fbd1cfe0736',
  'Large Header Hero ',
  'Hero3',
  'section',
  'expansions',
  'import { Bell, PlayCircle } from "lucide-react";

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
',
  '["npm install lucide-react","npx shadcn@latest add badge","npx shadcn@latest add button"]',
  '[]',
  '{}',
  '{"dev":false,"prod":false,"staging":false,"github_pr":null,"files_created":false,"last_deployment":null,"registry_updated":false}',
  'created',
  NULL,
  NULL,
  NULL,
  '[]',
  '2025-09-28T19:34:57.479+00:00',
  '2025-09-28T19:34:57.479+00:00'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  code_name = EXCLUDED.code_name,
  type = EXCLUDED.type,
  source = EXCLUDED.source,
  code = EXCLUDED.code,
  dependencies = EXCLUDED.dependencies,
  imports = EXCLUDED.imports,
  metadata = EXCLUDED.metadata,
  deployment_status = EXCLUDED.deployment_status,
  pipeline_status = EXCLUDED.pipeline_status,
  auto_number = EXCLUDED.auto_number,
  base_type = EXCLUDED.base_type,
  default_content = EXCLUDED.default_content,
  editable_fields = EXCLUDED.editable_fields,
  updated_at = EXCLUDED.updated_at;


-- Component: Modern Minimal Hero
INSERT INTO core_components (
  id,
  name,
  code_name,
  type,
  source,
  code,
  dependencies,
  imports,
  metadata,
  deployment_status,
  pipeline_status,
  auto_number,
  base_type,
  default_content,
  editable_fields,
  created_at,
  updated_at
) VALUES (
  '442bc63b-06fc-4fab-8fb1-65f310a5db20',
  'Modern Minimal Hero',
  'Hero4',
  'section',
  'shadcn',
  'import { ArrowRight } from "lucide-react";
import { BiLogoPlayStore } from "react-icons/bi";
import { FaApple } from "react-icons/fa";
import { SiTrustpilot } from "react-icons/si";

import { Button } from "@/components/ui/button";

const Hero15 = () => {
  return (
    <section className="py-32">
      <div className="container">
        <a
          href="#"
          className="group mx-auto mb-4 flex w-fit items-center rounded-full bg-muted px-4 py-2 text-sm transition-colors hover:bg-muted/80"
        >
          <span className="mr-1 font-semibold">What&apos;s new</span>
          <div className="mx-2 h-3.5 w-px bg-muted-foreground/70"></div>
          Read more
          <ArrowRight className="ml-2 inline size-4 transition-transform group-hover:translate-x-0.5" />
        </a>
        <h1 className="mx-auto my-4 mb-6 max-w-3xl text-center text-3xl font-bold lg:text-5xl">
          Efficient tools that simplify your workflow.
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-center text-muted-foreground lg:text-xl">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Nostrum dolor
          assumenda voluptatem nemo magni a maiores aspernatur.
        </p>
        <div className="flex justify-center">
          <Button
            size="lg"
            className="w-full shadow-sm transition-shadow hover:shadow-md sm:w-auto lg:mt-10"
          >
            Get started for free
          </Button>
        </div>
        <div className="mt-8 lg:mt-12">
          <ul className="flex flex-wrap justify-center gap-6 text-sm lg:text-base">
            <li className="flex items-center gap-2 whitespace-nowrap">
              <BiLogoPlayStore className="size-5" />
              4.7 rating on Play Store
            </li>
            <li className="flex items-center gap-2 whitespace-nowrap">
              <FaApple className="size-5" />
              4.8 rating on App Store
            </li>
            <li className="flex items-center gap-2 whitespace-nowrap">
              <SiTrustpilot className="size-5" />
              4.9 rating on Trustpilot
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export { Hero15 };
',
  '["npm install lucide-react react-icons","npx shadcn@latest add button"]',
  '[]',
  '{}',
  '{"dev":false,"prod":false,"staging":false,"github_pr":null,"files_created":false,"last_deployment":null,"registry_updated":false}',
  'created',
  NULL,
  NULL,
  NULL,
  '[]',
  '2025-09-28T20:34:36.111+00:00',
  '2025-09-28T20:34:36.111+00:00'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  code_name = EXCLUDED.code_name,
  type = EXCLUDED.type,
  source = EXCLUDED.source,
  code = EXCLUDED.code,
  dependencies = EXCLUDED.dependencies,
  imports = EXCLUDED.imports,
  metadata = EXCLUDED.metadata,
  deployment_status = EXCLUDED.deployment_status,
  pipeline_status = EXCLUDED.pipeline_status,
  auto_number = EXCLUDED.auto_number,
  base_type = EXCLUDED.base_type,
  default_content = EXCLUDED.default_content,
  editable_fields = EXCLUDED.editable_fields,
  updated_at = EXCLUDED.updated_at;


-- Component: Animated Text Hero
INSERT INTO core_components (
  id,
  name,
  code_name,
  type,
  source,
  code,
  dependencies,
  imports,
  metadata,
  deployment_status,
  pipeline_status,
  auto_number,
  base_type,
  default_content,
  editable_fields,
  created_at,
  updated_at
) VALUES (
  '083566d0-38d2-4f4c-98cc-23eafafbefcc',
  'Animated Text Hero',
  'Hero5',
  'section',
  'expansions',
  'import { TrendingUp, Users, Zap } from "lucide-react";
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
',
  '["npx shadcn@latest add https://ui.aceternity.com/registry/container-text-flip.json","npm install lucide-react react","npx shadcn@latest add button"]',
  '[]',
  '{}',
  '{"dev":false,"prod":false,"staging":false,"github_pr":null,"files_created":false,"last_deployment":null,"registry_updated":false}',
  'created',
  NULL,
  NULL,
  NULL,
  '[]',
  '2025-09-28T22:40:20.916+00:00',
  '2025-09-28T22:40:20.916+00:00'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  code_name = EXCLUDED.code_name,
  type = EXCLUDED.type,
  source = EXCLUDED.source,
  code = EXCLUDED.code,
  dependencies = EXCLUDED.dependencies,
  imports = EXCLUDED.imports,
  metadata = EXCLUDED.metadata,
  deployment_status = EXCLUDED.deployment_status,
  pipeline_status = EXCLUDED.pipeline_status,
  auto_number = EXCLUDED.auto_number,
  base_type = EXCLUDED.base_type,
  default_content = EXCLUDED.default_content,
  editable_fields = EXCLUDED.editable_fields,
  updated_at = EXCLUDED.updated_at;

-- Migration complete!
-- 6 component(s) exported
