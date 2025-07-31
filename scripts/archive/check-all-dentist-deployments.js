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

async function checkAllDentistDeployments() {
  console.log('=== Checking All Dentist Project Deployments ===');
  
  try {
    // First find the dentist project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('subdomain', 'dentist-1')
      .single();

    if (projectError || !project) {
      console.error('Could not find dentist project:', projectError);
      return;
    }

    console.log('Project Details:');
    console.log('- ID:', project.id);
    console.log('- Name:', project.name);
    console.log('- Subdomain:', project.subdomain);
    console.log('- Custom Domain:', project.custom_domain);
    console.log('- Status:', project.status);
    console.log('- Deployment Status:', project.deployment_status);
    console.log('- Netlify Site ID:', project.netlify_site_id);
    console.log('- Live URL:', project.live_url);
    console.log('');

    // Get all deployments for this project
    const { data: deployments, error: deploymentsError } = await supabase
      .from('deployment_queue')
      .select('*')
      .eq('project_id', project.id)
      .order('created_at', { ascending: false });

    if (deploymentsError) {
      console.error('Error fetching deployments:', deploymentsError);
      return;
    }

    console.log(`Found ${deployments.length} deployments for this project:\n`);

    deployments.forEach((deployment, index) => {
      console.log(`=== Deployment ${index + 1} ===`);
      console.log('- ID:', deployment.id);
      console.log('- Status:', deployment.status);
      console.log('- Domain:', deployment.domain);
      console.log('- Live URL:', deployment.live_url);
      console.log('- Netlify Site ID:', deployment.netlify_site_id);
      console.log('- Created:', new Date(deployment.created_at).toLocaleString());
      console.log('- Updated:', new Date(deployment.updated_at).toLocaleString());
      
      if (deployment.error) {
        console.log('- Error:', deployment.error);
      }
      
      if (deployment.logs) {
        console.log('- Has Logs: YES');
        const logs = typeof deployment.logs === 'string' ? JSON.parse(deployment.logs) : deployment.logs;
        console.log('- Log Entries:', logs.length);
        
        // Show first and last log entries
        if (logs.length > 0) {
          console.log('  First Entry:', logs[0].timestamp, '-', logs[0].message);
          console.log('  Last Entry:', logs[logs.length - 1].timestamp, '-', logs[logs.length - 1].message);
        }
      } else {
        console.log('- Has Logs: NO');
      }
      
      console.log('');
    });

    // Check pages for this project
    const { data: pages, error: pagesError } = await supabase
      .from('pages')
      .select('*, sections(count)')
      .eq('project_id', project.id);

    if (pages && pages.length > 0) {
      console.log(`=== Pages (${pages.length}) ===`);
      pages.forEach(page => {
        console.log(`- ${page.title} (${page.slug})`);
        console.log(`  Status: ${page.status}`);
        console.log(`  Sections: ${page.sections[0]?.count || 0}`);
        console.log(`  Is Homepage: ${page.is_homepage}`);
        console.log(`  Order: ${page.order}`);
      });
    } else {
      console.log('=== No pages found for this project ===');
    }

    // Check if there's a deployment in progress
    const inProgressDeployment = deployments.find(d => d.status === 'processing' || d.status === 'pending');
    if (inProgressDeployment) {
      console.log('\n⚠️  WARNING: There is a deployment in progress!');
      console.log('Deployment ID:', inProgressDeployment.id);
      console.log('Status:', inProgressDeployment.status);
    }

  } catch (error) {
    console.error('Script error:', error);
  }
}

checkAllDentistDeployments();