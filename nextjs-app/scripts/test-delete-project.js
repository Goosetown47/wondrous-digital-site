require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Use the service role to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Use the anon key to test with RLS
const supabaseAnon = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testDelete() {
  const projectId = '73bbad94-9b19-4b43-be29-b622fd23018c';
  
  console.log('Testing project deletion for:', projectId);
  console.log('===============================================\n');
  
  // 1. First check if project exists
  const { data: project, error: fetchError } = await supabaseAdmin
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single();
    
  if (fetchError) {
    console.log('Project not found:', fetchError.message);
    return;
  }
  
  console.log('Project found:');
  console.log('  Name:', project.name);
  console.log('  Account ID:', project.account_id);
  console.log('  Archived:', project.archived_at ? 'Yes' : 'No');
  console.log('\n');
  
  // 2. Check related data that might block deletion
  console.log('Checking for related data that might block deletion...\n');
  
  const { data: pages } = await supabaseAdmin
    .from('pages')
    .select('id, title')
    .eq('project_id', projectId);
    
  console.log('Pages linked to project:', pages?.length || 0);
  if (pages && pages.length > 0) {
    pages.forEach(p => console.log('  -', p.title || p.id));
  }
  
  const { data: domains } = await supabaseAdmin
    .from('project_domains')
    .select('id, domain')
    .eq('project_id', projectId);
    
  console.log('Domains linked to project:', domains?.length || 0);
  if (domains && domains.length > 0) {
    domains.forEach(d => console.log('  -', d.domain));
  }
  
  // 3. Try deletion with anon client (respects RLS)
  console.log('\n===============================================');
  console.log('Attempting DELETE with RLS (anon client)...\n');
  
  const { error: rlsDeleteError } = await supabaseAnon
    .from('projects')
    .delete()
    .eq('id', projectId);
    
  if (rlsDeleteError) {
    console.log('❌ RLS Delete failed:', rlsDeleteError.message);
    console.log('   Code:', rlsDeleteError.code);
    console.log('   Details:', rlsDeleteError.details);
  } else {
    console.log('✅ RLS Delete returned success (204)');
    
    // Check if actually deleted
    const { data: checkAfter } = await supabaseAdmin
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .single();
      
    if (checkAfter) {
      console.log('⚠️  BUT project still exists! (RLS blocked the delete)');
    } else {
      console.log('✅ Project was actually deleted!');
    }
  }
  
  // 4. Check what the RLS policy sees
  console.log('\n===============================================');
  console.log('Checking RLS policy conditions...\n');
  
  // Get the current user ID from your auth
  // You'll need to provide this based on your logged-in user
  const userId = 'ec6595d2-f10b-485b-aa62-bb951971e83f'; // Your user ID
  
  // Check if user is in account_users for this project's account
  const { data: accountUser } = await supabaseAdmin
    .from('account_users')
    .select('*')
    .eq('user_id', userId)
    .eq('account_id', project.account_id);
    
  console.log('User in account_users for project\'s account?', accountUser && accountUser.length > 0 ? 'YES' : 'NO');
  if (accountUser && accountUser.length > 0) {
    console.log('  Role:', accountUser[0].role);
  }
  
  // Check if user is platform admin
  const { data: adminCheck } = await supabaseAdmin
    .from('account_users')
    .select('*')
    .eq('user_id', userId)
    .eq('account_id', '00000000-0000-0000-0000-000000000000');
    
  console.log('User is platform admin?', adminCheck && adminCheck.length > 0 ? 'YES' : 'NO');
  
  // 5. Try with service role (bypasses RLS) - BE CAREFUL!
  console.log('\n===============================================');
  console.log('FOR COMPARISON: Delete with service role (bypasses RLS)...\n');
  console.log('⚠️  NOT executing actual delete, just showing it would work');
  
  // Uncomment to actually delete with service role:
  // const { error: adminDeleteError } = await supabaseAdmin
  //   .from('projects')
  //   .delete()
  //   .eq('id', projectId);
  // console.log('Admin delete result:', adminDeleteError || 'Success');
}

testDelete().catch(console.error);