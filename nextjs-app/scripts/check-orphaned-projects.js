require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkOrphanedProjects() {
  console.log('Checking for orphaned projects (projects with no account members)...');
  console.log('===============================================\n');
  
  // Get all projects
  const { data: projects, error: projectError } = await supabase
    .from('projects')
    .select('id, name, account_id')
    .order('created_at', { ascending: false });
    
  if (projectError) {
    console.log('Error fetching projects:', projectError);
    return;
  }
  
  console.log(`Found ${projects.length} total projects\n`);
  
  let orphanedCount = 0;
  const orphanedProjects = [];
  
  for (const project of projects) {
    // Check if account has any members
    const { data: members } = await supabase
      .from('account_users')
      .select('user_id')
      .eq('account_id', project.account_id)
      .limit(1);
      
    if (!members || members.length === 0) {
      orphanedCount++;
      orphanedProjects.push(project);
      console.log(`❌ ORPHANED: "${project.name}"`);
      console.log(`   Project ID: ${project.id}`);
      console.log(`   Account ID: ${project.account_id}`);
      console.log(`   No users in account_users table!\n`);
    }
  }
  
  console.log('\n===============================================');
  console.log('SUMMARY:\n');
  console.log(`Total Projects: ${projects.length}`);
  console.log(`Orphaned Projects: ${orphanedCount}`);
  
  if (orphanedCount > 0) {
    console.log('\n⚠️  These projects cannot be deleted via the UI because:');
    console.log('   - The RLS policy requires users to be in account_users');
    console.log('   - But these accounts have no members!');
    
    console.log('\nPOSSIBLE CAUSES:');
    console.log('   1. Database was rebuilt without properly seeding account_users');
    console.log('   2. Projects were created directly in the database');
    console.log('   3. Account users were deleted but projects remained');
    
    console.log('\nSOLUTION:');
    console.log('   Add the current user as account_owner for these accounts');
    
    // Get current user
    const userId = 'ec6595d2-f10b-485b-aa62-bb951971e83f';
    
    console.log('\nSQL to fix (add user to all orphaned accounts):');
    orphanedProjects.forEach(p => {
      console.log(`INSERT INTO account_users (account_id, user_id, role) VALUES ('${p.account_id}', '${userId}', 'account_owner');`);
    });
  } else {
    console.log('\n✅ All projects have at least one account member');
  }
}

checkOrphanedProjects().catch(console.error);