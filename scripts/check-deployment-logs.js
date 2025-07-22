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

async function checkDeploymentLogs() {
  console.log('=== Checking Deployment Logs ===');
  console.log('Deployment ID: 34cb9778-9977-4dc5-9105-947765000538');
  console.log('');

  try {
    // Get the deployment record
    const { data: deployment, error: deploymentError } = await supabase
      .from('deployment_queue')
      .select('*')
      .eq('id', '34cb9778-9977-4dc5-9105-947765000538')
      .single();

    if (deploymentError) {
      console.error('Error fetching deployment:', deploymentError);
      return;
    }

    if (!deployment) {
      console.error('Deployment not found');
      return;
    }

    console.log('Deployment Details:');
    console.log('- Project ID:', deployment.project_id);
    console.log('- Status:', deployment.status);
    console.log('- Domain:', deployment.domain);
    console.log('- Live URL:', deployment.live_url);
    console.log('- Netlify Site ID:', deployment.netlify_site_id);
    console.log('- Created:', new Date(deployment.created_at).toLocaleString());
    console.log('- Updated:', new Date(deployment.updated_at).toLocaleString());
    console.log('');

    // Check the logs
    console.log('=== Deployment Logs ===');
    if (deployment.logs) {
      const logs = typeof deployment.logs === 'string' ? JSON.parse(deployment.logs) : deployment.logs;
      
      // Pretty print the logs
      console.log(JSON.stringify(logs, null, 2));
      
      // Analyze for errors
      console.log('\n=== Log Analysis ===');
      
      // Check for error entries
      const errorEntries = logs.filter(entry => 
        entry.level === 'error' || 
        (entry.message && entry.message.toLowerCase().includes('error')) ||
        (entry.details && JSON.stringify(entry.details).toLowerCase().includes('error'))
      );
      
      if (errorEntries.length > 0) {
        console.log(`Found ${errorEntries.length} error entries:`);
        errorEntries.forEach((entry, i) => {
          console.log(`\nError ${i + 1}:`);
          console.log('- Timestamp:', entry.timestamp);
          console.log('- Message:', entry.message);
          if (entry.details) {
            console.log('- Details:', JSON.stringify(entry.details, null, 2));
          }
        });
      } else {
        console.log('No explicit errors found in logs');
      }
      
      // Check for pages and sections info
      const pageEntries = logs.filter(entry => 
        entry.message && (
          entry.message.includes('pages') || 
          entry.message.includes('sections') ||
          entry.message.includes('Exporting page')
        )
      );
      
      if (pageEntries.length > 0) {
        console.log(`\n=== Page/Section Related Entries ===`);
        pageEntries.forEach(entry => {
          console.log(`\n- ${entry.timestamp}: ${entry.message}`);
          if (entry.details) {
            console.log('  Details:', JSON.stringify(entry.details, null, 2));
          }
        });
      }
      
      // Check deployment flow
      console.log('\n=== Deployment Flow ===');
      const flowSteps = [
        'Starting deployment',
        'Fetching project data',
        'Exporting pages',
        'Creating Netlify site',
        'Uploading to Netlify',
        'Deployment complete'
      ];
      
      flowSteps.forEach(step => {
        const entry = logs.find(log => log.message && log.message.includes(step));
        if (entry) {
          console.log(`✓ ${step} - ${entry.timestamp}`);
        } else {
          console.log(`✗ ${step} - NOT FOUND`);
        }
      });
      
    } else {
      console.log('No logs found for this deployment');
    }

    // Check error field
    if (deployment.error) {
      console.log('\n=== Deployment Error Field ===');
      console.log(deployment.error);
    }

    // Get project details
    console.log('\n=== Project Details ===');
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*, pages(count)')
      .eq('id', deployment.project_id)
      .single();

    if (project) {
      console.log('- Project Name:', project.name);
      console.log('- Subdomain:', project.subdomain);
      console.log('- Custom Domain:', project.custom_domain);
      console.log('- Status:', project.status);
      console.log('- Page Count:', project.pages[0]?.count || 0);
    }

    // Check if pages exist
    const { data: pages, error: pagesError } = await supabase
      .from('pages')
      .select('id, title, slug, status')
      .eq('project_id', deployment.project_id);

    if (pages && pages.length > 0) {
      console.log(`\n=== Pages (${pages.length}) ===`);
      pages.forEach(page => {
        console.log(`- ${page.title} (${page.slug}) - Status: ${page.status}`);
      });
    } else {
      console.log('\n=== No pages found for this project ===');
    }

  } catch (error) {
    console.error('Script error:', error);
  }
}

checkDeploymentLogs();