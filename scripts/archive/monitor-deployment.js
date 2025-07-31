import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  'https://bpdhbxvsguklkbusqtke.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGhieHZzZ3VrbGtidXNxdGtlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTMzNzI4OCwiZXhwIjoyMDY2OTEzMjg4fQ.lbC3iZr7qc43HaxAL0UKnq38Qci4YleR0rLmuC9S5AM'
);

const deploymentId = process.argv[2];

async function monitorDeployment() {
  if (!deploymentId) {
    console.log('Usage: node monitor-deployment.js <deployment-id>');
    return;
  }
  
  console.log(`📊 Monitoring deployment: ${deploymentId}\n`);
  
  let lastStatus = null;
  let checkCount = 0;
  const maxChecks = 60; // Monitor for up to 5 minutes
  
  const checkDeployment = async () => {
    checkCount++;
    
    const { data: deployment, error } = await supabase
      .from('deployment_queue')
      .select('*')
      .eq('id', deploymentId)
      .single();
    
    if (error) {
      console.error('Error fetching deployment:', error);
      return false;
    }
    
    if (!deployment) {
      console.log('❌ Deployment not found');
      return false;
    }
    
    const statusChanged = deployment.status !== lastStatus;
    
    if (statusChanged) {
      const timestamp = new Date().toLocaleTimeString();
      console.log(`[${timestamp}] Status: ${deployment.status}`);
      
      if (deployment.status === 'processing') {
        console.log('   🔄 Deployment is being processed by Edge Function');
      } else if (deployment.status === 'completed') {
        console.log('   ✅ Deployment completed successfully!');
        if (deployment.live_url) {
          console.log(`   🌐 Live URL: ${deployment.live_url}`);
        }
        if (deployment.netlify_site_id) {
          console.log(`   📦 Netlify Site ID: ${deployment.netlify_site_id}`);
        }
        return false; // Stop monitoring
      } else if (deployment.status === 'failed') {
        console.log('   ❌ Deployment failed');
        console.log(`   Error: ${deployment.error_message}`);
        console.log(`   Attempts: ${deployment.attempt_count}`);
        return false; // Stop monitoring
      }
      
      if (deployment.logs) {
        console.log('   📝 Logs:', deployment.logs.slice(-100));
      }
      
      lastStatus = deployment.status;
    }
    
    return checkCount < maxChecks; // Continue monitoring
  };
  
  // Initial check
  const shouldContinue = await checkDeployment();
  
  if (shouldContinue) {
    console.log('\n⏳ Monitoring deployment... (checking every 5 seconds)\n');
    
    // Set up interval
    const interval = setInterval(async () => {
      const continueMonitoring = await checkDeployment();
      
      if (!continueMonitoring) {
        clearInterval(interval);
        console.log('\n✨ Monitoring complete');
        process.exit(0);
      }
    }, 5000);
  }
}

monitorDeployment();