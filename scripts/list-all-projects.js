import { createClient } from '@supabase/supabase-js';

// Use service role key for full access
const supabaseUrl = 'https://bpdhbxvsguklkbusqtke.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGhieHZzZ3VrbGtidXNxdGtlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTMzNzI4OCwiZXhwIjoyMDY2OTEzMjg4fQ.lbC3iZr7qc43HaxAL0UKnq38Qci4YleR0rLmuC9S5AM';
const supabase = createClient(supabaseUrl, supabaseKey);

async function listAllProjects() {
  console.log('=== LISTING ALL PROJECTS ===\n');

  try {
    // Get all projects
    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

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
      console.log(`${index + 1}. Project: ${project.project_name}`);
      console.log(`   ID: ${project.id}`);
      console.log(`   Subdomain: ${project.subdomain || 'None'}`);
      console.log(`   Domain: ${project.domain || 'None'}`);
      console.log(`   Deployment Status: ${project.deployment_status || 'None'}`);
      console.log(`   Netlify Site ID: ${project.netlify_site_id || 'None'}`);
      console.log(`   Created: ${new Date(project.created_at).toLocaleString()}`);
      console.log(`   Updated: ${new Date(project.updated_at).toLocaleString()}`);
      console.log('');
    });

    // Check for any project with 'template' in the name
    const templateProjects = projects.filter(p => 
      p.project_name.toLowerCase().includes('template') || 
      p.project_name.toLowerCase().includes('dentist')
    );

    if (templateProjects.length > 0) {
      console.log('\n=== TEMPLATE/DENTIST PROJECTS ===');
      templateProjects.forEach(p => {
        console.log(`- "${p.project_name}" (ID: ${p.id})`);
      });
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the listing
listAllProjects().then(() => {
  console.log('\n✓ Done');
  process.exit(0);
}).catch(error => {
  console.error('Failed to list projects:', error);
  process.exit(1);
});