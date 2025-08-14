import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase/admin';
import { cookies } from 'next/headers';
import { env } from '@/env.mjs';
import { sanitizeText } from '@/lib/sanitization';
// import { HeroTwoColumn } from '@/components/sections/hero-two-column'; // TODO: Use for actual rendering

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Verify authentication
    const cookieStore = await cookies();
    const authClient = createServerClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Ignore cookie setting errors
            }
          },
        },
      }
    );

    const { data: { user }, error: userError } = await authClient.auth.getUser();
    
    if (userError || !user) {
      return new Response('Not authenticated', { status: 401 });
    }

    // Create service role client to bypass RLS for lab drafts
    const serviceClient = createAdminClient();

    // Get the draft directly from database
    const { data: draft, error } = await serviceClient
      .from('lab_drafts')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !draft) {
      console.error('Error fetching lab draft:', error);
      return new Response('Draft not found', { status: 404 });
    }

    // TODO: This preview is hardcoded for hero sections.
    // Should dynamically render different section types based on draft.type and draft.component_name
    interface HeroSectionContent {
      heroContent: {
        heading: string;
        subtext: string;
        buttonText: string;
        buttonLink: string;
        imageUrl: string;
      };
    }
    
    const rawHeroContent = (draft.content && typeof draft.content === 'object' && 'heroContent' in draft.content) 
      ? ((draft.content as unknown) as HeroSectionContent).heroContent 
      : {
          heading: "Blocks Built With Shadcn & Tailwind",
          subtext: "Finely crafted components built with React, Tailwind and Shadcn UI.",
          buttonText: "Discover all components",
          buttonLink: "#",
          imageUrl: "",
        };

    // Sanitize all user-generated content to prevent XSS
    const heroContent = {
      heading: sanitizeText(rawHeroContent.heading),
      subtext: sanitizeText(rawHeroContent.subtext),
      buttonText: sanitizeText(rawHeroContent.buttonText),
      buttonLink: sanitizeText(rawHeroContent.buttonLink),
      imageUrl: sanitizeText(rawHeroContent.imageUrl),
    };

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${draft.name} - Preview</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body>
        <div id="root"></div>
        <script type="module">
          // Simple preview - in production, this would render the actual React component
          // NOTE: All content is sanitized before being inserted to prevent XSS attacks
          // Using innerHTML here is safe because we control the template and sanitize all dynamic values
          document.getElementById('root').innerHTML = \`
            <section class="w-full py-12 md:py-24 lg:py-32">
              <div class="container mx-auto px-4 md:px-6">
                <div class="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
                  <div class="flex flex-col justify-center space-y-4">
                    <div class="space-y-2">
                      <h1 class="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                        ${heroContent.heading}
                      </h1>
                      <p class="text-gray-600 md:text-xl">
                        ${heroContent.subtext}
                      </p>
                    </div>
                    <div class="flex flex-col gap-2 min-[400px]:flex-row">
                      <button class="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800">
                        ${heroContent.buttonText}
                      </button>
                      <button class="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                        View on GitHub
                      </button>
                    </div>
                  </div>
                  <div class="flex items-center justify-center">
                    <div class="relative w-full h-[400px] lg:h-[500px] bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                      <svg viewBox="0 0 200 200" class="w-48 h-48" fill="currentColor">
                        <path d="M100 30 L170 70 L170 130 L100 170 L30 130 L30 70 Z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          \`;
        </script>
      </body>
      </html>
    `;

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch {
    return new Response('Internal Server Error', { status: 500 });
  }
}