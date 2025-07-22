import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://rknygqpmuiztdmvpszpj.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJrbnlncXBtdWl6dGRtdnBzenBqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMzMxMTQxOSwiZXhwIjoyMDQ4ODg3NDE5fQ.vHsVwtcF-Bqm8VXxlU2yYeORsVjl9K_2LNtvJxBNjkE';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkDentistProject() {
  console.log('Checking for dentist project...\n');

  // Check all projects
  const { data: projects, error } = await supabase
    .from('projects')
    .select('id, subdomain, deployment_status, netlify_site_id, project_type')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('All projects:');
  projects.forEach(p => {
    console.log(`- ${p.id}: subdomain="${p.subdomain}", type="${p.project_type}", status="${p.deployment_status}"`);
  });

  // Find dentist project
  const dentistProject = projects.find(p => 
    p.subdomain && (p.subdomain.includes('dentist') || p.subdomain === 'dentist-1')
  );

  if (dentistProject) {
    console.log('\nDentist project found:');
    console.log(JSON.stringify(dentistProject, null, 2));
  } else {
    console.log('\nNo dentist project found');
  }
}

checkDentistProject();