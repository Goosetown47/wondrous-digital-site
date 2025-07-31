const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testDomainSystem() {
  console.log('=== Domain System Testing Guide ===\n');

  // 1. Get all domains
  const { data: domains, error } = await supabase
    .from('project_domains')
    .select('*, project:projects(id, name, slug)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching domains:', error);
    return;
  }

  console.log('📋 Current Domains in Database:\n');
  if (!domains || domains.length === 0) {
    console.log('  No domains found.');
  } else {
    domains.forEach(domain => {
      console.log(`  • ${domain.domain}`);
      console.log(`    Project: ${domain.project.name} (${domain.project.slug})`);
      console.log(`    Verified: ${domain.verified ? '✅' : '❌'}`);
      console.log(`    Created: ${new Date(domain.created_at).toLocaleDateString()}\n`);
    });
  }

  console.log('\n🧪 Testing Instructions:\n');
  
  console.log('1. LOCAL TESTING WITH SUBDOMAINS:');
  console.log('   - Add test domains to your hosts file:');
  console.log('     127.0.0.1  veterinary-one.localhost');
  console.log('     127.0.0.1  dentist-one.localhost');
  console.log('   - Visit http://veterinary-one.localhost:3000');
  console.log('   - The middleware should route to the correct project\n');

  console.log('2. ADD A TEST DOMAIN:');
  console.log('   - Go to Project Settings → Domains tab');
  console.log('   - Add a test domain like "mytest.localhost"');
  console.log('   - It should auto-verify in development mode\n');

  console.log('3. MIDDLEWARE ROUTING TEST:');
  console.log('   - Reserved domains (show admin UI):');
  console.log('     • localhost:3000');
  console.log('     • app.wondrousdigital.com');
  console.log('   - Customer domains (show project site):');
  console.log('     • veterinary-one.wondrousdigital.com');
  console.log('     • Any custom domain in project_domains table\n');

  console.log('4. CURRENT IMPLEMENTATION STATUS:');
  console.log('   ✅ Domain management UI');
  console.log('   ✅ Database storage');
  console.log('   ✅ Middleware routing');
  console.log('   ✅ Auto-verification in dev mode');
  console.log('   ❌ Vercel API integration');
  console.log('   ❌ Preview subdomains (*.sites.wondrousdigital.com)');
  console.log('   ❌ Real DNS verification\n');

  console.log('5. DNS CONFIGURATION (Production):');
  console.log('   CNAME Target: sites.wondrousdigital.com');
  console.log('   (Currently shows "domains.wondrousdigital.com" in UI - needs update)\n');

  // Show a test domain configuration
  console.log('6. EXAMPLE DOMAIN SETUP:');
  console.log('   To test locally, run this SQL in Supabase:');
  console.log(`
   INSERT INTO project_domains (project_id, domain, verified, verified_at)
   VALUES (
     (SELECT id FROM projects WHERE slug = 'test-project-1' LIMIT 1),
     'mytest.localhost',
     true,
     NOW()
   );
  `);

  console.log('\n=== End of Testing Guide ===');
}

testDomainSystem().catch(console.error);