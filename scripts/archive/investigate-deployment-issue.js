import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function investigateDeploymentIssue() {
  console.log('🔍 Investigating Deployment Issue...\n');

  try {
    // 1. Get the latest deployment from queue
    console.log('1️⃣ Checking latest deployment from queue...');
    const { data: latestDeployment, error: deploymentError } = await supabase
      .from('deployment_queue')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (deploymentError) {
      console.error('Error fetching deployment:', deploymentError);
      return;
    }

    console.log('Latest deployment:', {
      id: latestDeployment.id,
      project_id: latestDeployment.project_id,
      status: latestDeployment.status,
      deployment_type: latestDeployment.deployment_type,
      domain: latestDeployment.domain,
      live_url: latestDeployment.live_url,
      netlify_site_id: latestDeployment.netlify_site_id,
      created_at: latestDeployment.created_at,
      error_message: latestDeployment.error_message
    });

    // 2. Get project details
    console.log('\n2️⃣ Fetching project details...');
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', latestDeployment.project_id)
      .single();

    if (projectError) {
      console.error('Error fetching project:', projectError);
      return;
    }

    console.log('Project details:', {
      id: project.id,
      name: project.name,
      subdomain: project.subdomain,
      custom_domain: project.custom_domain,
      netlify_site_id: project.netlify_site_id,
      deployment_status: project.deployment_status,
      deployment_url: project.deployment_url
    });

    // 3. Check for site ID mismatch
    console.log('\n3️⃣ Checking for Netlify site ID mismatch...');
    if (latestDeployment.netlify_site_id !== project.netlify_site_id) {
      console.log('⚠️  MISMATCH DETECTED!');
      console.log(`Deployment site ID: ${latestDeployment.netlify_site_id}`);
      console.log(`Project site ID: ${project.netlify_site_id}`);
    } else {
      console.log('✅ Site IDs match');
    }

    // 4. Check Netlify site cache
    console.log('\n4️⃣ Checking Netlify site cache...');
    const { data: cacheEntries, error: cacheError } = await supabase
      .from('netlify_site_cache')
      .select('*')
      .or(`site_id.eq.${latestDeployment.netlify_site_id},site_id.eq.${project.netlify_site_id}`)
      .order('created_at', { ascending: false });

    if (!cacheError && cacheEntries) {
      console.log(`Found ${cacheEntries.length} cache entries:`);
      cacheEntries.forEach(entry => {
        console.log(`- Site ID: ${entry.site_id}`);
        console.log(`  Domain: ${entry.domain}`);
        console.log(`  URL: ${entry.url}`);
        console.log(`  Created: ${entry.created_at}`);
        console.log('---');
      });
    }

    // 5. Check all projects for conflicting site IDs
    console.log('\n5️⃣ Checking for conflicting Netlify site IDs across projects...');
    const { data: allProjects, error: allProjectsError } = await supabase
      .from('projects')
      .select('id, name, subdomain, netlify_site_id, deployment_url')
      .not('netlify_site_id', 'is', null);

    if (!allProjectsError && allProjects) {
      // Group by netlify_site_id
      const siteIdGroups = {};
      allProjects.forEach(proj => {
        if (!siteIdGroups[proj.netlify_site_id]) {
          siteIdGroups[proj.netlify_site_id] = [];
        }
        siteIdGroups[proj.netlify_site_id].push(proj);
      });

      // Find duplicates
      const duplicates = Object.entries(siteIdGroups).filter(([_, projects]) => projects.length > 1);
      
      if (duplicates.length > 0) {
        console.log('⚠️  DUPLICATE SITE IDS FOUND!');
        duplicates.forEach(([siteId, projects]) => {
          console.log(`\nSite ID: ${siteId} is used by ${projects.length} projects:`);
          projects.forEach(proj => {
            console.log(`  - ${proj.name} (ID: ${proj.id}, subdomain: ${proj.subdomain})`);
          });
        });
      } else {
        console.log('✅ No duplicate site IDs found');
      }
    }

    // 6. Check recent deployments for pattern
    console.log('\n6️⃣ Checking recent deployments for patterns...');
    const { data: recentDeployments, error: recentError } = await supabase
      .from('deployment_queue')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (!recentError && recentDeployments) {
      console.log(`\nLast ${recentDeployments.length} deployments:`);
      recentDeployments.forEach(dep => {
        console.log(`- ${dep.created_at} | Project: ${dep.project_id} | Status: ${dep.status}`);
        console.log(`  Domain: ${dep.domain} | Site ID: ${dep.netlify_site_id}`);
        if (dep.error_message) {
          console.log(`  Error: ${dep.error_message}`);
        }
      });
    }

    // 7. Check for "Bright Smiles Dental" project
    console.log('\n7️⃣ Looking for "Bright Smiles Dental" project...');
    const { data: dentalProjects, error: dentalError } = await supabase
      .from('projects')
      .select('*')
      .or('name.ilike.%bright%smiles%,name.ilike.%dental%');

    if (!dentalError && dentalProjects && dentalProjects.length > 0) {
      console.log(`Found ${dentalProjects.length} dental-related projects:`);
      dentalProjects.forEach(proj => {
        console.log(`- ${proj.name} (ID: ${proj.id})`);
        console.log(`  Subdomain: ${proj.subdomain}`);
        console.log(`  Netlify Site ID: ${proj.netlify_site_id}`);
        console.log(`  Deployment URL: ${proj.deployment_url}`);
      });
    } else {
      console.log('No dental-related projects found');
    }

    // 8. Check if the wrong project's content is being deployed
    console.log('\n8️⃣ Checking deployment content source...');
    if (latestDeployment.project_id) {
      // Check pages for this project
      const { data: pages, error: pagesError } = await supabase
        .from('pages')
        .select('id, name, path, is_homepage')
        .eq('project_id', latestDeployment.project_id)
        .limit(5);

      if (!pagesError && pages) {
        console.log(`\nPages for project ${project.name}:`);
        pages.forEach(page => {
          console.log(`- ${page.name} (${page.path})${page.is_homepage ? ' [HOMEPAGE]' : ''}`);
        });
      }

      // Check a sample section content
      const { data: sections, error: sectionsError } = await supabase
        .from('sections')
        .select('id, type, content')
        .eq('project_id', latestDeployment.project_id)
        .limit(3);

      if (!sectionsError && sections) {
        console.log(`\nSample sections for project ${project.name}:`);
        sections.forEach(section => {
          const contentPreview = JSON.stringify(section.content).substring(0, 100);
          console.log(`- ${section.type}: ${contentPreview}...`);
        });
      }
    }

    // 9. Environment check
    console.log('\n9️⃣ Checking environment configuration...');
    console.log('Netlify access token present:', !!process.env.VITE_NETLIFY_ACCESS_TOKEN);
    console.log('Main Netlify site ID:', process.env.VITE_NETLIFY_SITE_ID);
    
    // Summary
    console.log('\n📊 INVESTIGATION SUMMARY:');
    console.log('========================');
    console.log(`Latest deployment was for: ${project.name}`);
    console.log(`Deployment status: ${latestDeployment.status}`);
    console.log(`Target domain: ${latestDeployment.domain}`);
    console.log(`Live URL: ${latestDeployment.live_url}`);
    
    if (latestDeployment.netlify_site_id === process.env.VITE_NETLIFY_SITE_ID) {
      console.log('\n⚠️  WARNING: Deployment is using the MAIN SITE ID!');
      console.log('This would overwrite the main Wondrous Digital site!');
    }

  } catch (error) {
    console.error('Investigation error:', error);
  }
}

// Run the investigation
investigateDeploymentIssue();