import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://bpdhbxvsguklkbusqtke.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGhieHZzZ3VrbGtidXNxdGtlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTMzNzI4OCwiZXhwIjoyMDY2OTEzMjg4fQ.lbC3iZr7qc43HaxAL0UKnq38Qci4YleR0rLmuC9S5AM'
);

async function listProjects() {
  console.log('🔍 Listing all projects...\n');
  
  const { data: projects, error } = await supabase
    .from('projects')
    .select('id, project_name, subdomain, project_type, customer_id, created_at')
    .order('created_at', { ascending: false })
    .limit(20);
  
  if (error) {
    console.error('Error fetching projects:', error);
    return;
  }
  
  if (!projects || projects.length === 0) {
    console.log('No projects found in the database');
    return;
  }
  
  console.log(`Found ${projects.length} projects:\n`);
  
  projects.forEach((project, index) => {
    console.log(`${index + 1}. ${project.project_name}`);
    console.log(`   ID: ${project.id}`);
    console.log(`   Type: ${project.project_type}`);
    console.log(`   Subdomain: ${project.subdomain || 'Not set'}`);
    console.log(`   Created: ${new Date(project.created_at).toLocaleDateString()}`);
    console.log('');
  });
  
  // Find template projects
  const templateProjects = projects.filter(p => p.project_type === 'template');
  if (templateProjects.length > 0) {
    console.log('\n📋 Template Projects:');
    templateProjects.forEach(p => {
      console.log(`- ${p.project_name} (subdomain: ${p.subdomain || 'none'})`);
    });
  }
  
  // Find projects with subdomains
  const projectsWithSubdomains = projects.filter(p => p.subdomain);
  if (projectsWithSubdomains.length > 0) {
    console.log('\n🌐 Projects with subdomains:');
    projectsWithSubdomains.forEach(p => {
      console.log(`- ${p.project_name}: ${p.subdomain}`);
    });
  }
}

listProjects();