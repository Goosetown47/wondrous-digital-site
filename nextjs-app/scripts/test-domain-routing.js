const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testDomainRouting() {
  console.log('=== Domain Routing Test ===\n');

  // 1. Get the test domain
  const { data: domains, error } = await supabase
    .from('project_domains')
    .select('*, project:projects(*)')
    .eq('domain', 'veterinary-one.wondrousdigital.com')
    .single();

  if (error) {
    console.error('Error fetching domain:', error);
    return;
  }

  console.log('Test Domain Configuration:');
  console.log(`  Domain: ${domains.domain}`);
  console.log(`  Project: ${domains.project.name} (ID: ${domains.project.id})`);
  console.log(`  Verified: ${domains.verified}`);
  console.log(`  Project Slug: ${domains.project.slug}`);

  // 2. Check middleware configuration
  console.log('\n\nMiddleware Configuration:');
  console.log('  Reserved domains: localhost, app.wondrousdigital.com, vercel.app');
  console.log('  Customer domain routing: Enabled via project_domains table lookup');
  console.log('  Route rewriting: /sites/[projectId]/[[...slug]]');

  // 3. Show expected behavior
  console.log('\n\nExpected Routing Behavior:');
  console.log('  1. Request to veterinary-one.wondrousdigital.com');
  console.log('  2. Middleware checks if domain is reserved (it\'s not)');
  console.log('  3. Looks up domain in project_domains table');
  console.log('  4. Finds project ID: ' + domains.project_id);
  console.log('  5. Rewrites URL to: /sites/' + domains.project_id + '/[path]');
  console.log('  6. Sites route renders the project content');

  // 4. Check if project has pages
  const { data: pages } = await supabase
    .from('pages')
    .select('path, title')
    .eq('project_id', domains.project_id);

  console.log('\n\nProject Pages:');
  if (pages && pages.length > 0) {
    pages.forEach(page => {
      console.log(`  - ${page.path} (${page.title || 'Untitled'})`);
    });
  } else {
    console.log('  No pages found for this project');
  }

  // 5. Check preview domain format
  console.log('\n\nPreview Domain (planned):');
  console.log(`  Format: ${domains.project.slug}.sites.wondrousdigital.com`);
  console.log('  Status: Not yet implemented (requires wildcard domain setup)');

  // 6. DNS Instructions
  console.log('\n\nDNS Configuration for Custom Domains:');
  console.log('  Type: CNAME');
  console.log('  Target: sites.wondrousdigital.com');
  console.log('  Note: Currently shows domains.wondrousdigital.com in UI (needs update)');

  console.log('\n=== End of Domain Routing Test ===');
}

testDomainRouting().catch(console.error);