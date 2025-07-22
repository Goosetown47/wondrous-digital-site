import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://bpdhbxvsguklkbusqtke.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGhieHZzZ3VrbGtidXNxdGtlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTMzNzI4OCwiZXhwIjoyMDY2OTEzMjg4fQ.lbC3iZr7qc43HaxAL0UKnq38Qci4YleR0rLmuC9S5AM'
);

async function checkDentistProject() {
  console.log('🦷 Checking Dentist Template deployment status...\n');
  
  // 1. Check project data
  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .or('subdomain.eq.dentist-1,project_name.ilike.%dentist%')
    .single();
  
  if (project) {
    console.log('Project found:');
    console.log('  ID:', project.id);
    console.log('  Name:', project.project_name);
    console.log('  Subdomain:', project.subdomain);
    console.log('  Deployment Domain:', project.deployment_domain);
    console.log('  Deployment Status:', project.deployment_status);
    console.log('  Deployment URL:', project.deployment_url);
    console.log('  Netlify Site ID:', project.netlify_site_id);
    console.log('  Last Deployed:', project.last_deployed_at);
    
    // 2. Check deployment queue for this project
    console.log('\nChecking deployment queue:');
    const { data: deployments } = await supabase
      .from('deployment_queue')
      .select('*')
      .eq('project_id', project.id)
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (deployments && deployments.length > 0) {
      console.log(`Found ${deployments.length} deployment records:`);
      deployments.forEach((d, i) => {
        console.log(`  ${i + 1}. Status: ${d.status}, Created: ${new Date(d.created_at).toLocaleString()}`);
        if (d.error_message) {
          console.log(`     Error: ${d.error_message}`);
        }
      });
    } else {
      console.log('  No deployment records found');
    }
    
    // 3. Analysis
    console.log('\n🔍 Analysis:');
    if (project.deployment_status === 'deployed' && !project.netlify_site_id) {
      console.log('  ⚠️  BUG CONFIRMED: Project shows "deployed" status but has no Netlify site ID');
      console.log('  This is causing the incorrect "Deployed" badge in the UI');
    } else if (project.deployment_status === 'deployed' && project.netlify_site_id) {
      console.log('  ✅ Project appears to be correctly deployed');
    } else {
      console.log('  ℹ️  Project deployment status:', project.deployment_status || 'none');
    }
  } else {
    console.log('❌ Dentist project not found');
  }
}

checkDentistProject();