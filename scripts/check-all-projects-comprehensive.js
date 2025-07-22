import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://rknygqpmuiztdmvpszpj.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJrbnlncXBtdWl6dGRtdnBzenBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMzMTE0MTksImV4cCI6MjA0ODg4NzQxOX0.-oVTr5OqQVOdAl2s5ggdKDiXLvzR3y4U2TxJXNABCkI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAllData() {
  console.log('=== Comprehensive Database Check ===\n');

  // 1. Check projects
  console.log('1. Projects table:');
  const { data: projects, error: projectsError, count: projectsCount } = await supabase
    .from('projects')
    .select('*', { count: 'exact' });

  if (projectsError) {
    console.error('Error fetching projects:', projectsError);
  } else {
    console.log(`Total projects: ${projectsCount}`);
    if (projects && projects.length > 0) {
      projects.forEach((p, i) => {
        console.log(`\nProject ${i + 1}:`);
        console.log(JSON.stringify(p, null, 2));
      });
    }
  }

  // 2. Check deployment queue
  console.log('\n\n2. Deployment queue:');
  const { data: queue, error: queueError, count: queueCount } = await supabase
    .from('deployment_queue')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .limit(10);

  if (queueError) {
    console.error('Error fetching deployment queue:', queueError);
  } else {
    console.log(`Total deployments in queue: ${queueCount}`);
    if (queue && queue.length > 0) {
      console.log('Recent deployments:');
      queue.forEach((d, i) => {
        console.log(`\n${i + 1}. ID: ${d.id}`);
        console.log(`   Project: ${d.project_id}`);
        console.log(`   Status: ${d.status}`);
        console.log(`   Domain: ${d.domain}`);
        console.log(`   Created: ${new Date(d.created_at).toLocaleString()}`);
      });
    }
  }

  // 3. Check if we're authenticated
  console.log('\n\n3. Authentication check:');
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError) {
    console.log('Not authenticated:', authError.message);
  } else if (user) {
    console.log('Authenticated as:', user.email);
  } else {
    console.log('No authentication');
  }
}

checkAllData();