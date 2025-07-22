import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://bpdhbxvsguklkbusqtke.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGhieHZzZ3VrbGtidXNxdGtlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTMzNzI4OCwiZXhwIjoyMDY2OTEzMjg4fQ.lbC3iZr7qc43HaxAL0UKnq38Qci4YleR0rLmuC9S5AM'
);

const deploymentId = 'd396fac7-9c60-4f26-9a96-c282cd643afb';

async function monitorDeployment() {
  console.log('📊 Monitoring deployment:', deploymentId);
  console.log('Press Ctrl+C to stop monitoring\n');
  
  let lastStatus = null;
  
  const checkStatus = async () => {
    const { data, error } = await supabase
      .from('deployment_queue')
      .select('*')
      .eq('id', deploymentId)
      .single();
    
    if (error) {
      console.error('Error checking status:', error);
      return;
    }
    
    if (data.status !== lastStatus) {
      lastStatus = data.status;
      const timestamp = new Date().toLocaleTimeString();
      console.log(`[${timestamp}] Status: ${data.status}`);
      
      if (data.status === 'processing') {
        console.log('   ⚙️  Edge function is processing the deployment...');
      } else if (data.status === 'completed') {
        console.log('   ✅ Deployment completed successfully!');
        
        // Check deployment logs
        const { data: logs } = await supabase
          .from('deployment_logs')
          .select('*')
          .eq('deployment_id', deploymentId)
          .order('created_at', { ascending: true });
        
        if (logs && logs.length > 0) {
          console.log('\n📝 Deployment logs:');
          logs.forEach(log => {
            const logTime = new Date(log.created_at).toLocaleTimeString();
            console.log(`   [${logTime}] ${log.log_level.toUpperCase()}: ${log.message}`);
          });
        }
        
        // Check if deployment URL was updated
        const { data: project } = await supabase
          .from('projects')
          .select('deployment_url, deployment_status')
          .eq('id', '923eb256-26eb-4cf3-8e64-ddd1297863c0')
          .single();
        
        if (project) {
          console.log('\n🌐 Project deployment info:');
          console.log(`   Deployment URL: ${project.deployment_url}`);
          console.log(`   Deployment Status: ${project.deployment_status}`);
        }
        
        if (data.payload?.deploymentResult?.deployment_url) {
          console.log(`\n🔗 Live URL: ${data.payload.deploymentResult.deployment_url}`);
        }
        
        process.exit(0);
      } else if (data.status === 'failed') {
        console.log(`   ❌ Deployment failed: ${data.error_message}`);
        process.exit(1);
      }
    }
  };
  
  // Check immediately
  await checkStatus();
  
  // Then check every 5 seconds
  setInterval(checkStatus, 5000);
}

monitorDeployment().catch(console.error);