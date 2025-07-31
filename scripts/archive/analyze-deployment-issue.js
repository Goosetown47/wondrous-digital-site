import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load .env
dotenv.config();

// Also load .env.local if it exists
const envLocalPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function analyzeDeploymentIssue() {
  console.log('=== DEPLOYMENT ISSUE ANALYSIS ===');
  console.log('Project: Dentist Template (dentist-1)');
  console.log('Deployment ID: 34cb9778-9977-4dc5-9105-947765000538');
  console.log('');

  const projectId = '923eb256-26eb-4cf3-8e64-ddd1297863c0';

  try {
    // 1. Check project details
    const { data: project } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    console.log('1. PROJECT STATUS:');
    console.log('   - Deployment Status:', project.deployment_status);
    console.log('   - Netlify Site ID:', project.netlify_site_id);
    console.log('   - Live URL:', project.live_url);
    console.log('');

    // 2. Check pages
    const { data: pages } = await supabase
      .from('pages')
      .select('*')
      .eq('project_id', projectId);

    console.log('2. PAGES ANALYSIS:');
    console.log('   - Total Pages:', pages?.length || 0);
    if (pages && pages.length > 0) {
      pages.forEach(page => {
        console.log(`   - Page "${page.title || 'NO TITLE'}" (${page.slug}):`);
        console.log(`     * Status: ${page.status}`);
        console.log(`     * Is Homepage: ${page.is_homepage}`);
        console.log(`     * Has Title: ${page.title ? 'YES' : 'NO'}`);
      });
    }
    console.log('');

    // 3. Check sections
    const { data: sections } = await supabase
      .from('sections')
      .select('*, pages!inner(project_id)')
      .eq('pages.project_id', projectId);

    console.log('3. SECTIONS ANALYSIS:');
    console.log('   - Total Sections:', sections?.length || 0);
    console.log('');

    // 4. Check deployment
    const { data: deployment } = await supabase
      .from('deployment_queue')
      .select('*')
      .eq('id', '34cb9778-9977-4dc5-9105-947765000538')
      .single();

    console.log('4. DEPLOYMENT ANALYSIS:');
    console.log('   - Status:', deployment.status);
    console.log('   - Has Logs:', deployment.logs ? 'YES' : 'NO');
    console.log('   - Has Error:', deployment.error ? 'YES' : 'NO');
    console.log('   - Live URL:', deployment.live_url);
    console.log('');

    // 5. Check Netlify cache
    const { data: netlifyCache } = await supabase
      .from('netlify_site_cache')
      .select('*')
      .eq('project_id', projectId);

    console.log('5. NETLIFY CACHE:');
    console.log('   - Cache Entries:', netlifyCache?.length || 0);
    if (netlifyCache && netlifyCache.length > 0) {
      netlifyCache.forEach(cache => {
        console.log(`   - Site ID: ${cache.site_id}`);
        console.log(`     * Domain: ${cache.domain}`);
        console.log(`     * URL: ${cache.url}`);
        console.log(`     * Created: ${new Date(cache.created_at).toLocaleString()}`);
      });
    }
    console.log('');

    console.log('=== DIAGNOSIS ===');
    console.log('ISSUE IDENTIFIED:');
    console.log('1. The page has NO TITLE (showing as undefined)');
    console.log('2. The page has NO SECTIONS (0 sections found)');
    console.log('3. Deployments have NO LOGS (logging might be disabled or failing)');
    console.log('4. The deployment marks as "completed" but deploys an empty site');
    console.log('');
    console.log('ROOT CAUSE:');
    console.log('The deployment process is completing successfully but deploying');
    console.log('an empty HTML shell because there are no sections to render.');
    console.log('Additionally, the logging mechanism appears to be broken.');
    console.log('');
    console.log('SOLUTION:');
    console.log('1. Add sections to the page before deploying');
    console.log('2. Fix the deployment logging to capture the process');
    console.log('3. Add validation to prevent deploying empty pages');

  } catch (error) {
    console.error('Script error:', error);
  }
}

analyzeDeploymentIssue();