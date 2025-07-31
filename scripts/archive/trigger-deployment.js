import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://bpdhbxvsguklkbusqtke.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGhieHZzZ3VrbGtidXNxdGtlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTMzNzI4OCwiZXhwIjoyMDY2OTEzMjg4fQ.lbC3iZr7qc43HaxAL0UKnq38Qci4YleR0rLmuC9S5AM'
);

async function triggerDeployment() {
  // Find the dentist project
  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('subdomain', 'dentist-1')
    .single();
    
  if (!project) {
    console.error('Project not found');
    return;
  }
  
  console.log('Triggering deployment for:', project.project_name);
  
  // Add to deployment queue
  const { data, error } = await supabase
    .from('deployment_queue')
    .insert({
      project_id: project.id,
      status: 'queued',
      payload: {
        subdomain: project.subdomain,
        deployment_domain: project.deployment_domain || 'wondrousdigital.com'
      }
    })
    .select()
    .single();
    
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Deployment queued:', data.id);
    console.log('Monitor at: https://bpdhbxvsguklkbusqtke.supabase.co/project/default/editor/deployment_queue');
  }
}

triggerDeployment();