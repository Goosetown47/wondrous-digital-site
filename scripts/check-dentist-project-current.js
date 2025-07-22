#\!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://bpdhbxvsguklkbusqtke.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGhieHZzZ3VrbGtidXNxdGtlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTMzNzI4OCwiZXhwIjoyMDY2OTEzMjg4fQ.lbC3iZr7qc43HaxAL0UKnq38Qci4YleR0rLmuC9S5AM'
);

async function checkDentistProject() {
  console.log('🦷 Looking for dentist template project...\n');
  
  // Search for dentist projects
  const { data: projects, error } = await supabase
    .from('projects')
    .select('*')
    .or('project_name.ilike.%dentist%,subdomain.ilike.%dentist%')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching projects:', error);
    return;
  }
  
  if (\!projects || projects.length === 0) {
    console.log('No dentist projects found\!');
    return;
  }
  
  console.log(`Found ${projects.length} dentist-related project(s):\n`);
  
  for (const project of projects) {
    console.log(`📋 Project: ${project.project_name} (ID: ${project.id})`);
    console.log(`   Status: ${project.project_status}`);
    console.log(`   Subdomain: ${project.subdomain || 'none'}`);
    console.log(`   Deployment Domain: ${project.deployment_domain || 'none'}`);
    console.log(`   Deployment URL: ${project.deployment_url || 'none'}`);
    console.log(`   Deployment Status: ${project.deployment_status || 'none'}`);
    console.log(`   Netlify Site ID: ${project.netlify_site_id || 'none'}`);
    console.log(`   Last Deployed: ${project.last_deployed_at || 'never'}`);
    console.log('');
  }
  
  // Check deployment queue for any pending deployments
  console.log('🔍 Checking deployment queue...\n');
  
  const { data: queue } = await supabase
    .from('deployment_queue')
    .select('*')
    .in('project_id', projects.map(p => p.id))
    .order('created_at', { ascending: false })
    .limit(5);
  
  if (queue && queue.length > 0) {
    console.log('Recent deployment queue entries:');
    queue.forEach(item => {
      console.log(`   ${item.status}: ${item.created_at} - ${item.error_message || 'no error'}`);
    });
  } else {
    console.log('No deployment queue entries found for dentist projects.');
  }
}

checkDentistProject().catch(console.error);
