import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function verifyDentistDeployment() {
  console.log('🦷 Verifying Dentist-1 Deployment Status...\n');

  try {
    // Get project details
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('subdomain', 'dentist-1')
      .single();

    if (projectError) {
      console.error('Error fetching project:', projectError);
      return;
    }

    console.log('Project Details:');
    console.log(`  Name: ${project.name}`);
    console.log(`  Subdomain: ${project.subdomain}`);
    console.log(`  Deployment Status: ${project.deployment_status}`);
    console.log(`  Netlify Site ID: ${project.netlify_site_id}`);
    console.log(`  Last Updated: ${new Date(project.updated_at).toLocaleString()}\n`);

    // Get pages
    const { data: pages, error: pagesError } = await supabase
      .from('pages')
      .select('id, title, slug, is_homepage')
      .eq('project_id', project.id)
      .order('created_at');

    if (!pagesError && pages) {
      console.log(`Pages (${pages.length}):`)
      pages.forEach(page => {
        console.log(`  - ${page.title} (${page.slug})${page.is_homepage ? ' [Homepage]' : ''}`);
      });
    }

    // Get deployment queue entries
    const { data: deployments, error: deployError } = await supabase
      .from('deployment_queue')
      .select('*')
      .eq('project_id', project.id)
      .order('created_at', { ascending: false })
      .limit(5);

    if (!deployError && deployments) {
      console.log(`\nRecent Deployments (${deployments.length}):`)
      deployments.forEach(dep => {
        console.log(`  - ${new Date(dep.created_at).toLocaleString()}: ${dep.status}`);
        if (dep.error_message) {
          console.log(`    Error: ${dep.error_message}`);
        }
        if (dep.live_url) {
          console.log(`    Live URL: ${dep.live_url}`);
        }
      });
    }

    // Check Netlify site cache
    const { data: cache, error: cacheError } = await supabase
      .from('netlify_site_cache')
      .select('*')
      .eq('site_id', project.netlify_site_id)
      .single();

    if (!cacheError && cache) {
      console.log('\nNetlify Site Cache:');
      console.log(`  URL: ${cache.url}`);
      console.log(`  Custom Domain: ${cache.custom_domain || 'Not set'}`);
      console.log(`  State: ${cache.state}`);
      console.log(`  Updated: ${new Date(cache.updated_at).toLocaleString()}`);
    }

    console.log('\n✅ Deployment Status Summary:');
    console.log(`The dentist-1 project is marked as "${project.deployment_status}"`);
    console.log(`Live at: https://dentist-1.wondrousdigital.com`);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

verifyDentistDeployment();