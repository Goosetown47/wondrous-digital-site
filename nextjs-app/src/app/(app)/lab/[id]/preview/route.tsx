import { labDraftService } from '@/lib/supabase/lab-drafts';
import { HeroTwoColumn } from '@/components/sections/hero-two-column';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const draft = await labDraftService.getById(id);
    
    if (!draft) {
      return new Response('Draft not found', { status: 404 });
    }

    const heroContent = draft.content?.heroContent || {
      heading: "Blocks Built With Shadcn & Tailwind",
      subtext: "Finely crafted components built with React, Tailwind and Shadcn UI.",
      buttonText: "Discover all components",
      buttonLink: "#",
      imageUrl: "",
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
  } catch (error) {
    return new Response('Internal Server Error', { status: 500 });
  }
}