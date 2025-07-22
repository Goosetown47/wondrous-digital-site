-- Add html_template column to section_templates table for Phase 2 unified rendering

-- Add the new columns
ALTER TABLE section_templates 
ADD COLUMN IF NOT EXISTS html_template TEXT,
ADD COLUMN IF NOT EXISTS template_engine VARCHAR DEFAULT 'handlebars',
ADD COLUMN IF NOT EXISTS parent_template_id UUID REFERENCES section_templates(id),
ADD COLUMN IF NOT EXISTS variables_schema JSONB;

-- Ensure customizable_fields is never null
ALTER TABLE section_templates 
ALTER COLUMN customizable_fields SET DEFAULT '{}';

UPDATE section_templates 
SET customizable_fields = '{}' 
WHERE customizable_fields IS NULL;

-- Add initial HTML templates for hero section
UPDATE section_templates
SET html_template = '
<section class="section section-hero {{#if heroImage.src}}hero-split{{else}}hero{{/if}}" style="background-color: {{backgroundColor}}">
  <div class="container">
    {{#if heroImage.src}}
    <div class="hero-split-wrapper">
      <div class="hero-content">
        <h1 style="color: {{headline.color}}; line-height: {{headline.lineHeight}}">{{headline.text}}</h1>
        {{#if description.text}}
        <p style="color: {{description.color}}; line-height: {{description.lineHeight}}">{{description.text}}</p>
        {{/if}}
        <div class="hero-buttons">
          {{#if primaryButton.text}}
          <a href="{{primaryButton.href}}" class="btn btn-{{primaryButton.variant}} btn-{{_buttonSize}} btn-radius-{{_buttonRadius}} btn-style-{{_buttonStyle}}">
            {{primaryButton.text}}
          </a>
          {{/if}}
          {{#if secondaryButton.text}}
          <a href="{{secondaryButton.href}}" class="btn btn-{{secondaryButton.variant}} btn-{{_buttonSize}} btn-radius-{{_buttonRadius}} btn-style-{{_buttonStyle}}">
            {{secondaryButton.text}}
          </a>
          {{/if}}
        </div>
      </div>
      <div class="hero-image">
        <img src="{{heroImage.src}}" alt="{{heroImage.alt}}">
      </div>
    </div>
    {{else}}
    <div class="hero-content">
      <h1 style="color: {{headline.color}}; line-height: {{headline.lineHeight}}">{{headline.text}}</h1>
      {{#if description.text}}
      <p style="color: {{description.color}}; line-height: {{description.lineHeight}}">{{description.text}}</p>
      {{/if}}
      <div class="hero-buttons">
        {{#if primaryButton.text}}
        <a href="{{primaryButton.href}}" class="btn btn-{{primaryButton.variant}} btn-{{_buttonSize}} btn-radius-{{_buttonRadius}} btn-style-{{_buttonStyle}}">
          {{primaryButton.text}}
        </a>
        {{/if}}
        {{#if secondaryButton.text}}
        <a href="{{secondaryButton.href}}" class="btn btn-{{secondaryButton.variant}} btn-{{_buttonSize}} btn-radius-{{_buttonRadius}} btn-style-{{_buttonStyle}}">
          {{secondaryButton.text}}
        </a>
        {{/if}}
      </div>
    </div>
    {{/if}}
  </div>
</section>'
WHERE section_type = 'hero';

-- Add HTML template for features section
UPDATE section_templates
SET html_template = '
<section class="section section-features" style="background-color: {{backgroundColor}}">
  <div class="container">
    {{#if tagline.text}}
    <p class="tagline text-center" style="color: {{tagline.color}}">{{tagline.text}}</p>
    {{/if}}
    {{#if mainHeading.text}}
    <h2 class="text-center mb-4" style="color: {{mainHeading.color}}">{{mainHeading.text}}</h2>
    {{/if}}
    {{#if description.text}}
    <p class="description text-center mb-4" style="color: {{description.color}}">{{description.text}}</p>
    {{/if}}
    <div class="grid grid-cols-{{_featureCount}}">
      {{#if feature1Heading.text}}
      <div class="feature-item">
        {{#if feature1Icon.icon}}
        <div class="feature-icon" style="color: {{feature1Icon.color}}">
          <i class="icon-{{feature1Icon.icon}}"></i>
        </div>
        {{/if}}
        <h3 style="color: {{feature1Heading.color}}">{{feature1Heading.text}}</h3>
        {{#if feature1Description.text}}
        <p style="color: {{feature1Description.color}}">{{feature1Description.text}}</p>
        {{/if}}
      </div>
      {{/if}}
      {{#if feature2Heading.text}}
      <div class="feature-item">
        {{#if feature2Icon.icon}}
        <div class="feature-icon" style="color: {{feature2Icon.color}}">
          <i class="icon-{{feature2Icon.icon}}"></i>
        </div>
        {{/if}}
        <h3 style="color: {{feature2Heading.color}}">{{feature2Heading.text}}</h3>
        {{#if feature2Description.text}}
        <p style="color: {{feature2Description.color}}">{{feature2Description.text}}</p>
        {{/if}}
      </div>
      {{/if}}
      {{#if feature3Heading.text}}
      <div class="feature-item">
        {{#if feature3Icon.icon}}
        <div class="feature-icon" style="color: {{feature3Icon.color}}">
          <i class="icon-{{feature3Icon.icon}}"></i>
        </div>
        {{/if}}
        <h3 style="color: {{feature3Heading.color}}">{{feature3Heading.text}}</h3>
        {{#if feature3Description.text}}
        <p style="color: {{feature3Description.color}}">{{feature3Description.text}}</p>
        {{/if}}
      </div>
      {{/if}}
      {{#if feature4Heading.text}}
      <div class="feature-item">
        {{#if feature4Icon.icon}}
        <div class="feature-icon" style="color: {{feature4Icon.color}}">
          <i class="icon-{{feature4Icon.icon}}"></i>
        </div>
        {{/if}}
        <h3 style="color: {{feature4Heading.color}}">{{feature4Heading.text}}</h3>
        {{#if feature4Description.text}}
        <p style="color: {{feature4Description.color}}">{{feature4Description.text}}</p>
        {{/if}}
      </div>
      {{/if}}
    </div>
    {{#if primaryButton.text}}
    <div class="text-center mt-4">
      <a href="{{primaryButton.href}}" class="btn btn-{{primaryButton.variant}} btn-{{_buttonSize}} btn-radius-{{_buttonRadius}} btn-style-{{_buttonStyle}}">
        {{primaryButton.text}}
      </a>
      {{#if secondaryButton.text}}
      <a href="{{secondaryButton.href}}" class="btn btn-{{secondaryButton.variant}} btn-{{_buttonSize}} btn-radius-{{_buttonRadius}} btn-style-{{_buttonStyle}}">
        {{secondaryButton.text}}
      </a>
      {{/if}}
    </div>
    {{/if}}
  </div>
</section>'
WHERE section_type = 'features';

-- Add HTML template for navigation section
UPDATE section_templates  
SET html_template = '
<nav class="section section-{{_sectionType}} {{_navClass}}" style="background-color: {{backgroundColor}}; color: {{textColor}}">
  <div class="container">
    <div class="nav-wrapper">
      <div class="nav-logo">
        {{#if logo.src}}
        <img src="{{logo.src}}" alt="{{logo.alt}}" class="logo-image">
        {{else}}
        <span class="logo-text">{{logo.text}}</span>
        {{/if}}
      </div>
      <div class="nav-menu">
        {{#each _navItems}}
        <a href="{{this.href}}" class="nav-link">{{this.text}}</a>
        {{/each}}
      </div>
      {{#if ctaButton1.text}}
      <div class="nav-cta">
        <a href="{{ctaButton1.href}}" class="btn btn-{{ctaButton1.variant}} btn-{{_buttonSize}} btn-radius-{{_buttonRadius}} btn-style-{{_buttonStyle}}">
          {{ctaButton1.text}}
        </a>
        {{#if ctaButton2.text}}
        <a href="{{ctaButton2.href}}" class="btn btn-{{ctaButton2.variant}} btn-{{_buttonSize}} btn-radius-{{_buttonRadius}} btn-style-{{_buttonStyle}}">
          {{ctaButton2.text}}
        </a>
        {{/if}}
      </div>
      {{/if}}
      {{#if _isMobile}}
      <button class="nav-toggle" aria-label="Menu">☰</button>
      {{/if}}
    </div>
  </div>
</nav>'
WHERE section_type IN ('navigation', 'navigation-desktop');