import { TemplateRenderer } from '../src/lib/templateRenderer.ts';

// Test content for hero section
const heroContent = {
  headline: {
    text: "Test Hero Headline",
    color: "#1F0A42",
    lineHeight: "1.1"
  },
  description: {
    text: "This is a test description for the hero section.",
    color: "#6B7280",
    lineHeight: "1.6"
  },
  primaryButton: {
    text: "Get Started",
    href: "#",
    variant: "primary"
  },
  heroImage: {
    src: "https://example.com/image.jpg",
    alt: "Hero image"
  },
  backgroundColor: "#FFFFFF"
};

// Test template (simplified version)
const heroTemplate = `
<section class="section section-hero {{#if heroImage.src}}hero-split{{else}}hero{{/if}}" style="background-color: {{backgroundColor}}">
  <div class="container">
    <div class="hero-content">
      <h1 style="color: {{headline.color}}; line-height: {{headline.lineHeight}}">{{headline.text}}</h1>
      {{#if description.text}}
      <p style="color: {{description.color}}; line-height: {{description.lineHeight}}">{{description.text}}</p>
      {{/if}}
    </div>
  </div>
</section>`;

// Test site styles
const siteStyles = {
  button_style: 'default',
  primary_button_size: 'medium',
  primary_button_radius: 'slightly-rounded'
};

console.log('Testing template rendering...\n');

try {
  const renderedHtml = TemplateRenderer.render(heroTemplate, {
    ...heroContent,
    _siteStyles: siteStyles,
    _sectionType: 'hero'
  });
  
  console.log('Rendered HTML:');
  console.log('==============');
  console.log(renderedHtml);
  
  console.log('\n\nKey observations:');
  console.log('- The HTML is rendered with CSS classes like "section", "hero-split", "container"');
  console.log('- These classes need corresponding CSS to display properly');
  console.log('- The PageBuilder needs to include these CSS definitions');
  
} catch (error) {
  console.error('Error rendering template:', error);
}