require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables. Please check .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTestUsers() {
  console.log('🔍 Checking Test Users in DEV Database');
  console.log('=========================================\n');
  
  // 1. Check if test users exist
  const testEmails = [
    'admin@wondrousdigital.com',
    'staff@wondrousdigital.com',
    'owner@example.com',
    'user@example.com'
  ];
  
  console.log('1. Checking user profiles:');
  // Check user_profiles instead of auth.users (can't query auth.users directly)
  const { data: profiles } = await supabase
    .from('user_profiles')
    .select('user_id, full_name, display_name')
    .order('full_name');
    
  console.log('Found user profiles:');
  if (profiles && profiles.length > 0) {
    profiles.forEach(p => {
      console.log(`  - ${p.full_name || p.display_name} (${p.user_id})`);
    });
  } else {
    console.log('  ❌ No user profiles found');
  }
  
  // 2. Check test account exists
  console.log('\n2. Checking test account:');
  const testAccountId = '12526d99-6878-4b89-be82-dcb1add35c31';
  
  const { data: account, error: accountError } = await supabase
    .from('accounts')
    .select('id, name, created_at')
    .eq('id', testAccountId)
    .single();
    
  if (accountError) {
    console.log(`  ❌ Test account not found: ${accountError.message}`);
    console.log('\n  Creating test account...');
    
    const { data: newAccount, error: createError } = await supabase
      .from('accounts')
      .insert({
        id: testAccountId,
        name: 'Test Account'
      })
      .select()
      .single();
      
    if (createError) {
      console.log(`  ❌ Failed to create: ${createError.message}`);
    } else {
      console.log(`  ✅ Created: ${newAccount.name}`);
    }
  } else {
    console.log(`  ✅ Found: ${account.name} (created: ${account.created_at})`);
  }
  
  // 3. Check account_users associations
  console.log('\n3. Checking account_users associations:');
  
  const { data: accountUsers, error: auError } = await supabase
    .from('account_users')
    .select(`
      user_id,
      role,
      user_profiles!inner(full_name, display_name)
    `)
    .eq('account_id', testAccountId);
    
  if (auError) {
    console.log(`  ❌ Error: ${auError.message}`);
  } else if (!accountUsers || accountUsers.length === 0) {
    console.log('  ❌ No users associated with test account');
  } else {
    console.log(`  Found ${accountUsers.length} users:`);
    accountUsers.forEach(au => {
      const name = au.user_profiles?.full_name || au.user_id;
      console.log(`    - ${name}: ${au.role}`);
    });
  }
  
  // 4. Check for test project
  console.log('\n4. Checking for test projects:');
  
  const { data: projects, error: projectsError } = await supabase
    .from('projects')
    .select('id, name, slug, account_id, archived_at')
    .eq('account_id', testAccountId);
    
  if (projectsError) {
    console.log(`  ❌ Error: ${projectsError.message}`);
  } else if (!projects || projects.length === 0) {
    console.log('  ❌ No projects found for test account');
    console.log('\n  Creating test project...');
    
    const { data: newProject, error: createProjError } = await supabase
      .from('projects')
      .insert({
        name: 'Test Project for Deletion',
        slug: 'test-deletion-project',
        account_id: testAccountId,
        theme_id: 1, // Default theme
        settings: {}
      })
      .select()
      .single();
      
    if (createProjError) {
      console.log(`  ❌ Failed to create: ${createProjError.message}`);
    } else {
      console.log(`  ✅ Created: ${newProject.name} (${newProject.id})`);
    }
  } else {
    console.log(`  Found ${projects.length} projects:`);
    projects.forEach(p => {
      const status = p.archived_at ? '(archived)' : '(active)';
      console.log(`    - ${p.name} ${status}`);
      console.log(`      ID: ${p.id}`);
      console.log(`      Slug: ${p.slug}`);
    });
  }
  
  // 5. Summary
  console.log('\n5. Summary:');
  console.log('  ℹ️  RLS policies should be applied via migrations');
  console.log('  ℹ️  To fix project deletion, ensure owner@example.com has account_owner role');
}

checkTestUsers().catch(console.error);