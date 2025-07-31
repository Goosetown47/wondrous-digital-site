const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkDomains() {
  console.log('=== Domain System Check ===\n');

  // 1. Check project_domains table structure
  console.log('1. Checking project_domains table structure...');
  try {
    const { data: columns, error: columnsError } = await supabase
      .from('project_domains')
      .select('*')
      .limit(0);
    
    if (columnsError) {
      console.error('Error checking table structure:', columnsError);
    } else {
      console.log('✓ project_domains table exists');
    }
  } catch (err) {
    console.error('Table check error:', err);
  }

  // 2. Get all domains
  console.log('\n2. Fetching all domains...');
  const { data: domains, error: domainsError } = await supabase
    .from('project_domains')
    .select('*')
    .order('created_at', { ascending: false });

  if (domainsError) {
    console.error('Error fetching domains:', domainsError);
  } else if (!domains || domains.length === 0) {
    console.log('No domains found in the database');
  } else {
    console.log(`Found ${domains.length} domain(s):\n`);
    domains.forEach((domain, index) => {
      console.log(`Domain #${index + 1}:`);
      console.log(`  - Domain: ${domain.domain}`);
      console.log(`  - Project ID: ${domain.project_id}`);
      console.log(`  - Primary: ${domain.is_primary}`);
      console.log(`  - Verified: ${domain.verified}`);
      console.log(`  - Verified at: ${domain.verified_at || 'Not verified'}`);
      console.log(`  - Created: ${new Date(domain.created_at).toLocaleString()}\n`);
    });
  }

  // 3. Check projects with domains
  console.log('3. Checking projects with domains...');
  const { data: projects, error: projectsError } = await supabase
    .from('projects')
    .select('id, name, slug')
    .order('name');

  if (projectsError) {
    console.error('Error fetching projects:', projectsError);
  } else if (projects) {
    console.log(`\nTotal projects: ${projects.length}`);
    
    // For each project, check if it has domains
    for (const project of projects) {
      const { data: projectDomains } = await supabase
        .from('project_domains')
        .select('domain, verified')
        .eq('project_id', project.id);
      
      if (projectDomains && projectDomains.length > 0) {
        console.log(`\n✓ ${project.name} (${project.slug}):`);
        projectDomains.forEach(d => {
          console.log(`  - ${d.domain} ${d.verified ? '(verified)' : '(pending)'}`);
        });
      }
    }
  }

  // 4. Check for test domains
  console.log('\n\n4. Checking for test/localhost domains...');
  const { data: testDomains } = await supabase
    .from('project_domains')
    .select('*')
    .or('domain.ilike.%localhost%,domain.ilike.%test%,domain.ilike.%example%');

  if (testDomains && testDomains.length > 0) {
    console.log(`Found ${testDomains.length} test domain(s):`);
    testDomains.forEach(d => {
      console.log(`  - ${d.domain}`);
    });
  } else {
    console.log('No test domains found');
  }

  console.log('\n=== End of Domain Check ===');
}

checkDomains().catch(console.error);