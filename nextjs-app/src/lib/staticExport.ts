import type { Section } from '@/stores/builderStore';
import type { HeroContent } from '@/schemas/section';

function renderHeroSection(content: HeroContent): string {
  return `
    <section 
      class="hero-section"
      style="
        background-color: ${content.backgroundColor};
        color: ${content.textColor};
        ${content.backgroundImage ? `background-image: url(${content.backgroundImage});` : ''}
        background-size: cover;
        background-position: center;
        min-height: 500px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 4rem 1rem;
      "
    >
      <div style="max-width: 48rem; margin: 0 auto; text-align: center;">
        <h1 style="
          font-size: 3rem;
          font-weight: bold;
          margin-bottom: 1.5rem;
          line-height: 1.2;
        ">
          ${content.headline}
        </h1>
        
        <p style="
          font-size: 1.25rem;
          margin-bottom: 2rem;
          opacity: 0.9;
        ">
          ${content.subheadline}
        </p>
        
        <a 
          href="${content.buttonLink}"
          style="
            display: inline-block;
            background-color: ${content.buttonBackgroundColor};
            color: ${content.buttonTextColor};
            padding: 0.75rem 2rem;
            border-radius: 0.375rem;
            font-weight: 600;
            text-decoration: none;
            transition: opacity 0.2s;
          "
          onmouseover="this.style.opacity='0.9'"
          onmouseout="this.style.opacity='1'"
        >
          ${content.buttonText}
        </a>
      </div>
    </section>
  `;
}

export function generateStaticHTML(sections: Section[]): string {
  const sectionHTML = sections
    .map((section) => {
      if (section.type === 'hero') {
        return renderHeroSection(section.content as HeroContent);
      }
      // Add more section types here as they're implemented
      return '';
    })
    .join('\n');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated Site</title>
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        line-height: 1.6;
      }
      
      @media (max-width: 768px) {
        .hero-section h1 {
          font-size: 2rem !important;
        }
        .hero-section p {
          font-size: 1rem !important;
        }
      }
    </style>
</head>
<body>
    ${sectionHTML}
</body>
</html>
  `.trim();
}