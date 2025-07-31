import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function monitorDentistDeployment() {
  console.log('=== Monitoring Dentist Project Deployment ===\n');

  try {
    // 1. Get the dentist project
    console.log('1. Fetching dentist project...');
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('subdomain', 'dentist-1')
      .single();

    if (projectError) {
      console.error('Error fetching project:', projectError);
      return;
    }

    console.log('Project found:', {
      id: project.id,
      name: project.name,
      subdomain: project.subdomain,
      deployment_status: project.deployment_status,
      netlify_site_id: project.netlify_site_id,
      live_url: project.live_url
    });

    // 2. Queue a new deployment
    console.log('\n2. Queueing new deployment...');
    const { data: deployment, error: deployError } = await supabase
      .from('deployment_queue')
      .insert({
        project_id: project.id,
        status: 'pending',
        domain: project.subdomain ? `${project.subdomain}.wondrousdigital.com` : null,
        deployment_type: 'publish'
      })
      .select()
      .single();

    if (deployError) {
      console.error('Error queueing deployment:', deployError);
      return;
    }

    console.log('Deployment queued:', {
      id: deployment.id,
      status: deployment.status,
      domain: deployment.domain
    });

    // 3. Monitor the deployment
    console.log('\n3. Monitoring deployment progress...');
    let attempts = 0;
    const maxAttempts = 30; // 5 minutes max
    let lastStatus = deployment.status;

    while (attempts < maxAttempts) {
      await sleep(10000); // Wait 10 seconds between checks
      attempts++;

      // Check deployment queue status
      const { data: queueStatus, error: queueError } = await supabase
        .from('deployment_queue')
        .select('*')
        .eq('id', deployment.id)
        .single();

      if (queueError) {
        console.error('Error checking queue:', queueError);
        continue;
      }

      // Check project deployment status
      const { data: projectStatus, error: projectStatusError } = await supabase
        .from('projects')
        .select('deployment_status, netlify_site_id, live_url')
        .eq('id', project.id)
        .single();

      if (projectStatusError) {
        console.error('Error checking project:', projectStatusError);
        continue;
      }

      // Log status if changed
      if (queueStatus.status !== lastStatus || attempts % 3 === 1) {
        console.log(`\n[${new Date().toLocaleTimeString()}] Status check #${attempts}:`);
        console.log('Queue status:', {
          status: queueStatus.status,
          netlify_deploy_id: queueStatus.netlify_deploy_id,
          error_message: queueStatus.error_message,
          started_at: queueStatus.started_at,
          completed_at: queueStatus.completed_at
        });
        console.log('Project status:', {
          deployment_status: projectStatus.deployment_status,
          netlify_site_id: projectStatus.netlify_site_id,
          live_url: projectStatus.live_url
        });
      }

      lastStatus = queueStatus.status;

      // If deployment completed, check the actual site
      if (queueStatus.status === 'completed' && projectStatus.live_url) {
        console.log('\n4. Checking deployed site...');
        
        try {
          const response = await fetch(projectStatus.live_url);
          console.log('Site response:', {
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries())
          });

          if (response.ok) {
            const html = await response.text();
            console.log('Site content preview (first 500 chars):', html.substring(0, 500));
            
            // Check if it contains expected content
            const hasTitle = html.includes('<title>');
            const hasReact = html.includes('react') || html.includes('React');
            const hasVite = html.includes('vite') || html.includes('Vite');
            
            console.log('\nContent checks:', {
              hasTitle,
              hasReact,
              hasVite,
              htmlLength: html.length
            });
          }
        } catch (fetchError) {
          console.error('Error fetching site:', fetchError);
        }

        break;
      }

      // If deployment failed, show error and stop
      if (queueStatus.status === 'failed') {
        console.log('\nDeployment failed!');
        break;
      }
    }

    if (attempts >= maxAttempts) {
      console.log('\nDeployment monitoring timed out after 5 minutes');
    }

    // 5. Final status check
    console.log('\n5. Final status check...');
    const { data: finalQueue } = await supabase
      .from('deployment_queue')
      .select('*')
      .eq('id', deployment.id)
      .single();

    const { data: finalProject } = await supabase
      .from('projects')
      .select('*')
      .eq('id', project.id)
      .single();

    console.log('\nFinal deployment queue entry:', finalQueue);
    console.log('\nFinal project state:', {
      deployment_status: finalProject.deployment_status,
      netlify_site_id: finalProject.netlify_site_id,
      live_url: finalProject.live_url,
      updated_at: finalProject.updated_at
    });

  } catch (error) {
    console.error('Error in monitoring:', error);
  }
}

// Run the monitor
monitorDentistDeployment();