import { createClient } from '@supabase/supabase-js';

// Use service role key for admin operations
const supabase = createClient(
  'https://bpdhbxvsguklkbusqtke.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGhieHZzZ3VrbGtidXNxdGtlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTMzNzI4OCwiZXhwIjoyMDY2OTEzMjg4fQ.lbC3iZr7qc43HaxAL0UKnq38Qci4YleR0rLmuC9S5AM'
);

async function triggerDentistDeployment() {
  console.log('🚀 Starting deployment process for dentist project...\n');
  
  try {
    // 1. Find the dentist project
    console.log('1️⃣ Finding dentist project...');
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .or('subdomain.eq.dentist-1,project_name.ilike.%dentist%')
      .single();
    
    if (projectError || !project) {
      throw new Error(`Failed to find dentist project: ${projectError?.message || 'Not found'}`);
    }
    
    console.log('✅ Project found:');
    console.log('  - ID:', project.id);
    console.log('  - Name:', project.project_name);
    console.log('  - Subdomain:', project.subdomain);
    console.log('  - Current deployment status:', project.deployment_status);
    console.log('  - Netlify site ID:', project.netlify_site_id || 'None');
    
    // 2. Create a simplified deployment payload
    // Since we can't use the services directly, we'll create a minimal payload
    const deploymentPayload = {
      subdomain: project.subdomain,
      deployment_domain: project.deployment_domain || `${project.subdomain}.netlify.app`,
      exportResult: {
        pages: [],
        assets: [],
        manifest: {
          projectId: project.id,
          projectName: project.project_name,
          exportedAt: new Date().toISOString(),
          pageCount: 0,
          assetCount: 0
        }
      },
      netlify_site_id: project.netlify_site_id
    };
    
    // 3. Add to deployment queue
    console.log('\n2️⃣ Adding to deployment queue...');
    const { data: deployment, error: deploymentError } = await supabase
      .from('deployment_queue')
      .insert({
        project_id: project.id,
        customer_id: project.customer_id,
        payload: deploymentPayload,
        priority: 0,
        status: 'queued'
      })
      .select()
      .single();
    
    if (deploymentError) {
      throw new Error(`Failed to queue deployment: ${deploymentError.message}`);
    }
    
    console.log('✅ Deployment queued successfully!');
    console.log('  - Deployment ID:', deployment.id);
    console.log('  - Status:', deployment.status);
    console.log('  - Created at:', new Date(deployment.created_at).toLocaleString());
    
    // 4. Trigger the Edge Function to process the queue
    console.log('\n3️⃣ Triggering Edge Function to process queue...');
    const { error: triggerError } = await supabase.functions.invoke('process-deployment-queue', {
      body: {}
    });
    
    if (triggerError) {
      console.warn('⚠️  Could not trigger Edge Function:', triggerError.message);
      console.log('  The deployment will be processed by the next cron job run.');
    } else {
      console.log('✅ Edge Function triggered successfully!');
    }
    
    // 5. Monitor deployment progress
    console.log('\n4️⃣ Monitoring deployment progress...');
    console.log('   Waiting for deployment to start processing...\n');
    
    let attempts = 0;
    const maxAttempts = 30; // 5 minutes (10 seconds each)
    
    const checkDeployment = async () => {
      attempts++;
      const { data: currentDeployment, error } = await supabase
        .from('deployment_queue')
        .select('*')
        .eq('id', deployment.id)
        .single();
      
      if (error || !currentDeployment) {
        console.error('Error checking deployment:', error);
        return;
      }
      
      const timestamp = new Date().toLocaleTimeString();
      console.log(`[${timestamp}] Status: ${currentDeployment.status}`);
      
      if (currentDeployment.status === 'processing') {
        console.log('  ⚙️  Deployment is being processed...');
      } else if (currentDeployment.status === 'completed') {
        console.log('\n🎉 Deployment completed successfully!');
        
        // Check if project was updated with deployment info
        const { data: updatedProject } = await supabase
          .from('projects')
          .select('deployment_status, deployment_url, netlify_site_id, last_deployed_at')
          .eq('id', project.id)
          .single();
        
        if (updatedProject) {
          console.log('\nProject deployment info:');
          console.log('  - Deployment status:', updatedProject.deployment_status);
          console.log('  - Deployment URL:', updatedProject.deployment_url);
          console.log('  - Netlify site ID:', updatedProject.netlify_site_id);
          console.log('  - Last deployed:', updatedProject.last_deployed_at);
          
          if (currentDeployment.payload?.live_url) {
            console.log('  - Live URL:', currentDeployment.payload.live_url);
          }
        }
        
        // Check deployment logs
        const { data: logs } = await supabase
          .from('deployment_logs')
          .select('*')
          .eq('deployment_id', deployment.id)
          .order('created_at', { ascending: true });
        
        if (logs && logs.length > 0) {
          console.log('\nDeployment logs:');
          logs.forEach(log => {
            const logTime = new Date(log.created_at).toLocaleTimeString();
            console.log(`  [${logTime}] ${log.log_level.toUpperCase()}: ${log.message}`);
          });
        }
        
        return true; // Deployment complete
      } else if (currentDeployment.status === 'failed') {
        console.log('\n❌ Deployment failed!');
        console.log('  Error:', currentDeployment.error_message);
        
        // Show deployment logs
        const { data: logs } = await supabase
          .from('deployment_logs')
          .select('*')
          .eq('deployment_id', deployment.id)
          .order('created_at', { ascending: true });
        
        if (logs && logs.length > 0) {
          console.log('\nDeployment logs:');
          logs.forEach(log => {
            const logTime = new Date(log.created_at).toLocaleTimeString();
            console.log(`  [${logTime}] ${log.log_level.toUpperCase()}: ${log.message}`);
          });
        }
        
        return true; // Stop monitoring
      }
      
      if (attempts >= maxAttempts) {
        console.log('\n⏱️  Timeout: Deployment is taking longer than expected.');
        console.log('  The deployment may still complete in the background.');
        console.log('  Deployment ID for tracking:', deployment.id);
        console.log('  You can check status with: scripts/check-specific-deployment.js');
        return true;
      }
      
      return false; // Continue monitoring
    };
    
    // Check immediately
    const initialComplete = await checkDeployment();
    if (!initialComplete) {
      // Then check every 10 seconds
      const interval = setInterval(async () => {
        const complete = await checkDeployment();
        if (complete) {
          clearInterval(interval);
          process.exit(0);
        }
      }, 10000);
    } else {
      process.exit(0);
    }
    
  } catch (error) {
    console.error('\n❌ Error triggering deployment:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run the script
console.log('🦷 Dentist Project Deployment Trigger\n');
console.log('This script will:');
console.log('  1. Find the dentist project');
console.log('  2. Queue a deployment (with minimal payload)');
console.log('  3. Trigger the Edge Function');
console.log('  4. Monitor the deployment progress\n');
console.log('Note: The Edge Function will handle the actual static export and deployment.\n');

triggerDentistDeployment();