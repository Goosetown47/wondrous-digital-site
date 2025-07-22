import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://bpdhbxvsguklkbusqtke.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGhieHZzZ3VrbGtidXNxdGtlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTMzNzI4OCwiZXhwIjoyMDY2OTEzMjg4fQ.lbC3iZr7qc43HaxAL0UKnq38Qci4YleR0rLmuC9S5AM'
);

// Simplified section renderer for testing
function renderSection(section) {
  const { section_type, content } = section;
  
  switch (section_type) {
    case 'hero':
      return `
    <section class="hero-section" ${content.backgroundImage ? `style="background-image: url('${content.backgroundImage}')"` : ''}>
      <div class="container">
        <h1>${content.heading || 'Welcome'}</h1>
        ${content.subheading ? `<p class="hero-subtitle">${content.subheading}</p>` : ''}
        ${content.buttonText ? `<a href="${content.buttonLink || '#'}" class="btn btn-primary">${content.buttonText}</a>` : ''}
      </div>
    </section>`;
    
    case 'features':
      const featuresHtml = (content.features || []).map(f => `
        <div class="feature-item">
          ${f.icon ? `<div class="feature-icon">${f.icon}</div>` : ''}
          <h3>${f.title}</h3>
          <p>${f.description}</p>
        </div>
      `).join('');
      
      return `
    <section class="features-section">
      <div class="container">
        ${content.heading ? `<h2>${content.heading}</h2>` : ''}
        <div class="features-grid">
          ${featuresHtml}
        </div>
      </div>
    </section>`;
    
    case 'navigation':
      const navContent = content.content || content;
      const logo = navContent.logo || { text: 'Logo' };
      
      return `
    <nav class="main-navigation">
      <div class="container">
        <a href="/" class="logo">
          ${logo.text || 'Logo'}
        </a>
        <div class="nav-links">
          <a href="/">Home</a>
          <a href="/about">About</a>
          <a href="/services">Services</a>
          <a href="/contact">Contact</a>
        </div>
      </div>
    </nav>`;
    
    default:
      return `
    <section class="${section_type}-section">
      <div class="container">
        <div class="content">
          ${JSON.stringify(content, null, 2)}
        </div>
      </div>
    </section>`;
  }
}

async function testSectionRendering() {
  console.log('🎨 Testing section rendering for dentist template...\n');
  
  const projectId = '923eb256-26eb-4cf3-8e64-ddd1297863c0';
  
  // Get all sections
  const { data: sections, error } = await supabase
    .from('page_sections')
    .select('*')
    .eq('project_id', projectId)
    .order('order_index', { ascending: true });
  
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log(`Found ${sections.length} sections\n`);
  
  // Group by page
  const pageSections = {};
  const projectSections = [];
  
  sections.forEach(section => {
    if (section.page_id) {
      if (!pageSections[section.page_id]) {
        pageSections[section.page_id] = [];
      }
      pageSections[section.page_id].push(section);
    } else {
      projectSections.push(section);
    }
  });
  
  // Render project sections
  console.log('PROJECT-LEVEL SECTIONS:');
  console.log('======================\n');
  projectSections.forEach(section => {
    console.log(`Type: ${section.section_type}`);
    console.log('HTML:');
    console.log(renderSection(section));
    console.log('\n---\n');
  });
  
  // Render page sections
  console.log('\nPAGE SECTIONS:');
  console.log('==============\n');
  
  for (const [pageId, sections] of Object.entries(pageSections)) {
    console.log(`Page ID: ${pageId}`);
    sections.forEach(section => {
      console.log(`  Type: ${section.section_type}`);
      console.log('  HTML Preview:');
      const html = renderSection(section);
      console.log('  ' + html.trim().substring(0, 200) + '...\n');
    });
    console.log('');
  }
}

testSectionRendering();