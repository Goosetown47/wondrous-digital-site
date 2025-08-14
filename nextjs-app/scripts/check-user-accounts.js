require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkUserAccounts() {
  const userId = 'ec6595d2-f10b-485b-aa62-bb951971e83f';
  const projectAccountId = '975ebd75-5fef-4aaa-a492-2be6551e5c4a';
  
  console.log('Checking user account relationships...');
  console.log('===============================================\n');
  console.log('User ID:', userId);
  console.log('Project Account ID:', projectAccountId);
  console.log('\n');
  
  // 1. Get all account memberships for this user
  const { data: userAccounts, error: userError } = await supabase
    .from('account_users')
    .select(`
      account_id,
      role,
      accounts(id, name, slug)
    `)
    .eq('user_id', userId);
    
  if (userError) {
    console.log('Error fetching user accounts:', userError);
    return;
  }
  
  console.log('User is member of', userAccounts.length, 'account(s):');
  userAccounts.forEach(ua => {
    const isTarget = ua.account_id === projectAccountId;
    console.log(`  ${isTarget ? '❌' : '•'} ${ua.accounts?.name || ua.account_id}`);
    console.log(`    Role: ${ua.role}`);
    console.log(`    ID: ${ua.account_id}`);
    if (isTarget) {
      console.log('    ^ THIS IS THE PROJECT\'S ACCOUNT BUT USER IS NOT IN IT!');
    }
  });
  
  console.log('\n===============================================');
  console.log('Checking who IS in the project\'s account...\n');
  
  // 2. Get all users in the project's account
  const { data: accountMembers } = await supabase
    .from('account_users')
    .select(`
      user_id,
      role,
      auth.users(email)
    `)
    .eq('account_id', projectAccountId);
    
  console.log('Members of account', projectAccountId, ':');
  if (accountMembers && accountMembers.length > 0) {
    accountMembers.forEach(member => {
      console.log(`  • User: ${member.user_id}`);
      console.log(`    Email: ${member.users?.email || 'Unknown'}`);
      console.log(`    Role: ${member.role}`);
    });
  } else {
    console.log('  No members found!');
  }
  
  console.log('\n===============================================');
  console.log('DIAGNOSIS:\n');
  
  const isMember = userAccounts.some(ua => ua.account_id === projectAccountId);
  if (!isMember) {
    console.log('❌ User is NOT a member of the project\'s account');
    console.log('   This is why the DELETE is failing!');
    console.log('\nSOLUTION: Add user to account_users table:');
    console.log(`
INSERT INTO account_users (account_id, user_id, role)
VALUES ('${projectAccountId}', '${userId}', 'account_owner');
    `);
  } else {
    console.log('✅ User IS a member of the project\'s account');
  }
}

checkUserAccounts().catch(console.error);