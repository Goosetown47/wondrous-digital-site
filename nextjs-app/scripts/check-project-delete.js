const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bldjcqqnozxjyglbuevq.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsZGpjcXFub3p4anlnbGJ1ZXZxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNjE2NDU1MywiZXhwIjoyMDUxNzQwNTUzfQ.i9vGqAhOJ-nqNPQkRJQzYwbYl5E6OFQUuG8-nSDQpyA';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkProject() {
  const projectId = '73bbad94-9b19-4b43-be29-b622fd23018c';
  const userId = 'ec6595d2-f10b-485b-aa62-bb951971e83f'; // Your user ID from the network logs
  
  console.log('Checking project:', projectId);
  
  // 1. Check the project details
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('id, name, account_id, archived_at')
    .eq('id', projectId)
    .single();
    
  if (projectError) {
    console.error('Error fetching project:', projectError);
    return;
  }
  
  console.log('\n1. Project details:');
  console.log('  - ID:', project.id);
  console.log('  - Name:', project.name);
  console.log('  - Account ID:', project.account_id);
  console.log('  - Archived:', project.archived_at ? 'Yes' : 'No');
  
  // 2. Check if user is in account_users for this account
  const { data: accountUser, error: auError } = await supabase
    .from('account_users')
    .select('*')
    .eq('user_id', userId)
    .eq('account_id', project.account_id);
    
  console.log('\n2. User account membership:');
  if (auError) {
    console.error('Error:', auError);
  } else if (accountUser && accountUser.length > 0) {
    console.log('  - User IS in account_users for this account');
    accountUser.forEach(au => {
      console.log('    - Role:', au.role);
      console.log('    - Account ID:', au.account_id);
    });
  } else {
    console.log('  - User is NOT in account_users for this account!');
  }
  
  // 3. Check all account memberships for this user
  const { data: allMemberships, error: allError } = await supabase
    .from('account_users')
    .select('account_id, role, accounts(name)')
    .eq('user_id', userId);
    
  console.log('\n3. All account memberships for user:');
  if (allError) {
    console.error('Error:', allError);
  } else if (allMemberships && allMemberships.length > 0) {
    allMemberships.forEach(m => {
      console.log(`  - Account: ${m.accounts?.name || m.account_id}, Role: ${m.role}`);
    });
  } else {
    console.log('  - No account memberships found');
  }
  
  // 4. Try to simulate the RLS delete policy check
  console.log('\n4. RLS Delete Policy Check Simulation:');
  
  // Check if user is platform admin
  const { data: adminCheck } = await supabase
    .from('account_users')
    .select('user_id')
    .eq('account_id', '00000000-0000-0000-0000-000000000000')
    .eq('user_id', userId);
    
  const isPlatformAdmin = adminCheck && adminCheck.length > 0;
  console.log('  - Is Platform Admin:', isPlatformAdmin);
  
  // Check if user exists in account_users for project's account
  const userInAccount = accountUser && accountUser.length > 0;
  console.log('  - User in project\'s account:', userInAccount);
  
  console.log('\n  → RLS DELETE would', (isPlatformAdmin || userInAccount) ? 'ALLOW' : 'DENY', 'deletion');
  
  // 5. Check for any pages or domains linked to this project
  const { data: pages } = await supabase
    .from('pages')
    .select('id')
    .eq('project_id', projectId);
    
  const { data: domains } = await supabase
    .from('project_domains')
    .select('id')
    .eq('project_id', projectId);
    
  console.log('\n5. Related data:');
  console.log('  - Pages:', pages?.length || 0);
  console.log('  - Domains:', domains?.length || 0);
}

checkProject().catch(console.error);