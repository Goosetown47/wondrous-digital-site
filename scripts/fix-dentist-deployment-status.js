import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://bpdhbxvsguklkbusqtke.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGhieHZzZ3VrbGtidXNxdGtlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTMzNzI4OCwiZXhwIjoyMDY2OTEzMjg4fQ.lbC3iZr7qc43HaxAL0UKnq38Qci4YleR0rLmuC9S5AM'
);

async function fixDentistDeploymentStatus() {
  console.log('🔧 Fixing Dentist Template deployment status...\n');
  
  try {
    // 1. Find the Dentist Template project
    const { data: project, error: findError } = await supabase
      .from('projects')
      .select('id, project_name, subdomain, deployment_status, netlify_site_id')
      .or('subdomain.eq.dentist-1,project_name.ilike.%dentist%')
      .single();
    
    if (findError) {
      console.error('Error finding project:', findError);
      return;
    }
    
    if (!project) {
      console.log('❌ Dentist project not found');
      return;
    }
    
    console.log('Found project:');
    console.log('  ID:', project.id);
    console.log('  Name:', project.project_name);
    console.log('  Current deployment status:', project.deployment_status);
    console.log('  Netlify site ID:', project.netlify_site_id);
    
    // 2. Clear the incorrect deployment data
    console.log('\nClearing incorrect deployment data...');
    const { error: updateError } = await supabase
      .from('projects')
      .update({
        deployment_status: 'none',
        netlify_site_id: null,
        deployment_url: null,
        last_deployed_at: null
      })
      .eq('id', project.id);
    
    if (updateError) {
      console.error('Error updating project:', updateError);
      return;
    }
    
    console.log('✅ Successfully cleared deployment status');
    
    // 3. Verify the update
    const { data: updatedProject } = await supabase
      .from('projects')
      .select('deployment_status, netlify_site_id, deployment_url')
      .eq('id', project.id)
      .single();
    
    console.log('\nUpdated project data:');
    console.log('  Deployment status:', updatedProject.deployment_status);
    console.log('  Netlify site ID:', updatedProject.netlify_site_id);
    console.log('  Deployment URL:', updatedProject.deployment_url);
    
    console.log('\n✅ The Dentist Template should now show "Not Deployed" in the UI');
    
  } catch (error) {
    console.error('Script error:', error);
  }
}

fixDentistDeploymentStatus();